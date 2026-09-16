-- 0001_schema.sql
-- Campus Resource Sharing and Marketplace Platform
-- Initial Schema: Campuses, Profiles, Memberships, Preferences, Assets, Listings,
-- Media, Transactions, Reservations, Payment Proofs, Acknowledgements, Audit, Outbox

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Helper trigger for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Campuses
CREATE TABLE campuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  allowed_domains text[] NOT NULL DEFAULT ARRAY['hitam.org'],
  pickup_zones jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_campuses_updated_at
  BEFORE UPDATE ON campuses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed the primary HITAM campus
INSERT INTO campuses (id, name, code, status, timezone, allowed_domains, pickup_zones)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'Hyderabad Institute of Technology and Management',
  'HITAM',
  'active',
  'Asia/Kolkata',
  ARRAY['hitam.org'],
  '["Library Entrance", "Canteen Plaza", "Main Gate Reception", "Admin Block Foyer"]'::jsonb
) ON CONFLICT (code) DO NOTHING;

-- 3. Profiles (one-to-one with auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Memberships (campus-scoped user identity & role)
CREATE TABLE memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campus_id uuid NOT NULL REFERENCES campuses(id) ON DELETE RESTRICT,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'expired')),
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'moderator', 'admin')),
  student_eligibility text NOT NULL DEFAULT 'pending' CHECK (student_eligibility IN ('pending', 'eligible', 'ineligible', 'staff', 'alumni')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, campus_id),
  CONSTRAINT valid_hitam_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@hitam\.org$')
);

CREATE TRIGGER set_memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Preferences (independent style, appearance, motion, density)
CREATE TABLE preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  style text NOT NULL DEFAULT 'calm' CHECK (style IN ('pulse', 'calm')),
  appearance text NOT NULL DEFAULT 'system' CHECK (appearance IN ('system', 'light', 'dark')),
  motion text NOT NULL DEFAULT 'system' CHECK (motion IN ('system', 'reduced')),
  density text NOT NULL DEFAULT 'comfortable' CHECK (density IN ('comfortable', 'compact')),
  onboarding_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_preferences_updated_at
  BEFORE UPDATE ON preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Assets (physical items owned by a student)
CREATE TABLE assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id uuid NOT NULL REFERENCES campuses(id) ON DELETE RESTRICT,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_exchange', 'retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Listings (marketplace entry for an asset)
CREATE TABLE listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  campus_id uuid NOT NULL REFERENCES campuses(id) ON DELETE RESTRICT,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL CHECK (category IN ('textbooks', 'electronics', 'lab_gear', 'stationery', 'sports', 'musical', 'uniforms', 'other')),
  condition text NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
  defects text NOT NULL DEFAULT '',
  mode text NOT NULL CHECK (mode IN ('sale', 'free_loan', 'rental')),
  price_paise integer NOT NULL DEFAULT 0 CHECK (price_paise >= 0),
  deposit_paise integer NOT NULL DEFAULT 0 CHECK (deposit_paise >= 0),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'pending_review', 'published', 'paused', 'archived', 'hidden')),
  version integer NOT NULL DEFAULT 1,
  pickup_zone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mode_pricing_valid CHECK (
    (mode = 'free_loan' AND price_paise = 0) OR
    (mode IN ('sale', 'rental') AND price_paise > 0)
  )
);

CREATE TRIGGER set_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Invariant: exactly one active listing per asset
CREATE UNIQUE INDEX unique_active_listing_per_asset
  ON listings(asset_id)
  WHERE status IN ('published', 'draft', 'pending_review', 'paused');

-- 8. Listing Media
CREATE TABLE listing_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Transactions (requests and exchange workflows)
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  campus_id uuid NOT NULL REFERENCES campuses(id) ON DELETE RESTRICT,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  mode text NOT NULL CHECK (mode IN ('sale', 'free_loan', 'rental')),
  status text NOT NULL DEFAULT 'requested' CHECK (
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
      'canceled'
    )
  ),
  quoted_price_paise integer NOT NULL DEFAULT 0 CHECK (quoted_price_paise >= 0),
  quoted_deposit_paise integer NOT NULL DEFAULT 0 CHECK (quoted_deposit_paise >= 0),
  start_date date,
  end_date date,
  rental_days integer NOT NULL DEFAULT 0 CHECK (rental_days >= 0),
  pickup_zone text NOT NULL DEFAULT '',
  requester_note text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT distinct_participants CHECK (owner_id <> requester_id),
  CONSTRAINT loan_rental_dates_check CHECK (
    (mode = 'sale' AND start_date IS NULL AND end_date IS NULL) OR
    (mode IN ('free_loan', 'rental') AND start_date IS NOT NULL AND end_date IS NOT NULL AND end_date >= start_date)
  )
);

CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Reservations (atomic booking hold / calendar exclusion)
CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  reservation_period tstzrange NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_overlapping_active_reservations
    EXCLUDE USING gist (asset_id WITH =, reservation_period WITH &&)
    WHERE (status = 'active')
);

-- 11. Payment Proofs (payer upload only, private storage reference)
CREATE TABLE payment_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  payer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  amount_paise integer NOT NULL CHECK (amount_paise > 0),
  currency text NOT NULL DEFAULT 'INR',
  storage_path text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  masked_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (transaction_id, version)
);

-- 12. Payment Acknowledgements (payee acknowledgement or dispute)
CREATE TABLE payment_acknowledgements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id uuid NOT NULL REFERENCES payment_proofs(id) ON DELETE CASCADE,
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  payee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  decision text NOT NULL CHECK (decision IN ('acknowledged', 'disputed')),
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (proof_id)
);

-- 13. Audit Events (tamper-resistant operational logs)
CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  campus_id uuid REFERENCES campuses(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 14. Outbox Events (durable asynchronous events)
CREATE TABLE outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 15. Idempotency Keys (for atomic mutation replay prevention)
CREATE TABLE idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation text NOT NULL,
  key text NOT NULL,
  request_hash text NOT NULL,
  response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  UNIQUE (actor_id, operation, key)
);

-- Indexes for performance and query plans
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_campus ON memberships(campus_id);
CREATE INDEX idx_assets_campus ON assets(campus_id);
CREATE INDEX idx_assets_owner ON assets(owner_id);
CREATE INDEX idx_listings_campus_status ON listings(campus_id, status);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_mode ON listings(mode);
CREATE INDEX idx_transactions_owner ON transactions(owner_id);
CREATE INDEX idx_transactions_requester ON transactions(requester_id);
CREATE INDEX idx_transactions_listing ON transactions(listing_id);
CREATE INDEX idx_reservations_asset ON reservations(asset_id);
CREATE INDEX idx_outbox_pending ON outbox_events(status, next_attempt_at) WHERE status = 'pending';
