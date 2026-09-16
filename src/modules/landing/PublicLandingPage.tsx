// src/modules/landing/PublicLandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';

export const PublicLandingPage: React.FC = () => {
  const { user, membership } = useAuth();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
          HITAM Resource Share
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary, #64748b)', maxWidth: '600px', margin: '0 auto 24px auto' }}>
          An exclusive peer-to-peer campus marketplace for students to buy, sell, borrow, and rent academic equipment, textbooks, and gear.
        </p>

        <div>
          {user && membership?.status === 'active' ? (
            <Link
              to="/explore"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: 'var(--color-primary, #0284c7)',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Go to Explore
            </Link>
          ) : (
            <Link
              to="/login"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: 'var(--color-primary, #0284c7)',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Sign In with College Account
            </Link>
          )}
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '48px' }}>
        <div style={{ border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '8px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '8px' }}>Direct Sale</h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Buy or sell used textbooks, calculators, and tools directly with campus peers. Zero commissions.</p>
        </div>
        <div style={{ border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '8px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '8px' }}>Free Loan</h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Borrow drafting kits, reference manuals, and lab gear for free for up to 30 days.</p>
        </div>
        <div style={{ border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '8px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '8px' }}>Short-Term Rental</h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Rent components and specialized kits for exams or projects at fair student daily rates.</p>
        </div>
      </section>

      <section style={{ borderTop: '1px solid var(--color-border, #e2e8f0)', paddingTop: '24px', fontSize: '0.85rem', color: '#94a3b8' }}>
        <p><strong>Campus Eligibility:</strong> Access is restricted strictly to active students and staff of Hyderabad Institute of Technology and Management (HITAM) using authorized @hitam.org accounts.</p>
        <p><strong>Accessibility Statement:</strong> Built to WCAG 2.1 AA standards supporting keyboard navigation, visible focus indicators, and screen-reader semantics.</p>
      </section>
    </div>
  );
};
