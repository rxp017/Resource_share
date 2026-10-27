// src/shared/components/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      style={{
        maxWidth: '540px',
        margin: '80px auto',
        padding: '36px 24px',
        textAlign: 'center',
      }}
    >
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-card, 12px)',
          padding: '40px 24px',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '16px' }} aria-hidden="true">
          🧭
        </div>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '10px',
            color: 'var(--color-text)',
          }}
        >
          404: Page Not Found
        </h1>
        <p
          style={{
            color: 'var(--color-text-muted)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: '28px',
          }}
        >
          The page or listing you are looking for does not exist, has been removed, or is restricted to verified campus members.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            to="/"
            className="interactive-btn btn-primary"
            style={{
              padding: '12px 24px',
              fontWeight: 700,
            }}
          >
            <span>Return to Campus Home</span>
            <span>→</span>
          </Link>
          <Link
            to="/help"
            className="interactive-btn btn-secondary"
            style={{
              padding: '12px 20px',
            }}
          >
            <span>Guidelines & Help</span>
          </Link>
        </div>
      </div>
    </main>
  );
};
