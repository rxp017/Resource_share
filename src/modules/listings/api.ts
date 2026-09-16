// src/modules/listings/api.ts
import { supabase } from '../../shared/api-client/supabase';
import type {
  ListingItem,
  ListingMediaItem,
  ListingFilters,
  CreateListingFormValues,
} from './types';
import { resizeAndStripExif, uploadListingPhoto, getListingPhotoSignedUrl } from './imageUtils';

export const HITAM_CAMPUS_ID = 'c0000000-0000-0000-0000-000000000001';

export const CAMPUS_PICKUP_ZONES = [
  'Library Entrance',
  'Mechanical Block Ground Floor',
  'Canteen / Student Plaza',
  'Main Gate Security Post',
];

/**
 * Fetch published listings for the active member's campus with filtering.
 */
export async function fetchPublishedListings(filters: ListingFilters = {}): Promise<ListingItem[]> {
  let query = supabase
    .from('listings')
    .select(`
      id,
      asset_id,
      campus_id,
      owner_id,
      title,
      description,
      category,
      condition,
      defects,
      mode,
      price_paise,
      deposit_paise,
      status,
      version,
      pickup_zone,
      created_at,
      updated_at
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }

  if (filters.mode && filters.mode !== 'all') {
    query = query.eq('mode', filters.mode);
  }

  // Sale price filters
  if (filters.minPricePaise !== undefined && filters.minPricePaise > 0) {
    query = query.gte('price_paise', filters.minPricePaise);
  }
  if (filters.maxPricePaise !== undefined && filters.maxPricePaise > 0) {
    query = query.lte('price_paise', filters.maxPricePaise);
  }

  // Text search on title/description
  if (filters.query && filters.query.trim().length > 0) {
    const q = filters.query.trim();
    query = query.ilike('title', `%${q}%`);
  }

  const { data: listings, error } = await query;
  if (error) {
    throw new Error(`Failed to load listings: ${error.message}`);
  }

  if (!listings || listings.length === 0) {
    return [];
  }

  // Batch fetch media for these listings
  const listingIds = listings.map((l) => l.id);
  const { data: mediaRows } = await supabase
    .from('listing_media')
    .select('id, listing_id, storage_path, sort_order')
    .in('listing_id', listingIds)
    .order('sort_order', { ascending: true });

  // Map media to listings and resolve thumbnail signed URLs
  const mediaByListing = new Map<string, ListingMediaItem[]>();
  if (mediaRows) {
    for (const m of mediaRows) {
      const items = mediaByListing.get(m.listing_id) || [];
      items.push(m);
      mediaByListing.set(m.listing_id, items);
    }
  }

  // For the first photo of each listing, get a signed URL
  const enriched: ListingItem[] = await Promise.all(
    listings.map(async (l) => {
      const media = mediaByListing.get(l.id) || [];
      if (media.length > 0) {
        const signed = await getListingPhotoSignedUrl(media[0].storage_path);
        media[0].signed_url = signed || undefined;
      }
      return {
        ...l,
        media,
      };
    })
  );

  return enriched;
}

/**
 * Fetch a single listing with all photos and details.
 */
export async function fetchListingById(listingId: string): Promise<ListingItem | null> {
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      id,
      asset_id,
      campus_id,
      owner_id,
      title,
      description,
      category,
      condition,
      defects,
      mode,
      price_paise,
      deposit_paise,
      status,
      version,
      pickup_zone,
      created_at,
      updated_at
    `)
    .eq('id', listingId)
    .maybeSingle();

  if (error || !listing) {
    return null;
  }

  // Fetch all media
  const { data: mediaRows } = await supabase
    .from('listing_media')
    .select('id, listing_id, storage_path, sort_order')
    .eq('listing_id', listingId)
    .order('sort_order', { ascending: true });

  const media: ListingMediaItem[] = [];
  if (mediaRows) {
    for (const m of mediaRows) {
      const signed = await getListingPhotoSignedUrl(m.storage_path);
      media.push({
        ...m,
        signed_url: signed || undefined,
      });
    }
  }

  return {
    ...listing,
    media,
  };
}

/**
 * Fetch current user's listings.
 */
export async function fetchMyListings(userId: string): Promise<ListingItem[]> {
  const { data: listings, error } = await supabase
    .from('listings')
    .select(`
      id,
      asset_id,
      campus_id,
      owner_id,
      title,
      description,
      category,
      condition,
      defects,
      mode,
      price_paise,
      deposit_paise,
      status,
      version,
      pickup_zone,
      created_at,
      updated_at
    `)
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load your listings: ${error.message}`);
  }

  return listings || [];
}

/**
 * Fetch all listings for campus moderators/admins.
 */
export async function fetchModerationListings(): Promise<ListingItem[]> {
  const { data: listings, error } = await supabase
    .from('listings')
    .select(`
      id,
      asset_id,
      campus_id,
      owner_id,
      title,
      description,
      category,
      condition,
      defects,
      mode,
      price_paise,
      deposit_paise,
      status,
      version,
      pickup_zone,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load moderation listings: ${error.message}`);
  }

  return listings || [];
}

/**
 * Moderate a listing via the secure RPC.
 */
export async function callModerateListing(
  listingId: string,
  action: 'publish' | 'flag' | 'pause' | 'archive',
  notes?: string
): Promise<{ success: boolean; new_status: string }> {
  const { data, error } = await supabase.rpc('moderate_listing', {
    p_listing_id: listingId,
    p_action: action,
    p_notes: notes || null,
  });

  if (error) {
    throw new Error(`Moderation action failed: ${error.message}`);
  }

  return data;
}

/**
 * Create a new physical asset and marketplace listing with photo uploads.
 */
export async function createListing(
  userId: string,
  values: CreateListingFormValues
): Promise<{ listingId: string }> {
  // 1. Convert Rupees to Paise
  let pricePaise = 0;
  if (values.mode === 'sale' || values.mode === 'rental') {
    pricePaise = Math.round(Number(values.price_rupees) * 100);
    if (pricePaise <= 0) {
      throw new Error('Price must be greater than zero for sales and rentals.');
    }
  }

  const depositPaise = values.deposit_rupees
    ? Math.round(Number(values.deposit_rupees) * 100)
    : 0;

  // 2. Insert Asset
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .insert({
      campus_id: HITAM_CAMPUS_ID,
      owner_id: userId,
      title: values.title.trim(),
      description: values.description.trim(),
      status: 'active',
    })
    .select('id')
    .single();

  if (assetError || !asset) {
    throw new Error(`Failed creating asset: ${assetError?.message}`);
  }

  // 3. Insert Listing
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .insert({
      asset_id: asset.id,
      campus_id: HITAM_CAMPUS_ID,
      owner_id: userId,
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      condition: values.condition,
      defects: values.defects.trim(),
      mode: values.mode,
      price_paise: pricePaise,
      deposit_paise: depositPaise,
      pickup_zone: values.pickup_zone || CAMPUS_PICKUP_ZONES[0],
      status: 'published',
    })
    .select('id')
    .single();

  if (listingError || !listing) {
    throw new Error(`Failed creating listing: ${listingError?.message}`);
  }

  // 4. Resize and upload photos
  if (values.photos && values.photos.length > 0) {
    for (let i = 0; i < values.photos.length; i++) {
      const file = values.photos[i];
      try {
        const compressedBlob = await resizeAndStripExif(file);
        const storagePath = await uploadListingPhoto(userId, listing.id, compressedBlob);

        await supabase.from('listing_media').insert({
          listing_id: listing.id,
          storage_path: storagePath,
          sort_order: i,
        });
      } catch (uploadErr) {
        console.error('Error uploading photo', file.name, uploadErr);
      }
    }
  }

  return { listingId: listing.id };
}

/**
 * Toggle listing status (pause / resume / archive) for owner.
 */
export async function updateListingStatus(
  listingId: string,
  newStatus: 'published' | 'paused' | 'archived'
): Promise<void> {
  const { error } = await supabase
    .from('listings')
    .update({ status: newStatus })
    .eq('id', listingId);

  if (error) {
    throw new Error(`Failed updating listing status: ${error.message}`);
  }
}
