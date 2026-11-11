import { describe, it, expect, vi, beforeEach } from 'vitest';

// Configurable supabase mock. The api modules import { supabase } from this path.
const { mockSupabase } = vi.hoisted(() => ({
  mockSupabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'u1' } } } }),
    },
    storage: { from: vi.fn() },
  },
}));
vi.mock('../src/shared/api-client/supabase', () => ({ supabase: mockSupabase }));

import { fetchNotifications } from '../src/modules/notifications/api';
import { fetchMessages, sendMessage, fetchConversations } from '../src/modules/chat/api';
import { fetchTrustProfile, submitReview, fetchReviewsForUser, reportDispute, resolveDispute } from '../src/modules/reviews/api';
import { createHandoffSession, redeemHandoffChallenge, finalizeHandoff } from '../src/modules/handoff/api';
import { fetchListingById, fetchPublishedListings } from '../src/modules/listings/api';

const PGRST205 = { code: 'PGRST205', message: "Could not find the table in the schema cache" };

// A query builder whose every chained method returns itself; awaiting it resolves `value`.
function qbResolve(value: unknown) {
  const q: Record<string, unknown> = {};
  const self = () => q;
  for (const m of ['select', 'order', 'eq', 'neq', 'in', 'or', 'update', 'insert', 'limit', 'range', 'single', 'maybeSingle', 'then']) {
    q[m] = m === 'then'
      ? (onF: (v: unknown) => unknown) => Promise.resolve(value).then(onF)
      : self;
  }
  return q;
}
function qbReject(error: unknown) {
  const q: Record<string, unknown> = {};
  const self = () => q;
  for (const m of ['select', 'order', 'eq', 'neq', 'in', 'or', 'update', 'insert', 'limit', 'range']) {
    q[m] = self;
  }
  q.single = () => Promise.reject(error);
  q.maybeSingle = () => Promise.reject(error);
  q.then = (_onF: unknown, onR: (e: unknown) => unknown) => Promise.reject(error).then(undefined, onR);
  return q;
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

describe('honest failure behavior (migration-0005 objects missing)', () => {
  it('fetchNotifications throws instead of fabricating a sample notification', async () => {
    mockSupabase.from.mockReturnValue(qbResolve({ data: null, error: PGRST205 }));
    await expect(fetchNotifications()).rejects.toEqual(PGRST205);
    expect(localStorage.getItem('notifications_feed')).toBeNull();
  });

  it('fetchMessages throws instead of replaying localStorage history', async () => {
    localStorage.setItem('messages_tx1', JSON.stringify([{ id: 'ghost' }]));
    mockSupabase.from.mockReturnValue(qbResolve({ data: null, error: PGRST205 }));
    await expect(fetchMessages('tx1')).rejects.toEqual(PGRST205);
  });

  it('sendMessage throws and never writes a local fake message', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: { code: 'PGRST202' } });
    await expect(sendMessage('tx1', 'hello')).rejects.toThrow('Message could not be delivered');
    expect(localStorage.getItem('messages_tx1')).toBeNull();
  });

  it('fetchTrustProfile reports no rating instead of a fabricated 5.0', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: { code: 'PGRST202' } });
    mockSupabase.from.mockReturnValue(qbResolve({ data: null, error: null }));
    const profile = await fetchTrustProfile('u1');
    expect(profile.avg_rating).toBeNull();
    expect(profile.review_count).toBe(0);
  });

  it('submitReview throws instead of faking a successful submit', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: { code: 'PGRST202' } });
    await expect(submitReview('tx1', 5, 'great')).rejects.toThrow('Review could not be submitted');
    expect(localStorage.getItem('reviews_u2')).toBeNull();
  });

  it('fetchReviewsForUser throws instead of returning ghost reviews', async () => {
    localStorage.setItem('reviews_u1', JSON.stringify([{ id: 'ghost' }]));
    mockSupabase.from.mockReturnValue(qbResolve({ data: null, error: PGRST205 }));
    await expect(fetchReviewsForUser('u1')).rejects.toEqual(PGRST205);
  });

  it('reportDispute and resolveDispute throw instead of faking success', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: { code: 'PGRST202' } });
    await expect(reportDispute('tx1', 'damage', 'broken')).rejects.toThrow('Dispute could not be recorded');
    await expect(resolveDispute('d1', 'resolve')).rejects.toThrow('Dispute could not be updated');
  });

  it('handoff session create/redeem/finalize throw instead of manufacturing handoffs', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: { code: 'PGRST202' } });
    await expect(createHandoffSession('tx1', 'pickup')).rejects.toThrow('Handoff session could not be created');
    await expect(redeemHandoffChallenge('tx1', 'pickup', 'ABC123')).rejects.toThrow('Code verification is unavailable');
    await expect(finalizeHandoff('tx1', 's1', 'confirmed')).rejects.toThrow('Handoff could not be finalized');
  });
});

describe('seed demo labeling', () => {
  it('fetchListingById marks seed catalog entries as demo', async () => {
    const listing = await fetchListingById('seed-calc-001');
    expect(listing).not.toBeNull();
    expect(listing!.is_demo).toBe(true);
  });

  it('fetchListings catalog fallback marks results as demo', async () => {
    mockSupabase.from.mockImplementation(() => qbReject(PGRST205));
    const listings = await fetchPublishedListings({});
    expect(listings.length).toBeGreaterThan(0);
    expect(listings.every((l) => l.is_demo === true)).toBe(true);
  });
});

describe('counterpart identity comes from public profile fields', () => {
  it('fetchConversations maps display_name from profiles, never invented labels', async () => {
    const tx = { id: 'tx1', mode: 'rental', status: 'requested', owner_id: 'u1', requester_id: 'u2', listing: { title: 'Calc' } };
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'transactions') return qbResolve({ data: [tx], error: null });
      if (table === 'profiles') return qbResolve({ data: [{ id: 'u2', display_name: 'Asha Verma' }], error: null });
      return qbResolve({ data: null, error: null });
    });
    const convos = await fetchConversations('u1');
    expect(convos[0].counterpart_name).toBe('Asha Verma');
  });

  it('fetchConversations falls back to a neutral label when no profile row exists', async () => {
    const tx = { id: 'tx1', mode: 'rental', status: 'requested', owner_id: 'u1', requester_id: 'u2', listing: null };
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'transactions') return qbResolve({ data: [tx], error: null });
      return qbResolve({ data: [], error: null });
    });
    const convos = await fetchConversations('u1');
    expect(convos[0].counterpart_name).toBe('HITAM Student');
  });
});
