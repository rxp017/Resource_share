// src/modules/chat/ChatThread.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../auth';
import { fetchMessages, sendMessage } from './api';
import type { MessageItem } from './types';
import { MessageSquareIcon, LockIcon, CopyIcon, CheckIcon } from '../../shared/components';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const prevCountRef = useRef(0);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!transactionId) return;
      try {
        const list = await fetchMessages(transactionId);
        if (isMounted) {
          setMessages((prev) => {
            if (prev.length === list.length) {
              const unchanged = prev.every((m, idx) => m.id === list[idx]?.id);
              if (unchanged) return prev;
            }
            return list;
          });
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
    if (messages.length === 0) return;

    if (isInitialLoadRef.current) {
      scrollToBottom('auto');
      isInitialLoadRef.current = false;
      prevCountRef.current = messages.length;
      return;
    }

    if (messages.length > prevCountRef.current) {
      prevCountRef.current = messages.length;
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        if (distanceFromBottom < 120) {
          scrollToBottom('smooth');
        }
      }
    }
  }, [messages, scrollToBottom]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const QUICK_PROMPTS = [
    'Central Library Gate 2',
    'Near Canteen',
    'On my way (5 mins)',
    'Arrived at meetup spot',
  ];

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;
    const text = inputText.trim();
    setSendError(null);
    setIsSending(true);

    try {
      const newMsg = await sendMessage(transactionId, text);
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (err: unknown) {
      console.error('Failed to send message:', err);
      const msg = err instanceof Error ? err.message : 'Message could not be sent. Please retry.';
      setSendError(msg);
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
          <MessageSquareIcon size={16} color="var(--color-accent)" />
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <LockIcon size={11} />
          Encrypted · On-Campus Only
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
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
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>
              <MessageSquareIcon size={22} color="var(--color-accent)" />
            </div>
            <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: 'var(--color-text)' }}>No messages yet</p>
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
                    {isCopied ? (
                      <span style={{ color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <CheckIcon size={11} /> Copied
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <CopyIcon size={11} /> Copy
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
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

      {/* Inline Send Error Banner with Retry */}
      {sendError && (
        <div
          role="alert"
          style={{
            padding: '8px 14px',
            backgroundColor: 'color-mix(in srgb, #ef4444 12%, transparent)',
            borderTop: '1px solid color-mix(in srgb, #ef4444 28%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            fontSize: '0.8rem',
            color: '#b91c1c',
          }}
        >
          <span>⚠️ {sendError}</span>
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={isSending || !inputText.trim()}
            style={{
              background: 'none',
              border: 'none',
              color: '#b91c1c',
              textDecoration: 'underline',
              fontWeight: 700,
              cursor: isSending || !inputText.trim() ? 'not-allowed' : 'pointer',
              padding: '2px 6px',
            }}
          >
            Retry
          </button>
        </div>
      )}

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
          onChange={(e) => {
            setInputText(e.target.value);
            if (sendError) setSendError(null);
          }}
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
