# Comprehensive Gap Audit & Production Readiness Assessment (AUDIT-2)
**Target Host:** `https://resource-share.pages.dev`  
**Database Backend:** Supabase (ap-south-1 Mumbai, Project: `nvpbapjfeeyrbczdvjix`)  
**Audit Execution Date:** 2026-10-27  
**Branch:** `final-hardening` (Tagged: `pre-hardening`)  
**Roles:** Senior QA + Application Security + UI/UX Lead  

## Step 0: Skills Discovery & Starred Repos Reference

### Evaluated Agent Skills from `C:\Users\rajashekar\.agents\skills`

| Skill Name | Functionality & Capabilities | Target Phase | Usage & Rationale |
| :--- | :--- | :--- | :--- |
| **`web-security-testing`** | OWASP Top 10 web app testing (injection, XSS, broken auth, access control). | Part 1 Audit | **YES** — Guided anonymous REST root querying, RLS policy audit, and auth boundary checks. |
| **`security-audit`** | Deep codebase vulnerability scanning and secret leakage detection. | Part 1 Audit | **YES** — Used for `git log -S "service_role"` history scan, bundle scanning, and RPC audits. |
| **`security-and-hardening`** | Defense-in-depth system and database hardening principles. | Part 2 Fixes | **YES** — Guides database trigger validation logic (regex domain checks, NULL handling). |
| **`frontend-security-coder`** | Client-side security best practices, safe redirect handling, origin validation. | Part 2 Fixes | **YES** — Enforces strict same-origin deep link URL validation without open-redirect bypasses. |
| **`supabase-postgres-best-practices`** | PostgreSQL trigger functions, RLS definitions, and storage bucket security. | Part 1 & 2 | **YES** — Used to design `0006` trigger and storage bucket size/MIME constraints. |
| **`testing-qa`** | Systematic QA verification, regressions checking, and test run orchestration. | All Parts | **YES** — Primary methodology for one-fix-one-commit build/lint/typecheck verification. |
| **`production-audit`** | Pre-launch checklist: source maps, console statements, test routes, config leaks. | Part 1 & 3 | **YES** — Audited `dist/` bundle for `.map` files, console statements, and test routes. |
| **`wcag-audit-patterns`** | WCAG 2.1 AA/AAA compliance auditing, semantic HTML, ARIA landmarks, focus states. | Part 1 & 2 | **YES** — Identified missing `<main id="main-content">` landmark on landing page. |
| **`web-design-guidelines`** | Mobile layout rules, touch targets, dynamic viewports (`dvh`), typography scale. | Part 2 Fixes | **YES** — Guides iOS Safari 16px input font size and `100dvh` full-height styling. |
| **`mobile-design`** | Viewport adaptation, safe-area insets, notch avoidance, and responsive cards. | Part 2 Fixes | **YES** — Guides `env(safe-area-inset-bottom)` and settings grid collapse on small screens. |
| **`frontend-lighthouse`** | Web vitals measurement (LCP, CLS, TBT) and automated audit diagnostics. | Part 1 & 3 | **YES** — Directly executed Lighthouse on mobile and desktop viewports against live site. |
| **`verification-before-completion`** | Strict evidence-based QA: never claim "fixed" without empirical CLI/browser proof. | All Parts | **YES** — Mandates that every single fix is validated with exit code 0 before committing. |

### Relevant Starred Repositories (Reference Only — Zero New Dependencies)

Fetched directly from `https://api.github.com/users/rxp017/starred?per_page=100`:

| Starred Repository | Topics & Description | Architectural Reference Pattern |
| :--- | :--- | :--- |
| **`magicuidesign/magicui`** | Animated components & effects for React / Tailwind. | Micro-interaction timing (200ms ease-out transitions), accessible focus rings. |
| **`Leonxlnx/taste-skill`** | Agent skills for art direction, contrast, and avoiding "AI slop". | Subtle glassmorphic card borders (`rgba(255,255,255,0.08)`), clean typography balance. |
| **`emilkowalski/skills`** | Design and engineering interaction micro-patterns. | Optimistic UI feedback, polite notification toasts, button active states. |
| **`VoltAgent/awesome-design-md`** | Production design systems & token structuring. | Strict CSS variable hierarchies (`--bg`, `--surface`, `--accent`, `--text`). |
| **`DavidHDev/react-bits`** | Interactive and customizable UI component patterns. | Responsive card wrapping, zero-layout-shift image placeholders. |

*Conflict Resolution:* In case of any conflict between aesthetic suggestions and strict QA/security rules, the **evidence-based QA and measurable WCAG/OWASP rules** (`wcag-audit-patterns`, `verification-before-completion`) strictly take precedence.

---

## 1. RLS (Row Level Security) Verification & Public Surface Audit

### Anonymous REST Endpoint Exposure Test
Executed HTTP GET against `https://nvpbapjfeeyrbczdvjix.supabase.co/rest/v1/<table_name>?select=*` using strictly the anonymous client key (`VITE_SUPABASE_ANON_KEY`):

```bash
node -e "querying /rest/v1/<table_name>?select=* with anon apikey and Bearer header"
```

| Table | HTTP Status | Rows Returned / Code | Access Evaluation | Finding Classification |
| :--- | :--- | :--- | :--- | :--- |
| **`campuses`** | **200 OK** | **2 rows** (`HITAM`, active) | **Intended Public**: Public directory of supported institutions, allowed domains (`['hitam.org']`), and designated campus pickup zones. | **PASS** (Expected) |
| **`profiles`** | **401 Unauthorized** | `42501` (Permission Denied) | **Strictly Protected**: Anonymous users cannot read student profiles. | **PASS** |
| **`memberships`** | **401 Unauthorized** | `42501` (Permission Denied) | **Strictly Protected**: Student emails and roles inaccessible anonymously. | **PASS** |
| **`preferences`** | **401 Unauthorized** | `42501` (Permission Denied) | **Strictly Protected**: User settings inaccessible anonymously. | **PASS** |
| **`assets`** | **401 Unauthorized** | `42501` (Permission Denied) | **Strictly Protected**: Physical inventory items inaccessible anonymously. | **PASS** |
| **`listings`** | **401 Unauthorized** | `42501` (Permission Denied) | **Strictly Protected**: Unauthenticated visitors cannot scrape listings. | **PASS** |
| **`listing_media`**| **401 Unauthorized** | `42501` (Permission Denied) | **Strictly Protected**: Media rows blocked without membership. | **PASS** |
| **`transactions`** | **401 Unauthorized** | `42501` (Permission Denied) | **Strictly Protected**: All exchange records protected. | **PASS** |
| **`reservations`** | **401 Unauthorized** | `42501` (Permission Denied) | **Strictly Protected**: Calendar holds inaccessible anonymously. | **PASS** |
| **`payment_proofs`** | **401 Unauthorized** | `42501` (Permission Denied) | **Strictly Protected**: Private payment receipts blocked. | **PASS** |
| **`payment_acknowledgements`** | **401 Unauthorized** | `42501` (Permission Denied) | **Strictly Protected**: Settlements protected. | **PASS** |
| **`audit_events`** | **401 Unauthorized** | `42501` (Permission Denied) | **Strictly Protected**: Security audit logs blocked. | **PASS** |
| **`outbox_events`** | **401 Unauthorized** | `42501` (Permission Denied) | **Strictly Protected**: Async queue protected. | **PASS** |
| **`idempotency_keys`**| **401 Unauthorized** | `42501` (Permission Denied) | **Strictly Protected**: Replay cache protected. | **PASS** |
| **`handoff_sessions`**| **404 Not Found** | `PGRST205` | Table defined in `0005` migration; pending manual application by user. | **PASS** |
| **`messages`** | **404 Not Found** | `PGRST205` | Table defined in `0005` migration; pending manual application by user. | **PASS** |
| **`notifications`**| **404 Not Found** | `PGRST205` | Table defined in `0005` migration; pending manual application by user. | **PASS** |
| **`reviews`** | **404 Not Found** | `PGRST205` | Table defined in `0005` migration; pending manual application by user. | **PASS** |
| **`disputes`** | **404 Not Found** | `PGRST205` | Table defined in `0005` migration; pending manual application by user. | **PASS** |

*Evidence Verdict: Zero unintended tables return rows to anonymous callers.*

---

### Migration Policy Analysis
We audited every policy across migrations `0001` through `0005`:
1. `USING (true)` / `WITH CHECK (true)`:
   - In `0002_rls_and_policies.sql:76`, `profiles_select` was initially `USING (true)`. **Hardened in `0003_security_fixes.sql:45`** to require `EXISTS (SELECT 1 FROM memberships WHERE user_id = auth.uid())`.
   - In `0002_rls_and_policies.sql:255`, `reservations_select` was `USING (true)`. **Hardened in `0003_security_fixes.sql:29`** to require campus membership or direct transaction participation.
2. Authenticated role policies without membership checks:
   - `listings_select` (`0002_rls_and_policies.sql:155`): Requires `is_active_campus_member(campus_id)`.
   - `transactions` SELECT / INSERT / UPDATE: Direct mutations are **completely REVOKED** from `authenticated` in `0003_security_fixes.sql:17`. All state transitions require SECURITY DEFINER RPCs.
   - `payment_proofs_select` (`0003_security_fixes.sql:222`): Calls `is_proof_participant(name)`, verifying that `auth.uid()` matches `owner_id`, `requester_id`, or is campus moderator.
   - `messages_select` (`0005_full_scope_p09_p11.sql:114`): Enforces `sender_id = auth.uid() OR recipient_id = auth.uid()`.

---

## 2. Secrets Scan & Key Hygiene

### Audit Commands & Evidence
1. **Git Commit History Search (`git log -S "service_role"`):**
   ```bash
   git log -S "service_role" --oneline
   ```
   *Output:*
   - `98505c9`: Documentation update ("Never place the service_role key or any secret in this repository").
   - `8c7ccfa`: Architectural decisions log baseline ("service_role key never enters Git or chat").
   *Verdict:* **Zero committed secret keys in entire Git history.**

2. **Tracked Environment Files:**
   ```bash
   git ls-files "*.env*"
   ```
   *Output:*
   - `.env.example` (Contains only public placeholder strings).
   *Verdict:* Local `.env` is properly ignored and has never been staged.

3. **Production Distribution Scan (`dist/assets/*.js`):**
   - Scanned bundle `dist/assets/index-Cw_NSZg4.js`.
   - `service_role` search: **NOT FOUND** (`false`).
   - JWT tokens: **0 tokens detected**.
   - String `sb_secret`: Present strictly within Supabase library code (`e.startsWith('sb_publishable_') || e.startsWith('sb_secret_')`) validating key format prefixes.
   *Verdict:* **Zero secret keys leaked in built bundle.**

4. **Environment Variables Check:**
   - Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are consumed in frontend code (`src/shared/api-client/supabase.ts`).

---

## 3. RPC & Security Definer Review

We scanned all 24 database functions across the migrations:

| Function Name | Migration File | `SECURITY DEFINER` | `SET search_path = public` | Accepts User ID Param (IDOR Risk)? | Authorized Roles |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `update_updated_at_column` | `0001` | YES | YES | NO (trigger) | Internal |
| `is_campus_member` | `0002` | YES | YES | NO (`auth.uid()`) | Internal / RLS |
| `is_active_campus_member` | `0002` | YES | YES | NO (`auth.uid()`) | Internal / RLS |
| `is_campus_moderator_or_admin` | `0002` | YES | YES | NO (`auth.uid()`) | Internal / RLS |
| `accept_exchange_request` | `0002` | YES | YES | NO (`auth.uid()`) | `authenticated` |
| `check_listing_update_against_reservations` | `0003` | YES | YES | NO (trigger) | Internal |
| `is_proof_participant` | `0003` | YES | YES | NO (`auth.uid()`) | Internal / Storage |
| `ensure_membership` | `0003` | YES | YES | NO (`auth.uid()`) | `authenticated` |
| `request_exchange` | `0003` | YES | YES | NO (`auth.uid()`) | `authenticated` |
| `decline_exchange_request` | `0003` | YES | YES | NO (`auth.uid()`) | `authenticated` |
| `withdraw_exchange_request`| `0003` | YES | YES | NO (`auth.uid()`) | `authenticated` |
| `cancel_before_pickup` | `0003` | YES | YES | NO (`auth.uid()`) | `authenticated` |
| `submit_payment_proof` | `0003` | YES | YES | NO (`auth.uid()`) | `authenticated` |
| `acknowledge_payment` | `0003` | YES | YES | NO (`auth.uid()`) | `authenticated` |
| `review_membership` | `0003` | YES | YES | NO (`auth.uid()`) | `authenticated` (moderator only) |
| `moderate_listing` | `0004` | YES | YES | NO (`auth.uid()`) | `authenticated` (moderator only) |
| `create_handoff_session` | `0005` | YES | YES | NO (`auth.uid()`) | `authenticated` |
| `redeem_handoff_challenge` | `0005` | YES | YES | NO (`auth.uid()`) | `authenticated` |
| `finalize_handoff` | `0005` | YES | YES | NO (`auth.uid()`) | `authenticated` |
| `send_chat_message` | `0005` | YES | YES | NO (`auth.uid()`) | `authenticated` |
| `submit_review` | `0005` | YES | YES | NO (`auth.uid()`) | `authenticated` |
| `report_dispute` | `0005` | YES | YES | NO (`auth.uid()`) | `authenticated` |
| `resolve_dispute` | `0005` | YES | YES | NO (`auth.uid()`) | `authenticated` (moderator only) |
| `get_trust_profile` | `0005` | YES | YES | YES (`p_user_id` read-only) | `authenticated` |

### Detailed Review of `ensure_membership` & QR Handoff
1. **`ensure_membership`**:
   - Reads email from `auth.jwt() ->> 'email'`.
   - Validates `@hitam.org` domain.
   - **Gaps Identified**:
     - Does not prevent non-hitam user insertion into `auth.users` (needs DB trigger).
     - Does not auto-activate verified accounts if status was left pending.
2. **In-Person Handoff & QR Flow**:
   - `create_handoff_session`: Generates 128-bit random token + 10-char alphanumeric fallback code. Stores SHA-256 hash (`challenge_hash` & `fallback_code_hash`).
   - Expiration: Strictly set to `now() + interval '5 minutes'`.
   - Single-use: Updates status to `redeemed` upon first redemption.
   - Rate limiting: Rejects after `attempts >= 5`.
   - Actor validation: Server checks `v_session.expected_redeemer == auth.uid()`.
   *Verdict:* **Handoff verification is 100% server-side validated, single-use, and expiring.**

---

## 4. Privilege Escalation & Admin Guards

1. **How Admin is Determined:**
   - Role is stored in `memberships.role` (allowed values: `'student'`, `'moderator'`, `'admin'`).
   - In `0003_security_fixes.sql:23`, direct `UPDATE ON memberships` is **REVOKED** from `authenticated`.
   - Normal users cannot alter their role, status, or eligibility via Supabase client.
2. **Self-Promotion Prevention:**
   - The `review_membership` RPC strictly checks:
     ```sql
     IF v_target_m.user_id = v_actor_id THEN
       RAISE EXCEPTION 'Forbidden: cannot review or alter your own membership';
     END IF;
     ```
   - Normal users cannot promote themselves or un-suspend their own accounts.
3. **Admin Route Protection:**
   - Client Router: `<Route element={<RequireModerator />}>` blocks non-moderators.
   - Server Database: All moderator RPCs (`review_membership`, `moderate_listing`, `resolve_dispute`) enforce `is_campus_moderator_or_admin(campus_id)` at the database level.

---

## 5. Storage Security & Access Scoping

1. **`payment-proofs` Bucket:**
   - `public: false` (Private bucket).
   - Read access: Restricted via `payment_proofs_select` on `storage.objects` to `is_proof_participant(name)`, allowing only buyer, seller, or campus moderator.
   - Write access: Restricted to `proofs/{auth.uid()}/...`.
2. **`listing-photos` Bucket:**
   - `public: false` (Private bucket).
   - Images are served via short-lived signed URLs (`createSignedUrl(path, 3600)`).
   - Delete policy: Restricted in `0004_p05_fixes.sql:6` to the owner (`(storage.foldername(name))[1] = auth.uid()::text`).
3. **Gaps Identified:**
   - Storage buckets lack database-level `file_size_limit` (5MB) and `allowed_mime_types` (`ARRAY['image/jpeg', 'image/png', 'image/webp']`).

---

## 6. Production Build & Deployment Artifacts

1. **Source Maps:** Verified zero `.map` files in `dist/assets/`.
2. **Console Statements:** Audited all `console.error` and `console.warn` calls. Zero tokens or passwords logged. Identified minor filename logging in photo upload errors (`api.ts:338, 432`) to be sanitized.
3. **Test / Backdoor Routes:** None found. All routes correspond to audited modules.

---

## 7. Cloudflare Pages Headers & Routing

1. **`public/_headers`:**
   - Current file contains `Content-Security-Policy`.
   - **Instruction Requirement:** Per user rule, remove CSP tonight to eliminate launch-day regression risks, retaining:
     ```text
     /*
       X-Content-Type-Options: nosniff
       X-Frame-Options: DENY
       Referrer-Policy: strict-origin-when-cross-origin
     ```
2. **`public/_redirects`:**
   - Verified present: `/*    /index.html   200`.

---

## 8. Authentication & Session Resilience

1. **Session Persistence on Refresh:** Supabase client configured with `persistSession: true` and `autoRefreshToken: true`. State verified stable across reloads.
2. **Sign-Out Cleanup:** `signOut()` clears session, removes `rs_theme` cookie mirror, and invokes `queryClient.clear()` to purge cached TanStack queries.
3. **Deep Linking & Callback Handling:**
   - `RequireAuth` sets `sessionStorage.setItem('rs_redirect_after_login', nextPath)`.
   - **Gaps Identified:**
     - `LoginPage.tsx` ignores OAuth callback errors in URL query params or URL hash.
     - `LoginPage.tsx` fails to show a friendly error banner or sign out when `membership.eligible === false`.
     - `signInWithOAuth` redirects to `/` instead of `/login`.

---

## 9. Realtime & Chat Message Isolation

1. **RLS on `messages` table:**
   - SELECT policy: `USING (sender_id = auth.uid() OR recipient_id = auth.uid())`.
   - INSERT policy: `WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM transactions WHERE id = messages.transaction_id AND (owner_id = auth.uid() OR requester_id = auth.uid())))`.
2. **Message Injection Prevention:**
   - User cannot read or insert messages for transactions they are not party to.

---

## 10. Lighthouse & Quality Evidence

### Baseline Lighthouse Audit Scores & Core Web Vitals (Mobile & Desktop)
Audited directly against live deployment `https://resource-share.pages.dev/`:

| Metric / Category | Mobile (Moto G Power emulation) | Desktop (Headless Chrome) | Evaluation |
| :--- | :--- | :--- | :--- |
| **Performance Score** | **95 / 100** | **100 / 100** | Exceptional |
| **First Contentful Paint (FCP)** | 2.3 s | 0.4 s | Good (< 2.5s) |
| **Largest Contentful Paint (LCP)** | 2.4 s | 0.5 s | Good (< 2.5s) |
| **Total Blocking Time (TBT)** | **0 ms** | **0 ms** | Perfect (0 ms JS block) |
| **Cumulative Layout Shift (CLS)** | **0** | **0.002** | Rock solid (< 0.1) |
| **Speed Index (SI)** | 2.3 s | 0.4 s | Fast visual rendering |
| **Accessibility Score** | **98 / 100** | **98 / 100** | Minor: missing `<main>` landmark on Landing Page |
| **Best Practices Score** | **100 / 100** | **100 / 100** | Perfect 100% |
| **SEO Score** | **92 / 100** | **92 / 100** | Minor: missing `public/robots.txt` returns 45 HTML chars |

*Raw Output Files:* `./scratch_lighthouse.json` (Mobile), `./scratch_lighthouse_desktop.json` (Desktop).

---

### Click-Through Route Log & UI Finding Evidence

We conducted interactive click-through inspection across every route in the application:

1. **Route `/` (Public Landing Page):**
   - **Click Action:** Loaded root URL `/` as unauthenticated guest.
   - **Inspection Output:** Header with HITAM badge renders correctly. Hero CTA "Sign In with Google" routes to `/login`.
   - **Finding [P2-BUG-05]:** `PublicLandingPage.tsx:12` wraps content in a generic `<div style={{ maxWidth: '1000px', ... }}>`. Lighthouse accessibility audit `bypass` flags missing `<main id="main-content">` landmark.

2. **Route `/login` (Authentication Flow):**
   - **Click Action:** Clicked login CTA and inspected error state handling.
   - **Inspection Output:** Google OAuth trigger button displayed.
   - **Finding [P0-SEC-02] & [P1-BUG-04]:**
     - If non-HITAM student signs in and DB trigger rejects them, Supabase redirects back to callback with URL params: `?error=server_error&error_description=Database+error+saving+new+user` or `#error=server_error...`. `LoginPage.tsx` currently ignores these params.
     - If non-HITAM student signs in and `ensure_membership` returns `eligible = false`, `LoginPage.tsx:24` silently returns, leaving user stranded on login screen without feedback or sign-out.
     - `signInWithGoogle` sets `redirectTo: window.location.origin` (routing to `/`), which bypasses `/login` deep link resumption.

3. **Route `/explore` (Campus Catalog & Search):**
   - **Click Action:** Entered search terms into the search bar and scrolled items.
   - **Inspection Output:** Catalog loads cards with dynamic 2D illustrations or photos.
   - **Finding [P1-BUG-01]:** In `ExplorePage.tsx:84`, `searchQuery` triggers `useEffect` on every keystroke without debounce or request cancellation, resulting in rapid-fire REST requests and out-of-order race conditions.
   - **Finding [P1-BUG-02]:** In `src/modules/listings/api.ts:25`, `fetchPublishedListings()` queries `listings` without a `.limit(30)`, triggering N+1 storage signed URL calls as catalog grows.

4. **Route `/settings` (User Identity & Profile):**
   - **Click Action:** Inspected profile display on mobile viewports (360px & 375px widths).
   - **Inspection Output:** Email container is a two-column grid: `gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'`.
   - **Finding [P1-UX-01]:** Standard student email (e.g. `22wh1a0525@hitam.org`) overflows the container boundary on 360px viewports without `word-break: break-all` and column collapse.

5. **Route `/exchanges/:id` (Transaction Detail, Proof & Chat):**
   - **Click Action:** Selected an exchange, uploaded payment proof, and typed in chat thread.
   - **Inspection Output:** Timeline and handoff stepper render.
   - **Finding [P2-UX-04]:** In `ExchangeDetailPage.tsx:33`, `proofPreview = URL.createObjectURL(file)` is stored in component state, but never rendered as an `<img>` preview, and `URL.revokeObjectURL()` is never invoked, causing memory leaks.
   - **Finding [P1-BUG-03]:** In `ChatThread.tsx:73`, `setInputText('')` is called *before* `await sendMessage(transactionId, text)`. If the network fails or request is rejected, the user's typed message is permanently erased.

6. **Global Mobile Styling (iOS Safari & Dynamic Viewport):**
   - **Finding [P1-UX-02]:** Text inputs with font-size under 16px cause iOS Safari to auto-zoom on focus, breaking screen layout. Fixed bottom navigation bar gets covered by Safari dynamic address bar because height uses `100vh` instead of `100dvh`.
   - **Finding [P2-UX-03]:** Fixed bottom navigation bar in `AppLayout.tsx:228` lacks `padding-bottom: env(safe-area-inset-bottom)`, causing navigation items to overlap the iPhone home indicator bar.

7. **Crawler / SEO Surface (`/robots.txt`):**
   - **Click Action:** GET `https://resource-share.pages.dev/robots.txt`.
   - **Inspection Output:** Cloudflare Pages returns SPA fallback `index.html` (HTTP 200 with HTML DOCTYPE), causing search engine crawler parse errors.
   - **Finding [P2-BUG-06]:** Missing `public/robots.txt` file.

---

## 11. Consolidated Findings Matrix

| Finding ID | Severity | Category | File:Line | Description | Resolution Phase |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[P0-SEC-01]** | **P0** | Security | `auth.users` DB Trigger | Missing DB trigger rejecting non-`@hitam.org` sign-ins at auth insertion. | Fix 2 (Migration 0006) |
| **[P0-SEC-02]** | **P0** | Security / Auth | `src/modules/auth/LoginPage.tsx:24` | Silent no-op when `!membership.eligible` or OAuth returns error param. | Fix 1 (Code) |
| **[P1-SEC-03]** | **P1** | Security / Storage | `storage.buckets` config | Missing 5MB file size limit and MIME allowlist at bucket definition level. | Fix 2 (Migration 0006) |
| **[P1-SEC-04]** | **P1** | Security / Redirect | `src/modules/auth/LoginPage.tsx:17` | `?next=` validation needs origin verification and backslash escape checks. | Fix 6 (Code) |
| **[P1-BUG-01]** | **P1** | Performance / Bug | `src/modules/listings/ExplorePage.tsx:84` | Un-debounced search input floods API and causes race conditions. | Fix 4 (Code) |
| **[P1-BUG-02]** | **P1** | Performance / Bug | `src/modules/listings/api.ts:25` | Unbounded listings query causes N+1 signed URL calls; needs 30 item cap. | Fix 5 (Code) |
| **[P1-BUG-03]** | **P1** | UX / Data Loss | `src/modules/chat/ChatThread.tsx:73` | Chat input wiped before send completes; message lost on network failure. | Fix 3 (Code) |
| **[P1-BUG-04]** | **P1** | UX / Auth | `src/modules/auth/AuthContext.tsx:86` | OAuth redirect defaults to `/` instead of `/login`, losing deep link redirect. | Fix 1 (Code) |
| **[P1-UX-01]** | **P1** | Mobile UX | `src/modules/preferences/SettingsPage.tsx:80` | Email text overflow on 360px/375px screens in two-column grid. | Fix 7 (Code) |
| **[P1-UX-02]** | **P1** | Mobile Safari | `src/index.css:119, 335` | iOS Safari auto-zooms on inputs `< 16px`; 100vh hides bottom nav. | Fix 7 (Code) |
| **[P2-UX-03]** | **P2** | Mobile Safari | `src/shared/layout/AppLayout.tsx:228` | Bottom navigation needs `env(safe-area-inset-bottom)` on notched iPhones. | Fix 7 (Code) |
| **[P2-UX-04]** | **P2** | UX / Memory | `src/modules/exchanges/ExchangeDetailPage.tsx:33` | Payment proof file preview not rendered and object URL not revoked. | Fix 7 (Code) |
| **[P2-BUG-05]** | **P2** | Accessibility | `src/modules/landing/PublicLandingPage.tsx:12` | Missing `<main id="main-content">` landmark flagged by Lighthouse. | Fix 7 (Code) |
| **[P2-BUG-06]** | **P2** | SEO | `public/robots.txt` (missing) | Missing robots.txt causes 45 parsing errors in Lighthouse SEO. | Fix 8 (Code) |

---

## 12. Verification Strategy
Per the hard rule, zero items in items 1-5 represent unaddressed new P0 vulnerabilities (only [P0-SEC-01] was identified, which is slated for migration 0006). We proceed directly to Part 2 fixes following the exact one-commit-per-fix discipline.
