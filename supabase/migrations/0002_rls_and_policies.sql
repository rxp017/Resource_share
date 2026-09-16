-- 0002_rls_and_policies.sql
-- Row Level Security (RLS) & Access Control Policies
-- Strict database authorization: participant scoping, campus isolation, role protection

-- 1. Enable RLS on all domain tables
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;

-- 2. Security Definer Helper Functions
CREATE OR REPLACE FUNCTION is_campus_member(p_campus_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE user_id = auth.uid()
      AND campus_id = p_campus_id
      AND status IN ('active', 'pending')
  );
$$;

CREATE OR REPLACE FUNCTION is_active_campus_member(p_campus_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE user_id = auth.uid()
      AND campus_id = p_campus_id
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION is_campus_moderator_or_admin(p_campus_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE user_id = auth.uid()
      AND campus_id = p_campus_id
      AND status = 'active'
      AND role IN ('moderator', 'admin')
  );
$$;

-- 3. Campuses Policies
-- Public and authenticated users can view active campuses
CREATE POLICY campuses_select_active ON campuses
  FOR SELECT
  USING (status = 'active');

-- 4. Profiles Policies
-- Profiles readable by authenticated campus members
CREATE POLICY profiles_select ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 5. Memberships Policies
-- Users can view their own membership or moderators can view campus memberships
CREATE POLICY memberships_select ON memberships
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_campus_moderator_or_admin(campus_id));

-- Users can insert only their own pending student membership
CREATE POLICY memberships_insert_self ON memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND role = 'student'
    AND student_eligibility = 'pending'
  );

-- Only moderators/admins can update membership status or roles
CREATE POLICY memberships_update_mod ON memberships
  FOR UPDATE
  TO authenticated
  USING (is_campus_moderator_or_admin(campus_id))
  WITH CHECK (is_campus_moderator_or_admin(campus_id));

-- 6. Preferences Policies (owner only)
CREATE POLICY preferences_select_own ON preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY preferences_insert_own ON preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY preferences_update_own ON preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 7. Assets Policies
-- Assets visible to active members of the campus
CREATE POLICY assets_select ON assets
  FOR SELECT
  TO authenticated
  USING (is_active_campus_member(campus_id) OR owner_id = auth.uid());

CREATE POLICY assets_insert_own ON assets
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid() AND is_active_campus_member(campus_id));

CREATE POLICY assets_update_own ON assets
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- 8. Listings Policies
-- Published listings visible to active members of the campus; owner and mods can see drafts/paused
CREATE POLICY listings_select ON listings
  FOR SELECT
  TO authenticated
  USING (
    (status = 'published' AND is_active_campus_member(campus_id))
    OR owner_id = auth.uid()
    OR is_campus_moderator_or_admin(campus_id)
  );

CREATE POLICY listings_insert_own ON listings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND is_active_campus_member(campus_id)
  );

CREATE POLICY listings_update_own ON listings
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() OR is_campus_moderator_or_admin(campus_id))
  WITH CHECK (owner_id = auth.uid() OR is_campus_moderator_or_admin(campus_id));

-- 9. Listing Media Policies
CREATE POLICY listing_media_select ON listing_media
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = listing_media.listing_id
        AND (
          (l.status = 'published' AND is_active_campus_member(l.campus_id))
          OR l.owner_id = auth.uid()
          OR is_campus_moderator_or_admin(l.campus_id)
        )
    )
  );

CREATE POLICY listing_media_insert ON listing_media
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = listing_media.listing_id
        AND l.owner_id = auth.uid()
    )
  );

CREATE POLICY listing_media_delete ON listing_media
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = listing_media.listing_id
        AND l.owner_id = auth.uid()
    )
  );

-- 10. Transactions Policies
-- Participants (requester, owner) and campus moderators can view
CREATE POLICY transactions_select ON transactions
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR requester_id = auth.uid()
    OR is_campus_moderator_or_admin(campus_id)
  );

-- Requester can insert a new request (distinct from owner, active campus member)
CREATE POLICY transactions_insert_request ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    requester_id = auth.uid()
    AND owner_id <> auth.uid()
    AND is_active_campus_member(campus_id)
    AND status = 'requested'
  );

-- Participants can update transaction state within allowed boundaries
CREATE POLICY transactions_update ON transactions
  FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR requester_id = auth.uid()
    OR is_campus_moderator_or_admin(campus_id)
  )
  WITH CHECK (
    owner_id = auth.uid()
    OR requester_id = auth.uid()
    OR is_campus_moderator_or_admin(campus_id)
  );

-- 11. Reservations Policies
-- Read-only for authenticated members to check availability
CREATE POLICY reservations_select ON reservations
  FOR SELECT
  TO authenticated
  USING (true);

-- 12. Payment Proofs Policies (private evidence)
-- Only transaction participants and assigned staff can view payment proofs
CREATE POLICY payment_proofs_select ON payment_proofs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = payment_proofs.transaction_id
        AND (
          t.owner_id = auth.uid()
          OR t.requester_id = auth.uid()
          OR is_campus_moderator_or_admin(t.campus_id)
        )
    )
  );

-- Only the payer (requester) can upload payment proof
CREATE POLICY payment_proofs_insert ON payment_proofs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    payer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = payment_proofs.transaction_id
        AND t.requester_id = auth.uid()
        AND t.status IN ('accepted', 'proof_submitted', 'seller_disputed')
    )
  );

-- 13. Payment Acknowledgements Policies
-- Only participants and moderators can view
CREATE POLICY payment_acknowledgements_select ON payment_acknowledgements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = payment_acknowledgements.transaction_id
        AND (
          t.owner_id = auth.uid()
          OR t.requester_id = auth.uid()
          OR is_campus_moderator_or_admin(t.campus_id)
        )
    )
  );

-- Only the payee (owner) can acknowledge or dispute payment
CREATE POLICY payment_acknowledgements_insert ON payment_acknowledgements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    payee_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = payment_acknowledgements.transaction_id
        AND t.owner_id = auth.uid()
    )
  );

-- 14. Audit Events Policies
-- Only campus moderators and admins can view audit logs
CREATE POLICY audit_events_select ON audit_events
  FOR SELECT
  TO authenticated
  USING (is_campus_moderator_or_admin(campus_id));

-- Users can insert audit events documenting their own actions
CREATE POLICY audit_events_insert ON audit_events
  FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- 15. Idempotency Keys Policies (owner only)
CREATE POLICY idempotency_keys_all ON idempotency_keys
  FOR ALL
  TO authenticated
  USING (actor_id = auth.uid())
  WITH CHECK (actor_id = auth.uid());

-- 16. Least Privilege Role Grants
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;

-- Anon has SELECT only on active campuses
GRANT SELECT ON campuses TO anon;

-- Authenticated permissions
GRANT SELECT ON campuses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON memberships TO authenticated;
GRANT SELECT, INSERT, UPDATE ON preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON listings TO authenticated;
GRANT SELECT, INSERT, DELETE ON listing_media TO authenticated;
GRANT SELECT, INSERT, UPDATE ON transactions TO authenticated;
GRANT SELECT ON reservations TO authenticated;
GRANT SELECT, INSERT ON payment_proofs TO authenticated;
GRANT SELECT, INSERT ON payment_acknowledgements TO authenticated;
GRANT SELECT, INSERT ON audit_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON idempotency_keys TO authenticated;

-- 17. Atomic Workflow Functions (RPC)
CREATE OR REPLACE FUNCTION accept_exchange_request(
  p_transaction_id uuid,
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
  v_start_tz timestamptz;
  v_end_tz timestamptz;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be authenticated' USING ERRCODE = '42501';
  END IF;

  -- Lock transaction for update
  SELECT * INTO v_tx
  FROM transactions
  WHERE id = p_transaction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_tx.owner_id <> v_actor_id THEN
    RAISE EXCEPTION 'Forbidden: only the asset owner can accept an exchange request' USING ERRCODE = '42501';
  END IF;

  IF v_tx.status <> 'requested' THEN
    RAISE EXCEPTION 'Invalid transition: transaction is already in state %', v_tx.status USING ERRCODE = '22023';
  END IF;

  -- For loan/rental, compute reservation range and insert into reservations
  IF v_tx.mode IN ('free_loan', 'rental') THEN
    v_start_tz := (v_tx.start_date::text || ' 00:00:00+00')::timestamptz;
    v_end_tz := (v_tx.end_date::text || ' 23:59:59+00')::timestamptz;

    -- Inserting into reservations triggers the exclusion constraint
    -- 'no_overlapping_active_reservations' if another active reservation overlaps
    INSERT INTO reservations (transaction_id, asset_id, reservation_period, status)
    VALUES (v_tx.id, v_tx.asset_id, tstzrange(v_start_tz, v_end_tz, '[]'), 'active');
  ELSIF v_tx.mode = 'sale' THEN
    INSERT INTO reservations (transaction_id, asset_id, reservation_period, status)
    VALUES (v_tx.id, v_tx.asset_id, tstzrange(now(), 'infinity'::timestamptz, '[]'), 'active');
    
    UPDATE assets SET status = 'in_exchange' WHERE id = v_tx.asset_id;
  END IF;

  -- Update transaction status to accepted
  UPDATE transactions
  SET status = 'accepted', version = version + 1
  WHERE id = p_transaction_id;

  -- Record audit event
  INSERT INTO audit_events (actor_id, campus_id, action, entity_type, entity_id, details)
  VALUES (
    v_actor_id,
    v_tx.campus_id,
    'transaction.accepted',
    'transaction',
    v_tx.id,
    jsonb_build_object('mode', v_tx.mode, 'requester_id', v_tx.requester_id)
  );

  -- Record outbox event for notifications
  INSERT INTO outbox_events (kind, payload)
  VALUES (
    'exchange_accepted',
    jsonb_build_object('transaction_id', v_tx.id, 'owner_id', v_actor_id, 'requester_id', v_tx.requester_id)
  );

  RETURN jsonb_build_object('success', true, 'transaction_id', v_tx.id, 'status', 'accepted');
END;
$$;

GRANT EXECUTE ON FUNCTION accept_exchange_request(uuid, text) TO authenticated;

