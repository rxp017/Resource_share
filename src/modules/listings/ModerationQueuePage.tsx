// src/modules/listings/ModerationQueuePage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchModerationListings, callModerateListing } from './api';
import type { ListingItem } from './types';
import { fetchDisputesQueue, resolveDispute } from '../reviews/api';
import type { DisputeItem } from '../reviews/types';
import { Skeleton } from '../../shared/components/Skeleton';
import { ErrorState } from '../../shared/components/ErrorState';

export const ModerationQueuePage: React.FC = () => {
  const [mainTab, setMainTab] = useState<'listings' | 'disputes'>('listings');
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const [listingsData, disputesData] = await Promise.all([
          fetchModerationListings(),
          fetchDisputesQueue(),
        ]);
        if (isMounted) {
          setListings(listingsData);
          setDisputes(disputesData);
          setErrorMessage(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed loading moderation queue.';
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
  }, [refreshTrigger]);

  const handleResolveDispute = async (disputeId: string, resolution: 'resolve' | 'dismiss') => {
    const notes = prompt(`Enter resolution notes for this dispute:`, 'Reviewed and resolved by campus moderator');
    if (notes === null) return;

    setActionInProgress(disputeId);
    try {
      const res = await resolveDispute(disputeId, resolution, notes);
      setDisputes((prev) =>
        prev.map((d) => (d.id === disputeId ? { ...d, status: res.status as DisputeItem['status'], resolution_notes: notes } : d))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Dispute resolution failed');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleModerate = async (
    listingId: string,
    action: 'publish' | 'flag' | 'pause' | 'archive'
  ) => {
    const notes = prompt(`Enter moderation reason/note for action "${action}":`, 'Reviewed per campus policy');
    if (notes === null) return;

    setActionInProgress(listingId);
    try {
      const res = await callModerateListing(listingId, action, notes);
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: res.new_status as ListingItem['status'] } : l))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Moderation action failed.');
    } finally {
      setActionInProgress(null);
    }
  };

  const filtered = listings.filter((l) => {
    if (statusFilter === 'all') return true;
    return l.status === statusFilter;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px 80px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
          Campus Moderation Queue
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Review reported or newly posted listings to ensure campus compliance and student safety.
        </p>
      </header>

      {/* Main Tab Switcher */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid var(--color-border)', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setMainTab('listings')}
          style={{
            padding: '8px 18px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: mainTab === 'listings' ? 'var(--color-accent)' : 'transparent',
            color: mainTab === 'listings' ? 'var(--color-accent-contrast)' : 'var(--color-text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          📦 Listings Queue ({listings.length})
        </button>
        <button
          type="button"
          onClick={() => setMainTab('disputes')}
          style={{
            padding: '8px 18px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: mainTab === 'disputes' ? 'var(--color-accent)' : 'transparent',
            color: mainTab === 'disputes' ? 'var(--color-accent-contrast)' : 'var(--color-text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          ⚖️ Disputes & Cases ({disputes.length})
        </button>
      </div>

      {mainTab === 'disputes' ? (
        <div>
          {disputes.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)' }}>
              No active student disputes in queue. Campus exchanges are operating cleanly!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {disputes.map((d) => (
                <div
                  key={d.id}
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: d.status === 'open' ? '#fee2e2' : '#f1f5f9',
                        color: d.status === 'open' ? '#991b1b' : '#334155',
                        textTransform: 'uppercase',
                      }}
                    >
                      {d.status} · {d.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Reported on {new Date(d.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: 1.5 }}>
                    <strong>Reason:</strong> {d.reason}
                  </p>

                  {d.resolution_notes && (
                    <div style={{ padding: '8px 12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.825rem', color: '#166534', marginBottom: '12px' }}>
                      <strong>Resolution Notes:</strong> {d.resolution_notes}
                    </div>
                  )}

                  {d.status === 'open' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleResolveDispute(d.id, 'resolve')}
                        disabled={actionInProgress === d.id}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.825rem',
                          cursor: 'pointer',
                        }}
                      >
                        ✓ Mark Resolved
                      </button>
                      <button
                        onClick={() => handleResolveDispute(d.id, 'dismiss')}
                        disabled={actionInProgress === d.id}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: 'transparent',
                          color: '#dc2626',
                          border: '1px solid #f87171',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.825rem',
                          cursor: 'pointer',
                        }}
                      >
                        Dismiss Case
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {['all', 'published', 'hidden', 'paused', 'archived'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-btn, 6px)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: statusFilter === st ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: statusFilter === st ? 'var(--color-accent-contrast)' : 'var(--color-text)',
                  fontWeight: statusFilter === st ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  minHeight: '44px',
                  textTransform: 'capitalize',
                }}
              >
                {st} ({listings.filter((l) => (st === 'all' ? true : l.status === st)).length})
              </button>
            ))}
          </div>
        </>
      )}

      {mainTab === 'listings' && (
        <>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="100px" borderRadius="8px" />
          ))}
        </div>
      ) : errorMessage ? (
        <ErrorState
          title="Moderation queue error"
          message={errorMessage}
          onRetry={() => {
            setIsLoading(true);
            setRefreshTrigger((t) => t + 1);
          }}
        />
      ) : filtered.length === 0 ? (
        <div
          style={{
            padding: '48px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
          }}
        >
          <p style={{ color: 'var(--color-text-muted)' }}>No listings match the selected status.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card, 8px)',
                padding: '18px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
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
                          : item.status === 'hidden'
                          ? '#FEE2E2'
                          : '#FEF3C7',
                      color:
                        item.status === 'published'
                          ? '#166534'
                          : item.status === 'hidden'
                          ? '#991B1B'
                          : '#92400E',
                    }}
                  >
                    {item.status}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Category: {item.category} &bull; Mode: {item.mode}
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
                  Condition: {item.condition} &bull; Pickup: {item.pickup_zone} &bull; Price:{' '}
                  {item.mode === 'free_loan'
                    ? 'Free Loan'
                    : `₹${(item.price_paise / 100).toLocaleString('en-IN')}`}
                </p>
              </div>

              {/* Moderation Actions */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {item.status !== 'published' && (
                  <button
                    type="button"
                    onClick={() => handleModerate(item.id, 'publish')}
                    disabled={actionInProgress === item.id}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#166534',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--radius-btn, 6px)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                  >
                    Approve
                  </button>
                )}

                {item.status !== 'hidden' && (
                  <button
                    type="button"
                    onClick={() => handleModerate(item.id, 'flag')}
                    disabled={actionInProgress === item.id}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#B91C1C',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--radius-btn, 6px)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                  >
                    Hide / Flag
                  </button>
                )}

                {item.status !== 'archived' && (
                  <button
                    type="button"
                    onClick={() => handleModerate(item.id, 'archive')}
                    disabled={actionInProgress === item.id}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-btn, 6px)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
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
        </>
      )}
    </div>
  );
};
