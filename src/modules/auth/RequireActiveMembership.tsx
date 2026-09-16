// src/modules/auth/RequireActiveMembership.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { NotEligiblePage } from './NotEligiblePage';

export const RequireActiveMembership: React.FC = () => {
  const { membership, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary, #666)' }}>
        <p>Loading membership details...</p>
      </div>
    );
  }

  if (membership && !membership.eligible) {
    return <NotEligiblePage />;
  }

  if (!membership || membership.status === 'pending') {
    return <Navigate to="/verify" replace />;
  }

  if (membership.status === 'suspended') {
    return (
      <div style={{ maxWidth: '480px', margin: '60px auto', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid #fed7aa', borderRadius: '12px', padding: '32px 24px' }}>
          <h1 style={{ fontSize: '1.4rem', color: '#c2410c', marginBottom: '12px' }}>Membership Suspended</h1>
          <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '20px' }}>
            Your campus sharing privileges have been temporarily suspended by a campus moderator.
          </p>
          <button
            type="button"
            onClick={signOut}
            style={{
              padding: '10px 18px',
              backgroundColor: '#c2410c',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (membership.status === 'expired') {
    return (
      <div style={{ maxWidth: '480px', margin: '60px auto', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '32px 24px' }}>
          <h1 style={{ fontSize: '1.4rem', color: '#475569', marginBottom: '12px' }}>Membership Expired</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '20px' }}>
            Your student membership for this academic session has expired or been deactivated.
          </p>
          <button
            type="button"
            onClick={signOut}
            style={{
              padding: '10px 18px',
              backgroundColor: '#475569',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
