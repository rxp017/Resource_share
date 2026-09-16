// src/modules/listings/ListingDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchListingById } from './api';
import type { ListingItem } from './types';
import { useAuth } from '../auth/useAuth';
import { Skeleton } from '../../shared/components/Skeleton';
import { ErrorState } from '../../shared/components/ErrorState';

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState<ListingItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function load() {
      try {
        const data = await fetchListingById(id!);
        if (isMounted) {
          if (!data) {
            setErrorMessage('Listing not found or has been removed.');
          } else {
            setListing(data);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed loading listing details.';
          setErrorMessage(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 20px 80px' }}>
        <Skeleton height="320px" borderRadius="8px" />
        <div style={{ marginTop: '20px' }}>
          <Skeleton width="40%" height="32px" borderRadius="6px" />
        </div>
        <div style={{ marginTop: '12px' }}>
          <Skeleton width="60%" height="20px" borderRadius="4px" />
        </div>
      </div>
    );
  }

  if (errorMessage || !listing) {
    return (
      <div style={{ maxWidth: '680px', margin: '60px auto', padding: '0 20px' }}>
        <ErrorState
          title="Listing unavailable"
          message={errorMessage || 'This listing could not be found.'}
          onRetry={() => navigate('/explore')}
        />
      </div>
    );
  }

  const isOwner = user?.id === listing.owner_id;
  const photos = listing.media || [];
  const activePhoto = photos[activePhotoIndex]?.signed_url;

  const formatPrice = () => {
    if (listing.mode === 'free_loan') {
      return 'Free Campus Loan';
    }
    const amt = (listing.price_paise / 100).toLocaleString('en-IN');
    if (listing.mode === 'sale') {
      return `₹${amt}`;
    }
    return `₹${amt} / day`;
  };

  const getCtaLabel = () => {
    switch (listing.mode) {
      case 'sale':
        return `Request to Buy (₹${(listing.price_paise / 100).toLocaleString('en-IN')})`;
      case 'rental':
        return `Request Rental (₹${(listing.price_paise / 100).toLocaleString('en-IN')}/day)`;
      case 'free_loan':
        return 'Request Free Loan';
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Back Link */}
      <div style={{ marginBottom: '16px' }}>
        <Link
          to="/explore"
          style={{
            color: 'var(--color-accent)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            minHeight: '44px',
          }}
        >
          &larr; Back to Explore
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* Gallery Column */}
        <div>
          <div
            style={{
              width: '100%',
              height: '360px',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card, 8px)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            {activePhoto ? (
              <img
                src={activePhoto}
                alt={listing.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <span style={{ fontSize: '3rem' }}>📦</span>
                <p style={{ marginTop: '8px' }}>No photo uploaded</p>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              {photos.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: activePhotoIndex === idx ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                    padding: 0,
                    cursor: 'pointer',
                    minHeight: '64px',
                    minWidth: '64px',
                  }}
                >
                  <img
                    src={p.signed_url}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-contrast)',
              }}
            >
              {listing.mode.replace('_', ' ')}
            </span>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'capitalize',
              }}
            >
              {listing.category.replace('_', ' ')}
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              marginBottom: '12px',
              color: 'var(--color-text)',
            }}
          >
            {listing.title}
          </h1>

          {/* Pricing Box */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card, 8px)',
              padding: '16px 20px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>
                  {listing.mode === 'sale' ? 'Purchase Price' : listing.mode === 'rental' ? 'Daily Rental Rate' : 'Exchange Mode'}
                </span>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                  {formatPrice()}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-success)',
                }}
              >
                ● Available on Campus
              </span>
            </div>

            {listing.deposit_paise > 0 && (
              <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Security deposit: <strong>₹{(listing.deposit_paise / 100).toLocaleString('en-IN')}</strong> (fully refundable upon return)
              </p>
            )}
          </div>

          {/* Attributes Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px',
              fontSize: '0.9rem',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Item Condition</span>
              <strong style={{ textTransform: 'capitalize' }}>{listing.condition.replace('_', ' ')}</strong>
            </div>

            <div
              style={{
                padding: '10px 14px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Pickup Zone</span>
              <strong>{listing.pickup_zone || 'HITAM Campus'}</strong>
            </div>
          </div>

          {/* Defects disclosure */}
          {listing.defects && (
            <div
              style={{
                padding: '12px 16px',
                border: '1px solid #fed7aa',
                borderRadius: '6px',
                backgroundColor: '#fffbeb',
                marginBottom: '20px',
                fontSize: '0.875rem',
              }}
            >
              <strong style={{ color: '#b45309', display: 'block', marginBottom: '2px' }}>
                Reported Wear & Defects:
              </strong>
              <p style={{ color: '#78350f' }}>{listing.defects}</p>
            </div>
          )}

          {/* Description */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>Description</h3>
            <p style={{ color: 'var(--color-text)', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {listing.description || 'No additional description provided by the student owner.'}
            </p>
          </div>

          {/* Action CTA */}
          {isOwner ? (
            <div
              style={{
                padding: '16px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card, 8px)',
                textAlign: 'center',
              }}
            >
              <p style={{ fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                You are the student owner of this listing.
              </p>
              <Link
                to="/my/listings"
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-contrast)',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-btn, 6px)',
                  fontWeight: 700,
                  minHeight: '44px',
                }}
              >
                Manage in My Listings
              </Link>
            </div>
          ) : (
            <Link
              to={`/listings/${listing.id}/request`}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                padding: '14px 24px',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-contrast)',
                textDecoration: 'none',
                borderRadius: 'var(--radius-btn, 8px)',
                fontWeight: 700,
                fontSize: '1.05rem',
                minHeight: '48px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              {getCtaLabel()}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
