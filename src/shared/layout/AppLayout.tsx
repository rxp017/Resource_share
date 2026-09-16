// src/shared/layout/AppLayout.tsx
import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../modules/auth/useAuth';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/explore', label: 'Explore', icon: '🔍' },
    { to: '/exchanges', label: 'My exchanges', icon: '🔄' },
    { to: '/listings/new', label: 'Create', icon: '➕' },
    { to: '/inbox', label: 'Inbox', icon: '💬' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <header
        role="banner"
        style={{
          borderBottom: '1px solid var(--color-border, #e2e8f0)',
          backgroundColor: 'var(--color-surface, #fff)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/explore"
            style={{
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              minHeight: '44px',
            }}
          >
            HITAM Share
          </Link>
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              borderLeft: '1px solid var(--color-border)',
              paddingLeft: '12px',
              display: 'none',
            }}
            className="desktop-campus-name"
          >
            Hyderabad Institute of Technology and Management
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav
          role="navigation"
          aria-label="Desktop primary navigation"
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          className="desktop-nav"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                minHeight: '44px',
                borderRadius: 'var(--radius-btn, 6px)',
                textDecoration: 'none',
                fontSize: '0.925rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-accent)' : 'var(--color-text)',
                backgroundColor: isActive ? 'var(--color-bg)' : 'transparent',
              })}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Disabled Notifications Button */}
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Notifications service is deferred to milestone P10."
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              minHeight: '44px',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-btn, 6px)',
              color: 'var(--color-text-muted)',
              fontSize: '0.8rem',
              cursor: 'not-allowed',
              opacity: 0.8,
            }}
          >
            <span>🔔</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Not available in this preview</span>
          </button>

          {/* Settings Shortcut */}
          <Link
            to="/settings"
            aria-label="Preferences and settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '44px',
              minWidth: '44px',
              color: 'var(--color-text)',
              textDecoration: 'none',
              borderRadius: 'var(--radius-btn, 6px)',
              border: '1px solid var(--color-border)',
            }}
          >
            ⚙️
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" role="main" style={{ flex: 1, paddingBottom: '72px' }}>
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        role="navigation"
        aria-label="Mobile bottom navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--color-surface, #fff)',
          borderTop: '1px solid var(--color-border, #e2e8f0)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '6px 0',
          zIndex: 100,
        }}
        className="mobile-bottom-nav"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '44px',
              minWidth: '44px',
              padding: '4px 8px',
              textDecoration: 'none',
              fontSize: '0.75rem',
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
              fontWeight: isActive ? 700 : 500,
            })}
          >
            <span style={{ fontSize: '1.25rem', marginBottom: '2px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <footer
        role="contentinfo"
        style={{
          borderTop: '1px solid var(--color-border, #e2e8f0)',
          backgroundColor: 'var(--color-surface, #fff)',
          padding: '16px 20px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)',
          display: 'none',
        }}
        className="desktop-footer"
      >
        <p>
          HITAM Resource Share &bull; Verified Campus Peer Exchange &bull; Signed in as {user?.email}
        </p>
      </footer>
    </div>
  );
};
