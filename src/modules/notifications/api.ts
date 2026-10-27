// src/modules/notifications/api.ts
import { supabase } from '../../shared/api-client/supabase';
import type { NotificationItem } from './types';

export async function fetchNotifications(unreadOnly = false): Promise<NotificationItem[]> {
  try {
    let q = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      q = q.eq('is_read', false);
    }

    const { data, error } = await q.limit(50);
    if (error) throw error;
    return (data || []) as NotificationItem[];
  } catch (err: unknown) {
    console.warn('fetchNotifications fallback:', err);
    const stored = localStorage.getItem('notifications_feed');
    const list: NotificationItem[] = stored ? JSON.parse(stored) : [
      {
        id: 'sample_notif_1',
        user_id: 'current',
        title: 'Welcome to HITAM Resource Share',
        body: 'Browse campus listings or publish your own textbooks, lab gear, and calculators.',
        entity_type: 'system',
        entity_id: 'system',
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ];
    return unreadOnly ? list.filter((n) => !n.is_read) : list;
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) throw error;
  } catch (err: unknown) {
    console.warn('markNotificationRead fallback:', err);
    const stored = localStorage.getItem('notifications_feed');
    if (stored) {
      const list: NotificationItem[] = JSON.parse(stored);
      const updated = list.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      localStorage.setItem('notifications_feed', JSON.stringify(updated));
    }
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    if (error) throw error;
  } catch (err: unknown) {
    console.warn('markAllNotificationsRead fallback:', err);
    const stored = localStorage.getItem('notifications_feed');
    if (stored) {
      const list: NotificationItem[] = JSON.parse(stored);
      const updated = list.map((n) => ({ ...n, is_read: true }));
      localStorage.setItem('notifications_feed', JSON.stringify(updated));
    }
  }
}
