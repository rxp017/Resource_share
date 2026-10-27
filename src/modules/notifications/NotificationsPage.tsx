// src/modules/notifications/NotificationsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from './api';
import type { NotificationItem } from './types';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await fetchNotifications(filter === 'unread');
        if (isMounted) {
          setNotifications(data);
        }
      } catch (e: unknown) {
        console.warn('Could not load notifications:', e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [filter]);

  const handleCardClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      await markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    }

    if (notif.entity_type === 'transaction') {
      navigate(`/exchanges/${notif.entity_id}`);
    } else if (notif.entity_type === 'review') {
      navigate('/feedback');
    } else if (notif.entity_type === 'dispute') {
      navigate('/admin/moderation');
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px 0' }}>
            Notifications
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Activity updates on requests, payment proofs, handoffs, and messages.
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="interactive-btn"
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--color-text)',
            }}
          >
            ✓ Mark all read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
        <button
          onClick={() => setFilter('all')}
          className="interactive-btn"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: filter === 'all' ? 'var(--color-accent)' : 'transparent',
            color: filter === 'all' ? 'var(--color-accent-contrast)' : 'var(--color-text-muted)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          All Notifications
        </button>
        <button
          onClick={() => setFilter('unread')}
          className="interactive-btn"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: filter === 'unread' ? 'var(--color-accent)' : 'transparent',
            color: filter === 'unread' ? 'var(--color-accent-contrast)' : 'var(--color-text-muted)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Unread Only
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔔</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
            No Notifications
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            You're all caught up! New exchange updates will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleCardClick(n)}
              className="interactive-card animate-fade-in"
              style={{
                padding: '16px 20px',
                backgroundColor: n.is_read ? 'var(--color-surface)' : 'var(--color-surface-subtle, #f0fdf4)',
                border: '1px solid var(--color-border)',
                borderLeft: n.is_read ? '4px solid transparent' : '4px solid var(--color-accent)',
                borderRadius: '10px',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {!n.is_read && (
                <span
                  className="badge-pulse"
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#16a34a',
                    borderRadius: '50%',
                  }}
                />
              )}
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: 'var(--color-text)' }}>
                {n.title}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px', lineHeight: 1.45 }}>
                {n.body}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>🕒</span>
                <span>{new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
