// src/shared/layout/AppLayout.tsx
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../modules/auth/useAuth';
import { fetchNotifications } from '../../modules/notifications/api';
import {
  SearchIcon,
  RefreshCwIcon,
  PlusCircleIcon,
  MessageSquareIcon,
  UserIcon,
  BellIcon,
  SettingsIcon,
  GoogleIcon,
} from '../components/Icons';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    if (!user) return;

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
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const navItems = [
    { to: '/explore', label: 'Explore', icon: <SearchIcon size={18} strokeWidth={2} /> },
    { to: '/exchanges', label: 'Exchanges', icon: <RefreshCwIcon size={18} strokeWidth={2} /> },
    { to: '/listings/new', label: 'Create', icon: <PlusCircleIcon size={18} strokeWidth={2} /> },
    { to: '/inbox', label: 'Inbox', icon: <MessageSquareIcon size={18} strokeWidth={2} /> },
    { to: '/profile', label: 'Profile', icon: <UserIcon size={18} strokeWidth={2} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Glassmorphic Sticky Header */}
      <header
        role="banner"
        className="glass-panel header-mobile"
        style={{
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/explore"
            style={{
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '1.15rem',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minHeight: '44px',
            }}
          >
            <img
              src="/hitam-logo.png"
              alt="HITAM Logo"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                objectFit: 'cover',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              }}
            />
            <span style={{ letterSpacing: '-0.02em' }}>HITAM Share</span>
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
                gap: '8px',
                padding: '8px 14px',
                minHeight: '40px',
                borderRadius: 'var(--radius-btn, 8px)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                backgroundColor: isActive ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)' : 'transparent',
                border: isActive ? '1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)' : '1px solid transparent',
                transition: 'all 150ms ease',
              })}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <>
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
                  minHeight: '40px',
                  minWidth: '40px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-btn, 8px)',
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                }}
              >
                <BellIcon size={18} strokeWidth={2} />
                {unreadCount > 0 && (
                  <span
                    className="badge-pulse"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: 'var(--color-danger, #B91C1C)',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      borderRadius: '9999px',
                      minWidth: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
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
                  minHeight: '40px',
                  minWidth: '40px',
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-btn, 8px)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <SettingsIcon size={18} strokeWidth={2} />
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="interactive-btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-btn, 8px)',
                fontWeight: 600,
                fontSize: '0.825rem',
                textDecoration: 'none',
                minHeight: '36px',
                flexShrink: 0,
              }}
            >
              <GoogleIcon size={15} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" role="main" style={{ flex: 1, paddingBottom: '76px' }}>
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
          backgroundColor: 'color-mix(in srgb, var(--color-surface) 90%, transparent)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingTop: '8px',
          paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          zIndex: 100,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
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
              textDecoration: 'none',
              padding: '4px 10px',
              minWidth: '54px',
              minHeight: '48px',
              borderRadius: '8px',
              gap: '4px',
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
              backgroundColor: isActive ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
              transition: 'all 150ms ease',
            })}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}
            >
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
