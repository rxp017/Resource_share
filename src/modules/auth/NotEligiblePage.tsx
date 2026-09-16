// src/modules/auth/NotEligiblePage.tsx
import React from 'react';
import { useAuth } from './AuthContext';

export const NotEligiblePage: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div style={{ maxWidth: '480px', margin: '60px auto', padding: '32px 24px', textAlign: 'center' }}>
      <div style={{
        background: 'var(--color-surface, #fff)',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        padding: '32px 24px',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          fontSize: '24px'
        }}>
          🚫
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#991b1b', marginBottom: '12px' }}>
          Account Ineligible
        </h1>

        <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '16px', lineHeight: '1.5' }}>
          You signed in as <strong>{user?.email}</strong>.
        </p>

        <div style={{
          background: '#fef2f2',
          border: '1px solid #fee2e2',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'left',
          fontSize: '0.875rem',
          color: '#991b1b',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          <strong>Domain Restriction Enforced:</strong>
          <p style={{ margin: '6px 0 0 0' }}>
            This platform is strictly restricted to members of Hyderabad Institute of Technology and Management with valid <code>@hitam.org</code> email addresses. Personal Gmail and third-party email accounts are denied access.
          </p>
        </div>

        <button
          type="button"
          onClick={signOut}
          style={{
            width: '100%',
            minHeight: '44px',
            padding: '10px 16px',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Sign Out of Account
        </button>
      </div>
    </div>
  );
};
