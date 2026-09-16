-- 0003_security_fixes.sql
-- Security Hardening & RPC Workflow Migration
-- Fixes F1-F9: audit/tx mutations locked to RPCs, reservations/profiles RLS narrowed,
-- listings update trigger, duration checks, storage buckets & policies, and 8 secure RPCs

-- =====================================================================
-- 1. FIX F1: Audit Events write restriction
-- =====================================================================
DROP POLICY IF EXISTS audit_events_insert ON audit_events;
REVOKE INSERT ON audit_events FROM authenticated;

-- =====================================================================
-- 2. FIX F2 & F3: Transactions mutations locked to RPCs only
-- =====================================================================
DROP POLICY IF EXISTS transactions_update ON transactions;
DROP POLICY IF EXISTS transactions_insert_request ON transactions;
REVOKE INSERT, UPDATE ON transactions FROM authenticated;

-- =====================================================================
-- 3. FIX F4: Memberships updates locked to review_membership RPC
-- =====================================================================
DROP POLICY IF EXISTS memberships_update_mod ON memberships;
REVOKE UPDATE ON memberships FROM authenticated;

-- =====================================================================
-- 4. FIX F5: Reservations SELECT restricted to same-campus or participant
-- =====================================================================
DROP POLICY IF EXISTS reservations_select ON reservations;
CREATE POLICY reservations_select ON reservations
  FOR SELECT
  TO authenticated
  USING (
    is_campus_member((SELECT campus_id FROM assets WHERE assets.id = reservations.asset_id))
    OR EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = reservations.transaction_id
        AND (t.owner_id = auth.uid() OR t.requester_id = auth.uid())
    )
  );

-- =====================================================================
-- 5. FIX F6: Profiles SELECT restricted to users with any membership row
-- =====================================================================
DROP POLICY IF EXISTS profiles_select ON profiles;
CREATE POLICY profiles_select ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.user_id = auth.uid()
    )
  );

-- =====================================================================
-- 6. FIX F7: Strengthen payment_acknowledgements_insert policy
-- =====================================================================
DROP POLICY IF EXISTS payment_acknowledgements_insert ON payment_acknowledgements;
CREATE POLICY payment_acknowledgements_insert ON payment_acknowledgements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    payee_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM transactions t
      JOIN payment_proofs p ON p.transaction_id = t.id
      WHERE p.id = payment_acknowledgements.proof_id
        AND t.owner_id = auth.uid()
        AND t.status = 'proof_submitted'
        AND p.version = (
          SELECT coalesce(max(version), 0)
          FROM payment_proofs
          WHERE transaction_id = t.id
        )
    )
  );

-- =====================================================================
-- 7. FIX F8: Listings status, moderation reason, and reservation check trigger
-- =====================================================================
ALTER TABLE listings ADD COLUMN IF NOT EXISTS moderation_reason text NOT NULL DEFAULT '';

ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check
  CHECK (status IN ('draft', 'pending_review', 'published', 'paused', 'archived', 'hidden', 'rejected'));

ALTER TABLE listings ALTER COLUMN status SET DEFAULT 'pending_review';

CREATE OR REPLACE FUNCTION check_listing_update_against_reservations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.mode <> NEW.mode OR OLD.price_paise <> NEW.price_paise) THEN
    IF EXISTS (
      SELECT 1 FROM reservations
      WHERE asset_id = OLD.asset_id AND status = 'active'
    ) THEN
      RAISE EXCEPTION 'Cannot change listing mode or price while an active reservation exists'
        USING ERRCODE = '23P01';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_listings_check_active_reservations ON listings;
CREATE TRIGGER trg_listings_check_active_reservations
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION check_listing_update_against_reservations();

-- =====================================================================
-- 8. FIX F9: Duration check on transactions for loan/rental (0 to 30 days)
-- =====================================================================
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS check_loan_rental_duration;
ALTER TABLE transactions ADD CONSTRAINT check_loan_rental_duration
  CHECK (mode = 'sale' OR (start_date IS NOT NULL AND end_date IS NOT NULL AND (end_date - start_date) BETWEEN 0 AND 30));

-- =====================================================================
-- 9. Storage Buckets and Policies
-- =====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('listing-photos', 'listing-photos', false),
  ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Helper to check if actor is proof participant or campus moderator
CREATE OR REPLACE FUNCTION is_proof_participant(p_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_parts text[];
  v_tx_id uuid;
  v_tx transactions%ROWTYPE;
BEGIN
  v_parts := string_to_array(p_name, '/');
  -- Format: proofs/{payer_uuid}/{transaction_uuid}/v{n}.jpg
  IF array_length(v_parts, 1) >= 3 AND v_parts[1] = 'proofs' THEN
    BEGIN
      v_tx_id := v_parts[3]::uuid;
    EXCEPTION WHEN OTHERS THEN
      RETURN false;
    END;
  ELSIF array_length(v_parts, 1) >= 2 THEN
    BEGIN
      v_tx_id := v_parts[2]::uuid;
    EXCEPTION WHEN OTHERS THEN
      RETURN false;
    END;
  ELSE
    RETURN false;
  END IF;

  SELECT * INTO v_tx FROM transactions WHERE id = v_tx_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  RETURN (
    v_tx.owner_id = auth.uid()
    OR v_tx.requester_id = auth.uid()
    OR is_campus_moderator_or_admin(v_tx.campus_id)
  );
END;
$$;

-- Storage policies for listing-photos
DROP POLICY IF EXISTS listing_photos_insert ON storage.objects;
CREATE POLICY listing_photos_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'listing-photos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR (storage.foldername(name))[2] = auth.uid()::text
      OR name LIKE 'listings/' || auth.uid()::text || '/%'
    )
  );

DROP POLICY IF EXISTS listing_photos_update ON storage.objects;
CREATE POLICY listing_photos_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'listing-photos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR (storage.foldername(name))[2] = auth.uid()::text
      OR name LIKE 'listings/' || auth.uid()::text || '/%'
    )
  );

DROP POLICY IF EXISTS listing_photos_select ON storage.objects;
CREATE POLICY listing_photos_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'listing-photos'
    AND EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid())
  );

-- Storage policies for payment-proofs
DROP POLICY IF EXISTS payment_proofs_insert ON storage.objects;
CREATE POLICY payment_proofs_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR (storage.foldername(name))[2] = auth.uid()::text
      OR name LIKE 'proofs/' || auth.uid()::text || '/%'
    )
  );

DROP POLICY IF EXISTS payment_proofs_select ON storage.objects;
CREATE POLICY payment_proofs_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND is_proof_participant(name)
  );

-- =====================================================================
-- 10. New SECURITY DEFINER RPC Functions
-- =====================================================================

-- RPC 1: ensure_membership()
CREATE OR REPLACE FUNCTION ensure_membership()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_raw_email text;
  v_email text;
  v_parts text[];
  v_campus_id uuid;
  v_status text;
  v_role text;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be authenticated' USING ERRCODE = '42501';
  END IF;

  v_raw_email := auth.jwt() ->> 'email';
  IF v_raw_email IS NULL OR v_raw_email = '' THEN
    RETURN jsonb_build_object('eligible', false, 'reason', 'No verified email found in token');
  END IF;

  v_email := lower(trim(v_raw_email));
  v_parts := string_to_array(v_email, '@');

  IF array_length(v_parts, 1) <> 2 OR v_parts[2] <> 'hitam.org' THEN
    RETURN jsonb_build_object('eligible', false, 'reason', 'Email must be exactly from hitam.org');
  END IF;

  SELECT id INTO v_campus_id FROM campuses WHERE code = 'HITAM' LIMIT 1;
  IF v_campus_id IS NULL THEN
    RAISE EXCEPTION 'HITAM campus record not found' USING ERRCODE = 'P0002';
  END IF;

  -- Upsert profile with local part of email
  INSERT INTO profiles (id, display_name)
  VALUES (v_actor_id, v_parts[1])
  ON CONFLICT (id) DO NOTHING;

  -- Upsert pending student membership
  INSERT INTO memberships (user_id, campus_id, email, status, role, student_eligibility)
  VALUES (v_actor_id, v_campus_id, v_email, 'pending', 'student', 'pending')
  ON CONFLICT (user_id, campus_id) DO NOTHING;

  -- Ensure default preferences
  INSERT INTO preferences (user_id)
  VALUES (v_actor_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Fetch existing or created record
  SELECT status, role INTO v_status, v_role
  FROM memberships
  WHERE user_id = v_actor_id AND campus_id = v_campus_id;

  RETURN jsonb_build_object(
    'eligible', true,
    'status', v_status,
    'role', v_role,
    'campus_id', v_campus_id
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION ensure_membership() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION ensure_membership() TO authenticated;

-- RPC 2: request_exchange(...)
CREATE OR REPLACE FUNCTION request_exchange(
  p_listing_id uuid,
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL,
  p_note text DEFAULT NULL,
  p_expected_listing_version int DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_listing listings%ROWTYPE;
  v_rental_days integer := 0;
  v_total_price integer := 0;
  v_tx_id uuid;
  v_existing_idempotency idempotency_keys%ROWTYPE;
  v_request_hash text;
  v_response jsonb;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be authenticated' USING ERRCODE = '42501';
  END IF;

  v_request_hash := md5(p_listing_id::text || ':' || coalesce(p_start_date::text, 'none') || ':' || coalesce(p_end_date::text, 'none') || ':' || coalesce(p_expected_listing_version::text, 'none'));

  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    SELECT * INTO v_existing_idempotency
    FROM idempotency_keys
    WHERE actor_id = v_actor_id AND operation = 'request_exchange' AND key = p_idempotency_key;

    IF FOUND THEN
      IF v_existing_idempotency.request_hash = v_request_hash THEN
        RETURN v_existing_idempotency.response;
      ELSE
        RAISE EXCEPTION 'Idempotency conflict: key % reused with different payload', p_idempotency_key USING ERRCODE = '23505';
      END IF;
    END IF;
  END IF;

  SELECT * INTO v_listing FROM listings WHERE id = p_listing_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_listing.status <> 'published' THEN
    RAISE EXCEPTION 'Listing is not available for request (status: %)', v_listing.status USING ERRCODE = '22023';
  END IF;

  IF v_listing.owner_id = v_actor_id THEN
    RAISE EXCEPTION 'Cannot request your own listing' USING ERRCODE = '42501';
  END IF;

  IF p_expected_listing_version IS NOT NULL AND v_listing.version <> p_expected_listing_version THEN
    RAISE EXCEPTION 'Conflict: listing terms have changed (expected %, current %)', p_expected_listing_version, v_listing.version USING ERRCODE = '40001';
  END IF;

  IF NOT is_active_campus_member(v_listing.campus_id) THEN
    RAISE EXCEPTION 'Requester must be an active campus member' USING ERRCODE = '42501';
  END IF;

  IF v_listing.mode IN ('free_loan', 'rental') THEN
    IF p_start_date IS NULL OR p_end_date IS NULL THEN
      RAISE EXCEPTION 'Start date and end date are required for loans and rentals' USING ERRCODE = '22023';
    END IF;
    IF p_start_date < current_date THEN
      RAISE EXCEPTION 'Start date cannot be in the past' USING ERRCODE = '22023';
    END IF;
    IF p_start_date > current_date + 30 THEN
      RAISE EXCEPTION 'Start date exceeds maximum horizon of 30 days' USING ERRCODE = '22023';
    END IF;
    IF p_end_date < p_start_date THEN
      RAISE EXCEPTION 'End date cannot precede start date' USING ERRCODE = '22023';
    END IF;
    IF (p_end_date - p_start_date) > 30 THEN
      RAISE EXCEPTION 'Duration cannot exceed 30 days' USING ERRCODE = '22023';
    END IF;

    v_rental_days := (p_end_date - p_start_date) + 1;
    IF v_listing.mode = 'rental' THEN
      v_total_price := v_listing.price_paise * v_rental_days;
    ELSE
      v_total_price := 0;
    END IF;
  ELSIF v_listing.mode = 'sale' THEN
    p_start_date := NULL;
    p_end_date := NULL;
    v_rental_days := 0;
    v_total_price := v_listing.price_paise;
  END IF;

  INSERT INTO transactions (
    listing_id, asset_id, campus_id, owner_id, requester_id,
    mode, status, quoted_price_paise, quoted_deposit_paise,
    start_date, end_date, rental_days, pickup_zone, requester_note, version
  ) VALUES (
    v_listing.id, v_listing.asset_id, v_listing.campus_id, v_listing.owner_id, v_actor_id,
    v_listing.mode, 'requested', v_total_price, v_listing.deposit_paise,
    p_start_date, p_end_date, v_rental_days, v_listing.pickup_zone, coalesce(p_note, ''), 1
  ) RETURNING id INTO v_tx_id;

  INSERT INTO audit_events (actor_id, campus_id, action, entity_type, entity_id, details)
  VALUES (
    v_actor_id, v_listing.campus_id, 'transaction.requested', 'transaction', v_tx_id,
    jsonb_build_object('mode', v_listing.mode, 'quoted_price_paise', v_total_price)
  );

  INSERT INTO outbox_events (kind, payload)
  VALUES (
    'exchange_requested',
    jsonb_build_object('transaction_id', v_tx_id, 'owner_id', v_listing.owner_id, 'requester_id', v_actor_id)
  );

  v_response := jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'status', 'requested',
    'quoted_price_paise', v_total_price
  );

  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    INSERT INTO idempotency_keys (actor_id, operation, key, request_hash, response, expires_at)
    VALUES (v_actor_id, 'request_exchange', p_idempotency_key, v_request_hash, v_response, now() + interval '24 hours');
  END IF;

  RETURN v_response;
END;
$$;
REVOKE EXECUTE ON FUNCTION request_exchange(uuid, date, date, text, int, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION request_exchange(uuid, date, date, text, int, text) TO authenticated;

-- RPC 3: decline_exchange_request(...)
CREATE OR REPLACE FUNCTION decline_exchange_request(
  p_transaction_id uuid,
  p_expected_version int DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_tx transactions%ROWTYPE;
  v_existing_idempotency idempotency_keys%ROWTYPE;
  v_request_hash text;
  v_response jsonb;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be authenticated' USING ERRCODE = '42501';
  END IF;

  v_request_hash := md5(p_transaction_id::text || ':' || coalesce(p_expected_version::text, 'none'));

  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    SELECT * INTO v_existing_idempotency
    FROM idempotency_keys
    WHERE actor_id = v_actor_id AND operation = 'decline_exchange_request' AND key = p_idempotency_key;

    IF FOUND THEN
      IF v_existing_idempotency.request_hash = v_request_hash THEN
        RETURN v_existing_idempotency.response;
      ELSE
        RAISE EXCEPTION 'Idempotency conflict: key % reused with different payload', p_idempotency_key USING ERRCODE = '23505';
      END IF;
    END IF;
  END IF;

  SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_tx.owner_id <> v_actor_id THEN
    RAISE EXCEPTION 'Forbidden: only the listing owner can decline this request' USING ERRCODE = '42501';
  END IF;

  IF v_tx.status <> 'requested' THEN
    RAISE EXCEPTION 'Invalid transition: transaction is in state %', v_tx.status USING ERRCODE = '22023';
  END IF;

  IF p_expected_version IS NOT NULL AND v_tx.version <> p_expected_version THEN
    RAISE EXCEPTION 'Conflict: stale version (expected %, current %)', p_expected_version, v_tx.version USING ERRCODE = '40001';
  END IF;

  UPDATE transactions
  SET status = 'declined', version = version + 1
  WHERE id = p_transaction_id;

  INSERT INTO audit_events (actor_id, campus_id, action, entity_type, entity_id, details)
  VALUES (v_actor_id, v_tx.campus_id, 'transaction.declined', 'transaction', v_tx.id, '{}'::jsonb);

  INSERT INTO outbox_events (kind, payload)
  VALUES ('exchange_declined', jsonb_build_object('transaction_id', v_tx.id, 'requester_id', v_tx.requester_id));

  v_response := jsonb_build_object('success', true, 'transaction_id', v_tx.id, 'status', 'declined');

  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    INSERT INTO idempotency_keys (actor_id, operation, key, request_hash, response, expires_at)
    VALUES (v_actor_id, 'decline_exchange_request', p_idempotency_key, v_request_hash, v_response, now() + interval '24 hours');
  END IF;

  RETURN v_response;
END;
$$;
REVOKE EXECUTE ON FUNCTION decline_exchange_request(uuid, int, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION decline_exchange_request(uuid, int, text) TO authenticated;

-- RPC 4: withdraw_exchange_request(...)
CREATE OR REPLACE FUNCTION withdraw_exchange_request(
  p_transaction_id uuid,
  p_expected_version int DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_tx transactions%ROWTYPE;
  v_existing_idempotency idempotency_keys%ROWTYPE;
  v_request_hash text;
  v_response jsonb;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be authenticated' USING ERRCODE = '42501';
  END IF;

  v_request_hash := md5(p_transaction_id::text || ':' || coalesce(p_expected_version::text, 'none'));

  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    SELECT * INTO v_existing_idempotency
    FROM idempotency_keys
    WHERE actor_id = v_actor_id AND operation = 'withdraw_exchange_request' AND key = p_idempotency_key;

    IF FOUND THEN
      IF v_existing_idempotency.request_hash = v_request_hash THEN
        RETURN v_existing_idempotency.response;
      ELSE
        RAISE EXCEPTION 'Idempotency conflict: key % reused with different payload', p_idempotency_key USING ERRCODE = '23505';
      END IF;
    END IF;
  END IF;

  SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_tx.requester_id <> v_actor_id THEN
    RAISE EXCEPTION 'Forbidden: only the requester can withdraw this request' USING ERRCODE = '42501';
  END IF;

  IF v_tx.status <> 'requested' THEN
    RAISE EXCEPTION 'Invalid transition: transaction is in state %', v_tx.status USING ERRCODE = '22023';
  END IF;

  IF p_expected_version IS NOT NULL AND v_tx.version <> p_expected_version THEN
    RAISE EXCEPTION 'Conflict: stale version (expected %, current %)', p_expected_version, v_tx.version USING ERRCODE = '40001';
  END IF;

  UPDATE transactions
  SET status = 'withdrawn', version = version + 1
  WHERE id = p_transaction_id;

  INSERT INTO audit_events (actor_id, campus_id, action, entity_type, entity_id, details)
  VALUES (v_actor_id, v_tx.campus_id, 'transaction.withdrawn', 'transaction', v_tx.id, '{}'::jsonb);

  INSERT INTO outbox_events (kind, payload)
  VALUES ('exchange_withdrawn', jsonb_build_object('transaction_id', v_tx.id, 'owner_id', v_tx.owner_id));

  v_response := jsonb_build_object('success', true, 'transaction_id', v_tx.id, 'status', 'withdrawn');

  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    INSERT INTO idempotency_keys (actor_id, operation, key, request_hash, response, expires_at)
    VALUES (v_actor_id, 'withdraw_exchange_request', p_idempotency_key, v_request_hash, v_response, now() + interval '24 hours');
  END IF;

  RETURN v_response;
END;
$$;
REVOKE EXECUTE ON FUNCTION withdraw_exchange_request(uuid, int, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION withdraw_exchange_request(uuid, int, text) TO authenticated;

-- RPC 5: cancel_before_pickup(...)
CREATE OR REPLACE FUNCTION cancel_before_pickup(
  p_transaction_id uuid,
  p_expected_version int DEFAULT NULL,
  p_reason text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_tx transactions%ROWTYPE;
  v_existing_idempotency idempotency_keys%ROWTYPE;
  v_request_hash text;
  v_response jsonb;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be authenticated' USING ERRCODE = '42501';
  END IF;

  v_request_hash := md5(p_transaction_id::text || ':' || coalesce(p_expected_version::text, 'none') || ':' || coalesce(p_reason, ''));

  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    SELECT * INTO v_existing_idempotency
    FROM idempotency_keys
    WHERE actor_id = v_actor_id AND operation = 'cancel_before_pickup' AND key = p_idempotency_key;

    IF FOUND THEN
      IF v_existing_idempotency.request_hash = v_request_hash THEN
        RETURN v_existing_idempotency.response;
      ELSE
        RAISE EXCEPTION 'Idempotency conflict: key % reused with different payload', p_idempotency_key USING ERRCODE = '23505';
      END IF;
    END IF;
  END IF;

  SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_actor_id <> v_tx.owner_id AND v_actor_id <> v_tx.requester_id THEN
    RAISE EXCEPTION 'Forbidden: only exchange participants can cancel before pickup' USING ERRCODE = '42501';
  END IF;

  IF v_tx.status NOT IN ('accepted', 'proof_submitted', 'seller_acknowledged', 'seller_disputed') THEN
    RAISE EXCEPTION 'Cannot cancel transaction in state %', v_tx.status USING ERRCODE = '22023';
  END IF;

  IF p_expected_version IS NOT NULL AND v_tx.version <> p_expected_version THEN
    RAISE EXCEPTION 'Conflict: stale version (expected %, current %)', p_expected_version, v_tx.version USING ERRCODE = '40001';
  END IF;

  -- Release matching active reservation
  UPDATE reservations
  SET status = 'released'
  WHERE transaction_id = v_tx.id AND status = 'active';

  -- If sale, revert asset state back to active
  IF v_tx.mode = 'sale' THEN
    UPDATE assets SET status = 'active' WHERE id = v_tx.asset_id;
  END IF;

  UPDATE transactions
  SET status = 'canceled', version = version + 1
  WHERE id = p_transaction_id;

  INSERT INTO audit_events (actor_id, campus_id, action, entity_type, entity_id, details)
  VALUES (v_actor_id, v_tx.campus_id, 'transaction.canceled', 'transaction', v_tx.id, jsonb_build_object('reason', coalesce(p_reason, '')));

  INSERT INTO outbox_events (kind, payload)
  VALUES ('exchange_canceled', jsonb_build_object('transaction_id', v_tx.id, 'canceled_by', v_actor_id));

  v_response := jsonb_build_object('success', true, 'transaction_id', v_tx.id, 'status', 'canceled');

  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    INSERT INTO idempotency_keys (actor_id, operation, key, request_hash, response, expires_at)
    VALUES (v_actor_id, 'cancel_before_pickup', p_idempotency_key, v_request_hash, v_response, now() + interval '24 hours');
  END IF;

  RETURN v_response;
END;
$$;
REVOKE EXECUTE ON FUNCTION cancel_before_pickup(uuid, int, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION cancel_before_pickup(uuid, int, text, text) TO authenticated;

-- RPC 6: submit_payment_proof(...)
CREATE OR REPLACE FUNCTION submit_payment_proof(
  p_transaction_id uuid,
  p_amount_paise int,
  p_storage_path text,
  p_masked_reference text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_tx transactions%ROWTYPE;
  v_expected_prefix text;
  v_proof_version integer;
  v_proof_id uuid;
  v_existing_idempotency idempotency_keys%ROWTYPE;
  v_request_hash text;
  v_response jsonb;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be authenticated' USING ERRCODE = '42501';
  END IF;

  v_request_hash := md5(p_transaction_id::text || ':' || p_amount_paise::text || ':' || p_storage_path);

  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    SELECT * INTO v_existing_idempotency
    FROM idempotency_keys
    WHERE actor_id = v_actor_id AND operation = 'submit_payment_proof' AND key = p_idempotency_key;

    IF FOUND THEN
      IF v_existing_idempotency.request_hash = v_request_hash THEN
        RETURN v_existing_idempotency.response;
      ELSE
        RAISE EXCEPTION 'Idempotency conflict: key % reused with different payload', p_idempotency_key USING ERRCODE = '23505';
      END IF;
    END IF;
  END IF;

  SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_tx.requester_id <> v_actor_id THEN
    RAISE EXCEPTION 'Forbidden: only the buyer/requester can submit payment proof' USING ERRCODE = '42501';
  END IF;

  IF v_tx.status NOT IN ('accepted', 'seller_disputed') THEN
    RAISE EXCEPTION 'Cannot submit proof when transaction is in state %', v_tx.status USING ERRCODE = '22023';
  END IF;

  IF p_amount_paise <> v_tx.quoted_price_paise THEN
    RAISE EXCEPTION 'Validation error: proof amount (% paise) does not match agreed price (% paise)', p_amount_paise, v_tx.quoted_price_paise USING ERRCODE = '22023';
  END IF;

  SELECT coalesce(max(version), 0) + 1 INTO v_proof_version
  FROM payment_proofs
  WHERE transaction_id = v_tx.id;

  IF v_proof_version > 3 THEN
    RAISE EXCEPTION 'Hard cap reached: maximum 3 payment proof submissions per transaction (PAY-06)' USING ERRCODE = '22023';
  END IF;

  v_expected_prefix := 'proofs/' || v_actor_id::text || '/' || p_transaction_id::text || '/';
  IF p_storage_path NOT LIKE (v_expected_prefix || '%') THEN
    RAISE EXCEPTION 'Invalid storage path: must begin with %', v_expected_prefix USING ERRCODE = '22023';
  END IF;

  INSERT INTO payment_proofs (
    transaction_id, payer_id, amount_paise, currency, storage_path, version, masked_reference
  ) VALUES (
    v_tx.id, v_actor_id, p_amount_paise, 'INR', p_storage_path, v_proof_version, p_masked_reference
  ) RETURNING id INTO v_proof_id;

  UPDATE transactions
  SET status = 'proof_submitted', version = version + 1
  WHERE id = p_transaction_id;

  INSERT INTO audit_events (actor_id, campus_id, action, entity_type, entity_id, details)
  VALUES (
    v_actor_id, v_tx.campus_id, 'payment_proof.submitted', 'payment_proof', v_proof_id,
    jsonb_build_object('transaction_id', v_tx.id, 'version', v_proof_version)
  );

  INSERT INTO outbox_events (kind, payload)
  VALUES (
    'proof_submitted',
    jsonb_build_object('transaction_id', v_tx.id, 'owner_id', v_tx.owner_id, 'version', v_proof_version)
  );

  v_response := jsonb_build_object(
    'success', true,
    'proof_id', v_proof_id,
    'version', v_proof_version,
    'status', 'proof_submitted'
  );

  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    INSERT INTO idempotency_keys (actor_id, operation, key, request_hash, response, expires_at)
    VALUES (v_actor_id, 'submit_payment_proof', p_idempotency_key, v_request_hash, v_response, now() + interval '24 hours');
  END IF;

  RETURN v_response;
END;
$$;
REVOKE EXECUTE ON FUNCTION submit_payment_proof(uuid, int, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION submit_payment_proof(uuid, int, text, text, text) TO authenticated;

-- RPC 7: acknowledge_payment(...)
CREATE OR REPLACE FUNCTION acknowledge_payment(
  p_proof_id uuid,
  p_decision text,
  p_reason text DEFAULT NULL,
  p_expected_tx_version int DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_proof payment_proofs%ROWTYPE;
  v_tx transactions%ROWTYPE;
  v_max_version int;
  v_new_status text;
  v_existing_idempotency idempotency_keys%ROWTYPE;
  v_request_hash text;
  v_response jsonb;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_decision NOT IN ('acknowledged', 'disputed') THEN
    RAISE EXCEPTION 'Decision must be either acknowledged or disputed' USING ERRCODE = '22023';
  END IF;

  v_request_hash := md5(p_proof_id::text || ':' || p_decision || ':' || coalesce(p_expected_tx_version::text, 'none'));

  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    SELECT * INTO v_existing_idempotency
    FROM idempotency_keys
    WHERE actor_id = v_actor_id AND operation = 'acknowledge_payment' AND key = p_idempotency_key;

    IF FOUND THEN
      IF v_existing_idempotency.request_hash = v_request_hash THEN
        RETURN v_existing_idempotency.response;
      ELSE
        RAISE EXCEPTION 'Idempotency conflict: key % reused with different payload', p_idempotency_key USING ERRCODE = '23505';
      END IF;
    END IF;
  END IF;

  SELECT * INTO v_proof FROM payment_proofs WHERE id = p_proof_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment proof not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_tx FROM transactions WHERE id = v_proof.transaction_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_tx.owner_id <> v_actor_id THEN
    RAISE EXCEPTION 'Forbidden: only the payee/owner can acknowledge this proof' USING ERRCODE = '42501';
  END IF;

  IF v_tx.status <> 'proof_submitted' THEN
    RAISE EXCEPTION 'Transaction is not in proof_submitted state (current: %)', v_tx.status USING ERRCODE = '22023';
  END IF;

  SELECT max(version) INTO v_max_version FROM payment_proofs WHERE transaction_id = v_tx.id;
  IF v_proof.version <> v_max_version THEN
    RAISE EXCEPTION 'Can only acknowledge the latest proof version (attempted %, current %)', v_proof.version, v_max_version USING ERRCODE = '22023';
  END IF;

  IF p_expected_tx_version IS NOT NULL AND v_tx.version <> p_expected_tx_version THEN
    RAISE EXCEPTION 'Conflict: stale transaction version (expected %, current %)', p_expected_tx_version, v_tx.version USING ERRCODE = '40001';
  END IF;

  INSERT INTO payment_acknowledgements (proof_id, transaction_id, payee_id, decision, reason)
  VALUES (v_proof.id, v_tx.id, v_actor_id, p_decision, coalesce(p_reason, ''));

  IF p_decision = 'acknowledged' THEN
    v_new_status := 'seller_acknowledged';
  ELSE
    v_new_status := 'seller_disputed';
  END IF;

  UPDATE transactions
  SET status = v_new_status, version = version + 1
  WHERE id = v_tx.id;

  INSERT INTO audit_events (actor_id, campus_id, action, entity_type, entity_id, details)
  VALUES (
    v_actor_id, v_tx.campus_id, 'payment.' || p_decision, 'transaction', v_tx.id,
    jsonb_build_object('proof_id', v_proof.id, 'decision', p_decision)
  );

  INSERT INTO outbox_events (kind, payload)
  VALUES (
    'payment_' || p_decision,
    jsonb_build_object('transaction_id', v_tx.id, 'requester_id', v_tx.requester_id, 'decision', p_decision)
  );

  v_response := jsonb_build_object('success', true, 'transaction_id', v_tx.id, 'status', v_new_status);

  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    INSERT INTO idempotency_keys (actor_id, operation, key, request_hash, response, expires_at)
    VALUES (v_actor_id, 'acknowledge_payment', p_idempotency_key, v_request_hash, v_response, now() + interval '24 hours');
  END IF;

  RETURN v_response;
END;
$$;
REVOKE EXECUTE ON FUNCTION acknowledge_payment(uuid, text, text, int, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION acknowledge_payment(uuid, text, text, int, text) TO authenticated;

-- RPC 8: review_membership(...)
CREATE OR REPLACE FUNCTION review_membership(
  p_membership_id uuid,
  p_action text,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_target_m memberships%ROWTYPE;
  v_new_status text;
  v_new_eligibility text;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_action NOT IN ('approve', 'decline', 'suspend', 'expire', 'reactivate') THEN
    RAISE EXCEPTION 'Invalid review action %', p_action USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_target_m FROM memberships WHERE id = p_membership_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Membership record not found' USING ERRCODE = 'P0002';
  END IF;

  IF NOT is_campus_moderator_or_admin(v_target_m.campus_id) THEN
    RAISE EXCEPTION 'Forbidden: active moderator or admin role required' USING ERRCODE = '42501';
  END IF;

  IF v_target_m.user_id = v_actor_id THEN
    RAISE EXCEPTION 'Forbidden: cannot review or alter your own membership' USING ERRCODE = '42501';
  END IF;

  IF p_action = 'approve' THEN
    v_new_status := 'active';
    v_new_eligibility := 'eligible';
  ELSIF p_action = 'decline' THEN
    v_new_status := 'expired';
    v_new_eligibility := 'ineligible';
  ELSIF p_action = 'suspend' THEN
    v_new_status := 'suspended';
    v_new_eligibility := v_target_m.student_eligibility;
  ELSIF p_action = 'expire' THEN
    v_new_status := 'expired';
    v_new_eligibility := v_target_m.student_eligibility;
  ELSIF p_action = 'reactivate' THEN
    v_new_status := 'active';
    v_new_eligibility := 'eligible';
  END IF;

  UPDATE memberships
  SET status = v_new_status, student_eligibility = v_new_eligibility
  WHERE id = p_membership_id;

  INSERT INTO audit_events (actor_id, campus_id, action, entity_type, entity_id, details)
  VALUES (
    v_actor_id, v_target_m.campus_id, 'membership.reviewed', 'membership', v_target_m.id,
    jsonb_build_object('action', p_action, 'reason', coalesce(p_reason, ''), 'target_user_id', v_target_m.user_id)
  );

  INSERT INTO outbox_events (kind, payload)
  VALUES (
    'membership_reviewed',
    jsonb_build_object('membership_id', v_target_m.id, 'action', p_action, 'new_status', v_new_status)
  );

  RETURN jsonb_build_object('success', true, 'membership_id', v_target_m.id, 'status', v_new_status);
END;
$$;
REVOKE EXECUTE ON FUNCTION review_membership(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION review_membership(uuid, text, text) TO authenticated;
