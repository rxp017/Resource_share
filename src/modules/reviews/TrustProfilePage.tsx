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
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px 80px' }}>
      {/* Profile Header Card */}
      <div
        className="glass-panel"
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '28px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-contrast)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)',
            }}
          >
            {profile.display_name.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                {profile.display_name}
              </h1>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'color-mix(in srgb, #16a34a 15%, transparent)',
                  color: '#16a34a',
                  border: '1px solid color-mix(in srgb, #16a34a 30%, transparent)',
                }}
              >
                ✓ Verified HITAM Student
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '6px 0 0 0' }}>
              Campus Role: <strong>{profile.role}</strong> · Hyderabad Institute of Technology and Management
            </p>
          </div>
        </div>

        {/* Visual Trust Score Meter */}
        <div
          style={{
            marginBottom: '20px',
            padding: '16px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-surface-subtle, #f8fafc)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>
              Campus Reliability & Trust Index
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-accent)' }}>
              {profile.completed_count >= 5 ? '98% Top Rated' : profile.completed_count > 0 ? '92% Reliable' : '100% In Good Standing'}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'var(--color-border)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: profile.completed_count >= 5 ? '98%' : profile.completed_count > 0 ? '92%' : '100%',
                height: '100%',
                background: 'linear-gradient(90deg, var(--color-accent), #10b981)',
                borderRadius: '999px',
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}
        >
          <div
            className="interactive-card"
            style={{ padding: '14px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>
              {profile.completed_count}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px', fontWeight: 600 }}>
              Completed Exchanges
            </div>
          </div>

          <div
            className="interactive-card"
            style={{ padding: '14px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>
              {profile.review_count > 0 ? `★ ${profile.avg_rating}` : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px', fontWeight: 600 }}>
              Community Rating ({profile.review_count})
            </div>
          </div>

          <div
            className="interactive-card"
            style={{ padding: '14px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>
              100%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px', fontWeight: 600 }}>
              Honest Campus Standard
            </div>
          </div>
        </div>

        {profile.is_newcomer && (
          <div
            style={{
              marginTop: '18px',
              padding: '12px 16px',
              backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🌱</span>
            <span>
              <strong>Campus Newcomer:</strong> This student is establishing their exchange history. Welcome them and exchange in person at designated campus pickup zones!
            </span>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>
          Peer Reviews & Verification Statements ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <div
            style={{
              padding: '36px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '0.875rem',
            }}
          >
            No reviews yet for this profile.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reviews.map((r) => (
              <div
                key={r.id}
                className="interactive-card"
                style={{
                  padding: '18px 20px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                    {r.reviewer_name || 'Verified Counterparty'}
                  </span>
                  <span style={{ color: '#f59e0b', fontSize: '1rem', letterSpacing: '2px' }}>
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </span>
                </div>
                {r.comment && (
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.45 }}>
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
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link
            to="/settings"
            className="interactive-btn"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            ⚙️ Edit Appearance & Theme Settings
          </Link>
        </div>
      )}
    </div>
  );
};
