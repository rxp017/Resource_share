// src/modules/chat/InboxPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { fetchConversations } from './api';
import { ChatThread } from './ChatThread';
import type { ConversationItem } from './types';

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
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💬</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Active Chats</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 20px auto' }}>
            When you request an item or receive an exchange request, your direct communication thread will appear here.
          </p>
          <button
            onClick={() => navigate('/explore')}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-contrast)',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Explore Campus Listings
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 320px) 1fr',
            gap: '16px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            overflow: 'hidden',
            minHeight: '500px',
          }}
        >
          {/* Conversation List */}
          <div
            style={{
              borderRight: '1px solid var(--color-border)',
              overflowY: 'auto',
              maxHeight: '600px',
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: '0.875rem' }}>
              Conversations ({conversations.length})
            </div>
            {conversations.map((c) => {
              const isSelected = c.transaction_id === activeTxId;
              return (
                <div
                  key={c.transaction_id}
                  onClick={() => navigate(`/inbox/${c.transaction_id}`)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--color-surface-subtle, #f8fafc)' : 'transparent',
                    borderLeft: isSelected ? '4px solid var(--color-accent)' : '4px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                      {c.listing_title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {c.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.counterpart_name}: {c.last_message}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Chat Thread */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
            {activeTxId ? (
              <div>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                    {activeConvo?.listing_title}
                  </span>
                  <button
                    onClick={() => navigate(`/exchanges/${activeTxId}`)}
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-accent)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    View Exchange Record →
                  </button>
                </div>
                <ChatThread transactionId={activeTxId} maxHeight="450px" />
              </div>
            ) : (
              <div style={{ margin: 'auto', color: 'var(--color-text-muted)' }}>
                Select a conversation on the left to start chatting.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
