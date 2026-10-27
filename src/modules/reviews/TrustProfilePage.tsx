// src/modules/reviews/TrustProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { fetchTrustProfile, fetchReviewsForUser } from './api';
import type { TrustProfile, ReviewItem } from './types';

export const TrustProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const [profile, setProfile] = useState<TrustProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetUserId) return;
    async function load() {
      try {
        const [p, r] = await Promise.all([
          fetchTrustProfile(targetUserId!),
          fetchReviewsForUser(targetUserId!),
        ]);
        setProfile(p);
        setReviews(r);
      } catch (err: unknown) {
        console.warn('Error loading trust profile:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [targetUserId]);

  if (loading) {
    return (
      <div style={{ maxWidth: '680px', margin: '40px auto', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading student trust profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ maxWidth: '680px', margin: '40px auto', padding: '24px', textAlign: 'center' }}>
        <h2>Student Not Found</h2>
        <Link to="/explore" style={{ color: 'var(--color-accent)' }}>← Back to Explore</Link>
      </div>
    );
  }

  const isSelf = targetUserId === user?.id;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Profile Header Card */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-contrast)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
            }}
          >
            {profile.display_name.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                {profile.display_name}
              </h1>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                }}
              >
                ✓ Verified HITAM Student
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
              Role: <strong>{profile.role}</strong> · Hyderabad Institute of Technology and Management
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '16px',
          }}
        >
          <div style={{ padding: '12px', backgroundColor: 'var(--color-surface-subtle, #f8fafc)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>
              {profile.completed_count}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Completed Exchanges
            </div>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--color-surface-subtle, #f8fafc)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
              {profile.review_count > 0 ? `★ ${profile.avg_rating}` : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Community Rating ({profile.review_count})
            </div>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--color-surface-subtle, #f8fafc)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>
              100%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Honest Campus Standard
            </div>
          </div>
        </div>

        {profile.is_newcomer && (
          <div
            style={{
              marginTop: '16px',
              padding: '10px 14px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              fontSize: '0.825rem',
              color: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>🌱</span>
            <span>
              <strong>Campus Newcomer:</strong> This student is establishing their exchange history. Welcome them and exchange in person at designated pickup zones!
            </span>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px' }}>
          Peer Reviews & Verification Statements ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <div
            style={{
              padding: '32px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '0.875rem',
            }}
          >
            No reviews yet for this profile.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviews.map((r) => (
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
                    {r.reviewer_name || 'Verified Counterparty'}
                  </span>
                  <span style={{ color: '#f59e0b', fontSize: '0.95rem' }}>
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </span>
                </div>
                {r.comment && (
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.4 }}>
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

      {isSelf && (
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link
            to="/settings"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              textDecoration: 'none',
            }}
          >
            ⚙️ Edit Appearance & Theme Settings
          </Link>
        </div>
      )}
    </div>
  );
};
