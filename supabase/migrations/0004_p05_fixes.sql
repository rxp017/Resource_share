-- supabase/migrations/0004_p05_fixes.sql
-- Migration 0004: P05 Listings & Media hardening and moderate_listing RPC

-- 1. Ensure storage delete policy for listing-photos so owners can delete photos
DROP POLICY IF EXISTS listing_photos_delete ON storage.objects;
CREATE POLICY listing_photos_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'listing-photos'
    AND (
      split_part(name, '/', 1) = auth.uid()::text
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR name LIKE 'listings/' || auth.uid()::text || '/%'
    )
  );

-- 2. Ensure listing-photos insert covers split_part path convention
DROP POLICY IF EXISTS listing_photos_insert ON storage.objects;
CREATE POLICY listing_photos_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'listing-photos'
    AND (
      split_part(name, '/', 1) = auth.uid()::text
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR name LIKE 'listings/' || auth.uid()::text || '/%'
    )
  );

-- 3. Moderate listing RPC for campus moderators and admins
CREATE OR REPLACE FUNCTION moderate_listing(
  p_listing_id uuid,
  p_action text,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_listing record;
  v_caller_id uuid;
  v_new_status text;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  -- Fetch listing
  SELECT * INTO v_listing FROM listings WHERE id = p_listing_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found' USING ERRCODE = 'P0002';
  END IF;

  -- Check caller is active moderator or admin of this campus
  IF NOT is_campus_moderator_or_admin(v_listing.campus_id) THEN
    RAISE EXCEPTION 'Only campus moderators or admins can moderate listings' USING ERRCODE = '42501';
  END IF;

  -- Validate and map action
  IF p_action IN ('publish', 'approve') THEN
    v_new_status := 'published';
  ELSIF p_action IN ('flag', 'hide', 'hidden') THEN
    v_new_status := 'hidden';
  ELSIF p_action IN ('pause', 'paused') THEN
    v_new_status := 'paused';
  ELSIF p_action IN ('archive', 'archived') THEN
    v_new_status := 'archived';
  ELSE
    RAISE EXCEPTION 'Invalid moderation action: %', p_action USING ERRCODE = '22023';
  END IF;

  -- Update listing status
  UPDATE listings
  SET status = v_new_status,
      updated_at = now()
  WHERE id = p_listing_id;

  RETURN jsonb_build_object(
    'success', true,
    'listing_id', p_listing_id,
    'old_status', v_listing.status,
    'new_status', v_new_status,
    'moderator_id', v_caller_id,
    'notes', p_notes,
    'timestamp', now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION moderate_listing(uuid, text, text) TO authenticated;
