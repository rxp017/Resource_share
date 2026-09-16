# HITAM Resource Share — Demonstration Handover & Milestone Audit

**Document Version:** 1.0.0  
**Target Milestone Date:** 17 September 2026  
**Audience:** Academic Reviewers, PBL Evaluators, and Campus Operators  
**Production URL:** [https://resource-share.pages.dev/](https://resource-share.pages.dev/)  
**Database / Auth Backend:** Hosted Supabase (ap-south-1 Mumbai, Project `nvpbapjfeeyrbczdvjix`)  
**Git Repository:** [https://github.com/rxp017/Resource_share.git](https://github.com/rxp017/Resource_share.git) (branch `main`)

---

## 1. Executive Summary & Milestone Score

This handover marks the completion of the **Demonstration Milestone (70/100 Points)** per the project execution contract (`planning/04-GENERATOR-PROMPTS.md` and `planning/08-TOMORROW-AND-FREE-DEPLOYMENT.md`).

Every claimed point is backed by executed, reproducible test evidence recorded in `docs/execution/EVIDENCE.md` and checked in `docs/execution/STATUS.md`. Post-tomorrow roadmap features (QR custody handoff, in-app peer chat, trust reviews) are disabled and labeled **"Not available in this preview"** to preserve academic honesty and operational safety.

### Milestone Scorecard

| Milestone Group | Available Points | Earned Points | Status | Evidence Reference |
|---|---:|---:|:---:|---|
| **Group 1: Foundation, Migrations & Deployment** | 10 | 10 | **VERIFIED** | `E-016`, `E-018`, `E-025`, `0001_schema.sql` |
| **Group 2: HITAM College Identity & Admission** | 10 | 10 | **VERIFIED** | `E-021`, `E-023`, `0003_security_fixes.sql` |
| **Group 3: Responsive Pulse/Calm UI & Preferences** | 10 | 10 | **VERIFIED** | `E-024`, 40/40 WCAG 2.1 AA token checks |
| **Group 4: Listing, Media, Search & Moderation** | 15 | 15 | **VERIFIED** | `E-026`, `E-027`, `0004_p05_fixes.sql` |
| **Group 5: Sale Requests & Private Direct-Payment Proof** | 15 | 15 | **VERIFIED** | `E-028`, `scratch/test_s6_exchanges.ps1` |
| **Group 6: Loan/Rental Requests & Availability Gate** | 10 | 10 | **VERIFIED** | `E-029`, `scratch/test_s7_rentals.ps1` |
| Group 7: QR Pickup/Return & Custody Workflow | 8 | 0 | *DEFERRED* | Post-tomorrow roadmap (P09) |
| Group 8: Contextual Chat & Notifications | 5 | 0 | *DEFERRED* | Post-tomorrow roadmap (P10) |
| Group 9: Full Trust Reviews & Case Resolution | 7 | 0 | *DEFERRED* | Post-tomorrow roadmap (P11) |
| Group 10: Pilot Operational Readiness | 10 | 0 | *DEFERRED* | Post-tomorrow roadmap (P14–P15) |
| **Total Project Score** | **100** | **70** | **MILESTONE ACHIEVED** | **Exact 70/100 points validated** |

---

## 2. Architecture & Invariants

1. **Exact Campus Domain Enforcement:** Only verified `@hitam.org` accounts can access campus resources. Outsider Google accounts (e.g., standard `@gmail.com` addresses) are rejected server-side by the `ensure_membership()` SECURITY DEFINER procedure with 0 membership records created.
2. **Zero Gateway / Zero Escrow:** The platform does NOT process bank payments, hold digital wallets, or charge transaction fees. All payments occur directly peer-to-peer (via UPI or cash at pickup).
3. **Private Evidence Separation:** Payment receipts are stored in the private `payment-proofs` Supabase Storage bucket. Access is strictly restricted to exchange participants (buyer and seller) and campus moderators via row-level storage policies.
4. **Hardware-Accelerated Client EXIF Stripping:** Photos uploaded for listings and payment proofs are processed via an HTML5 canvas pipeline that strips EXIF location/device metadata, downsamples to max 1600px, and re-encodes to high-efficiency JPEG.
5. **Integer Minor Unit Accounting:** All monetary values are calculated and stored as integer paise (`price_paise`, `deposit_paise`, `quoted_price_paise`) to prevent floating-point rounding errors.
6. **PostgreSQL Concurrency Protection:** Asset availability and booking intervals are enforced at the database boundary via the `no_overlapping_active_reservations` exclusion constraint (`23P01`), preventing double-booking across concurrent browser sessions.

---

## 3. Live Demonstration Walkthrough (Two-Account Script)

Evaluators can follow this step-by-step rehearsal script using two browser windows (e.g. Standard and Incognito):

### Step 1: Design System & First Impression
- Navigate to [https://resource-share.pages.dev/](https://resource-share.pages.dev/).
- Inspect the landing hero. Toggle between **Calm** (editorial, balanced) and **Pulse** (vibrant, high-contrast) styles.
- Switch Appearance between System, Light, and Dark modes. Notice the absence of flash-of-unstyled-theme (FOUT) due to the synchronous `rs_theme` head script.
- Verify 44px touch targets on mobile viewports.

### Step 2: Google Authentication & Membership Gate
- Click **Sign In with HITAM Account**.
- Authenticate with an authorized `@hitam.org` Google Workspace account.
- Un-onboarded students are greeted with the `OnboardingPage` featuring an equal-content preview of Calm vs. Pulse. Choosing or skipping persists to the database and unlocks the marketplace.
- Outsider accounts are rejected with an explicit, honest admission notice.

### Step 3: Marketplace Feed & Discovery
- Navigate to `/explore`.
- Use the live search input to filter items in real time.
- Filter by Category pills (`textbooks`, `electronics`, `lab_gear`, etc.) and Mode (`Sale`, `Free Loan`, `Rental`).
- Observe distinct pricing labels: Sale displays total purchase price; Rental displays daily rate (`₹XX.XX/day`).

### Step 4: Listing Creation & Image Handling
- Click **List an Item** (`/listings/new`).
- Fill in title, description, category, condition, wear/defects disclosure, and campus pickup zone (`Central Library`, `Canteen Plaza`, `Mech Workshop`, etc.).
- Attach photos. Notice immediate client-side EXIF stripping and thumbnail generation.
- Submit listing: view it immediately in `/explore` and `/my/listings`.

### Step 5: Sale Request & Private Payment Evidence (P06)
- In Window 2 (Student B), open Student A's sale listing (`/listings/:id`).
- Click **Request Purchase** (`/listings/:id/request`). Confirm terms and submit.
- In Window 1 (Student A), open `/exchanges`. Accept the incoming request.
- In Window 2 (Student B), refresh or view the exchange receipt (`/exchanges/:id`). The **Direct Payment Evidence** panel is now unlocked.
- Student B uploads a payment receipt screenshot and enters an optional UPI reference.
- In Window 1 (Student A), inspect the uploaded private receipt. Verify the payee warning: *"Verify this payment in your UPI app directly."*
- Student A clicks **Acknowledge Payment Received**. Both windows reflect the verified state.

### Step 6: Loan/Rental Booking & Exclusion Conflict Gate (P07)
- In Window 2 (Student B), find a rental listing. Request rental for dates `2026-09-20` to `2026-09-24` (5 days).
- Notice live calculated quote: `days * daily_rate = total`.
- Student A accepts the rental. An active reservation is booked in PostgreSQL.
- Attempt to submit a competing request for an overlapping window (`2026-09-22` to `2026-09-26`).
- Student A attempts to accept the second request: the platform gracefully displays: *"This item has already been booked for overlapping dates by another student"* (backed by PostgreSQL `23P01`).

---

## 4. Verification Suite Summary

| Test Suite | Command | Result | Verification Notes |
|---|---|:---:|---|
| Contrast Check | `node scripts/contrast-check.mjs` | **PASS (40/40)** | All themes exceed WCAG 2.1 AA ratios (4.5:1 text, 3:1 non-text) |
| ESLint Audit | `npm run lint` | **PASS (0 errors)** | Zero linter or react-hooks warnings |
| TypeScript Compiler | `npm run typecheck` | **PASS (0 errors)** | Clean compile with `verbatimModuleSyntax` |
| Production Build | `npm run build` | **PASS (253 ms)** | Static bundle optimized with zero server dependencies |
| Negative REST Suite | `scratch/run_s1_tests.ps1` | **PASS (6/6)** | Anon endpoints blocked (42501); boundary tests enforced |
| S6 Sale & Proof Suite | `scratch/test_s6_exchanges.ps1` | **PASS (100%)** | Two-account sale, private proof upload, payee ack, privacy isolation |
| S7 Rental Overlap Suite | `scratch/test_s7_rentals.ps1` | **PASS (100%)** | 23P01 exclusion constraint triggered on overlap; free loans verified |

---

## 5. Security & Privacy Audit Verification

- **Public Git Tree Cleanliness:** A strict forbidden-files guard (`\.env$|\.env\.test$|team_12_ppt|WhatsApp|planning/source-evidence`) is executed prior to every commit. No private keys, passwords, or personal data have been committed.
- **Content Security Policy (CSP):** Deployed headers restrict scripts to `'self'` and connect endpoints to `nvpbapjfeeyrbczdvjix.supabase.co`. Frame injection is prevented with `X-Frame-Options: DENY` and `frame-ancestors 'none'`.
- **Private Buckets:** `payment-proofs` is configured with `public = false`. Anonymous or non-participant access attempts receive HTTP 400/403 errors.

---

## 6. Post-Tomorrow Roadmap (Remaining 30 Points)

Features intentionally deferred to Phase P09–P15 for post-evaluation delivery:
1. **P09 QR In-Person Handoff:** Ephemeral HMAC-SHA256 tokens exchanged between student devices upon physical handover.
2. **P10 Contextual In-App Chat:** End-to-end encrypted messaging scoped strictly to active exchange participants.
3. **P11 Trust & Accountability:** Post-exchange condition ratings, peer trust metrics, and moderator appeal workflows.
4. **P12 Background Expiry Jobs:** Automated cron jobs to transition stale `requested` or `accepted` transactions to `expired`.
5. **P14 Disaster Recovery Drill:** Automated encrypted backups and restoration runbooks.

---

**Certified by Implementation Engineer:** Antigravity AI  
**Repository Branch:** `main` (clean working tree)  
**Handover Status:** COMPLETED AND READY FOR DEMONSTRATION
