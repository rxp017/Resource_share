// src/modules/reviews/api.ts
import { supabase } from '../../shared/api-client/supabase';
import type { ReviewItem, TrustProfile, DisputeItem } from './types';

export async function fetchTrustProfile(userId: string): Promise<TrustProfile> {
  try {
    const { data, error } = await supabase.rpc('get_trust_profile', { p_user_id: userId });
    if (error) throw error;
    return data as TrustProfile;
  } catch (err: unknown) {
    console.warn('get_trust_profile RPC unavailable, using base profile data only:', err);
    const { data: profile } = await supabase.from('profiles').select('display_name, avatar_url').eq('id', userId).single();
    const { data: m } = await supabase.from('memberships').select('role, created_at').eq('user_id', userId).single();
    const { count: completedCount } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .or(`owner_id.eq.${userId},requester_id.eq.${userId}`)
      .eq('status', 'completed');

    return {
      user_id: userId,
      display_name: profile?.display_name || 'HITAM Student',
      avatar_url: profile?.avatar_url,
      role: m?.role || 'student',
      completed_count: completedCount || 0,
      review_count: 0,
      avg_rating: null, // honest: no rating data without the trust profile RPC
      is_newcomer: (completedCount || 0) < 3,
      member_since: m?.created_at,
    };
  }
}

export async function submitReview(
  transactionId: string,
  rating: number,
  comment = ''
): Promise<{ success: boolean; review_id: string; message: string }> {
  try {
    const { data, error } = await supabase.rpc('submit_review', {
      p_transaction_id: transactionId,
      p_rating: rating,
      p_comment: comment.trim(),
    });

    if (error) throw error;
    return data;
  } catch (err: unknown) {
    console.warn('submit_review RPC failed:', err);
    // Fail honestly: a review that is only stored locally must never look submitted.
    throw new Error('Review could not be submitted right now. Please try again.', { cause: err });
  }
}

interface ReviewRow extends ReviewItem {
  reviewer?: {
    display_name?: string;
  };
}

export async function fetchReviewsForUser(userId: string): Promise<ReviewItem[]> {
  try {
    // NOTE: no embedded join (reviewer:profiles!reviewer_id) - the live schema has no
    // FK from reviews.reviewer_id to profiles.id, so PostgREST rejects it (PGRST200).
    // Fetch reviewer display names in a second query and join client-side instead.
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('reviewee_id', userId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const rows = (data || []) as unknown as ReviewRow[];
    const reviewerIds = [...new Set(rows.map((r) => r.reviewer_id).filter(Boolean))];
    const nameById = new Map<string, string>();
    if (reviewerIds.length > 0) {
      const { data: reviewers, error: reviewersError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', reviewerIds);
      if (reviewersError) throw reviewersError;
      for (const p of reviewers || []) {
        if (p?.id) nameById.set(p.id, p.display_name || 'Anonymous Student');
      }
    }
    return rows.map((r) => ({
      ...r,
      reviewer_name: nameById.get(r.reviewer_id) || 'Anonymous Student',
    }));
  } catch (err: unknown) {
    console.warn('fetchReviewsForUser failed:', err);
    throw err;
  }
}

export async function reportDispute(
  transactionId: string,
  category: string,
  reason: string
): Promise<{ success: boolean; dispute_id: string; message: string }> {
  try {
    const { data, error } = await supabase.rpc('report_dispute', {
      p_transaction_id: transactionId,
      p_category: category,
      p_reason: reason.trim(),
    });

    if (error) throw error;
    return data;
  } catch (err: unknown) {
    console.warn('report_dispute RPC failed:', err);
    throw new Error('Dispute could not be recorded right now. Please try again.', { cause: err });
  }
}

export async function resolveDispute(
  disputeId: string,
  resolution: 'resolve' | 'dismiss',
  notes = ''
): Promise<{ success: boolean; status: string }> {
  try {
    const { data, error } = await supabase.rpc('resolve_dispute', {
      p_dispute_id: disputeId,
      p_resolution: resolution,
      p_notes: notes.trim(),
    });

    if (error) throw error;
    return data;
  } catch (err: unknown) {
    console.warn('resolve_dispute RPC failed:', err);
    throw new Error('Dispute could not be updated right now. Please try again.', { cause: err });
  }
}

export async function fetchDisputesQueue(): Promise<DisputeItem[]> {
  try {
    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as DisputeItem[];
  } catch (err: unknown) {
    console.warn('fetchDisputesQueue fallback:', err);
    return [];
  }
}
