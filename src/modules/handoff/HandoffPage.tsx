// src/modules/handoff/HandoffPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { supabase } from '../../shared/api-client/supabase';
import { generateQrSvg } from '../../shared/utils/qrGenerator';
import { createHandoffSession, redeemHandoffChallenge, finalizeHandoff } from './api';
import type { TransactionItem } from '../exchanges/types';

export const HandoffPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [transaction, setTransaction] = useState<TransactionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Phase: pickup or return
  const requestedPhase = searchParams.get('phase') as 'pickup' | 'return' | null;
  const phase: 'pickup' | 'return' = useMemo(() => {
    if (requestedPhase === 'return' || requestedPhase === 'pickup') return requestedPhase;
    if (transaction?.status === 'in_progress') return 'return';
    return 'pickup';
  }, [requestedPhase, transaction?.status]);

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [fallbackCode, setFallbackCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 mins in seconds
  const [copiedCode, setCopiedCode] = useState(false);

  // Redeemer inputs
  const [inputCode, setInputCode] = useState('');
  const [isRedeemed, setIsRedeemed] = useState(false);
  const [conditionSummary, setConditionSummary] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [conditionAgreed, setConditionAgreed] = useState(true);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch transaction details
  useEffect(() => {
    if (!id || !user) return;
    async function fetchTx() {
      try {
        const { data, error: err } = await supabase
          .from('transactions')
          .select('*, listing:listings(*)')
          .eq('id', id)
          .single();

        if (err) throw err;
        setTransaction(data as TransactionItem);
      } catch (e: unknown) {
        console.error('Error fetching transaction for handoff:', e);
        setError('Could not load exchange details. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchTx();
  }, [id, user]);

  // Role detection:
  // Pickup: Owner generates QR; Borrower redeems QR
  // Return: Borrower generates QR; Owner redeems QR
  const isOwner = user?.id === transaction?.owner_id;
  const isBorrower = user?.id === transaction?.requester_id;
  const isGenerator = (phase === 'pickup' && isOwner) || (phase === 'return' && isBorrower);

  // Countdown timer for active QR challenge
  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // Handler: Generate Handoff Session (Generator)
  const handleGenerate = async () => {
    if (!id) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await createHandoffSession(
        id,
        phase,
        transaction?.listing?.condition || 'Item inspected before handoff',
        'Physical handoff at ' + (transaction?.pickup_zone || 'HITAM Campus')
      );
      setSessionId(res.session_id);
      setQrToken(res.token);
      setFallbackCode(res.fallback_code);
      setExpiresAt(new Date(res.expires_at));
      setSuccessMsg('Handoff QR code active for 5 minutes. Present screen to counterparty.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate handoff session');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Redeem Challenge (Redeemer)
  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !inputCode.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await redeemHandoffChallenge(id, phase, inputCode.trim());
      setIsRedeemed(true);
      setSessionId(res.session_id);
      setConditionSummary(res.condition_summary || 'Standard Condition Review');
      setConditionNotes(res.condition_notes || '');
      setSuccessMsg('Code verified! Inspect the item in person, then confirm below.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid verification code');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Finalize Handoff
  const handleFinalize = async (agreed: boolean) => {
    if (!id || !sessionId) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await finalizeHandoff(
        id,
        sessionId,
        agreed ? 'confirmed' : 'disputed',
        agreed,
        conditionNotes
      );
      if (res.finalized) {
        setIsFinalized(true);
        setSuccessMsg(res.message);
      } else {
        setSuccessMsg('Your confirmation was recorded. Waiting for the other student.');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to finalize handoff');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '640px', margin: '40px auto', padding: '24px', textAlign: 'center' }}>
        <p>Loading handoff session...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div style={{ maxWidth: '640px', margin: '40px auto', padding: '24px', textAlign: 'center' }}>
        <h2>Exchange Not Found</h2>
        <Link to="/exchanges" style={{ color: 'var(--color-accent)' }}>← Back to Exchanges</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header Breadcrumb */}
      <div style={{ marginBottom: '16px' }}>
        <Link to={`/exchanges/${transaction.id}`} style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← Back to Exchange Details
        </Link>
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card, 12px)',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              backgroundColor: phase === 'pickup' ? '#eff6ff' : '#fef3c7',
              color: phase === 'pickup' ? '#1d4ed8' : '#b45309',
            }}
          >
            {phase === 'pickup' ? 'Physical Pickup' : 'Physical Return'}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Zone: <strong>{transaction.pickup_zone || 'HITAM Campus'}</strong>
          </span>
        </div>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0' }}>
          In-Person Custody Handover
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
          Item: <strong>{transaction.listing?.title}</strong> ({transaction.mode})
          <br />
          Both students must be physically present at the exchange location to verify and confirm custody.
        </p>

        {/* Notifications */}
        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ padding: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem' }}>
            {successMsg}
          </div>
        )}

        {/* Finalized State */}
        {isFinalized ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#15803d', marginBottom: '8px' }}>
              Handover Successfully Finalized!
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              {phase === 'pickup'
                ? transaction.mode === 'sale'
                  ? 'Ownership has transferred to the buyer. The sale is now complete.'
                  : 'Custody has transferred to the borrower. The loan/rental is now active.'
                : 'The item has been returned to the owner. The exchange is now complete.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate(`/exchanges/${transaction.id}`)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-contrast)',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                View Exchange Record
              </button>
              {transaction.status === 'completed' || isFinalized ? (
                <button
                  onClick={() => navigate('/feedback')}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Leave Peer Review ⭐
                </button>
              ) : null}
            </div>
          </div>
        ) : isGenerator ? (
          /* ========================================================= */
          /* GENERATOR VIEW (Owner on pickup / Borrower on return)     */
          /* ========================================================= */
          <div>
            {!sessionId ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: '16px' }}>
                  Ready to hand over the item? Click below to generate a secure, 5-minute QR verification code.
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={isProcessing}
                  style={{
                    padding: '12px 28px',
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-accent-contrast)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    minHeight: '44px',
                  }}
                >
                  {isProcessing ? 'Generating Challenge...' : 'Generate 5-Minute Handoff QR'}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  {qrToken && (
                    <div
                      className="magic-glow animate-fade-in"
                      style={{
                        display: 'inline-block',
                        padding: '16px',
                        backgroundColor: '#ffffff',
                        border: '2px solid var(--color-border)',
                        borderRadius: '16px',
                        marginBottom: '16px',
                      }}
                      dangerouslySetInnerHTML={{ __html: generateQrSvg(qrToken, 210) }}
                    />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: timeLeft < 60 ? 'var(--color-danger)' : 'var(--color-text)',
                        backgroundColor: timeLeft < 60 ? 'color-mix(in srgb, var(--color-danger) 12%, transparent)' : 'var(--color-bg)',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      ⏱️ Expires in: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </span>
                    {timeLeft === 0 && (
                      <button
                        onClick={handleGenerate}
                        className="interactive-btn"
                        style={{ fontSize: '0.85rem', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
                      >
                        Regenerate Challenge
                      </button>
                    )}
                  </div>

                  {/* Fallback code for camera-less/keyboard-only */}
                  <div
                    className="glass-panel"
                    style={{
                      padding: '14px 20px',
                      borderRadius: '10px',
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      KEYBOARD / TYPED FALLBACK CODE:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ fontSize: '1.35rem', letterSpacing: '0.15em', fontFamily: 'monospace', color: 'var(--color-text)' }}>
                        {fallbackCode}
                      </strong>
                      <button
                        type="button"
                        onClick={() => {
                          if (fallbackCode) {
                            navigator.clipboard.writeText(fallbackCode);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }
                        }}
                        className="interactive-btn"
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          border: '1px solid var(--color-border)',
                          backgroundColor: copiedCode ? 'var(--color-success)' : 'var(--color-surface)',
                          color: copiedCode ? '#ffffff' : 'var(--color-text)',
                          cursor: 'pointer',
                          minHeight: '32px',
                          minWidth: 'auto',
                        }}
                      >
                        {copiedCode ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Finalize Button for Generator */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>
                    Physical Confirmation
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                    Once the counterparty has scanned or entered the code and you have physically exchanged the item, click confirm.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleFinalize(true)}
                      disabled={isProcessing}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 700,
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        minHeight: '44px',
                      }}
                    >
                      {isProcessing ? 'Confirming...' : '✓ Confirm Physical Handover'}
                    </button>
                    <button
                      onClick={() => handleFinalize(false)}
                      disabled={isProcessing}
                      style={{
                        padding: '10px 18px',
                        backgroundColor: 'transparent',
                        color: '#dc2626',
                        border: '1px solid #f87171',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        minHeight: '44px',
                      }}
                    >
                      Report Disagreement / Issue
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* REDEEMER VIEW (Borrower on pickup / Owner on return)       */
          /* ========================================================= */
          <div>
            {!isRedeemed ? (
              <form onSubmit={handleRedeem}>
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="token-input" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>
                    Enter 10-Character Handoff Code (or scan counterparty's QR):
                  </label>
                  <input
                    id="token-input"
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="e.g. 9A4BC2DF10"
                    maxLength={32}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '1.1rem',
                      fontFamily: 'monospace',
                      letterSpacing: '0.1em',
                      textAlign: 'center',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      marginBottom: '8px',
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Ask the student presenting the item to read or show the code from their screen.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !inputCode.trim()}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-accent-contrast)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    minHeight: '44px',
                  }}
                >
                  {isProcessing ? 'Verifying Code...' : 'Verify Code & Inspect Condition'}
                </button>
              </form>
            ) : (
              /* Review condition and confirm */
              <div>
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    marginBottom: '20px',
                  }}
                >
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                    Condition Inspection Checklist
                  </h3>
                  {conditionSummary && (
                    <div style={{ fontSize: '0.85rem', color: '#1e40af', marginBottom: '8px' }}>
                      Stated condition: <strong>{conditionSummary}</strong>
                    </div>
                  )}
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 12px 0' }}>
                    Inspect the physical item thoroughly before accepting custody:
                  </p>
                  <ul style={{ fontSize: '0.85rem', color: '#334155', paddingLeft: '20px', margin: '0 0 16px 0', lineHeight: 1.6 }}>
                    <li>Item matches listing category and specifications</li>
                    <li>No unexpected scratches, tears, or hardware defects</li>
                    <li>All included cables, accessories, or textbook inserts are present</li>
                  </ul>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={conditionAgreed}
                        onChange={(e) => setConditionAgreed(e.target.checked)}
                      />
                      <span>I have inspected the item and agree with its physical condition.</span>
                    </label>
                  </div>

                  <div>
                    <label htmlFor="notes-input" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '4px' }}>
                      Inspection Notes (optional):
                    </label>
                    <input
                      id="notes-input"
                      type="text"
                      value={conditionNotes}
                      onChange={(e) => setConditionNotes(e.target.value)}
                      placeholder="e.g. minor crease on cover, working perfectly."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleFinalize(conditionAgreed)}
                    disabled={isProcessing}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      backgroundColor: conditionAgreed ? '#16a34a' : '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      minHeight: '44px',
                    }}
                  >
                    {isProcessing
                      ? 'Finalizing...'
                      : conditionAgreed
                      ? '✓ Confirm Physical Handoff'
                      : '⚠️ Confirm Handover with Disputed Condition'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
