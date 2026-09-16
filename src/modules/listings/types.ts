// src/modules/listings/types.ts

export type ListingCategory =
  | 'textbooks'
  | 'electronics'
  | 'lab_gear'
  | 'stationery'
  | 'sports'
  | 'musical'
  | 'uniforms'
  | 'other';

export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair';

export type ListingMode = 'sale' | 'free_loan' | 'rental';

export type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'paused'
  | 'archived'
  | 'hidden';

export interface ListingMediaItem {
  id: string;
  listing_id: string;
  storage_path: string;
  sort_order: number;
  signed_url?: string;
}

export interface ListingItem {
  id: string;
  asset_id: string;
  campus_id: string;
  owner_id: string;
  title: string;
  description: string;
  category: ListingCategory;
  condition: ListingCondition;
  defects: string;
  mode: ListingMode;
  price_paise: number;
  deposit_paise: number;
  status: ListingStatus;
  version: number;
  pickup_zone: string;
  created_at: string;
  updated_at: string;
  media?: ListingMediaItem[];
  owner_email?: string;
}

export interface CreateListingFormValues {
  title: string;
  description: string;
  category: ListingCategory;
  condition: ListingCondition;
  defects: string;
  mode: ListingMode;
  price_rupees: number;
  deposit_rupees: number;
  pickup_zone: string;
  photos: File[];
}

export interface ListingFilters {
  query?: string;
  category?: string;
  mode?: string;
  minPricePaise?: number;
  maxPricePaise?: number;
  minRentalRatePaise?: number;
  maxRentalRatePaise?: number;
  pickupZone?: string;
}
