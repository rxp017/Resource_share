// src/modules/chat/api.ts
import { supabase } from '../../shared/api-client/supabase';
import type { MessageItem, ConversationItem } from './types';

export async function fetchMessages(transactionId: string): Promise<MessageItem[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as MessageItem[];
  } catch (err: unknown) {
    console.warn('fetchMessages failed:', err);
    // Fail honestly: never replay localStorage as if it were chat history.
    throw err;
  }
}

export async function sendMessage(
  transactionId: string,
  content: string,
  clientMsgId?: string
): Promise<MessageItem> {
  const msgId = clientMsgId || 'msg_' + Date.now();
  try {
    const { data, error } = await supabase.rpc('send_chat_message', {
      p_transaction_id: transactionId,
      p_content: content.trim(),
      p_client_msg_id: msgId,
    });

    if (error) throw error;
    return data as MessageItem;
  } catch (err: unknown) {
    console.warn('send_chat_message RPC failed:', err);
    // Fail honestly: a message that only exists locally must never look sent.
    throw new Error('Message could not be delivered right now. Please try again.', { cause: err });
  }
}

interface TransactionListingRecord {
  title?: string;
}

interface TransactionRecord {
  id: string;
  mode: string;
  status: string;
  owner_id: string;
  requester_id: string;
  listing?: TransactionListingRecord | TransactionListingRecord[] | null;
}

export async function fetchConversations(currentUserId: string): Promise<ConversationItem[]> {
  try {
    const { data: txs, error } = await supabase
      .from('transactions')
      .select('id, mode, status, owner_id, requester_id, listing:listings(title)')
      .or(`owner_id.eq.${currentUserId},requester_id.eq.${currentUserId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    if (!txs) return [];

    const records = txs as unknown as TransactionRecord[];
    const counterpartIds = [...new Set(records.map((tx) => (tx.owner_id === currentUserId ? tx.requester_id : tx.owner_id)))];
    let nameById = new Map<string, string>();
    if (counterpartIds.length > 0) {
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', counterpartIds);
      nameById = new Map<string, string>(
        (profileRows || []).map((p: { id: string; display_name?: string }) => [p.id, p.display_name || 'HITAM Student'] as [string, string])
      );
    }

    return records.map((tx) => {
      const isOwner = tx.owner_id === currentUserId;
      const counterpartId = isOwner ? tx.requester_id : tx.owner_id;
      // Get any stored messages
      const stored = localStorage.getItem('messages_' + tx.id);
      const msgs: MessageItem[] = stored ? JSON.parse(stored) : [];
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : undefined;

      const listingData = Array.isArray(tx.listing) ? tx.listing[0] : tx.listing;

      return {
        transaction_id: tx.id,
        listing_title: listingData?.title || 'Campus Item',
        counterpart_id: counterpartId,
        counterpart_name: nameById.get(counterpartId) || 'HITAM Student',
        last_message: lastMsg?.content || 'No messages yet',
        last_message_at: lastMsg?.created_at,
        unread_count: 0,
        status: tx.status,
      };
    });
  } catch (err: unknown) {
    console.warn('fetchConversations error:', err);
    return [];
  }
}
