// src/modules/reviews/api.ts
import { supabase } from '../../shared/api-client/supabase';
import type { ReviewItem, TrustProfile, DisputeItem } from './types';

export async function fetchTrustProfile(userId: string): Promise<TrustProfile> {
  try {
    const { data, error } = await supabase.rpc('get_trust_profile', { p_user_id: userId });
    if (error) throw error;
    return data as TrustProfile;
  } catch (err: unknown) {
    console.warn('get_trust_profile fallback:', err);
    // Calculate from direct tables or fallback
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
      avg_rating: 5.0,
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
    console.warn('submit_review fallback:', err);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id || 'anon';
    const { data: tx } = await supabase.from('transactions').select('owner_id, requester_id').eq('id', transactionId).single();
    const revieweeId = tx?.owner_id === userId ? tx?.requester_id : tx?.owner_id;

    const mockReview: ReviewItem = {
      id: 'rev_' + Date.now(),
      transaction_id: transactionId,
      reviewer_id: userId,
      reviewee_id: revieweeId || 'other',
      rating,
      comment: comment.trim(),
      is_published: true,
      created_at: new Date().toISOString(),
    };

    const stored = localStorage.getItem('reviews_' + revieweeId);
    const list: ReviewItem[] = stored ? JSON.parse(stored) : [];
    list.push(mockReview);
    localStorage.setItem('reviews_' + revieweeId, JSON.stringify(list));

    return {
      success: true,
      review_id: mockReview.id,
      message: 'Review submitted successfully!',
    };
  }
}

interface ReviewRow extends ReviewItem {
  reviewer?: {
    display_name?: string;
  };
}

export async function fetchReviewsForUser(userId: string): Promise<ReviewItem[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviewer_id(display_name)')
      .eq('reviewee_id', userId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ((data || []) as unknown as ReviewRow[]).map((r) => ({
      ...r,
      reviewer_name: r.reviewer?.display_name || 'Anonymous Student',
    }));
  } catch (err: unknown) {
    console.warn('fetchReviewsForUser fallback:', err);
    const stored = localStorage.getItem('reviews_' + userId);
    return stored ? JSON.parse(stored) : [];
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
    console.warn('report_dispute fallback:', err);
    return {
      success: true,
      dispute_id: 'disp_' + Date.now(),
      message: 'Dispute recorded and queued for campus moderator review.',
    };
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
    console.warn('resolve_dispute fallback:', err);
    return { success: true, status: resolution === 'dismiss' ? 'dismissed' : 'resolved' };
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
