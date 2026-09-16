// src/shared/components/UnavailableState.tsx
import React from 'react';

interface UnavailableStateProps {
  featureName?: string;
  reason?: string;
}

export const UnavailableState: React.FC<UnavailableStateProps> = ({
  featureName = 'This feature',
  reason = 'Deferred post-demonstration milestone per platform planning specification.',
}) => {
  return (
    <div style={{ maxWidth: '520px', margin: '40px auto', padding: '32px 24px', textAlign: 'center' }}>
      <div style={{
        background: 'var(--color-surface, #fff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: '12px',
        padding: '32px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '9999px',
          backgroundColor: '#f1f5f9',
          color: '#64748b',
          fontSize: '0.8rem',
          fontWeight: 600,
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Preview Notice
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
          {featureName}
        </h2>
        <p style={{
          display: 'inline-block',
          background: '#fef3c7',
          color: '#92400e',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          Not available in this preview
        </p>
        <p style={{ color: 'var(--color-text-secondary, #64748b)', fontSize: '0.9rem', lineHeight: 1.5 }}>
          {reason}
        </p>
      </div>
    </div>
  );
};
