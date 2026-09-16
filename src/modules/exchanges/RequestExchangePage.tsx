// src/modules/exchanges/RequestExchangePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { fetchListingById } from '../listings/api';
import type { ListingItem } from '../listings/types';
import { createExchangeRequest } from './api';
import { Skeleton } from '../../shared/components/Skeleton';
import { ErrorState } from '../../shared/components/ErrorState';

export const RequestExchangePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState<ListingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadListing() {
      if (!id) return;
      try {
        const data = await fetchListingById(id);
        if (isMounted) {
          setListing(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load listing.';
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadListing();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px' }}>
        <Skeleton height="32px" width="60%" style={{ marginBottom: '16px' }} />
        <Skeleton height="180px" style={{ marginBottom: '16px', borderRadius: '8px' }} />
        <Skeleton height="200px" style={{ borderRadius: '8px' }} />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px' }}>
        <ErrorState
          title="Listing Not Available"
          message={error || 'Could not retrieve listing details.'}
          onRetry={() => navigate('/explore')}
        />
      </div>
    );
  }

  const isOwner = user?.id === listing.owner_id;
  if (isOwner) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
          Cannot Request Own Item
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
          You are the owner of "{listing.title}". You cannot initiate an exchange with yourself.
        </p>
        <Link
          to={`/listings/${listing.id}`}
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-contrast)',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 700,
          }}
        >
          Return to Listing
        </Link>
      </div>
    );
  }

  // Calculate rental days and price quote
  let rentalDays = 0;
  let totalQuotePaise = listing.price_paise;
  if (listing.mode === 'rental' || listing.mode === 'free_loan') {
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const diffTime = e.getTime() - s.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) {
        rentalDays = diffDays;
        totalQuotePaise = listing.mode === 'rental' ? listing.price_paise * rentalDays : 0;
      }
    }
  }

  // Min and max date calculation (today to today + 30 days)
  const todayStr = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if ((listing.mode === 'rental' || listing.mode === 'free_loan') && (!startDate || !endDate)) {
      setSubmitError('Please select both start and end dates.');
      return;
    }

    if (rentalDays > 30) {
      setSubmitError('Exchange duration cannot exceed 30 days per campus guidelines.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createExchangeRequest({
        listingId: listing.id,
        startDate: listing.mode !== 'sale' ? startDate : undefined,
        endDate: listing.mode !== 'sale' ? endDate : undefined,
        note: note.trim() || undefined,
        expectedListingVersion: listing.version,
        idempotencyKey: crypto.randomUUID(),
      });

      if (res.success && res.transaction_id) {
        navigate(`/exchanges/${res.transaction_id}`);
      } else {
        throw new Error('Exchange creation did not return a valid transaction ID.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit exchange request.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link
          to={`/listings/${listing.id}`}
          style={{
            color: 'var(--color-text-muted)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          ← Back to Listing
        </Link>
      </div>

      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
        Request {listing.mode === 'sale' ? 'Purchase' : listing.mode === 'rental' ? 'Rental' : 'Free Loan'}
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
        Send a formal request to the student owner to agree on exchange terms and handover.
      </p>

      {/* Listing summary box */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '16px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card, 8px)',
          marginBottom: '24px',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1 }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.725rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-contrast)',
              marginBottom: '6px',
            }}
          >
            {listing.mode.replace('_', ' ')}
          </span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px 0' }}>
            {listing.title}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Pickup Zone: <strong>{listing.pickup_zone || 'HITAM Campus'}</strong>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>
            {listing.mode === 'rental' ? 'Rate' : 'Price'}
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-accent)' }}>
            {listing.mode === 'free_loan'
              ? 'Free'
              : `₹${(listing.price_paise / 100).toFixed(2)}${listing.mode === 'rental' ? '/day' : ''}`}
          </span>
        </div>
      </div>

      {/* Platform honesty banner */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          marginBottom: '24px',
          fontSize: '0.85rem',
          color: '#1e3a8a',
          lineHeight: 1.5,
        }}
      >
        <strong>Direct Student Handoff:</strong> HITAM Resource Share operates strictly as an on-campus student exchange. There is no automated payment gateway, digital wallet, or escrow. Any payment is made directly between students (via UPI or cash) upon mutual agreement.
      </div>

      {submitError && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            marginBottom: '20px',
            color: '#991b1b',
            fontSize: '0.875rem',
          }}
        >
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Date pickers for rental or loan */}
        {(listing.mode === 'rental' || listing.mode === 'free_loan') && (
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card, 8px)',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>
              Booking Duration
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label
                  htmlFor="start-date"
                  style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}
                >
                  Start Date *
                </label>
                <input
                  id="start-date"
                  type="date"
                  min={todayStr}
                  max={maxDateStr}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="end-date"
                  style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}
                >
                  End Date *
                </label>
                <input
                  id="end-date"
                  type="date"
                  min={startDate || todayStr}
                  max={maxDateStr}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>

            {rentalDays > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px dashed var(--color-border)',
                  fontSize: '0.875rem',
                }}
              >
                <span>Duration: <strong>{rentalDays} day{rentalDays > 1 ? 's' : ''}</strong></span>
                <span>
                  Estimated Total:{' '}
                  <strong style={{ color: 'var(--color-accent)' }}>
                    {listing.mode === 'free_loan' ? '₹0.00 (Free)' : `₹${(totalQuotePaise / 100).toFixed(2)}`}
                  </strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Note to owner */}
        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="requester-note"
            style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}
          >
            Message to Student Owner (Optional)
          </label>
          <textarea
            id="requester-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. When are you free near the mechanical workshop for handover? I can meet during lunch break."
            rows={3}
            maxLength={300}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '0.9rem',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Terms agreement summary */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card, 8px)',
            marginBottom: '24px',
          }}
        >
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
            Exchange Summary
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Agreed Total Amount</span>
            <span style={{ fontWeight: 800 }}>
              {listing.mode === 'free_loan' ? '₹0.00 (Free)' : `₹${(totalQuotePaise / 100).toFixed(2)}`}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Designated Campus Zone</span>
            <span>{listing.pickup_zone || 'HITAM Campus'}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '14px 20px',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-contrast)',
            border: 'none',
            borderRadius: 'var(--radius-btn, 8px)',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            minHeight: '48px',
          }}
        >
          {isSubmitting ? 'Submitting Request...' : 'Confirm and Send Request'}
        </button>
      </form>
    </div>
  );
};
