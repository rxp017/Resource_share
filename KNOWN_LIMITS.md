# Known Limits & Architectural Constraints
**Project:** HITAM Campus Resource Share  
**Deployment Target:** Cloudflare Pages + Supabase (Mumbai)  
**Last Updated:** 2026-10-27  

---

## 1. Marketplace Catalog Query Limit (30 Items Cap)

- **Constraint:** The campus marketplace explore query (`fetchPublishedListings` in `src/modules/listings/api.ts`) is capped at the **30 most recently published items** (`.order('created_at', { ascending: false }).limit(30)`).
- **Rationale & Benefits:**
  1. **Zero N+1 Query Cascade:** Eliminates network waterfalls by bounding the maximum items returned.
  2. **Single-Batch Signed URLs:** Thumbnail signed URLs are generated in a single batch call (`supabase.storage.from('listing-photos').createSignedUrls(paths, 3600)`), keeping network latency under 200ms.
  3. **High Performance on Low-End Mobile Devices:** Prevents DOM bloating and memory exhaustion on budget student smartphones (e.g. Moto G, Redmi devices).
  4. **Active Campus Relevance:** Peer sharing items are local and time-sensitive; users discover the newest available textbooks, drafters, and lab equipment immediately.
- **Future Growth Roadmap:** Once catalog inventory exceeds 100 active items, cursor-based infinite scroll (`created_at < cursor`) can be evaluated without regressions to initial page load performance.

---

## 2. Storage & File Upload Limits

- **Max Photo Size:** 5 MB per listing photo or transaction payment proof.
- **Allowed MIME Formats:** `image/jpeg`, `image/png`, `image/webp`.
- **Client Pre-Processing:** Listing photos are automatically downscaled to 1200px max dimension and EXIF metadata is stripped before upload to preserve student privacy.

---

## 3. Search & Query Throttling

- **Debounce Window:** 300ms on the search bar input.
- **Stale Response Discarding:** Previous pending search requests are automatically ignored upon newer keystrokes or filter adjustments via cleanup cancellation flags.

---

## 4. In-Person QR Handoff Tokens

- **Session Expiry:** Handoff verification tokens and challenge hashes expire exactly 5 minutes after creation.
- **Single-Use Guard:** Once verified, handoff sessions transition to `redeemed` and cannot be replayed.
- **Brute-Force Rate Limiting:** Sessions reject verification attempts after 5 invalid tries.
