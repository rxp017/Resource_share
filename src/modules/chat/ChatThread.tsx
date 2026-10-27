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

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const QUICK_PROMPTS = [
    '📍 Central Library Gate 2',
    '☕ Near Canteen',
    '🏃 On my way (5 mins)',
    '👋 Arrived at meetup spot',
  ];

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

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
        borderRadius: '12px',
        backgroundColor: 'var(--color-surface)',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      }}
    >
      {/* Thread Header */}
      <div
        style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface-subtle, #f9fafb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>💬</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
            In-App Exchange Chat with {counterpartName}
          </span>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '999px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
            fontWeight: 600,
          }}
        >
          🔒 Encrypted · On-Campus Only
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          padding: '18px',
          height: maxHeight,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--color-text-muted)', fontSize: '0.875rem', padding: '24px 0' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🤝</div>
            <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>No messages yet</p>
            <p style={{ margin: 0, fontSize: '0.8rem' }}>Tap a quick coordination chip below or send a note to set a pickup time.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === user?.id;
            const isCopied = copiedId === m.id;
            return (
              <div
                key={m.id}
                className="animate-fade-in"
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '78%',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    backgroundColor: isMe ? 'var(--color-accent)' : 'var(--color-surface-subtle, #f1f5f9)',
                    color: isMe ? 'var(--color-accent-contrast)' : 'var(--color-text)',
                    fontSize: '0.875rem',
                    lineHeight: 1.45,
                    wordBreak: 'break-word',
                    boxShadow: isMe ? '0 2px 8px rgba(13, 148, 136, 0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {m.content}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    gap: '6px',
                    fontSize: '0.7rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '3px',
                    padding: '0 4px',
                  }}
                >
                  <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(m.id, m.content)}
                    title="Copy message"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      color: 'var(--color-text-muted)',
                      opacity: 0.7,
                      transition: 'opacity 0.15s',
                    }}
                  >
                    {isCopied ? '✓ Copied' : '📋'}
                  </button>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Campus Coordination Preset Chips */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface-subtle, #f9fafb)',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="interactive-btn"
            onClick={() => setInputText((prev) => (prev ? `${prev} ${prompt}` : prompt))}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '999px',
              color: 'var(--color-text)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '12px 14px',
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
          placeholder="Type message to coordinate..."
          maxLength={1000}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            fontSize: '0.875rem',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
        <button
          type="submit"
          disabled={isSending || !inputText.trim()}
          className="interactive-btn"
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-contrast)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: isSending || !inputText.trim() ? 'not-allowed' : 'pointer',
            opacity: isSending || !inputText.trim() ? 0.6 : 1,
          }}
        >
          {isSending ? 'Sending...' : 'Send →'}
        </button>
      </form>
    </div>
  );
};
