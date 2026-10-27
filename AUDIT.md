# Production Readiness Audit & Vulnerability Assessment: HITAM Resource Share
**Target URL:** `https://resource-share.pages.dev`  
**Assessment Date:** 2026-10-27  
**Lead Roles:** Senior QA + Application Security + UI/UX Lead  
**Audit Standard:** OWASP Top 10, WCAG 2.1 AA, Supabase Free Tier Hardening, Nielsen Usability Heuristics  

---

## 1. Executive Summary & Baseline Metrics

| Category | Baseline Status | Target for Tomorrow's Presentation |
| :--- | :--- | :--- |
| **Lighthouse Performance** | **95 / 100** (Mobile) | 98+ / 100 |
| **Lighthouse Accessibility** | **98 / 100** (Mobile) | 100 / 100 |
| **Lighthouse Best Practices** | **100 / 100** | 100 / 100 (Maintain) |
| **Lighthouse SEO** | **92 / 100** (Missing `robots.txt` fallback) | 100 / 100 |
| **WCAG 2.1 AA Token Contrast** | **40 / 40 Passed** (Scripts verify light/dark across Calm & Pulse) | 100% Invariant |
| **Server-Side Domain Isolation** | **Vulnerable** (Missing PostgreSQL trigger on `auth.users`) | Enforced via DB Trigger |
| **Auth Callback Error Handling** | **Broken** (Silent no-op on non-hitam email sign-in) | Friendly rejection screen + sign-out |

---

## 2. Security Audit Findings

### [P0-SEC-01] Missing Server-Side DB Trigger on `auth.users` Enforcing `@hitam.org`
- **File & Line:** `supabase/migrations/0003_security_fixes.sql:261`
- **Why It Matters:**  
  The Google OAuth `hd: 'hitam.org'` parameter is client-side only. When a student or outsider signs in with a personal `@gmail.com` account, Supabase Auth creates an entry directly in `auth.users` before `ensure_membership()` is ever invoked. The token issued is a valid `authenticated` JWT. While `ensure_membership()` returns `eligible: false`, non-hitam records accumulate in `auth.users`, and any policy scoped solely to `authenticated` can be accessed. True server-side enforcement requires a PostgreSQL trigger on `auth.users` that aborts insertion if the email domain is not `@hitam.org`.
- **Exact Fix:**
  Add a `BEFORE INSERT OR UPDATE ON auth.users` trigger in a new migration:
  ```sql
  CREATE OR REPLACE FUNCTION public.enforce_hitam_email_domain()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, auth
  AS $$
  BEGIN
    IF lower(trim(NEW.email)) NOT LIKE '%@hitam.org' THEN
      RAISE EXCEPTION 'Access restricted: Only @hitam.org email addresses are permitted on this campus exchange.'
        USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END;
  $$;

  DROP TRIGGER IF EXISTS trg_enforce_hitam_domain ON auth.users;
  CREATE TRIGGER trg_enforce_hitam_domain
    BEFORE INSERT OR UPDATE OF email ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_hitam_email_domain();
  ```

---

### [P0-SEC-02] Silent Rejection Limbo in `LoginPage.tsx` for Non-HITAM Accounts
- **File & Line:** `src/modules/auth/LoginPage.tsx:24-27`
- **Why It Matters:**  
  When an outsider signs in with a personal Gmail account, `ensure_membership()` returns `{ eligible: false, reason: 'Email must be exactly from hitam.org' }`. `LoginPage.tsx` catches this with:
  ```ts
  if (!membership.eligible) {
    // Will be rendered as not eligible
    return;
  }
  ```
  It does nothing: it sets no error message, does not route to `/not-eligible`, and does not sign out the invalid session. The user is left sitting on the Login page with a spinning or reset button, wondering why they cannot enter.
- **Exact Fix:**
  In `src/modules/auth/LoginPage.tsx`:
  When `membership && !membership.eligible`, immediately set a prominent error banner or route to `/not-eligible` with an automatic call to `signOut()`, showing a clear message:
  *"Access Denied: Only verified @hitam.org college email addresses are permitted. You signed in as {user.email}."*

---

### [P1-SEC-03] Storage Buckets Lack Database-Level `file_size_limit` and `allowed_mime_types`
- **File & Line:** `supabase/migrations/0003_security_fixes.sql:125-129`
- **Why It Matters:**  
  The `storage.buckets` insert for `listing-photos` and `payment-proofs` leaves `file_size_limit` and `allowed_mime_types` as `NULL`. Although client-side resizing and MIME checks exist, a malicious or modified client could upload an oversized executable, HTML script, or 50MB payload directly to Supabase storage, wasting free tier storage quota or risking stored file abuse.
- **Exact Fix:**
  Update the bucket configuration migration:
  ```sql
  UPDATE storage.buckets
  SET 
    file_size_limit = 5242880, -- 5MB limit
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
  WHERE id IN ('listing-photos', 'payment-proofs');
  ```

---

### [P1-SEC-04] Incomplete Open Redirect Sanitization in `LoginPage.tsx`
- **File & Line:** `src/modules/auth/LoginPage.tsx:17-19, 34`
- **Why It Matters:**  
  The current check for `?next=` is:
  ```ts
  if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//'))
  ```
  Certain browsers and URL parsers interpret `/\example.com` or `/\/example.com` as protocol-relative URLs, leading to unintended external redirects if passed outside React Router.
- **Exact Fix:**
  Strengthen the redirect validator:
  ```ts
  const isSafeInternalUrl = (url: string): boolean => {
    return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\') && !url.includes('://');
  };
  ```

---

### [P2-SEC-05] `dangerouslySetInnerHTML` Usage in `HandoffPage.tsx`
- **File & Line:** `src/modules/handoff/HandoffPage.tsx:323`
- **Why It Matters:**  
  `generateQrSvg(qrToken, 210)` is injected via `dangerouslySetInnerHTML`. While the current mathematical generator only outputs SVG `<rect>` and `<path>` tags, using `dangerouslySetInnerHTML` triggers security linters, automated code review flags, and creates an unnecessary attack surface.
- **Exact Fix:**
  Convert `generateQrSvg` into a pure React SVG component (`<QrCodeSvg value={qrToken} size={210} />`) rendering native JSX `<svg>`, `<rect>`, and `<path>` nodes directly without raw HTML strings.

---

## 3. Bugs & Logic Errors

### [P1-BUG-01] Missing Debounce on Search Input in `ExplorePage.tsx`
- **File & Line:** `src/modules/listings/ExplorePage.tsx:29, 84`
- **Why It Matters:**  
  `searchQuery` is included directly in the `useEffect` dependencies of `ExplorePage.tsx`. As a student types into the search field, every keystroke immediately triggers `fetchPublishedListings()`. This creates query race conditions (where an older network response overrides the latest input) and floods the Supabase free tier API with unneeded requests.
- **Exact Fix:**
  Implement a lightweight 300ms debounce on `searchQuery` before triggering the query execution.

---

### [P1-BUG-02] Unbounded Query and Missing Pagination in `fetchPublishedListings()`
- **File & Line:** `src/modules/listings/api.ts:25-47, 99-115`
- **Why It Matters:**  
  `fetchPublishedListings()` executes without a `.limit()`. For every listing returned, it performs an individual signed URL request via `Promise.all(listings.map(...))`. As the catalog grows, this causes N+1 network requests and severe latency on 3G campus Wi-Fi.
- **Exact Fix:**
  Add a default `.limit(30)` to the Supabase query, and add cursor/offset pagination.

---

### [P1-BUG-03] Data Loss on Failed Chat Message Send in `ChatThread.tsx`
- **File & Line:** `src/modules/chat/ChatThread.tsx:73-82`
- **Why It Matters:**  
  `setInputText('')` is called *before* `await sendMessage(transactionId, text)`. If the request fails due to campus network drops, the user's drafted message is wiped out and unrecoverable, with no error notification displayed.
- **Exact Fix:**
  Only clear `inputText` after the promise successfully resolves. If an error occurs, preserve the text in the input box and display an inline retry banner.

---

### [P1-BUG-04] OAuth Redirect Defaults to Root Instead of Saved Next URL
- **File & Line:** `src/modules/auth/AuthContext.tsx:86`
- **Why It Matters:**  
  `signInWithOAuth` passes `redirectTo: window.location.origin`. When a user was prompted to login while trying to access `/listings/:id/request`, the callback redirects to `/`. Because `PublicLandingPage.tsx` does not auto-route logged-in users, the student loses their place in the flow and must navigate back manually.
- **Exact Fix:**
  Redirect to `${window.location.origin}/login`, allowing `LoginPage` to inspect `rs_redirect_after_login` and route the student directly to their target page.

---

### [P2-BUG-05] Missing Landmark `<main>` on `PublicLandingPage.tsx`
- **File & Line:** `src/modules/landing/PublicLandingPage.tsx:12`
- **Why It Matters:**  
  Lighthouse flagged: `Document does not have a main landmark.` Screen readers cannot jump directly to the primary page content.
- **Exact Fix:**
  Change the top-level container `<div style={{ maxWidth: '1000px', ... }}>` to `<main id="main-content" style={{ maxWidth: '1000px', ... }}>`.

---

### [P2-BUG-06] Missing `public/robots.txt` Triggering SPA Fallback Errors
- **File & Line:** `public/robots.txt` (Missing)
- **Why It Matters:**  
  Lighthouse SEO flagged 45 errors because crawlers requesting `/robots.txt` receive the HTML SPA fallback (`index.html`), causing syntax parsing errors.
- **Exact Fix:**
  Add a clean `public/robots.txt`:
  ```text
  User-agent: *
  Allow: /
  Disallow: /admin/
  Disallow: /inbox/
  Disallow: /my/
  ```

---

## 4. UI/UX & Craftsmanship Audit

### [P1-UX-01] Long Email Overflow on 360px/375px Mobile in `SettingsPage.tsx`
- **File & Line:** `src/modules/preferences/SettingsPage.tsx:80-84`
- **Why It Matters:**  
  The identity card displays email using `gridTemplateColumns: '1fr 1fr'`. Long student emails (e.g., `rajashekar.student22@hitam.org`) push past the column boundary on 360px/375px screens, clipping the text or causing micro-horizontal layout shifts.
- **Exact Fix:**
  Add `word-break: break-all;` and switch to a single-column layout on screens `<= 480px`.

---

### [P1-UX-02] Missing iOS Safari `16px` Input Rule & Dynamic Viewport Height
- **File & Line:** `src/index.css:119, 335`
- **Why It Matters:**  
  1. On iOS Safari, any input or select element with a font size below `16px` triggers an aggressive auto-zoom on focus, breaking the layout.
  2. `min-height: 100vh` on iOS hides the bottom navigation bar behind Safari's dynamic URL toolbar.
- **Exact Fix:**
  In `src/index.css`:
  ```css
  /* Prevent iOS auto-zoom on focus */
  @media (max-width: 768px) {
    input, select, textarea {
      font-size: 16px !important;
    }
  }

  /* Dynamic viewport height fallback */
  body, #root {
    min-height: 100vh;
    min-height: 100dvh;
  }
  ```

---

### [P2-UX-03] Mobile Bottom Navigation Safe-Area Inset on Notched iPhones
- **File & Line:** `src/shared/layout/AppLayout.tsx:228`
- **Why It Matters:**  
  The fixed bottom navigation uses `padding: '6px 0'`. On iPhone X and newer (with the home indicator gesture line), icons are crowded against the gesture pill.
- **Exact Fix:**
  Add safe-area padding:
  ```css
  padding: 6px 0 calc(6px + env(safe-area-inset-bottom, 0px));
  ```
  And add `viewport-fit=cover` in `index.html`.

---

### [P2-UX-04] Unused / Dead State `proofPreview` in `ExchangeDetailPage.tsx`
- **File & Line:** `src/modules/exchanges/ExchangeDetailPage.tsx:33, 178`
- **Why It Matters:**  
  When a student selects a payment proof screenshot, `setProofPreview(URL.createObjectURL(file))` is called, but the preview is never rendered in the upload form. The student cannot verify they selected the correct receipt before submitting, and the allocated object URL is not revoked on unmount.
- **Exact Fix:**
  Render an image preview with a remove button and invoke `URL.revokeObjectURL(proofPreview)` when cleared or unmounted.

---

## 5. Prioritized Action Matrix for Phase 3 Fixes

```
┌────────────────────────────────────────────────────────────────────────┐
│ P0: IMMEDIATE BLOCKERS                                                 │
│ 1. [P0-SEC-01] Add server-side PostgreSQL trigger on auth.users        │
│ 2. [P0-SEC-02] Add friendly rejected UI + auto signOut on LoginPage   │
├────────────────────────────────────────────────────────────────────────┤
│ P1: HIGH PRIORITY PRODUCTION HARDENING                                 │
│ 3. [P1-SEC-03] Storage bucket file_size_limit & MIME constraints       │
│ 4. [P1-SEC-04] Airtight open redirect validation                       │
│ 5. [P1-BUG-01] Debounce search queries in ExplorePage                  │
│ 6. [P1-BUG-02] Add query limit(30) to prevent N+1 signed URL floods    │
│ 7. [P1-BUG-03] Prevent data loss on failed chat message delivery       │
│ 8. [P1-BUG-04] Preserve target route across Google OAuth flow          │
│ 9. [P1-UX-01]  Fix email overflow on 360px/375px mobile                │
│ 10. [P1-UX-02] iOS Safari 16px font-size & 100dvh viewport fix         │
├────────────────────────────────────────────────────────────────────────┤
│ P2: POLISH & CODE CLEANLINESS                                          │
│ 11. [P2-SEC-05] Replace dangerouslySetInnerHTML with pure React SVG    │
│ 12. [P2-BUG-05] Add <main id="main-content"> to PublicLandingPage      │
│ 13. [P2-BUG-06] Add public/robots.txt (fixes Lighthouse SEO score)     │
│ 14. [P2-UX-03]  Add env(safe-area-inset-bottom) to mobile bottom nav   │
│ 15. [P2-UX-04]  Render payment proof preview + revokeObjectURL cleanup │
└────────────────────────────────────────────────────────────────────────┘
```
