-- supabase/migrations/0005_full_scope_p09_p11.sql
-- Migration 0005: Full Scope Completion (Phases P09, P10, P11)
-- Implements:
-- 1. In-person QR pickup & return custody workflow with hashed single-use challenges,
--    5-minute expiry, rate-limited typed fallback, and two-party finalization.
-- 2. Contextual participant text chat with message persistence and isolation.
-- 3. Durable in-app notifications system.
-- 4. Bilateral trust reviews and public community rating aggregation.
-- 5. Dispute / Case management with campus moderator resolution workflows.

-- =====================================================================
-- 1. Extend Transactions Status Check
-- =====================================================================
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_status_check CHECK (
  status IN (
    'requested',
    'accepted',
    'declined',
    'withdrawn',
    'expired',
    'proof_submitted',
    'seller_acknowledged',
    'seller_disputed',
    'in_progress',
    'completed',
    'canceled',
    'returned_pending_resolution'
  )
);

-- =====================================================================
-- 2. Handoff Sessions (P09: QR & Custody Workflow)
-- =====================================================================
CREATE TABLE IF NOT EXISTS handoff_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  phase text NOT NULL CHECK (phase IN ('pickup', 'return')),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  expected_redeemer uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  challenge_hash text NOT NULL,
  fallback_code_hash text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'canceled')),
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '5 minutes'),
  redeemed_at timestamptz,
  condition_summary text NOT NULL DEFAULT '',
  condition_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_handoff_sessions_tx ON handoff_sessions(transaction_id, phase);

ALTER TABLE handoff_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS handoff_sessions_select ON handoff_sessions;
CREATE POLICY handoff_sessions_select ON handoff_sessions
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() OR expected_redeemer = auth.uid()
  );

-- =====================================================================
-- 3. Handoff Acknowledgements (Two-Party Agreement)
-- =====================================================================
CREATE TABLE IF NOT EXISTS handoff_acknowledgements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES handoff_sessions(id) ON DELETE CASCADE,
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  phase text NOT NULL CHECK (phase IN ('pickup', 'return')),
  decision text NOT NULL CHECK (decision IN ('confirmed', 'disputed')),
  condition_agreed boolean NOT NULL DEFAULT true,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, actor_id)
);

ALTER TABLE handoff_acknowledgements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS handoff_acknowledgements_select ON handoff_acknowledgements;
CREATE POLICY handoff_acknowledgements_select ON handoff_acknowledgements
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = handoff_acknowledgements.transaction_id
        AND (t.owner_id = auth.uid() OR t.requester_id = auth.uid())
    )
  );

-- =====================================================================
-- 4. Messages (P10: Contextual Participant Chat)
-- =====================================================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  content text NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 2000),
  client_msg_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  CONSTRAINT distinct_chat_participants CHECK (sender_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_messages_tx_created ON messages(transaction_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, read_at) WHERE read_at IS NULL;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS messages_select ON messages;
CREATE POLICY messages_select ON messages
  FOR SELECT TO authenticated
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

DROP POLICY IF EXISTS messages_insert ON messages;
CREATE POLICY messages_insert ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = messages.transaction_id
        AND (t.owner_id = auth.uid() OR t.requester_id = auth.uid())
    )
  );

-- =====================================================================
-- 5. Notifications (P10: Durable In-App Notifications)
-- =====================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_select ON notifications;
CREATE POLICY notifications_select ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS notifications_update ON notifications;
CREATE POLICY notifications_update ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================================
-- 6. Reviews (P11: Trust, Ratings & Community Scores)
-- =====================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  reviewee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (transaction_id, reviewer_id),
  CONSTRAINT distinct_review_participants CHECK (reviewer_id <> reviewee_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id, is_published);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reviews_select ON reviews;
CREATE POLICY reviews_select ON reviews
  FOR SELECT TO authenticated
  USING (
    is_published = true
    OR reviewer_id = auth.uid()
  );

-- =====================================================================
-- 7. Disputes & Case Management (P11: Accountability)
-- =====================================================================
CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  campus_id uuid NOT NULL REFERENCES campuses(id) ON DELETE RESTRICT,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  respondent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  category text NOT NULL CHECK (category IN ('condition_mismatch', 'payment_dispute', 'late_return', 'damaged_item', 'unresponsive', 'other')),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
  resolution_notes text NOT NULL DEFAULT '',
  resolver_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_disputes_campus_status ON disputes(campus_id, status);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS disputes_select ON disputes;
CREATE POLICY disputes_select ON disputes
  FOR SELECT TO authenticated
  USING (
    reporter_id = auth.uid()
    OR respondent_id = auth.uid()
    OR is_campus_moderator_or_admin(campus_id)
  );

-- =====================================================================
-- 8. RPC: create_handoff_session (P09)
-- =====================================================================
CREATE OR REPLACE FUNCTION create_handoff_session(
  p_transaction_id uuid,
  p_phase text,
  p_condition_summary text DEFAULT '',
  p_condition_notes text DEFAULT '',
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
  v_expected_redeemer uuid;
  v_raw_token text;
  v_raw_fallback_code text;
  v_token_hash text;
  v_code_hash text;
  v_session_id uuid;
  v_expires_at timestamptz;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_phase NOT IN ('pickup', 'return') THEN
    RAISE EXCEPTION 'Invalid phase: must be pickup or return' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found' USING ERRCODE = 'P0002';
  END IF;

  -- Phase validation and role check
  IF p_phase = 'pickup' THEN
    IF v_tx.mode = 'sale' AND v_tx.status <> 'seller_acknowledged' THEN
      RAISE EXCEPTION 'Cannot initiate pickup: payment must be acknowledged by seller first' USING ERRCODE = '22023';
    ELSIF v_tx.mode = 'rental' AND v_tx.status <> 'seller_acknowledged' THEN
      RAISE EXCEPTION 'Cannot initiate pickup: rental payment must be acknowledged first' USING ERRCODE = '22023';
    ELSIF v_tx.mode = 'free_loan' AND v_tx.status <> 'accepted' THEN
      RAISE EXCEPTION 'Cannot initiate pickup: loan must be in accepted status' USING ERRCODE = '22023';
    END IF;

    IF v_tx.owner_id <> v_actor_id THEN
      RAISE EXCEPTION 'Forbidden: only the asset owner can generate the pickup challenge' USING ERRCODE = '42501';
    END IF;
    v_expected_redeemer := v_tx.requester_id;

  ELSIF p_phase = 'return' THEN
    IF v_tx.mode = 'sale' THEN
      RAISE EXCEPTION 'Return phase is not applicable to sales' USING ERRCODE = '22023';
    END IF;
    IF v_tx.status <> 'in_progress' THEN
      RAISE EXCEPTION 'Cannot initiate return: item is not currently in progress/custody' USING ERRCODE = '22023';
    END IF;

    IF v_tx.requester_id <> v_actor_id THEN
      RAISE EXCEPTION 'Forbidden: only the borrower can generate the return challenge' USING ERRCODE = '42501';
    END IF;
    v_expected_redeemer := v_tx.owner_id;
  END IF;

  -- Generate 128-bit random token + 10-char alphanumeric fallback code
  v_raw_token := 'rs_qr_' || encode(gen_random_bytes(16), 'hex');
  v_raw_fallback_code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  v_token_hash := encode(digest(v_raw_token, 'sha256'), 'hex');
  v_code_hash := encode(digest(v_raw_fallback_code, 'sha256'), 'hex');
  v_expires_at := now() + interval '5 minutes';

  -- Deactivate any prior active sessions for this transaction and phase
  UPDATE handoff_sessions
  SET status = 'canceled'
  WHERE transaction_id = v_tx.id AND phase = p_phase AND status = 'active';

  INSERT INTO handoff_sessions (
    transaction_id, phase, created_by, expected_redeemer,
    challenge_hash, fallback_code_hash, status, expires_at,
    condition_summary, condition_notes
  ) VALUES (
    v_tx.id, p_phase, v_actor_id, v_expected_redeemer,
    v_token_hash, v_code_hash, 'active', v_expires_at,
    coalesce(p_condition_summary, ''), coalesce(p_condition_notes, '')
  ) RETURNING id INTO v_session_id;

  -- Create notification for counterpart
  INSERT INTO notifications (user_id, actor_id, title, body, entity_type, entity_id)
  VALUES (
    v_expected_redeemer,
    v_actor_id,
    'In-Person Handoff Ready',
    'Your counterparty has generated the handoff code. Open the exchange to scan or enter code.',
    'transaction',
    v_tx.id
  );

  RETURN jsonb_build_object(
    'success', true,
    'session_id', v_session_id,
    'token', v_raw_token,
    'fallback_code', v_raw_fallback_code,
    'expires_at', v_expires_at,
    'phase', p_phase
  );
END;
$$;
GRANT EXECUTE ON FUNCTION create_handoff_session(uuid, text, text, text, text) TO authenticated;

-- =====================================================================
-- 9. RPC: redeem_handoff_challenge (P09)
-- =====================================================================
CREATE OR REPLACE FUNCTION redeem_handoff_challenge(
  p_transaction_id uuid,
  p_phase text,
  p_token_or_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_session handoff_sessions%ROWTYPE;
  v_input_hash text;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_token_or_code IS NULL OR length(trim(p_token_or_code)) < 4 THEN
    RAISE EXCEPTION 'Invalid verification code' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_session
  FROM handoff_sessions
  WHERE transaction_id = p_transaction_id AND phase = p_phase AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active handoff session found for this transaction' USING ERRCODE = 'P0002';
  END IF;

  IF v_session.expires_at < now() THEN
    UPDATE handoff_sessions SET status = 'expired' WHERE id = v_session.id;
    RAISE EXCEPTION 'Handoff session has expired. Please ask counterparty to generate a new QR code.' USING ERRCODE = '22023';
  END IF;

  IF v_session.expected_redeemer <> v_actor_id THEN
    RAISE EXCEPTION 'Forbidden: only the designated counterparty can redeem this challenge' USING ERRCODE = '42501';
  END IF;

  IF v_session.attempts >= v_session.max_attempts THEN
    UPDATE handoff_sessions SET status = 'expired' WHERE id = v_session.id;
    RAISE EXCEPTION 'Maximum verification attempts exceeded. Code expired for security.' USING ERRCODE = '22023';
  END IF;

  v_input_hash := encode(digest(trim(p_token_or_code), 'sha256'), 'hex');

  IF v_input_hash <> v_session.challenge_hash AND v_input_hash <> v_session.fallback_code_hash AND
     encode(digest(upper(trim(p_token_or_code)), 'sha256'), 'hex') <> v_session.fallback_code_hash THEN
    UPDATE handoff_sessions SET attempts = attempts + 1 WHERE id = v_session.id;
    RAISE EXCEPTION 'Invalid code or QR token (attempts: % of %)', v_session.attempts + 1, v_session.max_attempts USING ERRCODE = '22023';
  END IF;

  -- Challenge redeemed successfully!
  UPDATE handoff_sessions
  SET status = 'redeemed', redeemed_at = now()
  WHERE id = v_session.id;

  RETURN jsonb_build_object(
    'success', true,
    'session_id', v_session.id,
    'phase', v_session.phase,
    'condition_summary', v_session.condition_summary,
    'condition_notes', v_session.condition_notes,
    'message', 'Code verified! Please inspect item condition and confirm physical handoff.'
  );
END;
$$;
GRANT EXECUTE ON FUNCTION redeem_handoff_challenge(uuid, text, text) TO authenticated;

-- =====================================================================
-- 10. RPC: finalize_handoff (P09: Two-Party Acknowledgement)
-- =====================================================================
CREATE OR REPLACE FUNCTION finalize_handoff(
  p_transaction_id uuid,
  p_session_id uuid,
  p_decision text,
  p_condition_agreed boolean DEFAULT true,
  p_notes text DEFAULT '',
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_session handoff_sessions%ROWTYPE;
  v_tx transactions%ROWTYPE;
  v_ack_count integer;
  v_disagreed_count integer;
  v_new_status text;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_decision NOT IN ('confirmed', 'disputed') THEN
    RAISE EXCEPTION 'Decision must be confirmed or disputed' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_session FROM handoff_sessions WHERE id = p_session_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Handoff session not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_session.transaction_id <> p_transaction_id THEN
    RAISE EXCEPTION 'Session does not match transaction' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_actor_id <> v_tx.owner_id AND v_actor_id <> v_tx.requester_id THEN
    RAISE EXCEPTION 'Forbidden: only exchange participants can finalize handoff' USING ERRCODE = '42501';
  END IF;

  -- Upsert this actor's acknowledgement
  INSERT INTO handoff_acknowledgements (
    session_id, transaction_id, actor_id, phase, decision, condition_agreed, notes
  ) VALUES (
    v_session.id, v_tx.id, v_actor_id, v_session.phase, p_decision, p_condition_agreed, coalesce(p_notes, '')
  ) ON CONFLICT (session_id, actor_id) DO UPDATE SET
    decision = EXCLUDED.decision,
    condition_agreed = EXCLUDED.condition_agreed,
    notes = EXCLUDED.notes;

  -- Check how many distinct participants have acknowledged this session
  SELECT count(*), count(*) FILTER (WHERE condition_agreed = false OR decision = 'disputed')
  INTO v_ack_count, v_disagreed_count
  FROM handoff_acknowledgements
  WHERE session_id = v_session.id;

  IF v_ack_count < 2 THEN
    RETURN jsonb_build_object(
      'success', true,
      'finalized', false,
      'status', v_tx.status,
      'message', 'Your confirmation was recorded. Waiting for the other student to confirm.'
    );
  END IF;

  -- Both distinct participants have confirmed!
  IF v_session.phase = 'pickup' THEN
    IF v_tx.mode = 'sale' THEN
      v_new_status := 'completed';
      -- Sale completed: update asset status
      UPDATE assets SET status = 'in_exchange' WHERE id = v_tx.asset_id;
      -- Release reservation
      UPDATE reservations SET status = 'completed' WHERE transaction_id = v_tx.id;
    ELSE
      v_new_status := 'in_progress';
      UPDATE assets SET status = 'in_exchange' WHERE id = v_tx.asset_id;
    END IF;

  ELSIF v_session.phase = 'return' THEN
    IF v_disagreed_count > 0 THEN
      -- Disagreement on condition: record owner custody + open dispute
      v_new_status := 'returned_pending_resolution';
      UPDATE assets SET status = 'active' WHERE id = v_tx.asset_id;
      UPDATE reservations SET status = 'released' WHERE transaction_id = v_tx.id;

      INSERT INTO disputes (
        transaction_id, campus_id, reporter_id, respondent_id, category, reason
      ) VALUES (
        v_tx.id, v_tx.campus_id, v_tx.owner_id, v_tx.requester_id, 'condition_mismatch',
        'Participants disagreed on condition upon physical return. Handoff notes: ' || coalesce(p_notes, '')
      );
    ELSE
      v_new_status := 'completed';
      UPDATE assets SET status = 'active' WHERE id = v_tx.asset_id;
      UPDATE reservations SET status = 'completed' WHERE transaction_id = v_tx.id;
    END IF;
  END IF;

  UPDATE transactions
  SET status = v_new_status, version = version + 1
  WHERE id = v_tx.id;

  INSERT INTO audit_events (actor_id, campus_id, action, entity_type, entity_id, details)
  VALUES (
    v_actor_id, v_tx.campus_id, 'handoff.finalized', 'transaction', v_tx.id,
    jsonb_build_object('phase', v_session.phase, 'status', v_new_status, 'session_id', v_session.id)
  );

  INSERT INTO notifications (user_id, actor_id, title, body, entity_type, entity_id)
  VALUES (
    CASE WHEN v_actor_id = v_tx.owner_id THEN v_tx.requester_id ELSE v_tx.owner_id END,
    v_actor_id,
    'Handoff Finalized: ' || initcap(v_session.phase),
    'Both participants confirmed. Transaction is now ' || v_new_status || '.',
    'transaction',
    v_tx.id
  );

  RETURN jsonb_build_object(
    'success', true,
    'finalized', true,
    'status', v_new_status,
    'phase', v_session.phase,
    'message', 'Handoff successfully confirmed by both participants!'
  );
END;
$$;
GRANT EXECUTE ON FUNCTION finalize_handoff(uuid, uuid, text, boolean, text, text) TO authenticated;

-- =====================================================================
-- 11. RPC: send_chat_message (P10)
-- =====================================================================
CREATE OR REPLACE FUNCTION send_chat_message(
  p_transaction_id uuid,
  p_content text,
  p_client_msg_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_tx transactions%ROWTYPE;
  v_recipient_id uuid;
  v_msg_id uuid;
  v_created_at timestamptz;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_content IS NULL OR length(trim(p_content)) = 0 THEN
    RAISE EXCEPTION 'Message content cannot be empty' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_actor_id = v_tx.owner_id THEN
    v_recipient_id := v_tx.requester_id;
  ELSIF v_actor_id = v_tx.requester_id THEN
    v_recipient_id := v_tx.owner_id;
  ELSE
    RAISE EXCEPTION 'Forbidden: only participants can message in this exchange' USING ERRCODE = '42501';
  END IF;

  -- Check client message ID deduplication
  IF p_client_msg_id IS NOT NULL AND p_client_msg_id <> '' THEN
    SELECT id, created_at INTO v_msg_id, v_created_at
    FROM messages
    WHERE transaction_id = v_tx.id AND sender_id = v_actor_id AND client_msg_id = p_client_msg_id;

    IF FOUND THEN
      RETURN jsonb_build_object('success', true, 'id', v_msg_id, 'created_at', v_created_at, 'deduplicated', true);
    END IF;
  END IF;

  INSERT INTO messages (
    transaction_id, sender_id, recipient_id, content, client_msg_id
  ) VALUES (
    v_tx.id, v_actor_id, v_recipient_id, trim(p_content), p_client_msg_id
  ) RETURNING id, created_at INTO v_msg_id, v_created_at;

  -- In-app notification for recipient
  INSERT INTO notifications (user_id, actor_id, title, body, entity_type, entity_id)
  VALUES (
    v_recipient_id,
    v_actor_id,
    'New message on exchange',
    substring(trim(p_content), 1, 80),
    'transaction',
    v_tx.id
  );

  RETURN jsonb_build_object(
    'success', true,
    'id', v_msg_id,
    'sender_id', v_actor_id,
    'recipient_id', v_recipient_id,
    'content', trim(p_content),
    'created_at', v_created_at
  );
END;
$$;
GRANT EXECUTE ON FUNCTION send_chat_message(uuid, text, text) TO authenticated;

-- =====================================================================
-- 12. RPC: submit_review (P11)
-- =====================================================================
CREATE OR REPLACE FUNCTION submit_review(
  p_transaction_id uuid,
  p_rating integer,
  p_comment text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_tx transactions%ROWTYPE;
  v_reviewee_id uuid;
  v_review_id uuid;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5 stars' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_tx.status <> 'completed' THEN
    RAISE EXCEPTION 'Can only review completed exchanges' USING ERRCODE = '22023';
  END IF;

  IF v_actor_id = v_tx.owner_id THEN
    v_reviewee_id := v_tx.requester_id;
  ELSIF v_actor_id = v_tx.requester_id THEN
    v_reviewee_id := v_tx.owner_id;
  ELSE
    RAISE EXCEPTION 'Forbidden: only participants can submit a review' USING ERRCODE = '42501';
  END IF;

  INSERT INTO reviews (
    transaction_id, reviewer_id, reviewee_id, rating, comment
  ) VALUES (
    v_tx.id, v_actor_id, v_reviewee_id, p_rating, coalesce(p_comment, '')
  ) RETURNING id INTO v_review_id;

  INSERT INTO notifications (user_id, actor_id, title, body, entity_type, entity_id)
  VALUES (
    v_reviewee_id,
    v_actor_id,
    'New Peer Review Received',
    'A counterparty left a ' || p_rating || '-star rating for your completed exchange.',
    'review',
    v_review_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'review_id', v_review_id,
    'rating', p_rating,
    'message', 'Review submitted successfully!'
  );
END;
$$;
GRANT EXECUTE ON FUNCTION submit_review(uuid, integer, text) TO authenticated;

-- =====================================================================
-- 13. RPC: report_dispute & resolve_dispute (P11)
-- =====================================================================
CREATE OR REPLACE FUNCTION report_dispute(
  p_transaction_id uuid,
  p_category text,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_tx transactions%ROWTYPE;
  v_respondent_id uuid;
  v_dispute_id uuid;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_category NOT IN ('condition_mismatch', 'payment_dispute', 'late_return', 'damaged_item', 'unresponsive', 'other') THEN
    RAISE EXCEPTION 'Invalid dispute category' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_actor_id = v_tx.owner_id THEN
    v_respondent_id := v_tx.requester_id;
  ELSIF v_actor_id = v_tx.requester_id THEN
    v_respondent_id := v_tx.owner_id;
  ELSE
    RAISE EXCEPTION 'Forbidden: only participants can report a dispute' USING ERRCODE = '42501';
  END IF;

  INSERT INTO disputes (
    transaction_id, campus_id, reporter_id, respondent_id, category, reason
  ) VALUES (
    v_tx.id, v_tx.campus_id, v_actor_id, v_respondent_id, p_category, coalesce(p_reason, '')
  ) RETURNING id INTO v_dispute_id;

  RETURN jsonb_build_object(
    'success', true,
    'dispute_id', v_dispute_id,
    'status', 'open',
    'message', 'Dispute case submitted for campus moderator review.'
  );
END;
$$;
GRANT EXECUTE ON FUNCTION report_dispute(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION resolve_dispute(
  p_dispute_id uuid,
  p_resolution text,
  p_notes text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_dispute disputes%ROWTYPE;
  v_tx transactions%ROWTYPE;
  v_new_status text;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_dispute FROM disputes WHERE id = p_dispute_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Dispute not found' USING ERRCODE = 'P0002';
  END IF;

  IF NOT is_campus_moderator_or_admin(v_dispute.campus_id) THEN
    RAISE EXCEPTION 'Forbidden: active moderator or admin role required' USING ERRCODE = '42501';
  END IF;

  IF p_resolution = 'dismiss' THEN
    v_new_status := 'dismissed';
  ELSE
    v_new_status := 'resolved';
  END IF;

  UPDATE disputes
  SET status = v_new_status, resolution_notes = coalesce(p_notes, ''), resolver_id = v_actor_id, updated_at = now()
  WHERE id = p_dispute_id;

  -- If transaction was in returned_pending_resolution, transition to completed
  SELECT * INTO v_tx FROM transactions WHERE id = v_dispute.transaction_id;
  IF v_tx.status = 'returned_pending_resolution' THEN
    UPDATE transactions SET status = 'completed', version = version + 1 WHERE id = v_tx.id;
  END IF;

  -- Notify both parties
  INSERT INTO notifications (user_id, actor_id, title, body, entity_type, entity_id)
  VALUES
    (v_dispute.reporter_id, v_actor_id, 'Dispute Case ' || initcap(v_new_status), coalesce(p_notes, 'Case reviewed by campus moderator.'), 'dispute', v_dispute.id),
    (v_dispute.respondent_id, v_actor_id, 'Dispute Case ' || initcap(v_new_status), coalesce(p_notes, 'Case reviewed by campus moderator.'), 'dispute', v_dispute.id);

  RETURN jsonb_build_object(
    'success', true,
    'dispute_id', p_dispute_id,
    'status', v_new_status
  );
END;
$$;
GRANT EXECUTE ON FUNCTION resolve_dispute(uuid, text, text) TO authenticated;

-- =====================================================================
-- 14. Trust Profile Helper (P11)
-- =====================================================================
CREATE OR REPLACE FUNCTION get_trust_profile(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_display_name text;
  v_avatar_url text;
  v_completed_count integer := 0;
  v_review_count integer := 0;
  v_avg_rating numeric(3,2) := 0.00;
  v_member_since timestamptz;
  v_role text := 'student';
BEGIN
  SELECT p.display_name, p.avatar_url, m.created_at, m.role
  INTO v_display_name, v_avatar_url, v_member_since, v_role
  FROM profiles p
  LEFT JOIN memberships m ON m.user_id = p.id
  WHERE p.id = p_user_id
  LIMIT 1;

  SELECT count(*) INTO v_completed_count
  FROM transactions
  WHERE (owner_id = p_user_id OR requester_id = p_user_id) AND status = 'completed';

  SELECT count(*), coalesce(avg(rating), 0.00)
  INTO v_review_count, v_avg_rating
  FROM reviews
  WHERE reviewee_id = p_user_id AND is_published = true;

  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'display_name', coalesce(v_display_name, 'HITAM Student'),
    'avatar_url', v_avatar_url,
    'role', coalesce(v_role, 'student'),
    'member_since', v_member_since,
    'completed_count', v_completed_count,
    'review_count', v_review_count,
    'avg_rating', round(v_avg_rating, 2),
    'is_newcomer', (v_review_count < 3)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION get_trust_profile(uuid) TO authenticated;
