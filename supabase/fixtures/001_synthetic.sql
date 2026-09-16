-- supabase/fixtures/001_synthetic.sql
-- Ad hoc synthetic fixtures for development, testing, and P02 validation.
-- PREREQUISITE: Create three users in Supabase Dashboard (Authentication -> Users -> Add user, Auto-confirm ON):
--   1. studentA.test@hitam.org
--   2. studentB.test@hitam.org
--   3. studentC.test@hitam.org

DO $$
DECLARE
  v_campus_hitam uuid;
  v_campus_testcamp uuid;
  v_user_a uuid;
  v_user_b uuid;
  v_user_c uuid;
  v_mod_assigned uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  v_mod_unassigned uuid := '00000000-0000-0000-0000-000000000002'::uuid;
  v_user_pending uuid := '00000000-0000-0000-0000-000000000003'::uuid;
  v_user_suspended uuid := '00000000-0000-0000-0000-000000000004'::uuid;
  v_user_expired uuid := '00000000-0000-0000-0000-000000000005'::uuid;
  v_user_testcamp uuid := '00000000-0000-0000-0000-000000000006'::uuid;

  v_asset_sale uuid := gen_random_uuid();
  v_asset_rental1 uuid := gen_random_uuid();
  v_asset_rental2 uuid := gen_random_uuid();
  v_asset_free uuid := gen_random_uuid();
  v_asset_draft uuid := gen_random_uuid();
  v_asset_review uuid := gen_random_uuid();
  v_asset_rejected uuid := gen_random_uuid();
  v_asset_paused uuid := gen_random_uuid();
  v_asset_hidden uuid := gen_random_uuid();
  v_asset_hist uuid := gen_random_uuid();

  v_listing_sale uuid := gen_random_uuid();
  v_listing_rental1 uuid := gen_random_uuid();
  v_listing_rental2 uuid := gen_random_uuid();
  v_listing_free uuid := gen_random_uuid();
  v_listing_draft uuid := gen_random_uuid();
  v_listing_review uuid := gen_random_uuid();
  v_listing_rejected uuid := gen_random_uuid();
  v_listing_paused uuid := gen_random_uuid();
  v_listing_hidden uuid := gen_random_uuid();
  v_listing_hist uuid := gen_random_uuid();

  v_tx_sale uuid := gen_random_uuid();
  v_tx_rental uuid := gen_random_uuid();
  v_tx_hist uuid := gen_random_uuid();
BEGIN
  -- 1. Identify Campuses
  SELECT id INTO v_campus_hitam FROM campuses WHERE code = 'HITAM' LIMIT 1;
  IF v_campus_hitam IS NULL THEN
    RAISE EXCEPTION 'HITAM campus not found. Did you run 0001_schema.sql?';
  END IF;

  -- Create second synthetic campus TESTCAMP if absent
  INSERT INTO campuses (code, name, domain, status, settings)
  VALUES ('TESTCAMP', 'Test Synthetic Campus', 'testcamp.edu', 'active', '{}'::jsonb)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_campus_testcamp;

  -- 2. Resolve Synthetic Auth Users
  SELECT id INTO v_user_a FROM auth.users WHERE email = 'studentA.test@hitam.org';
  SELECT id INTO v_user_b FROM auth.users WHERE email = 'studentB.test@hitam.org';
  SELECT id INTO v_user_c FROM auth.users WHERE email = 'studentC.test@hitam.org';

  IF v_user_a IS NULL OR v_user_b IS NULL OR v_user_c IS NULL THEN
    RAISE NOTICE 'WARNING: Synthetic auth users studentA/B/C not found in auth.users. Profiles and memberships for A/B/C will be created if auth users exist.';
  END IF;

  -- Upsert synthetic profiles
  IF v_user_a IS NOT NULL THEN
    INSERT INTO profiles (id, display_name) VALUES (v_user_a, 'Student A (Seller)') ON CONFLICT (id) DO NOTHING;
    INSERT INTO memberships (user_id, campus_id, email, status, role, student_eligibility)
    VALUES (v_user_a, v_campus_hitam, 'studenta.test@hitam.org', 'active', 'student', 'eligible')
    ON CONFLICT (user_id, campus_id) DO UPDATE SET status = 'active', student_eligibility = 'eligible';
    INSERT INTO preferences (user_id) VALUES (v_user_a) ON CONFLICT (user_id) DO NOTHING;
  END IF;

  IF v_user_b IS NOT NULL THEN
    INSERT INTO profiles (id, display_name) VALUES (v_user_b, 'Student B (Buyer)') ON CONFLICT (id) DO NOTHING;
    INSERT INTO memberships (user_id, campus_id, email, status, role, student_eligibility)
    VALUES (v_user_b, v_campus_hitam, 'studentb.test@hitam.org', 'active', 'student', 'eligible')
    ON CONFLICT (user_id, campus_id) DO UPDATE SET status = 'active', student_eligibility = 'eligible';
    INSERT INTO preferences (user_id) VALUES (v_user_b) ON CONFLICT (user_id) DO NOTHING;
  END IF;

  IF v_user_c IS NOT NULL THEN
    INSERT INTO profiles (id, display_name) VALUES (v_user_c, 'Student C (Observer/Concurrent)') ON CONFLICT (id) DO NOTHING;
    INSERT INTO memberships (user_id, campus_id, email, status, role, student_eligibility)
    VALUES (v_user_c, v_campus_hitam, 'studentc.test@hitam.org', 'active', 'student', 'eligible')
    ON CONFLICT (user_id, campus_id) DO UPDATE SET status = 'active', student_eligibility = 'eligible';
    INSERT INTO preferences (user_id) VALUES (v_user_c) ON CONFLICT (user_id) DO NOTHING;
  END IF;

  -- Synthetic auxiliary profiles & memberships (fixtures)
  INSERT INTO profiles (id, display_name) VALUES
    (v_mod_assigned, 'Mod Assigned (HITAM)'),
    (v_mod_unassigned, 'Mod Unassigned (Global)'),
    (v_user_pending, 'Pending Student'),
    (v_user_suspended, 'Suspended Student'),
    (v_user_expired, 'Expired Student'),
    (v_user_testcamp, 'Testcamp Student')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO memberships (user_id, campus_id, email, status, role, student_eligibility) VALUES
    (v_mod_assigned, v_campus_hitam, 'mod.assigned@hitam.org', 'active', 'moderator', 'eligible'),
    (v_mod_unassigned, v_campus_hitam, 'mod.unassigned@hitam.org', 'active', 'moderator', 'eligible'),
    (v_user_pending, v_campus_hitam, 'pending.fixture@hitam.org', 'pending', 'student', 'pending'),
    (v_user_suspended, v_campus_hitam, 'suspended.fixture@hitam.org', 'suspended', 'student', 'eligible'),
    (v_user_expired, v_campus_hitam, 'expired.fixture@hitam.org', 'expired', 'student', 'eligible'),
    (v_user_testcamp, v_campus_testcamp, 'student@testcamp.edu', 'active', 'student', 'eligible')
  ON CONFLICT (user_id, campus_id) DO NOTHING;

  -- 3. Listings across all statuses (owned by user_a if exists, else mod_assigned)
  DECLARE
    v_owner uuid := coalesce(v_user_a, v_mod_assigned);
    v_buyer uuid := coalesce(v_user_b, v_user_c, v_mod_unassigned);
  BEGIN
    -- Asset & Listing: Published Sale
    INSERT INTO assets (id, campus_id, owner_id, title, category, condition, status)
    VALUES (v_asset_sale, v_campus_hitam, v_owner, 'Engineering Physics Textbook', 'textbooks', 'like_new', 'active');
    INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, mode, price_paise, deposit_paise, pickup_zone, status)
    VALUES (v_listing_sale, v_asset_sale, v_campus_hitam, v_owner, 'Engineering Physics Textbook', 'First year physics textbook in pristine condition.', 'textbooks', 'sale', 35000, 0, 'Library Ground Floor', 'published');
    INSERT INTO listing_media (listing_id, storage_path, sort_order)
    VALUES (v_listing_sale, 'listings/' || v_owner || '/' || v_listing_sale || '/0.jpg', 0);

    -- Asset & Listing: Published Rental 1
    INSERT INTO assets (id, campus_id, owner_id, title, category, condition, status)
    VALUES (v_asset_rental1, v_campus_hitam, v_owner, 'Casio FX-991EX Scientific Calculator', 'electronics', 'good', 'active');
    INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, mode, price_paise, deposit_paise, pickup_zone, status)
    VALUES (v_listing_rental1, v_asset_rental1, v_campus_hitam, v_owner, 'Casio FX-991EX Scientific Calculator', 'Ideal for semester exams. Daily rental.', 'electronics', 'rental', 5000, 20000, 'Academic Block Entrance', 'published');
    INSERT INTO listing_media (listing_id, storage_path, sort_order)
    VALUES (v_listing_rental1, 'listings/' || v_owner || '/' || v_listing_rental1 || '/0.jpg', 0);

    -- Asset & Listing: Published Rental 2 (For concurrency test)
    INSERT INTO assets (id, campus_id, owner_id, title, category, condition, status)
    VALUES (v_asset_rental2, v_campus_hitam, v_owner, 'Lab Apron & Safety Goggles', 'lab_gear', 'good', 'active');
    INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, mode, price_paise, deposit_paise, pickup_zone, status)
    VALUES (v_listing_rental2, v_asset_rental2, v_campus_hitam, v_owner, 'Lab Apron & Safety Goggles', 'Clean white apron size L with goggles.', 'lab_gear', 'rental', 3000, 10000, 'Chemistry Lab Porch', 'published');
    INSERT INTO listing_media (listing_id, storage_path, sort_order)
    VALUES (v_listing_rental2, 'listings/' || v_owner || '/' || v_listing_rental2 || '/0.jpg', 0);

    -- Asset & Listing: Published Free Loan
    INSERT INTO assets (id, campus_id, owner_id, title, category, condition, status)
    VALUES (v_asset_free, v_campus_hitam, v_owner, 'Drafter & Drawing Board', 'drafting', 'fair', 'active');
    INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, mode, price_paise, deposit_paise, pickup_zone, status)
    VALUES (v_listing_free, v_asset_free, v_campus_hitam, v_owner, 'Drafter & Drawing Board', 'Free loan for drawing assignments. Please return safely.', 'drafting', 'free_loan', 0, 0, 'Design Studio 204', 'published');
    INSERT INTO listing_media (listing_id, storage_path, sort_order)
    VALUES (v_listing_free, 'listings/' || v_owner || '/' || v_listing_free || '/0.jpg', 0);

    -- Asset & Listing: Draft
    INSERT INTO assets (id, campus_id, owner_id, title, category, condition, status)
    VALUES (v_asset_draft, v_campus_hitam, v_owner, 'Draft Raspberry Pi 4 Kit', 'electronics', 'good', 'active');
    INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, mode, price_paise, deposit_paise, pickup_zone, status)
    VALUES (v_listing_draft, v_asset_draft, v_campus_hitam, v_owner, 'Draft Raspberry Pi 4 Kit', 'Draft description', 'electronics', 'sale', 450000, 0, 'Canteen Area', 'draft');

    -- Asset & Listing: Pending Review
    INSERT INTO assets (id, campus_id, owner_id, title, category, condition, status)
    VALUES (v_asset_review, v_campus_hitam, v_owner, 'Pending Review Drone Kit', 'electronics', 'like_new', 'active');
    INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, mode, price_paise, deposit_paise, pickup_zone, status)
    VALUES (v_listing_review, v_asset_review, v_campus_hitam, v_owner, 'Pending Review Drone Kit', 'Awaiting moderation review', 'electronics', 'sale', 800000, 0, 'Tech Park Gate', 'pending_review');

    -- Asset & Listing: Rejected
    INSERT INTO assets (id, campus_id, owner_id, title, category, condition, status)
    VALUES (v_asset_rejected, v_campus_hitam, v_owner, 'Rejected Non-Compliant Item', 'notes', 'poor', 'active');
    INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, mode, price_paise, deposit_paise, pickup_zone, status, moderation_reason)
    VALUES (v_listing_rejected, v_asset_rejected, v_campus_hitam, v_owner, 'Rejected Non-Compliant Item', 'Violates policy', 'notes', 'sale', 10000, 0, 'Admin Block', 'rejected', 'Violates campus exchange policy on proprietary exam solutions.');

    -- Asset & Listing: Paused
    INSERT INTO assets (id, campus_id, owner_id, title, category, condition, status)
    VALUES (v_asset_paused, v_campus_hitam, v_owner, 'Paused Workshop Toolset', 'tools', 'good', 'active');
    INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, mode, price_paise, deposit_paise, pickup_zone, status)
    VALUES (v_listing_paused, v_asset_paused, v_campus_hitam, v_owner, 'Paused Workshop Toolset', 'Temporarily unavailable while owner is off-campus', 'tools', 'rental', 4000, 15000, 'Mechanical Lab', 'paused');

    -- Asset & Listing: Hidden
    INSERT INTO assets (id, campus_id, owner_id, title, category, condition, status)
    VALUES (v_asset_hidden, v_campus_hitam, v_owner, 'Hidden Reported Listing', 'other', 'fair', 'active');
    INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, mode, price_paise, deposit_paise, pickup_zone, status, moderation_reason)
    VALUES (v_listing_hidden, v_asset_hidden, v_campus_hitam, v_owner, 'Hidden Reported Listing', 'Hidden by moderator pending clarification', 'other', 'sale', 20000, 0, 'North Gate', 'hidden', 'Flagged by community pending photo clarification.');

    -- 4. Active Transaction 1: Accepted Sale + Active Reservation
    INSERT INTO transactions (
      id, listing_id, asset_id, campus_id, owner_id, requester_id,
      mode, status, quoted_price_paise, quoted_deposit_paise, pickup_zone, version
    ) VALUES (
      v_tx_sale, v_listing_sale, v_asset_sale, v_campus_hitam, v_owner, v_buyer,
      'sale', 'accepted', 35000, 0, 'Library Ground Floor', 2
    );

    INSERT INTO reservations (transaction_id, asset_id, reserved_from, reserved_to, status)
    VALUES (v_tx_sale, v_asset_sale, current_date, current_date + 3650, 'active');

    -- Mark asset as reserved
    UPDATE assets SET status = 'reserved' WHERE id = v_asset_sale;

    -- 5. Active Transaction 2: Accepted Rental + Active Reservation
    INSERT INTO transactions (
      id, listing_id, asset_id, campus_id, owner_id, requester_id,
      mode, status, quoted_price_paise, quoted_deposit_paise,
      start_date, end_date, rental_days, pickup_zone, version
    ) VALUES (
      v_tx_rental, v_listing_rental1, v_asset_rental1, v_campus_hitam, v_owner, v_buyer,
      'rental', 'accepted', 25000, 20000,
      current_date + 1, current_date + 5, 5, 'Academic Block Entrance', 2
    );

    INSERT INTO reservations (transaction_id, asset_id, reserved_from, reserved_to, status)
    VALUES (v_tx_rental, v_asset_rental1, current_date + 1, current_date + 5, 'active');

    -- 6. Completed Historical Transaction
    INSERT INTO assets (id, campus_id, owner_id, title, category, condition, status)
    VALUES (v_asset_hist, v_campus_hitam, v_owner, 'Historical Engineering Drawing Set', 'drafting', 'good', 'active');
    INSERT INTO listings (id, asset_id, campus_id, owner_id, title, description, category, mode, price_paise, deposit_paise, pickup_zone, status)
    VALUES (v_listing_hist, v_asset_hist, v_campus_hitam, v_owner, 'Historical Engineering Drawing Set', 'Archived historical exchange', 'drafting', 'sale', 25000, 0, 'Library', 'archived');

    INSERT INTO transactions (
      id, listing_id, asset_id, campus_id, owner_id, requester_id,
      mode, status, quoted_price_paise, quoted_deposit_paise, pickup_zone, version
    ) VALUES (
      v_tx_hist, v_listing_hist, v_asset_hist, v_campus_hitam, v_owner, v_buyer,
      'sale', 'completed', 25000, 0, 'Library', 3
    );

    INSERT INTO reservations (transaction_id, asset_id, reserved_from, reserved_to, status)
    VALUES (v_tx_hist, v_asset_hist, current_date - 10, current_date - 9, 'released');
  END;

  RAISE NOTICE 'Synthetic fixtures applied successfully!';
END $$;
