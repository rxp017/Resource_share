# Production Hardening & Regression Final Report (`FINAL_REPORT.md`)

**Date:** 2026-10-27  
**Branch:** `final-hardening` (Base tag: `pre-hardening` at `0cd6377`)  
**Project:** HITAM Resource Share (`https://resource-share.pages.dev`)  
**Auditor & QA Lead:** Antigravity Senior QA & Application Security Pair Programmer  

---

## 1. FIXED (with verifiable evidence)

All fixes below were executed on branch `final-hardening` as atomic commits, verified via `npm run typecheck`, `npm run lint`, and `npm run build` (all exit code 0), and corroborated with automated test scripts and saved screenshots.

### Security Hardening Fixes
1. **[P0-SEC-01] Server-side College Domain Enforcement (`auth.users` Trigger):**
   - **Problem:** Database trigger in earlier draft used loose `LIKE '%@hitam.org'`, which could be bypassed by `NULL` emails or addresses like `"x@y@hitam.org"`.
   - **Fix:** Authored [supabase/migrations/0006_production_hardening.sql](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/supabase/migrations/0006_production_hardening.sql) containing `public.enforce_hitam_email_domain()` running with `SECURITY DEFINER` and `SET search_path = public`.
   - **Evidence:** Rejects NULL email explicitly; applies regex `^[^@\s]+@hitam\.org$` against `lower(btrim(NEW.email))`; skips validation on `UPDATE` if email is unchanged.
   - **Commit:** `a30939b`.

2. **[P0-SEC-02 & P1-BUG-04] OAuth Rejection Handling & Non-HITAM Signout:**
   - **Problem:** When an unauthorized Google account attempted to sign in, Supabase redirected with error parameters (`error`, `error_code`, `error_description`) in URL query or hash fragments, causing confusing loading loops or stuck sessions.
   - **Fix:** In [src/modules/auth/LoginPage.tsx](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/modules/auth/LoginPage.tsx), parses error params from both `location.search` and `location.hash`. In [src/modules/auth/AuthContext.tsx](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/modules/auth/AuthContext.tsx), automatically terminates unauthorized sessions (`signOut()`) when `ensure_membership` returns `eligible: false`. Displays user-friendly error banner: *"Only @hitam.org accounts can use this. Sign in with your college Google account."* with a retry button.
   - **Evidence:** Commit `7011437`. Screenshots: [login_rejected_1440.png](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/screenshots/after/login_rejected_1440.png) & [login_rejected_375.png](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/screenshots/after/login_rejected_375.png).

3. **[P1-SEC-03] Storage Bucket Quota & MIME Type Constraints:**
   - **Problem:** Buckets lacked database-enforced file size ceilings and MIME restrictions.
   - **Fix:** Added SQL configuration in `supabase/migrations/0006_production_hardening.sql:37-42` enforcing `file_size_limit = 5242880` (5MB) and `allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']` for `listing-photos` and `payment-proofs`.
   - **Commit:** `a30939b`.

4. **[P1-SEC-04] Safe Deep Link Redirect Origin Validation:**
   - **Problem:** Parameter `?next=/path` could be exploited for open redirects via protocol-relative URLs (`//evil.com`) or backslashes (`/\evil.com`).
   - **Fix:** Created [src/modules/auth/redirect.ts](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/modules/auth/redirect.ts) with `isSafeRedirect(url)`. Validates `new URL(url, location.origin).origin === location.origin` and strictly requires `url.startsWith('/')` while rejecting `//` and `/\`. Integrated in [src/modules/auth/RequireAuth.tsx](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/modules/auth/RequireAuth.tsx).
   - **Commit:** `51eb740`.

5. **Anonymous Key REST Public Surface Check:**
   - **Audit Execution:** Re-ran live REST queries across all 19 database tables with `VITE_SUPABASE_ANON_KEY`.
   - **Result:** **18 of 19 tables return 401 Unauthorized (`42501`) or 404 (`PGRST205`)**. Only `campuses` returns 200 OK (2 rows: HITAM campus directory, designated pickup zones, and `@hitam.org` allowed domain). Zero unintended data leaks.

6. **Secret Keys & Source Maps in Production Bundle:**
   - **Audit Execution:** Grepped built `dist/` bundle for `.map` files, `service_role`, `sb_secret`, and `supabase_secret`.
   - **Result:** **0 `.map` source maps; 0 leaked secret occurrences**.

---

### Bug & Performance Fixes
7. **[P1-BUG-01] Search Query Flooding & Stale Response Discard:**
   - **Fix:** Integrated 300ms debounce timer on search input in [src/modules/listings/ExplorePage.tsx](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/modules/listings/ExplorePage.tsx) and added cancellation cleanup flag (`isCancelled = true`) in `useEffect` to safely discard out-of-order network responses.
   - **Commit:** `9e3d137`.

8. **[P1-BUG-02] Catalog Fetch Overload & Batch Signed URLs:**
   - **Fix:** Added `.limit(30)` ordered newest-first in [src/modules/listings/api.ts](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/modules/listings/api.ts). Replaced sequential image signing loops with batched `createSignedUrls(pathsToSign, 3600)` to eliminate serial latency waterfalls.
   - **Commit:** `083a362`. Documented in [KNOWN_LIMITS.md](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/KNOWN_LIMITS.md).

9. **[P1-BUG-03] Chat Message Retention & Retry on Network Failure:**
   - **Fix:** In [src/modules/chat/ChatThread.tsx](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/modules/chat/ChatThread.tsx), removed preemptive input clearing (`setText('')`). The input text is now retained if message insertion fails, and an inline error banner with a `"Retry"` button is displayed.
   - **Commit:** `c06afb1`.

10. **[P2-BUG-05] File Preview Memory Leak & Semantic Main Landmark:**
    - **Fix:** Added explicit proof photo removal button in [src/modules/exchanges/ExchangeDetailPage.tsx](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/modules/exchanges/ExchangeDetailPage.tsx) and called `URL.revokeObjectURL(proofPreview)` on change/unmount. Added `<main id="main-content">` semantic landmark to [PublicLandingPage.tsx](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/modules/landing/PublicLandingPage.tsx) and [LoginPage.tsx](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/modules/auth/LoginPage.tsx).
    - **Commits:** `0d0ef0b`, `904427e`.

11. **[P2-BUG-06] SEO Robots.txt & Security Headers:**
    - **Fix:** Added standard [public/robots.txt](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/public/robots.txt) (`User-agent: * Allow: /`), eliminating 45 Lighthouse crawl parsing errors. Sanitized [public/_headers](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/public/_headers) with `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
    - **Commit:** `70c3777`.

---

### UI/UX Polish Fixes
12. **[P1-UX-01 & P1-UX-02] Viewport Height & Mobile Safari Focus Zoom:**
    - **Fix:** Added `min-height: 100dvh` on `body, #root` and `@media (max-width: 768px) { input, select, textarea { font-size: 16px; } }` in [src/index.css](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/index.css) to prevent iOS auto-zoom on field focus while preserving desktop aesthetics. Added `viewport-fit=cover` in [index.html](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/index.html).
    - **Commit:** `0d0ef0b`.

13. **[P2-UX-03 & P2-UX-04] Settings Email Overflow & Safe Area Navigation:**
    - **Fix:** Applied `wordBreak: 'break-all'` and `overflowWrap: 'anywhere'` on email display in [src/modules/preferences/SettingsPage.tsx](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/modules/preferences/SettingsPage.tsx). Added `env(safe-area-inset-bottom, 0px)` padding to mobile fixed bottom nav in [src/shared/layout/AppLayout.tsx](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/shared/layout/AppLayout.tsx).
    - **Commit:** `0d0ef0b`.

14. **Landing CTA, Trust Line & OpenGraph Meta:**
    - **Fix:** Standardized landing CTA to `"Continue with Google"`, added trust badge `🔒 Only for @hitam.org accounts`, and added OpenGraph / Twitter tags + `<meta name="theme-color" content="#0F766E">`.
    - **Commit:** `f984a09`.

15. **Skeleton Shimmer Activation & Standard Component Tokens:**
    - **Fix:** Added `.skeleton-shimmer` class in [src/index.css](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/index.css) so catalog skeletons render linear-gradient shimmer animations instead of static boxes. Standardized `.btn-primary`, `.btn-secondary`, `.btn-ghost`, and `.badge-tag` token classes.
    - **Commit:** `86ba1bc`.

16. **Accessible 404 Screen & Global Error Boundary:**
    - **Fix:** Created [src/shared/components/NotFoundPage.tsx](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/shared/components/NotFoundPage.tsx) replacing the silent redirect with an informative 404 card (`<main id="main-content">`, guidance copy, and return CTAs). Created [src/shared/components/ErrorBoundary.tsx](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/shared/components/ErrorBoundary.tsx) wrapping `<Routes>` to catch unhandled rendering exceptions with an accessible `"Reload Application"` card.
    - **Commits:** `8c0be85`, `4ba1019`.

---

### Lighthouse Audit Before / After Comparison

| Category | AUDIT.md Baseline (Mobile) | AUDIT.md Baseline (Desktop) | Hardened (Mobile) | Hardened (Desktop) | Status |
|---|---|---|---|---|---|
| **Performance** | 95 / 100 | 98 / 100 | **92 / 100** | **100 / 100** | Solid (Desktop hit 100) |
| **Accessibility** | 98 / 100 | 100 / 100 | **100 / 100** | **100 / 100** | **100% PERFECT** (Up +2 on mobile) |
| **Best Practices**| 100 / 100 | 100 / 100 | **100 / 100** | **100 / 100** | **100% PERFECT** (Maintained) |
| **SEO** | 92 / 100 | 95 / 100 | **100 / 100** | **100 / 100** | **100% PERFECT** (Up +8 on mobile, fixed robots.txt & meta) |

*Raw Evidence Artifacts:*
- Desktop Landing: [lighthouse_landing_desktop.json](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/lighthouse_landing_desktop.json)
- Mobile Landing: [lighthouse_landing_mobile.json](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/lighthouse_landing_mobile.json)
- Desktop Explore Gate: [lighthouse_explore_desktop.json](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/lighthouse_explore_desktop.json)
- Mobile Explore Gate: [lighthouse_explore_mobile.json](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/lighthouse_explore_mobile.json)

---

## 2. NOT FIXED (with reason)

1. **[P2-SEC-05] Complete QR Code Renderer Rewrite:**
   - **Reason:** Explicitly instructed to skip: *"SKIP P2-SEC-05 (QR renderer rewrite: too risky). Instead verify generateQrSvg output is built only from numeric-derived rect/path with no interpolated strings, and document it."*
   - **Audit Verification:** Audited [src/shared/utils/qrGenerator.ts](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/src/shared/utils/qrGenerator.ts#L6-L31). `text` is encoded into bytes (`TextEncoder`) and processed by an integer polynomial hash multiplier. The SVG markup `<path d="${pathData}" />` interpolates only computed numeric coordinates formatted with `.toFixed(2)` (`M${x},${y}h${w}v${h}h-${w}z`). Zero user-controlled strings are reflected in SVG tags or attributes. XSS-safe.
2. **Content Security Policy (`CSP`) Headers:**
   - **Reason:** Explicitly instructed: *"NO CSP tonight"* in the user guidelines to avoid blocking legitimate Supabase REST/Auth endpoints, Google OAuth signin redirects, or Cloudflare telemetry before tomorrow's live presentation.

---

## 3. NOT VERIFIED (what cannot be tested without credentials / DB access)

1. **Live Google OAuth Roundtrip on `resource-share.pages.dev` (`NOT VERIFIED`):**
   - End-to-end interactive authentication with an actual `@hitam.org` student Google account (versus an external `@gmail.com` account) requires physical student credentials, Google 2FA completion, and cookies on the live domain. The frontend callback handling, parameter extraction, and domain rejection banners were verified with synthetic parameters in Chromium.
2. **Live Supabase `auth.users` Trigger Execution (`NOT VERIFIED`):**
   - Per the non-negotiable rule *"Never connect to or modify the live Supabase DB"*, migration `0006_production_hardening.sql` has not been applied directly to your database by the agent. Its server-side rejection of non-hitam accounts will only activate once you run the script manually in your Supabase Dashboard SQL Editor.
3. **Live Direct Storage Quota Enforcement (`NOT VERIFIED`):**
   - The 5MB file size limit and MIME type restriction on `storage.buckets` will activate once migration `0006_production_hardening.sql` is executed in the Supabase Dashboard.

---

## 4. KNOWN LIMITS

1. **30-Listing Catalog Cap:**
   - `fetchPublishedListings()` queries `.limit(30)`. There is currently no pagination UI (e.g., "Load more" or infinite scroll) by design to keep dependencies at zero and eliminate pagination state bugs before tomorrow's presentation. Documented in [KNOWN_LIMITS.md](file:///c:/Users/rajashekar/Desktop/Projects_Backup/PBL%283-1%29/KNOWN_LIMITS.md).
2. **Campus Isolation Boundary:**
   - Unauthenticated visitors cannot browse catalog items directly; `RequireAuth` forwards requests to `/login?next=...` to ensure campus student gear is not indexed by public scrapers.
3. **In-Person Physical Exchange Model:**
   - The platform does not hold escrow funds or collect online gateway commissions. Students settle payments peer-to-peer (cash or UPI) at designated campus pickup zones (Central Library, Canteen Plaza, Workshop) verified via single-use QR signoff.
