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
    console.warn('fetchNotifications failed:', err);
    // Fail honestly: never fabricate sample notifications or replay
    // localStorage as if it were the real notification feed.
    throw err;
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) throw error;
  } catch (err: unknown) {
    console.warn('markNotificationRead failed:', err);
    throw err;
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    if (error) throw error;
  } catch (err: unknown) {
    console.warn('markAllNotificationsRead failed:', err);
    throw err;
  }
}
