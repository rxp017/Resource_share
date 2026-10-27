// src/shared/components/EmptyState.tsx
import React from 'react';
import { PackageIcon } from './Icons';

interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div
      style={{
        maxWidth: '460px',
        margin: '40px auto',
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
          backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, var(--color-surface))',
          color: 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
        }}
      >
        {icon || <PackageIcon size={28} strokeWidth={1.75} />}
      </div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text)' }}>
        {title}
      </h2>
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: '0.9rem',
          marginBottom: actionText ? '22px' : '0',
          lineHeight: 1.6,
        }}
      >
        {message}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="interactive-btn btn-primary"
          style={{
            padding: '10px 22px',
            borderRadius: 'var(--radius-btn, 8px)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
