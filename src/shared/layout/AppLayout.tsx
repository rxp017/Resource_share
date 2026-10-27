// src/shared/layout/AppLayout.tsx
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../modules/auth/useAuth';
import { fetchNotifications } from '../../modules/notifications/api';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    async function checkUnread() {
      try {
        const notifs = await fetchNotifications(true);
        if (isMounted) {
          setUnreadCount(notifs.filter((n) => !n.is_read).length);
        }
      } catch (err: unknown) {
        console.warn('Could not poll unread notifications count:', err);
      }
    }

    void checkUnread();
    const interval = setInterval(() => {
      void checkUnread();
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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

      {/* Glassmorphic Sticky Header */}
      <header
        role="banner"
        className="glass-panel"
        style={{
          padding: '10px 20px',
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
              gap: '6px',
              minHeight: '44px',
            }}
          >
            <span>🎓</span>
            <span>HITAM Share</span>
          </Link>
          <span
            style={{
              fontSize: '0.75rem',
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
          style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
          className="desktop-nav"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="interactive-btn"
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
                backgroundColor: isActive ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)' : 'transparent',
                border: isActive ? '1px solid var(--color-accent)' : '1px solid transparent',
              })}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Active Notifications Link with Badge */}
          <Link
            to="/notifications"
            aria-label={`Campus notifications (${unreadCount} unread)`}
            className="interactive-btn"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '44px',
              minWidth: '44px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-btn, 6px)',
              color: 'var(--color-text)',
              fontSize: '1.1rem',
              textDecoration: 'none',
            }}
          >
            <span>🔔</span>
            {unreadCount > 0 && (
              <span
                className="badge-pulse"
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  backgroundColor: 'var(--color-danger, #B91C1C)',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  borderRadius: '9999px',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  lineHeight: 1,
                  boxShadow: '0 0 0 2px var(--color-surface)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Settings Shortcut */}
          <Link
            to="/settings"
            aria-label="Preferences and settings"
            className="interactive-btn"
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
              backgroundColor: 'var(--color-surface)',
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
