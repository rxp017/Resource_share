// src/modules/reviews/FeedbackPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth';
import { supabase } from '../../shared/api-client/supabase';
import { submitReview, fetchReviewsForUser } from './api';
import type { ReviewItem } from './types';
import type { TransactionItem } from '../exchanges/types';

export const FeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [completedTxs, setCompletedTxs] = useState<TransactionItem[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Form Modal / Inline State
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!user) return;
      try {
        // 1. Fetch completed transactions
        const { data: txs } = await supabase
          .from('transactions')
          .select('*, listing:listings(*)')
          .or(`owner_id.eq.${user.id},requester_id.eq.${user.id}`)
          .eq('status', 'completed')
          .order('updated_at', { ascending: false });

        if (isMounted) {
          setCompletedTxs((txs || []) as TransactionItem[]);
        }

        // 2. Fetch received reviews
        const reviews = await fetchReviewsForUser(user.id);
        if (isMounted) {
          setReceivedReviews(reviews);
        }
      } catch (e: unknown) {
        console.warn('Error loading feedback data:', e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [user, fetchTrigger]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxId) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await submitReview(selectedTxId, rating, comment);
      setSuccessMsg('Thank you! Your feedback has been submitted to the student trust network.');
      setSelectedTxId(null);
      setComment('');
      setRating(5);
      setFetchTrigger((c) => c + 1);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px 0' }}>
          Community Trust & Reviews
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
          Bilateral peer ratings for completed exchanges. Maintain high standards across the HITAM campus.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '8px', marginBottom: '20px', fontSize: '0.875rem' }}>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '8px', marginBottom: '20px', fontSize: '0.875rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Review Submission Box if an exchange is selected */}
      {selectedTxId && (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '2px solid var(--color-accent)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
              Leave a Review for Exchange
            </h3>
            <button
              onClick={() => setSelectedTxId(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmitReview}>
            {/* Interactive Star Rating */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                Overall Rating *
              </label>
              <div style={{ display: 'flex', gap: '8px', fontSize: '1.8rem', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    style={{
                      color: star <= (hoverRating || rating) ? '#f59e0b' : '#cbd5e1',
                      transition: 'color 0.1s ease',
                    }}
                  >
                    ★
                  </span>
                ))}
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', alignSelf: 'center', marginLeft: '8px' }}>
                  {rating === 5 ? 'Exceptional' : rating === 4 ? 'Great' : rating === 3 ? 'Satisfactory' : rating === 2 ? 'Needs Improvement' : 'Poor'}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="review-comment" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                Your Honest Feedback & Condition Notes:
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Was the item in the described condition? Was the student punctual and respectful during handoff?"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.875rem',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-contrast)',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Peer Review'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedTxId(null)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 1. Pending Completed Exchanges awaiting review */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px' }}>
          Completed Exchanges
        </h2>
        {loading ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Loading completed exchanges...</p>
        ) : completedTxs.length === 0 ? (
          <div
            style={{
              padding: '24px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '0.875rem',
            }}
          >
            No completed exchanges yet. Once you complete an in-person handoff, you can rate your experience here.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {completedTxs.map((tx) => (
              <div
                key={tx.id}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>
                    {tx.listing?.title || 'Campus Item'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Mode: <strong>{tx.mode}</strong> · Handover Zone: <strong>{tx.pickup_zone}</strong> · Completed on {new Date(tx.updated_at).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedTxId(tx.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-accent-contrast)',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  ★ Rate Counterparty
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Received Reviews */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px' }}>
          Reviews Received on Your Profile ({receivedReviews.length})
        </h2>
        {receivedReviews.length === 0 ? (
          <div
            style={{
              padding: '24px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '0.875rem',
            }}
          >
            No reviews received yet. Complete exchanges punctually and communicate politely to earn trust stars!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {receivedReviews.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                    {r.reviewer_name || 'Verified Student'}
                  </span>
                  <span style={{ color: '#f59e0b', fontSize: '1rem' }}>
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </span>
                </div>
                {r.comment && (
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.4 }}>
                    "{r.comment}"
                  </p>
                )}
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
