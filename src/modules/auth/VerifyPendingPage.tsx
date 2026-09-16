// src/modules/auth/VerifyPendingPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const VerifyPendingPage: React.FC = () => {
  const { user, refreshMembership, signOut } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setMessage('');
    try {
      const updated = await refreshMembership();
      if (updated?.status === 'active') {
        navigate('/explore', { replace: true });
      } else {
        setMessage('Your membership is still pending campus operator review. Please check back shortly.');
      }
    } catch {
      setMessage('Failed to refresh status. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '32px 24px', textAlign: 'center' }}>
      <div style={{
        background: 'var(--color-surface, #fff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: '12px',
        padding: '32px 24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: '#fef3c7',
          color: '#d97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          fontSize: '24px'
        }}>
          ⏳
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>
          Membership Pending Review
        </h1>

        <p style={{ color: 'var(--color-text-secondary, #666)', fontSize: '0.95rem', marginBottom: '16px' }}>
          Your college account <strong>{user?.email}</strong> has been registered.
        </p>

        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'left',
          fontSize: '0.875rem',
          color: '#475569',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>Campus Verification Policy:</strong>
          </p>
          <p style={{ margin: 0 }}>
            To safeguard the campus community, all new accounts must be approved by a HITAM campus moderator or administrator before marketplace listings and exchange requests are unlocked.
          </p>
        </div>

        {message && (
          <div style={{
            background: '#f1f5f9',
            color: '#334155',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '0.875rem',
            marginBottom: '16px'
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={isChecking}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '10px 16px',
              backgroundColor: 'var(--color-primary, #0284c7)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: isChecking ? 'not-allowed' : 'pointer'
            }}
          >
            {isChecking ? 'Checking status...' : 'Check Verification Status'}
          </button>

          <button
            type="button"
            onClick={signOut}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '10px 16px',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary, #666)',
              border: '1px solid var(--color-border, #d1d5db)',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
