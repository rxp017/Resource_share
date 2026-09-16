-- supabase/fixtures/001_synthetic.sql
-- Ad hoc synthetic fixtures for development, testing, and P02 validation.
-- PREREQUISITE: The following 9 synthetic users must exist in Supabase Dashboard
-- (Authentication -> Users -> Add user, with Auto-confirm User turned ON):
--   1. studentA.test@hitam.org (Seller / Owner)
--   2. studentB.test@hitam.org (Buyer / Requester)
--   3. studentC.test@hitam.org (Observer / Concurrency requester)
--   4. studentP.test@hitam.org (Pending member)
--   5. studentS.test@hitam.org (Suspended member)
--   6. studentX.test@hitam.org (Expired member)
--   7. studentM.test@hitam.org (Assigned moderator on HITAM)
--   8. studentU.test@hitam.org (Unassigned moderator)
--   9. studentT.test@hitam.org (TESTCAMP member)

DO $$
DECLARE
  v_campus_hitam uuid;
  v_campus_testcamp uuid;

  v_user_a uuid;
  v_user_b uuid;
  v_user_c uuid;
  v_user_p uuid;
  v_user_s uuid;
  v_user_x uuid;
  v_user_m uuid;
  v_user_u uuid;
  v_user_t uuid;

  -- Deterministic Asset UUIDs
  v_asset_tx_sale uuid     := 'a0000000-0000-0000-0000-000000000001'::uuid;
  v_asset_tx_rental uuid   := 'a0000000-0000-0000-0000-000000000002'::uuid;
  v_asset_tx_hist uuid     := 'a0000000-0000-0000-0000-000000000003'::uuid;
  v_asset_concurrency uuid := 'a0000000-0000-0000-0000-000000000004'::uuid;
  v_asset_draft uuid       := 'a0000000-0000-0000-0000-000000000005'::uuid;
  v_asset_review uuid      := 'a0000000-0000-0000-0000-000000000006'::uuid;
  v_asset_rejected uuid    := 'a0000000-0000-0000-0000-000000000007'::uuid;
  v_asset_paused uuid      := 'a0000000-0000-0000-0000-000000000008'::uuid;
  v_asset_hidden uuid      := 'a0000000-0000-0000-0000-000000000009'::uuid;

  -- Deterministic Listing UUIDs
  v_listing_tx_sale uuid     := 'b0000000-0000-0000-0000-000000000001'::uuid;
  v_listing_tx_rental uuid   := 'b0000000-0000-0000-0000-000000000002'::uuid;
  v_listing_tx_hist uuid     := 'b0000000-0000-0000-0000-000000000003'::uuid;
  v_listing_concurrency uuid := 'b0000000-0000-0000-0000-000000000004'::uuid;
  v_listing_draft uuid       := 'b0000000-0000-0000-0000-000000000005'::uuid;
  v_listing_review uuid      := 'b0000000-0000-0000-0000-000000000006'::uuid;
  v_listing_rejected uuid    := 'b0000000-0000-0000-0000-000000000007'::uuid;
  v_listing_paused uuid      := 'b0000000-0000-0000-0000-000000000008'::uuid;
  v_listing_hidden uuid      := 'b0000000-0000-0000-0000-000000000009'::uuid;

  -- Deterministic Transaction UUIDs
  v_tx_sale uuid   := 'c0000000-0000-0000-0000-000000000001'::uuid;
  v_tx_rental uuid := 'c0000000-0000-0000-0000-000000000002'::uuid;
  v_tx_hist uuid   := 'c0000000-0000-0000-0000-000000000003'::uuid;

  -- Reservation range variables
  v_start_tz timestamptz;
  v_end_tz timestamptz;

BEGIN
  -- 1. Identify Primary Campus (HITAM)
  SELECT id INTO v_campus_hitam FROM campuses WHERE code = 'HITAM' LIMIT 1;
  IF v_campus_hitam IS NULL THEN
    RAISE EXCEPTION 'HITAM campus record not found. 0001_schema.sql must be applied first.' USING ERRCODE = 'P0002';
  END IF;

  -- 2. Insert or Update Secondary Campus (TESTCAMP)
  INSERT INTO campuses (code, name, status, timezone, allowed_domains, pickup_zones)
  VALUES ('TESTCAMP', 'Test Synthetic Campus', 'active', 'Asia/Kolkata', ARRAY['testcamp.edu'], '[]'::jsonb)
  ON CONFLICT (code) DO UPDATE
    SET name = EXCLUDED.name,
        status = EXCLUDED.status,
        allowed_domains = EXCLUDED.allowed_domains,
        pickup_zones = EXCLUDED.pickup_zones
  RETURNING id INTO v_campus_testcamp;

  -- 3. Resolve All 9 Synthetic Auth Users
  SELECT id INTO v_user_a FROM auth.users WHERE lower(email) = 'studenta.test@hitam.org';
  SELECT id INTO v_user_b FROM auth.users WHERE lower(email) = 'studentb.test@hitam.org';
  SELECT id INTO v_user_c FROM auth.users WHERE lower(email) = 'studentc.test@hitam.org';
  SELECT id INTO v_user_p FROM auth.users WHERE lower(email) = 'studentp.test@hitam.org';
  SELECT id INTO v_user_s FROM auth.users WHERE lower(email) = 'students.test@hitam.org';
  SELECT id INTO v_user_x FROM auth.users WHERE lower(email) = 'studentx.test@hitam.org';
  SELECT id INTO v_user_m FROM auth.users WHERE lower(email) = 'studentm.test@hitam.org';
  SELECT id INTO v_user_u FROM auth.users WHERE lower(email) = 'studentu.test@hitam.org';
  SELECT id INTO v_user_t FROM auth.users WHERE lower(email) = 'studentt.test@hitam.org';

  IF v_user_a IS NULL OR v_user_b IS NULL OR v_user_c IS NULL OR
     v_user_p IS NULL OR v_user_s IS NULL OR v_user_x IS NULL OR
     v_user_m IS NULL OR v_user_u IS NULL OR v_user_t IS NULL THEN
    RAISE EXCEPTION 'Missing synthetic auth users. Please ensure all 9 accounts exist in auth.users before running fixtures.';
  END IF;

  -- 4. Clean Up Prior Fixture Data Idempotently (order preserves FK constraints)
  DELETE FROM reservations WHERE transaction_id IN (v_tx_sale, v_tx_rental, v_tx_hist);
  DELETE FROM transactions WHERE id IN (v_tx_sale, v_tx_rental, v_tx_hist);
  DELETE FROM listing_media WHERE listing_id IN (
    v_listing_tx_sale, v_listing_tx_rental, v_listing_tx_hist, v_listing_concurrency,
    v_listing_draft, v_listing_review, v_listing_rejected, v_listing_paused, v_listing_hidden
  );
  DELETE FROM listings WHERE id IN (
    v_listing_tx_sale, v_listing_tx_rental, v_listing_tx_hist, v_listing_concurrency,
    v_listing_draft, v_listing_review, v_listing_rejected, v_listing_paused, v_listing_hidden
  );
  DELETE FROM assets WHERE id IN (
    v_asset_tx_sale, v_asset_tx_rental, v_asset_tx_hist, v_asset_concurrency,
    v_asset_draft, v_asset_review, v_asset_rejected, v_asset_paused, v_asset_hidden
  );

  -- 5. Upsert Profiles for all 9 users
  INSERT INTO profiles (id, display_name) VALUES
    (v_user_a, 'Student A (Seller)'),
    (v_user_b, 'Student B (Buyer)'),
    (v_user_c, 'Student C (Observer)'),
    (v_user_p, 'Student P (Pending)'),
    (v_user_s, 'Student S (Suspended)'),
    (v_user_x, 'Student X (Expired)'),
    (v_user_m, 'Student M (Moderator Assigned)'),
    (v_user_u, 'Student U (Moderator Unassigned)'),
    (v_user_t, 'Student T (TESTCAMP Member)')
  ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

  -- 6. Upsert Preferences for all 9 users
  INSERT INTO preferences (user_id, style, appearance, motion, density) VALUES
    (v_user_a, 'calm', 'system', 'system', 'comfortable'),
    (v_user_b, 'pulse', 'system', 'system', 'comfortable'),
    (v_user_c, 'calm', 'light', 'system', 'comfortable'),
    (v_user_p, 'calm', 'system', 'system', 'comfortable'),
    (v_user_s, 'calm', 'system', 'system', 'comfortable'),
    (v_user_x, 'calm', 'system', 'system', 'comfortable'),
    (v_user_m, 'calm', 'system', 'system', 'comfortable'),
    (v_user_u, 'calm', 'system', 'system', 'comfortable'),
    (v_user_t, 'calm', 'system', 'system', 'comfortable')
  ON CONFLICT (user_id) DO NOTHING;

  -- 7. Upsert Memberships for all 9 users
  -- Note: memberships.email has valid_hitam_email CHECK constraint: ^[A-Za-z0-9._%+-]+@hitam\.org$
  INSERT INTO memberships (user_id, campus_id, email, status, role, student_eligibility) VALUES
    (v_user_a, v_campus_hitam, 'studenta.test@hitam.org', 'active', 'student', 'eligible'),
    (v_user_b, v_campus_hitam, 'studentb.test@hitam.org', 'active', 'student', 'eligible'),
    (v_user_c, v_campus_hitam, 'studentc.test@hitam.org', 'active', 'student', 'eligible'),
    (v_user_p, v_campus_hitam, 'studentp.test@hitam.org', 'pending', 'student', 'pending'),
    (v_user_s, v_campus_hitam, 'students.test@hitam.org', 'suspended', 'student', 'eligible'),
    (v_user_x, v_campus_hitam, 'studentx.test@hitam.org', 'expired', 'student', 'eligible'),
    (v_user_m, v_campus_hitam, 'studentm.test@hitam.org', 'active', 'moderator', 'eligible'),
    (v_user_u, v_campus_hitam, 'studentu.test@hitam.org', 'active', 'moderator', 'eligible'),
    (v_user_t, v_campus_testcamp, 'studentt.test@hitam.org', 'active', 'student', 'eligible')
  ON CONFLICT (user_id, campus_id) DO UPDATE
    SET email = EXCLUDED.email,
        status = EXCLUDED.status,
        role = EXCLUDED.role,
        student_eligibility = EXCLUDED.student_eligibility;

  -- 8. Assets & Listings Covering All Allowed Statuses

  -- (a) Accepted Sale Asset & Published Listing
  INSERT INTO assets (id, campus_id, owner_id, title, description, status)
  VALUES (v_asset_tx_sale, v_campus_hitam, v_user_a, 'Engineering Mathematics Handbook', 'Higher engineering math handbook.', 'in_exchange');

  INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, condition, defects, mode, price_paise, deposit_paise, pickup_zone, status)
  VALUES (v_listing_tx_sale, v_asset_tx_sale, v_campus_hitam, v_user_a, 'Engineering Mathematics Handbook', 'Comprehensive handbook for sem 1 and 2.', 'textbooks', 'like_new', '', 'sale', 35000, 0, 'Library Entrance', 'published');

  INSERT INTO listing_media (listing_id, storage_path, sort_order)
  VALUES (v_listing_tx_sale, 'listings/' || v_user_a || '/' || v_listing_tx_sale || '/0.jpg', 0);

  -- (b) Accepted Rental Asset & Published Listing
  INSERT INTO assets (id, campus_id, owner_id, title, description, status)
  VALUES (v_asset_tx_rental, v_campus_hitam, v_user_a, 'Casio FX-991EX ClassWiz Calculator', 'Advanced scientific calculator.', 'active');

  INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, condition, defects, mode, price_paise, deposit_paise, pickup_zone, status)
  VALUES (v_listing_tx_rental, v_asset_tx_rental, v_campus_hitam, v_user_a, 'Casio FX-991EX ClassWiz Calculator', 'Available for daily or weekly rental during exam prep.', 'electronics', 'good', '', 'rental', 5000, 20000, 'Main Gate Reception', 'published');

  INSERT INTO listing_media (listing_id, storage_path, sort_order)
  VALUES (v_listing_tx_rental, 'listings/' || v_user_a || '/' || v_listing_tx_rental || '/0.jpg', 0);

  -- (c) Concurrency Target Asset & Published Listing (Clean and available for simultaneous acceptance)
  INSERT INTO assets (id, campus_id, owner_id, title, description, status)
  VALUES (v_asset_concurrency, v_campus_hitam, v_user_a, 'Lab Coat and Safety Glasses Set', 'Clean lab coat and impact safety glasses.', 'active');

  INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, condition, defects, mode, price_paise, deposit_paise, pickup_zone, status)
  VALUES (v_listing_concurrency, v_asset_concurrency, v_campus_hitam, v_user_a, 'Lab Coat and Safety Glasses Set', 'Standard chemistry lab gear set.', 'lab_gear', 'good', '', 'rental', 3000, 10000, 'Canteen Plaza', 'published');

  INSERT INTO listing_media (listing_id, storage_path, sort_order)
  VALUES (v_listing_concurrency, 'listings/' || v_user_a || '/' || v_listing_concurrency || '/0.jpg', 0);

  -- (d) Draft Listing
  INSERT INTO assets (id, campus_id, owner_id, title, description, status)
  VALUES (v_asset_draft, v_campus_hitam, v_user_a, 'Arduino Starter Development Kit', 'Draft listing not yet published.', 'active');

  INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, condition, defects, mode, price_paise, deposit_paise, pickup_zone, status)
  VALUES (v_listing_draft, v_asset_draft, v_campus_hitam, v_user_a, 'Arduino Starter Development Kit', 'Sensors, breadboard, and Arduino Uno board.', 'electronics', 'like_new', '', 'sale', 120000, 0, 'Library Entrance', 'draft');

  -- (e) Pending Review Listing
  INSERT INTO assets (id, campus_id, owner_id, title, description, status)
  VALUES (v_asset_review, v_campus_hitam, v_user_a, 'Surveying Chain & Optical Level', 'Civil engineering surveying equipment.', 'active');

  INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, condition, defects, mode, price_paise, deposit_paise, pickup_zone, status)
  VALUES (v_listing_review, v_asset_review, v_campus_hitam, v_user_a, 'Surveying Chain & Optical Level', 'Complete surveying kit awaiting moderation approval.', 'other', 'good', '', 'rental', 15000, 50000, 'Admin Block Foyer', 'pending_review');

  -- (f) Rejected Listing (with moderation_reason)
  INSERT INTO assets (id, campus_id, owner_id, title, description, status)
  VALUES (v_asset_rejected, v_campus_hitam, v_user_a, 'Non-Compliant Exam Solution Bank', 'Handwritten semester solutions.', 'active');

  INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, condition, defects, mode, price_paise, deposit_paise, pickup_zone, status, moderation_reason)
  VALUES (v_listing_rejected, v_asset_rejected, v_campus_hitam, v_user_a, 'Non-Compliant Exam Solution Bank', 'Proprietary exam materials.', 'other', 'fair', '', 'sale', 10000, 0, 'Library Entrance', 'rejected', 'Violates campus academic integrity policy regarding proprietary exam solutions.');

  -- (g) Paused Listing
  INSERT INTO assets (id, campus_id, owner_id, title, description, status)
  VALUES (v_asset_paused, v_campus_hitam, v_user_a, 'Digital Vernier Caliper & Micrometer', 'Precision measurement tools.', 'active');

  INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, condition, defects, mode, price_paise, deposit_paise, pickup_zone, status)
  VALUES (v_listing_paused, v_asset_paused, v_campus_hitam, v_user_a, 'Digital Vernier Caliper & Micrometer', 'Temporarily paused while owner is off campus.', 'other', 'like_new', '', 'rental', 4000, 15000, 'Canteen Plaza', 'paused');

  -- (h) Hidden Listing (with moderation_reason)
  INSERT INTO assets (id, campus_id, owner_id, title, description, status)
  VALUES (v_asset_hidden, v_campus_hitam, v_user_a, 'Flagged Chemistry Lab Reagents', 'Chemistry glassware and reagents.', 'active');

  INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, condition, defects, mode, price_paise, deposit_paise, pickup_zone, status, moderation_reason)
  VALUES (v_listing_hidden, v_asset_hidden, v_campus_hitam, v_user_a, 'Flagged Chemistry Lab Reagents', 'Hidden pending safety review.', 'lab_gear', 'fair', '', 'sale', 20000, 0, 'Admin Block Foyer', 'hidden', 'Hidden by moderator pending chemical storage and safety compliance verification.');

  -- (i) Completed Historical Listing & Asset
  INSERT INTO assets (id, campus_id, owner_id, title, description, status)
  VALUES (v_asset_tx_hist, v_campus_hitam, v_user_a, 'First Year Drawing Drafter', 'Mini drafter with scale and clips.', 'active');

  INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, condition, defects, mode, price_paise, deposit_paise, pickup_zone, status)
  VALUES (v_listing_tx_hist, v_asset_tx_hist, v_campus_hitam, v_user_a, 'First Year Drawing Drafter', 'Archived historical exchange item.', 'other', 'good', '', 'sale', 25000, 0, 'Library Entrance', 'archived');

  -- 9. Transactions (Exactly 3 initial transactions)

  -- Transaction 1: Accepted Sale
  INSERT INTO transactions (
    id, listing_id, asset_id, campus_id, owner_id, requester_id,
    mode, status, quoted_price_paise, quoted_deposit_paise, pickup_zone, version
  ) VALUES (
    v_tx_sale, v_listing_tx_sale, v_asset_tx_sale, v_campus_hitam, v_user_a, v_user_b,
    'sale', 'accepted', 35000, 0, 'Library Entrance', 2
  );

  -- Transaction 2: Accepted Rental
  INSERT INTO transactions (
    id, listing_id, asset_id, campus_id, owner_id, requester_id,
    mode, status, quoted_price_paise, quoted_deposit_paise,
    start_date, end_date, rental_days, pickup_zone, version
  ) VALUES (
    v_tx_rental, v_listing_tx_rental, v_asset_tx_rental, v_campus_hitam, v_user_a, v_user_b,
    'rental', 'accepted', 25000, 20000,
    current_date + 1, current_date + 5, 5, 'Main Gate Reception', 2
  );

  -- Transaction 3: Completed Historical Sale
  INSERT INTO transactions (
    id, listing_id, asset_id, campus_id, owner_id, requester_id,
    mode, status, quoted_price_paise, quoted_deposit_paise, pickup_zone, version
  ) VALUES (
    v_tx_hist, v_listing_tx_hist, v_asset_tx_hist, v_campus_hitam, v_user_a, v_user_b,
    'sale', 'completed', 25000, 0, 'Library Entrance', 3
  );

  -- 10. Reservations (Exactly 2 active reservations + 1 completed historical)

  -- Reservation 1: Active indefinitely for accepted sale
  INSERT INTO reservations (transaction_id, asset_id, reservation_period, status)
  VALUES (v_tx_sale, v_asset_tx_sale, tstzrange(now(), 'infinity'::timestamptz, '[)'), 'active');

  -- Reservation 2: Active for accepted rental window + 1 hour turnaround buffer
  v_start_tz := ((current_date + 1)::text || ' 00:00:00+00')::timestamptz;
  v_end_tz := ((current_date + 5)::text || ' 23:59:59+00')::timestamptz + interval '1 hour';
  INSERT INTO reservations (transaction_id, asset_id, reservation_period, status)
  VALUES (v_tx_rental, v_asset_tx_rental, tstzrange(v_start_tz, v_end_tz, '[)'), 'active');

  -- Reservation 3: Completed historical reservation in the past (status 'completed' does not block active GiST)
  INSERT INTO reservations (transaction_id, asset_id, reservation_period, status)
  VALUES (v_tx_hist, v_asset_tx_hist, tstzrange(now() - interval '10 days', now() - interval '9 days', '[)'), 'completed');

  RAISE NOTICE 'Synthetic fixtures applied successfully!';
END $$;
