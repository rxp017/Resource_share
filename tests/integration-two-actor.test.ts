/**
 * Isolated two-actor simulation: a full exchange lifecycle (list -> request ->
 * conversation identity -> message both ways -> QR handoff -> review -> trust
 * profile -> notification) exercised through the REAL client api modules
 * against a stateful in-memory backend. This is NOT a live-backend or browser
 * integration test: it validates client behavior and data flow only, with the
 * server side simulated in memory.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

type Row = Record<string, any>;

const { mockSupabase, db, setActor } = vi.hoisted(() => {
  const db = {
    listings: [] as Row[],
    listing_media: [] as Row[],
    transactions: [] as Row[],
    messages: [] as Row[],
    notifications: [] as Row[],
    reviews: [] as Row[],
    profiles: [] as Row[],
  };
  let actor: Row | null = null;
  let seq = 0;
  const nextId = (p: string) => `${p}_${++seq}`;

  function makeBuilder(table: keyof typeof db) {
    const state: {
      filters: ((r: Row) => boolean)[];
      orderBy?: { col: string; asc: boolean };
      limitN?: number;
      single?: boolean;
      maybe?: boolean;
      insertRows?: Row[];
      updateObj?: Row;
    } = { filters: [] };

    const applyFilters = (rows: Row[]) => rows.filter((r) => state.filters.every((f) => f(r)));

    const finish = (): { data: any; error: any } => {
      if (state.insertRows) {
        const rows = state.insertRows.map((r) => ({ ...r }));
        db[table].push(...rows);
        const data = state.single ? rows[0] || null : rows;
        return { data, error: null };
      }
      let rows = applyFilters([...db[table]]);
      if (state.updateObj) {
        rows.forEach((r) => Object.assign(r, state.updateObj));
        return { data: rows, error: null };
      }
      if (state.orderBy) {
        const { col, asc } = state.orderBy;
        rows.sort((a, b) => (a[col] < b[col] ? -1 : 1) * (asc ? 1 : -1));
      }
      if (state.limitN) rows = rows.slice(0, state.limitN);
      if (state.single) {
        const row = rows[0] || null;
        if (!row && !state.maybe) return { data: null, error: { code: 'PGRST116', message: 'no rows' } };
        return { data: row, error: null };
      }
      return { data: rows, error: null };
    };

    const q: any = {
      select: () => q,
      eq: (col: string, val: any) => { state.filters.push((r) => r[col] === val); return q; },
      neq: (col: string, val: any) => { state.filters.push((r) => r[col] !== val); return q; },
      gte: (col: string, val: any) => { state.filters.push((r) => r[col] >= val); return q; },
      lte: (col: string, val: any) => { state.filters.push((r) => r[col] <= val); return q; },
      ilike: (col: string, val: string) => { const v = val.replace(/%/g, '').toLowerCase(); state.filters.push((r) => String(r[col]).toLowerCase().includes(v)); return q; },
      in: (col: string, vals: any[]) => { state.filters.push((r) => vals.includes(r[col])); return q; },
      or: (cond: string) => {
        const parts = cond.split(',').map((p) => {
          const [col, , val] = p.split('.');
          return (r: Row) => r[col] === val;
        });
        state.filters.push((r) => parts.some((f) => f(r)));
        return q;
      },
      order: (col: string, opts?: any) => { state.orderBy = { col, asc: opts?.ascending !== false }; return q; },
      limit: (n: number) => { state.limitN = n; return q; },
      single: () => { state.single = true; return q; },
      maybeSingle: () => { state.single = true; state.maybe = true; return q; },
      insert: (rows: Row[]) => { state.insertRows = rows; return q; },
      update: (obj: Row) => { state.updateObj = obj; return q; },
      then: (onF: any, onR?: any) => Promise.resolve(finish()).then(onF, onR),
    };
    return q;
  }

  const mockSupabase = {
    auth: {
      getUser: async () => ({ data: { user: actor } }),
      getSession: async () => ({ data: { session: actor ? { user: actor } : null } }),
    },
    storage: {
      from: () => ({ createSignedUrls: async () => ({ data: [] }) }),
    },
    from: (table: keyof typeof db) => makeBuilder(table),
    rpc: async (fn: string, args: Row) => {
      if (fn === 'request_exchange') {
        const listing = db.listings.find((l) => l.id === args.p_listing_id);
        if (!listing) return { data: null, error: { message: 'listing not found' } };
        const tx = {
          id: nextId('tx'), listing_id: listing.id, listing: { title: listing.title },
          owner_id: listing.owner_id, requester_id: actor!.id,
          mode: listing.mode, status: 'requested',
          created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        };
        db.transactions.push(tx);
        db.notifications.push({
          id: nextId('notif'), user_id: listing.owner_id, title: 'New exchange request',
          body: `Request for ${listing.title}`, entity_type: 'transaction', entity_id: tx.id,
          is_read: false, created_at: new Date().toISOString(),
        });
        return { data: { success: true, transaction_id: tx.id, status: 'requested', quoted_price_paise: listing.price_paise }, error: null };
      }
      if (fn === 'send_chat_message') {
        const tx = db.transactions.find((t) => t.id === args.p_transaction_id);
        if (!tx) return { data: null, error: { message: 'transaction not found' } };
        const msg = {
          id: nextId('msg'), transaction_id: tx.id, sender_id: actor!.id,
          recipient_id: tx.owner_id === actor!.id ? tx.requester_id : tx.owner_id,
          content: args.p_content, client_msg_id: args.p_client_msg_id,
          created_at: new Date().toISOString(),
        };
        db.messages.push(msg);
        return { data: msg, error: null };
      }
      if (fn === 'create_handoff_session') {
        const session = {
          id: nextId('session'), transaction_id: args.p_transaction_id, phase: args.p_phase,
          token: nextId('rs_qr'), fallback_code: 'CODE' + seq, status: 'active',
          condition_summary: args.p_condition_summary, condition_notes: args.p_condition_notes,
          expires_at: new Date(Date.now() + 300000).toISOString(),
        };
        db.__handoffs.push(session);
        return { data: { success: true, session_id: session.id, token: session.token, fallback_code: session.fallback_code, expires_at: session.expires_at }, error: null };
      }
      if (fn === 'redeem_handoff_challenge') {
        const s = db.__handoffs.find((h) => h.transaction_id === args.p_transaction_id && h.phase === args.p_phase);
        if (!s || (s.token !== args.p_token_or_code && s.fallback_code !== args.p_token_or_code.toUpperCase())) {
          return { data: null, error: { message: 'invalid code' } };
        }
        s.status = 'redeemed';
        return { data: { success: true, session_id: s.id, message: 'Code verified!' }, error: null };
      }
      if (fn === 'finalize_handoff') {
        const tx = db.transactions.find((t) => t.id === args.p_transaction_id);
        if (!tx) return { data: null, error: { message: 'transaction not found' } };
        tx.status = 'completed'; tx.updated_at = new Date().toISOString();
        return { data: { success: true, finalized: true, status: 'completed', message: 'done' }, error: null };
      }
      if (fn === 'submit_review') {
        const tx = db.transactions.find((t) => t.id === args.p_transaction_id);
        if (!tx) return { data: null, error: { message: 'transaction not found' } };
        const review = {
          id: nextId('rev'), transaction_id: tx.id, reviewer_id: actor!.id,
          reviewee_id: tx.owner_id === actor!.id ? tx.requester_id : tx.owner_id,
          rating: args.p_rating, comment: args.p_comment, is_published: true,
          created_at: new Date().toISOString(),
        };
        db.reviews.push(review);
        return { data: { success: true, review_id: review.id, message: 'ok' }, error: null };
      }
      if (fn === 'get_trust_profile') {
        const uid = args.p_user_id;
        const profile = db.profiles.find((p) => p.id === uid);
        const reviews = db.reviews.filter((r) => r.reviewee_id === uid && r.is_published);
        const completed = db.transactions.filter((t) => (t.owner_id === uid || t.requester_id === uid) && t.status === 'completed');
        return {
          data: {
            user_id: uid, display_name: profile?.display_name || 'HITAM Student', avatar_url: null,
            role: 'student', completed_count: completed.length, review_count: reviews.length,
            avg_rating: reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null,
            is_newcomer: completed.length < 3, member_since: null,
          },
          error: null,
        };
      }
      return { data: null, error: { message: 'unknown rpc ' + fn } };
    },
    __db: db,
  };
  (db as any).__handoffs = [] as Row[];
  return { mockSupabase, db, setActor: (u: Row | null) => { actor = u; } };
});

vi.mock('../src/shared/api-client/supabase', () => ({ supabase: mockSupabase }));

import { fetchPublishedListings } from '../src/modules/listings/api';
import { createExchangeRequest, getMyTransactions } from '../src/modules/exchanges/api';
import { fetchConversations, sendMessage, fetchMessages } from '../src/modules/chat/api';
import { createHandoffSession, redeemHandoffChallenge, finalizeHandoff } from '../src/modules/handoff/api';
import { submitReview, fetchTrustProfile, fetchReviewsForUser } from '../src/modules/reviews/api';
import { fetchNotifications } from '../src/modules/notifications/api';

const OWNER = { id: 'owner-1', display_name: 'Asha Verma' };
const REQUESTER = { id: 'req-1', display_name: 'Ravi Kumar' };

beforeEach(() => {
  db.listings.length = 0; db.listing_media.length = 0; db.transactions.length = 0;
  db.messages.length = 0; db.notifications.length = 0; db.reviews.length = 0;
  (db as any).__handoffs.length = 0;
  db.profiles.length = 0;
  db.profiles.push({ ...OWNER }, { ...REQUESTER });
  setActor(null);
});

describe('isolated two-actor exchange lifecycle', () => {
  it('owner lists, requester requests, both chat, QR handoff completes, review lands on trust profile', async () => {
    // Owner has a published listing (seeded as the createListing API would write it)
    db.listings.push({
      id: 'listing-1', asset_id: 'asset-1', campus_id: 'c1', owner_id: OWNER.id,
      title: 'Scientific Calculator', description: 'fx-991', category: 'electronics',
      condition: 'like_new', defects: 'none', mode: 'rental', price_paise: 2500,
      deposit_paise: 150000, status: 'published', version: 1, pickup_zone: 'Library Entrance',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });

    // Requester discovers it (live query path, not the demo seed fallback)
    setActor(REQUESTER);
    const listings = await fetchPublishedListings({});
    expect(listings).toHaveLength(1);
    expect(listings[0].is_demo).toBeFalsy();
    expect(listings[0].title).toBe('Scientific Calculator');

    // Requester opens an exchange request
    const req = await createExchangeRequest({ listingId: 'listing-1' } as any);
    expect(req.success).toBe(true);

    // Owner sees a real notification (not a fabricated sample)
    setActor(OWNER);
    const notifs = await fetchNotifications();
    expect(notifs).toHaveLength(1);
    expect(notifs[0].entity_id).toBe(req.transaction_id);

    // Both sides see the conversation with the REAL counterpart display name
    const ownerConvos = await fetchConversations(OWNER.id);
    expect(ownerConvos[0].counterpart_name).toBe('Ravi Kumar');
    setActor(REQUESTER);
    const reqConvos = await fetchConversations(REQUESTER.id);
    expect(reqConvos[0].counterpart_name).toBe('Asha Verma');

    // Messages flow both directions through the backend
    await sendMessage(req.transaction_id, 'Hi, is this available tomorrow?');
    setActor(OWNER);
    const msgsForOwner = await fetchMessages(req.transaction_id);
    expect(msgsForOwner).toHaveLength(1);
    expect(msgsForOwner[0].sender_id).toBe(REQUESTER.id);
    await sendMessage(req.transaction_id, 'Yes, pick up at Library Entrance');
    setActor(REQUESTER);
    const msgsForRequester = await fetchMessages(req.transaction_id);
    expect(msgsForRequester).toHaveLength(2);

    // QR handoff: owner creates session, requester redeems code, owner finalizes
    setActor(OWNER);
    const session = await createHandoffSession(req.transaction_id, 'pickup', 'good', '');
    expect(session.success).toBe(true);
    setActor(REQUESTER);
    const redeem = await redeemHandoffChallenge(req.transaction_id, 'pickup', session.fallback_code);
    expect(redeem.success).toBe(true);
    setActor(OWNER);
    const fin = await finalizeHandoff(req.transaction_id, session.session_id, 'confirmed');
    expect(fin.finalized).toBe(true);
    const txs = await getMyTransactions(OWNER.id);
    expect(txs[0].status).toBe('completed');

    // Review lands and the trust profile shows REAL rating data
    setActor(REQUESTER);
    const review = await submitReview(req.transaction_id, 5, 'Smooth handoff');
    expect(review.success).toBe(true);
    const reviews = await fetchReviewsForUser(OWNER.id);
    expect(reviews).toHaveLength(1);
    const trust = await fetchTrustProfile(OWNER.id);
    expect(trust.avg_rating).toBe(5);
    expect(trust.review_count).toBe(1);
    expect(trust.completed_count).toBe(1);
  });
});
