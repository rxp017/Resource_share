// src/modules/reviews/types.ts

export interface ReviewItem {
  id: string;
  transaction_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  is_published: boolean;
  created_at: string;
  reviewer_name?: string;
  listing_title?: string;
}

export interface TrustProfile {
  user_id: string;
  display_name: string;
  avatar_url?: string | null;
  role: string;
  completed_count: number;
  review_count: number;
  avg_rating: number;
  is_newcomer: boolean;
  member_since?: string;
}

export interface DisputeItem {
  id: string;
  transaction_id: string;
  campus_id: string;
  reporter_id: string;
  respondent_id: string;
  category: string;
  reason: string;
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  resolution_notes?: string;
  resolver_id?: string | null;
  created_at: string;
}
