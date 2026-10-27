// src/modules/chat/ChatThread.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth';
import { fetchMessages, sendMessage } from './api';
import type { MessageItem } from './types';

interface ChatThreadProps {
  transactionId: string;
  counterpartName?: string;
  maxHeight?: string;
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  transactionId,
  counterpartName = 'Counterparty',
  maxHeight = '400px',
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!transactionId) return;
      try {
        const list = await fetchMessages(transactionId);
        if (isMounted) {
          setMessages(list);
        }
      } catch (e: unknown) {
        console.warn('Could not poll chat messages:', e);
      }
    }

    void load();
    const interval = setInterval(() => {
      void load();
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [transactionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const newMsg = await sendMessage(transactionId, text);
      setMessages((prev) => [...prev, newMsg]);
    } catch (err: unknown) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        backgroundColor: 'var(--color-surface)',
        overflow: 'hidden',
      }}
    >
      {/* Thread Header */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface-subtle, #f9fafb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
          💬 In-App Exchange Chat with {counterpartName}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          Participant-only · Persisted
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          padding: '16px',
          height: maxHeight,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            No messages yet. Send a message to coordinate pickup time or details.
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === user?.id;
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                }}
              >
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    backgroundColor: isMe ? 'var(--color-accent)' : 'var(--color-surface-subtle, #f1f5f9)',
                    color: isMe ? 'var(--color-accent-contrast)' : 'var(--color-text)',
                    fontSize: '0.875rem',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                  }}
                >
                  {m.content}
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--color-text-muted)',
                    textAlign: isMe ? 'right' : 'left',
                    marginTop: '2px',
                    padding: '0 4px',
                  }}
                >
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '10px 12px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          gap: '8px',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message to student..."
          maxLength={1000}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid var(--color-border)',
            fontSize: '0.875rem',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
          }}
        />
        <button
          type="submit"
          disabled={isSending || !inputText.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-contrast)',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: isSending || !inputText.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {isSending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};
