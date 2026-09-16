// src/shared/components/ForbiddenState.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface ForbiddenStateProps {
  title?: string;
  message?: string;
}

export const ForbiddenState: React.FC<ForbiddenStateProps> = ({
  title = '403 - Access Forbidden',
  message = 'You do not have the required permissions to view this resource.',
}) => {
  return (
    <div
      role="alert"
      style={{
        maxWidth: '480px',
        margin: '60px auto',
        padding: '32px 20px',
        textAlign: 'center',
        background: 'var(--color-surface, #fff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 'var(--radius-card, 8px)',
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-danger, #b91c1c)', marginBottom: '8px' }}>
        {title}
      </h1>
      <p style={{ color: 'var(--color-text-muted, #64748b)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
        {message}
      </p>
      <Link
        to="/explore"
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: 'var(--color-accent, #0f766e)',
          color: 'var(--color-accent-contrast, #fff)',
          borderRadius: 'var(--radius-btn, 6px)',
          fontWeight: 600,
          textDecoration: 'none'
        }}
      >
        Return to Explore
      </Link>
    </div>
  );
};
