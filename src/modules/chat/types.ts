// src/modules/chat/types.ts

export interface MessageItem {
  id: string;
  transaction_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  client_msg_id?: string;
  created_at: string;
  read_at?: string | null;
  sender_name?: string;
}

export interface ConversationItem {
  transaction_id: string;
  listing_title: string;
  counterpart_id: string;
  counterpart_name: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  status: string;
}
