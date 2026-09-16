// src/modules/exchanges/ExchangeDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../auth';
import {
  getTransactionById,
  acceptExchangeRequest,
  declineExchangeRequest,
  withdrawExchangeRequest,
  cancelBeforePickup,
  uploadPaymentProofImage,
  submitPaymentProof,
  acknowledgePayment,
} from './api';
import type { TransactionItem, PaymentProof } from './types';
import { Skeleton } from '../../shared/components/Skeleton';
import { ErrorState } from '../../shared/components/ErrorState';

export const ExchangeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [transaction, setTransaction] = useState<TransactionItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment proof form state (Buyer)
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [maskedReference, setMaskedReference] = useState('');

  // Dispute form state (Seller)
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  // Cancel dialog state
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!id) return;
      try {
        const data = await getTransactionById(id);
        if (isMounted) {
          setTransaction(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load exchange.';
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
  }, [id, refreshCounter]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
        <Skeleton height="32px" width="50%" style={{ marginBottom: '16px' }} />
        <Skeleton height="120px" style={{ marginBottom: '16px', borderRadius: '8px' }} />
        <Skeleton height="240px" style={{ borderRadius: '8px' }} />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
        <ErrorState
          title="Exchange Not Found"
          message={error || 'Could not retrieve this exchange record.'}
          onRetry={() => setRefreshCounter((c) => c + 1)}
        />
      </div>
    );
  }

  const isOwner = user?.id === transaction.owner_id;
  const isRequester = user?.id === transaction.requester_id;
  const latestProof: PaymentProof | undefined =
    transaction.payment_proofs && transaction.payment_proofs.length > 0
      ? transaction.payment_proofs[transaction.payment_proofs.length - 1]
      : undefined;

  // Handle owner accept
  const handleAccept = async () => {
    try {
      setIsProcessing(true);
      setActionError(null);
      await acceptExchangeRequest(transaction.id, transaction.version, crypto.randomUUID());
      setActionSuccess('Exchange request accepted successfully.');
      setRefreshCounter((c) => c + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept exchange request.';
      setActionError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle owner decline
  const handleDecline = async () => {
    if (!window.confirm('Are you sure you want to decline this exchange request?')) return;
    try {
      setIsProcessing(true);
      setActionError(null);
      await declineExchangeRequest(transaction.id, transaction.version, crypto.randomUUID());
      setActionSuccess('Exchange request declined.');
      setRefreshCounter((c) => c + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to decline request.';
      setActionError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle requester withdraw
  const handleWithdraw = async () => {
    if (!window.confirm('Withdraw this request?')) return;
    try {
      setIsProcessing(true);
      setActionError(null);
      await withdrawExchangeRequest(transaction.id, transaction.version, crypto.randomUUID());
      setActionSuccess('Request withdrawn.');
      setRefreshCounter((c) => c + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to withdraw request.';
      setActionError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancel before pickup
  const handleCancel = async () => {
    try {
      setIsProcessing(true);
      setActionError(null);
      await cancelBeforePickup(
        transaction.id,
        cancelReason.trim() || undefined,
        transaction.version,
        crypto.randomUUID()
      );
      setActionSuccess('Exchange canceled.');
      setShowCancelInput(false);
      setRefreshCounter((c) => c + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel exchange.';
      setActionError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle proof file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  // Handle proof submission (Buyer)
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile || !user) return;

    try {
      setIsProcessing(true);
      setActionError(null);

      const nextVersion = (latestProof?.version || 0) + 1;
      const storagePath = await uploadPaymentProofImage(
        proofFile,
        user.id,
        transaction.id,
        nextVersion
      );

      await submitPaymentProof(
        transaction.id,
        transaction.quoted_price_paise,
        storagePath,
        maskedReference.trim() || undefined,
        crypto.randomUUID()
      );

      setActionSuccess('Payment proof submitted successfully. Waiting for seller acknowledgement.');
      setProofFile(null);
      setProofPreview(null);
      setMaskedReference('');
      setRefreshCounter((c) => c + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload payment proof.';
      setActionError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment acknowledgement (Seller)
  const handleAcknowledge = async (decision: 'acknowledged' | 'disputed') => {
    if (!latestProof) return;
    if (decision === 'disputed' && !disputeReason.trim()) {
      setActionError('Please provide a reason for the dispute.');
      return;
    }

    try {
      setIsProcessing(true);
      setActionError(null);
      await acknowledgePayment(
        latestProof.id,
        decision,
        decision === 'disputed' ? disputeReason.trim() : undefined,
        transaction.version,
        crypto.randomUUID()
      );

      setActionSuccess(
        decision === 'acknowledged'
          ? 'Payment confirmed and acknowledged.'
          : 'Payment marked as disputed.'
      );
      setShowDisputeInput(false);
      setDisputeReason('');
      setRefreshCounter((c) => c + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update payment status.';
      setActionError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    const s = transaction.status;
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
      label = s === 'seller_acknowledged' ? 'PAYMENT ACKNOWLEDGED' : 'COMPLETED';
    } else if (s === 'seller_disputed') {
      bg = '#fee2e2';
      text = '#b91c1c';
      label = 'PAYMENT DISPUTED';
    } else if (s === 'canceled' || s === 'declined' || s === 'withdrawn') {
      bg = '#f1f5f9';
      text = '#64748b';
    }

    return (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 800,
          backgroundColor: bg,
          color: text,
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link
          to="/exchanges"
          style={{
            color: 'var(--color-text-muted)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          ← Back to My Exchanges
        </Link>
      </div>

      {/* Header with Title and Status */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px 0' }}>
            Exchange Receipt
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', margin: 0 }}>
            ID: <code style={{ fontSize: '0.75rem' }}>{transaction.id}</code> · Version {transaction.version}
          </p>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {actionSuccess && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            color: '#166534',
            marginBottom: '20px',
            fontSize: '0.875rem',
          }}
        >
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#991b1b',
            marginBottom: '20px',
            fontSize: '0.875rem',
          }}
        >
          {actionError}
        </div>
      )}

      {/* Vertical Receipt Summary Card */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card, 8px)',
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '16px',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-contrast)',
                display: 'inline-block',
                marginBottom: '4px',
              }}
            >
              {transaction.mode.replace('_', ' ')}
            </span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '4px 0' }}>
              {transaction.listing?.title || 'Campus Item'}
            </h2>
            <Link
              to={`/listings/${transaction.listing_id}`}
              style={{ fontSize: '0.825rem', color: 'var(--color-accent)', textDecoration: 'none' }}
            >
              View original listing →
            </Link>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>
              Agreed Amount
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-accent)' }}>
              {transaction.mode === 'free_loan'
                ? 'Free'
                : `₹${(transaction.quoted_price_paise / 100).toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Key details grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            fontSize: '0.875rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>
              Pickup Zone
            </span>
            <strong>{transaction.pickup_zone || 'HITAM Campus'}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>
              Your Role
            </span>
            <strong>{isOwner ? 'Seller / Owner' : isRequester ? 'Buyer / Requester' : 'Moderator'}</strong>
          </div>

          {transaction.start_date && transaction.end_date && (
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>
                Booking Window
              </span>
              <strong>
                {transaction.start_date} to {transaction.end_date} ({transaction.rental_days} days)
              </strong>
            </div>
          )}

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>
              Requested On
            </span>
            <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {transaction.requester_note && (
          <div
            style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px dashed var(--color-border)',
              fontSize: '0.875rem',
            }}
          >
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>
              Note from Requester:
            </span>
            <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--color-text)' }}>
              "{transaction.requester_note}"
            </p>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* State Workflow Panels */}
      {/* ------------------------------------------------------------- */}

      {/* 1. STATE: Requested */}
      {transaction.status === 'requested' && (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card, 8px)',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          {isOwner ? (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px' }}>
                Exchange Request Received
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                A student has requested this item. If you accept, the item will be reserved and the buyer will be instructed to make direct payment.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleAccept}
                  disabled={isProcessing}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-accent-contrast)',
                    border: 'none',
                    borderRadius: 'var(--radius-btn, 6px)',
                    fontWeight: 700,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    minHeight: '44px',
                  }}
                >
                  {isProcessing ? 'Processing...' : 'Accept Exchange Request'}
                </button>

                <button
                  onClick={handleDecline}
                  disabled={isProcessing}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    color: '#dc2626',
                    border: '1px solid #f87171',
                    borderRadius: 'var(--radius-btn, 6px)',
                    fontWeight: 600,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    minHeight: '44px',
                  }}
                >
                  Decline
                </button>
              </div>
            </div>
          ) : isRequester ? (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px' }}>
                Request Sent to Owner
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                Waiting for the student owner to review and accept your request. You will be notified once they respond.
              </p>
              <button
                onClick={handleWithdraw}
                disabled={isProcessing}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-btn, 6px)',
                  fontWeight: 600,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  minHeight: '44px',
                }}
              >
                Withdraw Request
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* 2. STATE: Accepted (Direct Payment Proof Workflow) */}
      {(transaction.status === 'accepted' || transaction.status === 'seller_disputed') && (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card, 8px)',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          {transaction.status === 'seller_disputed' && (
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
              <strong>Payment Disputed:</strong> The seller indicated that the previous payment could not be confirmed in their account. Please check your transaction and re-upload proof, or coordinate directly.
            </div>
          )}

          {transaction.mode === 'free_loan' ? (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', color: '#166534' }}>
                ✓ Free Loan Approved
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: 1.5 }}>
                No payment is required for this free loan. Meet at <strong>{transaction.pickup_zone}</strong> to pick up the item.
              </p>
            </div>
          ) : isRequester ? (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '6px' }}>
                Submit Direct Payment Evidence
              </h3>
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '0.85rem',
                  color: '#1e3a8a',
                  lineHeight: 1.5,
                }}
              >
                <strong>Payment Instructions:</strong> Pay <strong>₹{(transaction.quoted_price_paise / 100).toFixed(2)}</strong> directly to the seller (e.g. via UPI or cash at handover). HITAM Resource Share has no payment gateway and does not handle funds. After paying, upload a legible screenshot of your payment receipt below.
              </div>

              <form onSubmit={handleSubmitProof}>
                <div style={{ marginBottom: '16px' }}>
                  <label
                    htmlFor="proof-image"
                    style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}
                  >
                    Payment Screenshot / Receipt Image *
                  </label>
                  <input
                    id="proof-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    required
                    style={{ fontSize: '0.875rem' }}
                  />
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    EXIF metadata will be automatically stripped before secure storage.
                  </span>
                </div>

                {proofPreview && (
                  <div style={{ marginBottom: '16px' }}>
                    <img
                      src={proofPreview}
                      alt="Proof preview"
                      style={{
                        maxHeight: '180px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                      }}
                    />
                  </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                  <label
                    htmlFor="masked-ref"
                    style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}
                  >
                    UPI Reference / UTR / Last 4 Digits (Optional)
                  </label>
                  <input
                    id="masked-ref"
                    type="text"
                    value={maskedReference}
                    onChange={(e) => setMaskedReference(e.target.value)}
                    placeholder="e.g. UTR 429182918291"
                    maxLength={32}
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

                <button
                  type="submit"
                  disabled={isProcessing || !proofFile}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-accent-contrast)',
                    border: 'none',
                    borderRadius: 'var(--radius-btn, 6px)',
                    fontWeight: 700,
                    cursor: isProcessing || !proofFile ? 'not-allowed' : 'pointer',
                    opacity: isProcessing || !proofFile ? 0.6 : 1,
                    minHeight: '44px',
                  }}
                >
                  {isProcessing ? 'Uploading Proof...' : 'Submit Payment Proof'}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px' }}>
                Awaiting Payment Proof from Buyer
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                The buyer has been notified to make direct payment of ₹{(transaction.quoted_price_paise / 100).toFixed(2)} and upload proof. Once submitted, you will be able to review and acknowledge it here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. STATE: Proof Submitted (Review & Acknowledgement) */}
      {transaction.status === 'proof_submitted' && latestProof && (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card, 8px)',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px' }}>
            Payment Proof (Version {latestProof.version})
          </h3>

          <div
            style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'flex-start',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}
          >
            {latestProof.signed_url ? (
              <a
                href={latestProof.signed_url}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'block' }}
              >
                <img
                  src={latestProof.signed_url}
                  alt="Payment receipt proof"
                  style={{
                    maxWidth: '220px',
                    maxHeight: '260px',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                  }}
                />
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: 'var(--color-accent)',
                    marginTop: '4px',
                    textAlign: 'center',
                  }}
                >
                  Click to view full size ↗
                </span>
              </a>
            ) : (
              <div
                style={{
                  width: '160px',
                  height: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                Private proof
              </div>
            )}

            <div style={{ flex: 1, minWidth: '220px' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Claimed Amount: </span>
                <strong>₹{(latestProof.amount_paise / 100).toFixed(2)}</strong>
              </p>
              {latestProof.masked_reference && (
                <p style={{ margin: '0 0 6px 0', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Reference: </span>
                  <code>{latestProof.masked_reference}</code>
                </p>
              )}
              <p style={{ margin: '0 0 16px 0', fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                Submitted on {new Date(latestProof.created_at).toLocaleString()}
              </p>

              {isOwner && (
                <div>
                  <div
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '6px',
                      fontSize: '0.825rem',
                      color: '#92400e',
                      marginBottom: '16px',
                    }}
                  >
                    <strong>Payee Verification:</strong> Open your own UPI app or bank statement to verify that this amount was credited. Do not rely exclusively on image screenshots.
                  </div>

                  {!showDisputeInput ? (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleAcknowledge('acknowledged')}
                        disabled={isProcessing}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 'var(--radius-btn, 6px)',
                          fontWeight: 700,
                          cursor: isProcessing ? 'not-allowed' : 'pointer',
                          minHeight: '44px',
                        }}
                      >
                        {isProcessing ? 'Updating...' : 'Acknowledge Payment Received'}
                      </button>

                      <button
                        onClick={() => setShowDisputeInput(true)}
                        disabled={isProcessing}
                        style={{
                          padding: '10px 18px',
                          backgroundColor: 'transparent',
                          color: '#dc2626',
                          border: '1px solid #f87171',
                          borderRadius: 'var(--radius-btn, 6px)',
                          fontWeight: 600,
                          cursor: isProcessing ? 'not-allowed' : 'pointer',
                          minHeight: '44px',
                        }}
                      >
                        Dispute Payment
                      </button>
                    </div>
                  ) : (
                    <div style={{ marginTop: '12px' }}>
                      <label
                        htmlFor="dispute-reason"
                        style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '4px' }}
                      >
                        Reason for Dispute *
                      </label>
                      <input
                        id="dispute-reason"
                        type="text"
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="e.g. Amount not reflected in Google Pay account."
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--color-border)',
                          marginBottom: '10px',
                          fontSize: '0.875rem',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleAcknowledge('disputed')}
                          disabled={isProcessing || !disputeReason.trim()}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                          }}
                        >
                          Confirm Dispute
                        </button>
                        <button
                          onClick={() => setShowDisputeInput(false)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isRequester && (
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  Awaiting seller verification. The seller will check their UPI or banking app and acknowledge receipt.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. STATE: Seller Acknowledged (Pickup Ready) */}
      {(transaction.status === 'seller_acknowledged' || transaction.status === 'completed') && (
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-card, 8px)',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534', margin: '0 0 8px 0' }}>
            ✓ Payment Acknowledged by Seller
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#15803d', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            Payment evidence has been verified and confirmed by the payee. Both parties can now meet at the designated pickup zone for physical handoff.
          </p>

          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              border: '1px solid #bbf7d0',
              fontSize: '0.875rem',
            }}
          >
            <strong>Pickup Location:</strong> {transaction.pickup_zone || 'HITAM Campus'}<br />
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
              Bring student ID card for verification during handoff.
            </span>
          </div>

          <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#15803d' }}>
            <em>Note: In-person QR custody verification is part of the post-tomorrow roadmap. For this demonstration, payment acknowledgement marks the verified milestone.</em>
          </div>
        </div>
      )}

      {/* Pre-pickup Cancellation Trigger */}
      {['accepted', 'proof_submitted', 'seller_acknowledged', 'seller_disputed'].includes(
        transaction.status
      ) && (
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'right',
          }}
        >
          {!showCancelInput ? (
            <button
              onClick={() => setShowCancelInput(true)}
              style={{
                fontSize: '0.825rem',
                color: '#dc2626',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Cancel this exchange before pickup
            </button>
          ) : (
            <div
              style={{
                textAlign: 'left',
                padding: '16px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
              }}
            >
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 6px 0' }}>
                Cancel Exchange Before Pickup
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 10px 0' }}>
                This will release any active reservation hold on the asset.
              </p>
              <input
                type="text"
                placeholder="Reason for cancellation (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  marginBottom: '10px',
                  fontSize: '0.85rem',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  style={{
                    padding: '6px 14px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  Confirm Cancellation
                </button>
                <button
                  onClick={() => setShowCancelInput(false)}
                  style={{
                    padding: '6px 14px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                  }}
                >
                  Nevermind
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
