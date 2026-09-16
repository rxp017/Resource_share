// src/modules/exchanges/ExchangesListPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { getMyTransactions } from './api';
import type { TransactionItem, TransactionStatus } from './types';
import { Skeleton } from '../../shared/components/Skeleton';
import { EmptyState } from '../../shared/components/EmptyState';
import { ErrorState } from '../../shared/components/ErrorState';

export const ExchangesListPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab: 'outgoing' (requester) vs 'incoming' (owner)
  const [activeTab, setActiveTab] = useState<'outgoing' | 'incoming'>('outgoing');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!user) return;
      try {
        const data = await getMyTransactions(user.id);
        if (isMounted) {
          setTransactions(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load exchanges.';
          setError(msg);
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
  }, [user, refreshCounter]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
        <Skeleton height="32px" width="40%" style={{ marginBottom: '20px' }} />
        <Skeleton height="80px" style={{ marginBottom: '12px', borderRadius: '8px' }} />
        <Skeleton height="80px" style={{ marginBottom: '12px', borderRadius: '8px' }} />
        <Skeleton height="80px" style={{ borderRadius: '8px' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
        <ErrorState
          title="Could Not Load Exchanges"
          message={error}
          onRetry={() => setRefreshCounter((c) => c + 1)}
        />
      </div>
    );
  }

  const outgoing = transactions.filter((t) => t.requester_id === user?.id);
  const incoming = transactions.filter((t) => t.owner_id === user?.id);

  const displayedList = activeTab === 'outgoing' ? outgoing : incoming;

  const filteredList = displayedList.filter((t) => {
    if (statusFilter === 'all') return true;
    const isClosed = ['completed', 'canceled', 'declined', 'withdrawn', 'expired'].includes(t.status);
    if (statusFilter === 'closed') return isClosed;
    if (statusFilter === 'active') return !isClosed;
    return true;
  });

  const getStatusBadge = (s: TransactionStatus) => {
    let bg = '#f1f5f9';
    let text = '#475569';
    let label = s.replace('_', ' ').toUpperCase();

    if (s === 'requested') {
      bg = '#e0f2fe';
      text = '#0369a1';
    } else if (s === 'accepted') {
      bg = '#dbeafe';
      text = '#1d4ed8';
    } else if (s === 'proof_submitted') {
      bg = '#fef3c7';
      text = '#b45309';
      label = 'PROOF SUBMITTED';
    } else if (s === 'seller_acknowledged' || s === 'completed') {
      bg = '#dcfce7';
      text = '#15803d';
      label = s === 'seller_acknowledged' ? 'ACKNOWLEDGED' : 'COMPLETED';
    } else if (s === 'seller_disputed') {
      bg = '#fee2e2';
      text = '#b91c1c';
      label = 'DISPUTED';
    }

    return (
      <span
        style={{
          display: 'inline-block',
          padding: '3px 8px',
          borderRadius: '9999px',
          fontSize: '0.7rem',
          fontWeight: 700,
          backgroundColor: bg,
          color: text,
        }}
      >
        {label}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
          My Exchanges
        </h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.95rem' }}>
          Track your resource sharing requests, direct payments, and handover status.
        </p>
      </div>

      {/* Tabs for Outgoing vs Incoming */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '20px',
          gap: '8px',
        }}
      >
        <button
          onClick={() => setActiveTab('outgoing')}
          style={{
            padding: '10px 18px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'outgoing' ? '3px solid var(--color-accent)' : '3px solid transparent',
            color: activeTab === 'outgoing' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          My Requests ({outgoing.length})
        </button>

        <button
          onClick={() => setActiveTab('incoming')}
          style={{
            padding: '10px 18px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'incoming' ? '3px solid var(--color-accent)' : '3px solid transparent',
            color: activeTab === 'incoming' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Incoming Requests ({incoming.length})
        </button>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['all', 'active', 'closed'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              border: '1px solid var(--color-border)',
              backgroundColor: statusFilter === filter ? 'var(--color-accent)' : 'transparent',
              color: statusFilter === filter ? 'var(--color-accent-contrast)' : 'var(--color-text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* List or Empty State */}
      {filteredList.length === 0 ? (
        <EmptyState
          title={activeTab === 'outgoing' ? 'No Outgoing Requests' : 'No Incoming Requests'}
          message={
            activeTab === 'outgoing'
              ? 'You have not submitted any exchange requests yet. Explore available items to make a request.'
              : 'You have not received any requests for your listings yet.'
          }
          actionText={activeTab === 'outgoing' ? 'Explore Resources' : 'View My Listings'}
          onAction={() => {
            window.location.href = activeTab === 'outgoing' ? '/explore' : '/my/listings';
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredList.map((tx) => (
            <Link
              key={tx.id}
              to={`/exchanges/${tx.id}`}
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card, 8px)',
                padding: '16px',
                transition: 'border-color 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-accent-contrast)',
                      marginRight: '8px',
                    }}
                  >
                    {tx.mode.replace('_', ' ')}
                  </span>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--color-text)' }}>
                    {tx.listing?.title || 'Campus Resource'}
                  </strong>
                </div>
                <div>{getStatusBadge(tx.status)}</div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  fontSize: '0.85rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                <div>
                  <span>Zone: <strong>{tx.pickup_zone || 'HITAM Campus'}</strong></span>
                  {tx.start_date && (
                    <span style={{ marginLeft: '12px' }}>
                      Window: {tx.start_date} to {tx.end_date}
                    </span>
                  )}
                </div>

                <div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--color-accent)' }}>
                    {tx.mode === 'free_loan'
                      ? 'Free'
                      : `₹${(tx.quoted_price_paise / 100).toFixed(2)}`}
                  </strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
