// src/modules/admin/MembersManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../shared/api-client/supabase';

interface MemberRecord {
  id: string;
  user_id: string;
  campus_id: string;
  email: string;
  status: 'pending' | 'active' | 'suspended' | 'expired';
  role: 'student' | 'moderator' | 'admin';
  student_eligibility: string;
  created_at: string;
  profile?: {
    display_name?: string;
  };
}

export const MembersManagementPage: React.FC = () => {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [message, setMessage] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function loadMembers() {
      try {
        const { data, error } = await supabase
          .from('memberships')
          .select('*, profile:profiles!user_id(display_name)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (isMounted) {
          setMembers((data || []) as MemberRecord[]);
        }
      } catch (err: unknown) {
        console.warn('Error fetching members:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadMembers();

    return () => {
      isMounted = false;
    };
  }, [fetchTrigger]);

  const handleReview = async (memberId: string, action: 'approve' | 'suspend' | 'reactivate' | 'expire') => {
    setActionId(memberId);
    setMessage(null);
    try {
      const { data, error } = await supabase.rpc('review_membership', {
        p_membership_id: memberId,
        p_action: action,
        p_reason: 'Admin moderation action: ' + action,
      });

      if (error) throw error;
      setMessage(`Successfully executed "${action}" on membership.`);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, status: data.status } : m))
      );
      setFetchTrigger((c) => c + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Membership review action failed');
    } finally {
      setActionId(null);
    }
  };

  const filteredMembers = filter === 'all' ? members : members.filter((m) => m.status === filter);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px 0' }}>
          Campus Member Verification & Access
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
          Manage @hitam.org student verification states, access authorizations, and suspensions.
        </p>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '8px', marginBottom: '20px', fontSize: '0.875rem' }}>
          {message}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['all', 'pending', 'active', 'suspended', 'expired'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: filter === f ? 'var(--color-accent)' : 'var(--color-surface)',
              color: filter === f ? 'var(--color-accent-contrast)' : 'var(--color-text-muted)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: filter === f ? 'var(--color-accent)' : 'var(--color-border)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {f} ({f === 'all' ? members.length : members.filter((m) => m.status === f).length})
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading members...</p>
      ) : filteredMembers.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)' }}>
          No members found matching filter "{filter}".
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-subtle, #f8fafc)' }}>
                <th style={{ padding: '12px 16px' }}>Student Email</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Registered</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{m.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {m.profile?.display_name || 'HITAM Student'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: m.role === 'admin' ? '#fef3c7' : '#f1f5f9',
                        color: m.role === 'admin' ? '#92400e' : '#334155',
                      }}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor:
                          m.status === 'active'
                            ? '#dcfce7'
                            : m.status === 'pending'
                            ? '#fef3c7'
                            : '#fee2e2',
                        color:
                          m.status === 'active'
                            ? '#166534'
                            : m.status === 'pending'
                            ? '#854d0e'
                            : '#991b1b',
                      }}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      {m.status === 'pending' && (
                        <button
                          onClick={() => handleReview(m.id, 'approve')}
                          disabled={actionId === m.id}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Approve
                        </button>
                      )}
                      {m.status === 'active' && (
                        <button
                          onClick={() => handleReview(m.id, 'suspend')}
                          disabled={actionId === m.id}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Suspend
                        </button>
                      )}
                      {m.status === 'suspended' && (
                        <button
                          onClick={() => handleReview(m.id, 'reactivate')}
                          disabled={actionId === m.id}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
