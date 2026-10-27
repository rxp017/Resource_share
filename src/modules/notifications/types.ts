// src/modules/notifications/types.ts

export interface NotificationItem {
  id: string;
  user_id: string;
  actor_id?: string | null;
  title: string;
  body: string;
  entity_type: string;
  entity_id: string;
  is_read: boolean;
  created_at: string;
}
