-- supabase/migrations/0007_auto_activate_hitam_members.sql
-- Migration 0007: Automatic Member Activation for Verified @hitam.org Student Accounts
-- Fixes onboarding deadlock where valid college students were stuck in 'pending' status

-- 1. Upgrade ensure_membership() to immediately activate verified @hitam.org accounts
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

  -- Upsert active student membership (Verified @hitam.org accounts are immediately activated)
  INSERT INTO memberships (user_id, campus_id, email, status, role, student_eligibility)
  VALUES (v_actor_id, v_campus_id, v_email, 'active', 'student', 'eligible')
  ON CONFLICT (user_id, campus_id) DO UPDATE
    SET email = EXCLUDED.email,
        status = CASE WHEN memberships.status = 'suspended' THEN 'suspended' ELSE 'active' END,
        student_eligibility = CASE WHEN memberships.status = 'suspended' THEN memberships.student_eligibility ELSE 'eligible' END;

  -- Ensure default preferences
  INSERT INTO preferences (user_id)
  VALUES (v_actor_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Fetch record
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

-- Grant execution to authenticated users
REVOKE EXECUTE ON FUNCTION ensure_membership() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION ensure_membership() TO authenticated;

-- 2. Activate any existing pending memberships with valid @hitam.org addresses
UPDATE memberships
SET status = 'active', student_eligibility = 'eligible'
WHERE email LIKE '%@hitam.org' AND status = 'pending';
