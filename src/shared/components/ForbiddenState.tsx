// src/shared/components/ForbiddenState.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { LockIcon } from './Icons';

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
        padding: '36px 24px',
        textAlign: 'center',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card, 12px)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'color-mix(in srgb, var(--color-danger, #b91c1c) 12%, var(--color-surface))',
          color: 'var(--color-danger, #b91c1c)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
        }}
      >
        <LockIcon size={26} strokeWidth={1.75} />
      </div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-danger, #b91c1c)', marginBottom: '8px' }}>
        {title}
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>
        {message}
      </p>
      <Link
        to="/explore"
        className="interactive-btn btn-primary"
        style={{
          display: 'inline-block',
          padding: '10px 22px',
          borderRadius: 'var(--radius-btn, 8px)',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Return to Explore
      </Link>
    </div>
  );
};
