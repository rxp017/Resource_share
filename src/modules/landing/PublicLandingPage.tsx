// src/modules/landing/PublicLandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { useTheme } from '../../shared/theme';
import {
  ShieldCheckIcon,
  LockIcon,
  QrCodeIcon,
  RefreshCwIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  GoogleIcon,
  SunIcon,
  MoonIcon,
  ArrowRightIcon,
  SearchIcon,
} from '../../shared/components/Icons';

export const PublicLandingPage: React.FC = () => {
  const { user, membership } = useAuth();
  const { appearance, updatePreferences } = useTheme();

  return (
    <main
      id="main-content"
      tabIndex={-1}
      style={{
        maxWidth: '1080px',
        margin: '0 auto',
        padding: '24px 16px 80px',
      }}
    >
      {/* Top Floating Glass Bar */}
      <nav
        aria-label="Campus navigation"
        className="glass-panel animate-fade-in"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderRadius: 'var(--radius-card, 12px)',
          marginBottom: '36px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <img
            src="/hitam-logo.png"
            alt="HITAM Logo"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              objectFit: 'cover',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              flexShrink: 0,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.02em', color: 'var(--color-text)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              HITAM Resource Share
            </span>
            <span className="hide-on-mobile" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Campus Academic Exchange
            </span>
          </div>
        </div>

        {/* Right Navigation & Theme Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Quick Light/Dark Toggle */}
          <button
            type="button"
            className="interactive-btn"
            onClick={() => void updatePreferences({ appearance: appearance === 'dark' ? 'light' : 'dark' })}
            aria-label={`Switch to ${appearance === 'dark' ? 'light' : 'dark'} mode`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {appearance === 'dark' ? (
              <SunIcon size={16} strokeWidth={2} />
            ) : (
              <MoonIcon size={16} strokeWidth={2} />
            )}
          </button>

          <Link
            to="/explore"
            className="interactive-btn hide-on-mobile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              minHeight: '34px',
            }}
          >
            <SearchIcon size={14} strokeWidth={2} />
            <span>Browse</span>
          </Link>

          {user && membership?.status === 'active' ? (
            <Link
              to="/explore"
              className="interactive-btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 700,
                textDecoration: 'none',
                minHeight: '34px',
              }}
            >
              <span>Explore</span>
              <ArrowRightIcon size={13} strokeWidth={2.5} />
            </Link>
          ) : (
            <Link
              to="/login"
              className="interactive-btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 700,
                textDecoration: 'none',
                minHeight: '34px',
              }}
            >
              <GoogleIcon size={14} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ textAlign: 'center', marginBottom: '56px' }} className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
          <img
            src="/hitam-logo.png"
            alt="HITAM Hyderabad Crest"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              objectFit: 'cover',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              border: '2px solid var(--color-border)',
            }}
          />
        </div>

        {/* Official Trust Badge */}
        <div
          className="magic-glow"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, var(--color-surface))',
            border: '1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)',
            color: 'var(--color-accent)',
            fontSize: 'clamp(0.72rem, 3.2vw, 0.825rem)',
            fontWeight: 700,
            marginBottom: '20px',
            maxWidth: '100%',
            lineHeight: 1.35,
          }}
        >
          <ShieldCheckIcon size={16} strokeWidth={2.2} style={{ flexShrink: 0 }} />
          <span>Official Peer Network for HITAM College</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.5rem, 5vw, 3.4rem)',
            fontWeight: 800,
            marginBottom: '18px',
            letterSpacing: '-0.03em',
            lineHeight: 1.18,
            color: 'var(--color-text)',
            wordBreak: 'break-word',
          }}
        >
          Share, Borrow & Rent <br />
          <span style={{ color: 'var(--color-accent)' }}>Academic Gear with Peers.</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(0.925rem, 2.5vw, 1.15rem)',
            color: 'var(--color-text-muted)',
            maxWidth: '660px',
            margin: '0 auto 32px auto',
            lineHeight: 1.6,
          }}
        >
          Direct peer-to-peer textbook and lab equipment exchanges. Zero broker commissions, zero online escrow delays, and verified physical handoffs powered by ephemeral single-use QR custody.
        </p>

        {/* Primary CTA Buttons */}
        <div
          className="flex-col-mobile"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <Link
            to="/explore"
            className="interactive-btn btn-primary full-width-mobile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 28px',
              borderRadius: 'var(--radius-btn, 8px)',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              minHeight: '48px',
              flex: '1 1 200px',
              maxWidth: '280px',
            }}
          >
            <SearchIcon size={18} strokeWidth={2.2} />
            <span>Explore Marketplace</span>
            <ArrowRightIcon size={16} strokeWidth={2.2} />
          </Link>

          {user && membership?.status === 'active' ? (
            <Link
              to="/listings/new"
              className="interactive-btn btn-secondary full-width-mobile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 24px',
                borderRadius: 'var(--radius-btn, 8px)',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
                minHeight: '48px',
                flex: '1 1 180px',
                maxWidth: '240px',
              }}
            >
              <span>+ Post Listing</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="interactive-btn full-width-mobile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px 24px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-btn, 8px)',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                minHeight: '48px',
                flex: '1 1 200px',
                maxWidth: '280px',
              }}
            >
              <GoogleIcon size={18} />
              <span>Sign in with Google</span>
            </Link>
          )}
        </div>

        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
            marginTop: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontWeight: 600,
          }}
        >
          <LockIcon size={14} strokeWidth={2} />
          <span>Exclusively for verified @hitam.org accounts</span>
        </p>
      </header>

      {/* Live Campus Metric Chips */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '56px',
        }}
      >
        {[
          {
            label: 'Campus Domain Isolation',
            value: '@hitam.org Only',
            icon: <LockIcon size={20} strokeWidth={2} />,
          },
          {
            label: 'Escrow / Middleman Fees',
            value: '₹0.00 Direct UPI',
            icon: <RefreshCwIcon size={20} strokeWidth={2} />,
          },
          {
            label: 'Physical Custody Handoff',
            value: '5-Min QR Protocol',
            icon: <QrCodeIcon size={20} strokeWidth={2} />,
          },
          {
            label: 'Visual Contrast & A11y',
            value: 'WCAG 2.1 AA Passed',
            icon: <CheckCircleIcon size={20} strokeWidth={2} />,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-panel"
            style={{
              padding: '18px 16px',
              borderRadius: 'var(--radius-card, 12px)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, var(--color-surface))',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px',
              }}
            >
              {stat.icon}
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '20px',
          }}
        >
          {[
            {
              title: 'Direct Peer Sale',
              desc: 'Transfer used reference books, workshop tools, and calculators directly to juniors. Zero commissions; settle via UPI or cash.',
              icon: <BookOpenIcon size={22} strokeWidth={2} />,
              tag: 'Permanent Purchase',
            },
            {
              title: '30-Day Free Loan',
              desc: 'Borrow drawing instruments, lab manuals, and component kits from campus peers at zero rental charge.',
              icon: <RefreshCwIcon size={22} strokeWidth={2} />,
              tag: 'Free Academic Aid',
            },
            {
              title: 'Daily Rental Booking',
              desc: 'Rent Arduino kits, Raspberry Pis, and oscilloscopes for semester assignments with automated exclusion calendar gates.',
              icon: <ClockIcon size={22} strokeWidth={2} />,
              tag: 'Per-Day Rates',
            },
            {
              title: 'QR Physical Custody',
              desc: 'Meet at campus zones (Central Library, Canteen Plaza, Workshop) and verify item condition with two-party cryptographic signoff.',
              icon: <QrCodeIcon size={22} strokeWidth={2} />,
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, var(--color-surface))',
                    color: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </div>
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
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginTop: 'auto' }}>
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
          <strong style={{ color: 'var(--color-text)' }}>Campus Isolation Invariant:</strong> Only authenticated students and faculty holding active <code style={{ backgroundColor: 'var(--color-bg)', padding: '2px 6px', borderRadius: '4px' }}>@hitam.org</code> credentials can list or request exchanges. Outside domains are rejected at the server gateway.
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: 'var(--color-text)' }}>Academic Safety:</strong> Zero online payment gateway fees or financial escrow. Prohibited items (weapons, academic integrity violations, hazardous materials) are systematically filtered by automated moderation rules.
        </p>
      </footer>
    </main>
  );
};
