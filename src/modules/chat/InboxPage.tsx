// src/modules/chat/InboxPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { fetchConversations } from './api';
import { ChatThread } from './ChatThread';
import type { ConversationItem } from './types';
import { MessageSquareIcon } from '../../shared/components';

export const InboxPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const convos = await fetchConversations(user!.id);
        setConversations(convos);
      } catch (err: unknown) {
        console.warn('Error loading conversations:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const activeTxId = id || (conversations.length > 0 ? conversations[0].transaction_id : null);
  const activeConvo = conversations.find((c) => c.transaction_id === activeTxId);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px 0' }}>
          Inbox & Messages
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
          Direct communication with other students for active purchases, loans, and rentals.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading conversations...
        </div>
      ) : conversations.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <MessageSquareIcon size={32} color="var(--color-accent)" />
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Active Chats</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 20px auto' }}>
            When you request an item or receive an exchange request, your direct communication thread will appear here.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="interactive-btn"
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-contrast)',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            Explore Campus Listings →
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 340px) 1fr',
            gap: '16px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            overflow: 'hidden',
            minHeight: '520px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}
        >
          {/* Conversation List */}
          <div
            style={{
              borderRight: '1px solid var(--color-border)',
              overflowY: 'auto',
              maxHeight: '620px',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--color-border)',
                fontWeight: 800,
                fontSize: '0.875rem',
                backgroundColor: 'var(--color-surface-subtle, #f8fafc)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Conversations</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-contrast)',
                  fontWeight: 700,
                }}
              >
                {conversations.length}
              </span>
            </div>
            {conversations.map((c) => {
              const isSelected = c.transaction_id === activeTxId;
              return (
                <div
                  key={c.transaction_id}
                  onClick={() => navigate(`/inbox/${c.transaction_id}`)}
                  className="interactive-card"
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--color-surface-subtle, #f8fafc)' : 'var(--color-surface)',
                    borderLeft: isSelected ? '4px solid var(--color-accent)' : '4px solid transparent',
                    transition: 'background-color 0.15s ease, border-left-color 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                    <span style={{ fontWeight: isSelected ? 800 : 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                      {c.listing_title}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--color-surface-subtle, #f1f5f9)',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <strong style={{ color: 'var(--color-text)' }}>{c.counterpart_name}:</strong> {c.last_message}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Chat Thread */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
            {activeTxId ? (
              <div>
                <div
                  style={{
                    marginBottom: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text)' }}>
                      {activeConvo?.listing_title}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>
                      Coordinating exchange with {activeConvo?.counterpart_name}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/exchanges/${activeTxId}`)}
                    className="interactive-btn"
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-accent)',
                      background: 'var(--color-surface-subtle, #f8fafc)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    View Exchange Record →
                  </button>
                </div>
                <ChatThread transactionId={activeTxId} counterpartName={activeConvo?.counterpart_name} maxHeight="450px" />
              </div>
            ) : (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto',
                  }}
                >
                  <MessageSquareIcon size={22} color="var(--color-text-muted)" />
                </div>
                <p style={{ fontWeight: 600 }}>Select a conversation on the left to start coordinating.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
