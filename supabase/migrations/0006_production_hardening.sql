-- supabase/migrations/0006_production_hardening.sql
-- Migration 0006: Server-side Domain Isolation Trigger (P0-SEC-01) & Storage Constraints (P1-SEC-03)
-- Hardening for HITAM Campus Resource Share

-- 1. P0-SEC-01: Server-side enforcement trigger on auth.users
-- Rejects NULL, non-hitam domains, and malformed emails (e.g. x@y@hitam.org)
CREATE OR REPLACE FUNCTION public.enforce_hitam_email_domain()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_cleaned_email text;
BEGIN
  -- On UPDATE, if email column is not modified, skip validation
  IF TG_OP = 'UPDATE' AND NEW.email IS NOT DISTINCT FROM OLD.email THEN
    RETURN NEW;
  END IF;

  -- Reject NULL or blank email
  IF NEW.email IS NULL OR btrim(NEW.email) = '' THEN
    RAISE EXCEPTION 'Registration denied: Email address is required and cannot be empty.'
      USING ERRCODE = '23514'; -- check_violation
  END IF;

  v_cleaned_email := lower(btrim(NEW.email));

  -- Enforce regex: must contain exactly one local-part without @ or whitespace, ending in @hitam.org
  IF v_cleaned_email !~ '^[^@\s]+@hitam\.org$' THEN
    RAISE EXCEPTION 'Registration denied: Only verified @hitam.org accounts are permitted to join this campus platform.'
      USING ERRCODE = '23514';
  END IF;

  NEW.email := v_cleaned_email;
  RETURN NEW;
END;
$$;

-- Drop previous trigger if present
DROP TRIGGER IF EXISTS trg_enforce_hitam_email_domain ON auth.users;

-- Bind trigger BEFORE INSERT OR UPDATE OF email on auth.users
CREATE TRIGGER trg_enforce_hitam_email_domain
  BEFORE INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_hitam_email_domain();

COMMENT ON FUNCTION public.enforce_hitam_email_domain() IS 
  'Enforces strict server-side domain isolation at the database layer, rejecting non-hitam.org emails and malformed addresses.';

-- 2. P1-SEC-03: Storage Bucket Hardening
-- Enforce 5MB (5242880 bytes) size limit and restrict uploads strictly to jpeg, png, webp
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('listing-photos', 'listing-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('payment-proofs', 'payment-proofs', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET 
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Update existing buckets in case they were created with NULL limits
UPDATE storage.buckets
SET 
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id IN ('listing-photos', 'payment-proofs');
