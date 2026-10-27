// src/shared/components/ErrorState.tsx
import React from 'react';
import { AlertCircleIcon } from './Icons';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An unexpected error occurred',
  message = 'We encountered an issue loading this information. Please try again.',
  onRetry,
}) => {
  return (
    <div
      role="alert"
      style={{
        maxWidth: '480px',
        margin: '40px auto',
        padding: '36px 24px',
        textAlign: 'center',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-danger, #b91c1c)',
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
        <AlertCircleIcon size={28} strokeWidth={1.75} />
      </div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-danger, #b91c1c)', marginBottom: '8px' }}>
        {title}
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: onRetry ? '22px' : '0', lineHeight: 1.6 }}>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="interactive-btn btn-secondary"
          style={{
            padding: '10px 22px',
            borderRadius: 'var(--radius-btn, 8px)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
};
