import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { fetchMyListings, updateListingStatus } from './api';
import type { ListingItem } from './types';
import { Skeleton } from '../../shared/components/Skeleton';
import { EmptyState } from '../../shared/components/EmptyState';
import { ErrorState } from '../../shared/components/ErrorState';

export const MyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    async function load() {
      try {
        const data = await fetchMyListings(user!.id);
        if (isMounted) {
          setListings(data);
          setErrorMessage(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed loading your listings.';
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
  }, [user, refreshTrigger]);

  const handleTogglePause = async (listing: ListingItem) => {
    const nextStatus = listing.status === 'published' ? 'paused' : 'published';
    setActionInProgress(listing.id);
    try {
      await updateListingStatus(listing.id, nextStatus);
      setListings((prev) =>
        prev.map((l) => (l.id === listing.id ? { ...l, status: nextStatus } : l))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Status update failed.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleArchive = async (listingId: string) => {
    if (!confirm('Are you sure you want to archive this listing? It will no longer appear in search.')) {
      return;
    }
    setActionInProgress(listingId);
    try {
      await updateListingStatus(listingId, 'archived');
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: 'archived' } : l))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Archive failed.');
    } finally {
      setActionInProgress(null);
    }
  };

  const formatPrice = (listing: ListingItem) => {
    if (listing.mode === 'free_loan') return 'Free Loan';
    const amt = (listing.price_paise / 100).toLocaleString('en-IN');
    return listing.mode === 'sale' ? `₹${amt}` : `₹${amt}/day`;
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 20px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>My Listings</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Manage your items, pause availability, or list new academic supplies.
          </p>
        </div>

        <Link
          to="/listings/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-contrast)',
            textDecoration: 'none',
            padding: '10px 18px',
            borderRadius: 'var(--radius-btn, 6px)',
            fontWeight: 700,
            fontSize: '0.95rem',
            minHeight: '44px',
          }}
        >
          <span>➕</span>
          <span>New Listing</span>
        </Link>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="90px" borderRadius="8px" />
          ))}
        </div>
      ) : errorMessage ? (
        <ErrorState
          title="Could not load your listings"
          message={errorMessage}
          onRetry={() => {
            setIsLoading(true);
            setRefreshTrigger((t) => t + 1);
          }}
        />
      ) : listings.length === 0 ? (
        <EmptyState
          title="No items listed yet"
          message="You have not published any listings yet. Share textbooks, lab coats, calculators, or drafters with your peers."
          actionText="Create Your First Listing"
          onAction={() => navigate('/listings/new')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {listings.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card, 8px)',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      backgroundColor:
                        item.status === 'published'
                          ? '#DCFCE7'
                          : item.status === 'paused'
                          ? '#FEF3C7'
                          : '#F1F5F9',
                      color:
                        item.status === 'published'
                          ? '#166534'
                          : item.status === 'paused'
                          ? '#92400E'
                          : '#64748b',
                    }}
                  >
                    {item.status}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {item.mode.replace('_', ' ')} &bull; {formatPrice(item)}
                  </span>
                </div>

                <Link
                  to={`/listings/${item.id}`}
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    textDecoration: 'none',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  {item.title}
                </Link>

                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                  📍 {item.pickup_zone} &bull; Listed {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Link
                  to={`/listings/${item.id}`}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-btn, 6px)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    minHeight: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  View
                </Link>

                {item.status !== 'archived' && (
                  <button
                    type="button"
                    onClick={() => handleTogglePause(item)}
                    disabled={actionInProgress === item.id}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-btn, 6px)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: item.status === 'published' ? '#FEF3C7' : '#DCFCE7',
                      color: item.status === 'published' ? '#92400E' : '#166534',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                  >
                    {item.status === 'published' ? 'Pause' : 'Resume'}
                  </button>
                )}

                {item.status !== 'archived' && (
                  <button
                    type="button"
                    onClick={() => handleArchive(item.id)}
                    disabled={actionInProgress === item.id}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-btn, 6px)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'transparent',
                      color: 'var(--color-danger, #B91C1C)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
