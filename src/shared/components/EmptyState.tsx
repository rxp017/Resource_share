// src/shared/components/EmptyState.tsx
import React from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionText,
  onAction,
  icon = '📦',
}) => {
  return (
    <div style={{
      maxWidth: '460px',
      margin: '40px auto',
      padding: '32px 20px',
      textAlign: 'center',
      background: 'var(--color-surface, #fff)',
      border: '1px solid var(--color-border, #e2e8f0)',
      borderRadius: 'var(--radius-card, 8px)',
    }}>
      <div style={{ fontSize: '32px', marginBottom: '16px' }}>{icon}</div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>{title}</h2>
      <p style={{ color: 'var(--color-text-muted, #64748b)', fontSize: '0.9rem', marginBottom: actionText ? '20px' : '0', lineHeight: 1.5 }}>
        {message}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--color-accent, #0f766e)',
            color: 'var(--color-accent-contrast, #fff)',
            border: 'none',
            borderRadius: 'var(--radius-btn, 6px)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
