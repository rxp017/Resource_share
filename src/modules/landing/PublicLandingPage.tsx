// src/modules/landing/PublicLandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { useTheme } from '../../shared/theme';

export const PublicLandingPage: React.FC = () => {
  const { user, membership } = useAuth();
  const { style, appearance, updatePreferences } = useTheme();

  return (
    <main id="main-content" tabIndex={-1} style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px 80px' }}>
      {/* Top Floating Glass Bar */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderRadius: 'var(--radius-card, 12px)',
          marginBottom: '40px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/hitam-logo.png"
            alt="HITAM Logo"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              objectFit: 'cover',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          />
          <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em', color: 'var(--color-text)' }}>
            HITAM Resource Share
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-contrast)',
            }}
          >
            v2.0 Full
          </span>
        </div>

        {/* Live Theme Quick-Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '2px' }}>
            <button
              type="button"
              className="interactive-btn"
              onClick={() => void updatePreferences({ style: 'calm' })}
              style={{
                border: 'none',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: style === 'calm' ? 700 : 500,
                borderRadius: '4px',
                backgroundColor: style === 'calm' ? 'var(--color-accent)' : 'transparent',
                color: style === 'calm' ? 'var(--color-accent-contrast)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                minHeight: '28px',
                minWidth: 'auto',
              }}
            >
              Calm
            </button>
            <button
              type="button"
              className="interactive-btn"
              onClick={() => void updatePreferences({ style: 'pulse' })}
              style={{
                border: 'none',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: style === 'pulse' ? 700 : 500,
                borderRadius: '4px',
                backgroundColor: style === 'pulse' ? 'var(--color-accent)' : 'transparent',
                color: style === 'pulse' ? 'var(--color-accent-contrast)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                minHeight: '28px',
                minWidth: 'auto',
              }}
            >
              Pulse
            </button>
          </div>

          <button
            type="button"
            className="interactive-btn"
            onClick={() => void updatePreferences({ appearance: appearance === 'dark' ? 'light' : 'dark' })}
            aria-label="Toggle light and dark mode"
            style={{
              padding: '4px 10px',
              fontSize: '0.85rem',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              minHeight: '32px',
              minWidth: '32px',
            }}
          >
            {appearance === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <header style={{ textAlign: 'center', marginBottom: '56px' }} className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <img
            src="/hitam-logo.png"
            alt="HITAM Hyderabad Crest"
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '16px',
              objectFit: 'cover',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              border: '2px solid var(--color-border)',
            }}
          />
        </div>
        <div
          className="magic-glow"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-accent)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '20px',
          }}
        >
          <span className="badge-pulse" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent)' }} />
          <span>Exclusive Campus Network for Hyderabad Institute of Technology & Management</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 800,
            marginBottom: '18px',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--color-text)',
          }}
        >
          Share, Borrow & Rent <br />
          <span style={{ color: 'var(--color-accent)' }}>Academic Gear with Peers.</span>
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--color-text-muted)',
            maxWidth: '680px',
            margin: '0 auto 32px auto',
            lineHeight: 1.6,
          }}
        >
          Direct peer-to-peer textbook and lab equipment exchanges. Zero broker commissions, zero online escrow delays, and verified physical handoffs powered by ephemeral single-use QR custody.
        </p>

        {/* Primary CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {user && membership?.status === 'active' ? (
            <Link
              to="/explore"
              className="interactive-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-contrast)',
                borderRadius: 'var(--radius-btn, 8px)',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                minHeight: '48px',
              }}
            >
              <span>Explore Marketplace</span>
              <span>→</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="interactive-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 32px',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-contrast)',
                borderRadius: 'var(--radius-btn, 8px)',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                minHeight: '48px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
              <span>→</span>
            </Link>
          )}

          <Link
            to="/help"
            className="interactive-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '14px 24px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-btn, 8px)',
              fontWeight: 600,
              fontSize: '1rem',
              textDecoration: 'none',
              minHeight: '48px',
            }}
          >
            <span>Campus Pickup Guidelines</span>
          </Link>
        </div>

        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
            marginTop: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontWeight: 600,
          }}
        >
          <span>🔒</span>
          <span>Only for @hitam.org accounts</span>
        </p>
      </header>

      {/* Live Campus Metric Chips */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '56px',
        }}
      >
        {[
          { label: 'Campus Authorization', value: '@hitam.org Only', icon: '🔒' },
          { label: 'Escrow / Middleman Fees', value: '₹0.00 Free', icon: '⚡' },
          { label: 'Physical Custody Handoff', value: '5-Min Replay-Safe QR', icon: '📱' },
          { label: 'Design Accessibility', value: '40/40 WCAG AA', icon: '♿' },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-panel"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-card, 10px)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{stat.icon}</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '2px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* 4 Feature Pillars Grid */}
      <section style={{ marginBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px', color: 'var(--color-text)' }}>
            Four Exchange Modes Tailored for Engineering Students
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Built specifically to solve textbook shortages, semester lab projects, and exam prep.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          {[
            {
              title: 'Direct Peer Sale',
              desc: 'Transfer used reference books, workshop tools, and calculators directly to juniors. Zero commissions; settle via UPI or cash.',
              icon: '🏷️',
              tag: 'Permanent Purchase',
            },
            {
              title: '30-Day Free Loan',
              desc: 'Borrow drawing instruments, lab manuals, and component kits from campus peers at zero rental charge.',
              icon: '🤝',
              tag: 'Free Academic Aid',
            },
            {
              title: 'Daily Rental Booking',
              desc: 'Rent Arduino kits, Raspberry Pis, and oscilloscopes for semester assignments with automated exclusion calendar gates.',
              icon: '⏱️',
              tag: 'Per-Day Rates',
            },
            {
              title: 'QR Physical Custody',
              desc: 'Meet at campus zones (Central Library, Canteen Plaza, Workshop) and verify item condition with two-party cryptographic signoff.',
              icon: '📲',
              tag: 'Replay-Safe Protocol',
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="interactive-card"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card, 12px)',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '2rem' }}>{card.icon}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {card.tag}
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text)' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginTop: 'auto' }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Policy and Safeguards Footer */}
      <footer
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-card, 12px)',
          padding: '24px 20px',
          fontSize: '0.825rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
        }}
      >
        <p style={{ marginBottom: '8px' }}>
          <strong style={{ color: 'var(--color-text)' }}>Campus Isolation Invariant:</strong> Only authenticated students and faculty holding active <code style={{ backgroundColor: 'var(--color-bg)', padding: '2px 6px', borderRadius: '4px' }}>@hitam.org</code> credentials can access, list, or request exchanges. Outside domains are rejected at the server gateway.
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: 'var(--color-text)' }}>Academic Safety:</strong> Zero online payment gateway fees or financial escrow. Prohibited items (weapons, academic integrity violations, hazardous materials) are systematically filtered by automated moderation rules.
        </p>
      </footer>
    </main>
  );
};
