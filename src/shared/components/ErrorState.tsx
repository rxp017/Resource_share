// src/shared/components/ErrorState.tsx
import React from 'react';

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
        padding: '32px 20px',
        textAlign: 'center',
        background: 'var(--color-surface, #fff)',
        border: '1px solid var(--color-danger, #b91c1c)',
        borderRadius: 'var(--radius-card, 8px)',
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-danger, #b91c1c)', marginBottom: '8px' }}>
        {title}
      </h2>
      <p style={{ color: 'var(--color-text-muted, #64748b)', fontSize: '0.9rem', marginBottom: onRetry ? '20px' : '0', lineHeight: 1.5 }}>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--color-surface, #fff)',
            color: 'var(--color-text, #201a17)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: 'var(--radius-btn, 6px)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
};
