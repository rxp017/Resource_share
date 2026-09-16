// src/modules/auth/RequireModerator.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const RequireModerator: React.FC = () => {
  const { membership, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary, #666)' }}>
        <p>Checking permissions...</p>
      </div>
    );
  }

  const isMod = membership?.role === 'moderator' || membership?.role === 'admin';

  if (!isMod) {
    return (
      <div style={{ maxWidth: '480px', margin: '60px auto', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{
          background: 'var(--color-surface, #fff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '12px',
          padding: '32px 24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#dc2626', marginBottom: '8px' }}>
            403 - Forbidden
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #666)', fontSize: '0.95rem' }}>
            Campus moderator or administrator credentials are required to view this administration queue.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
