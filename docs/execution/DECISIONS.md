# Decision log

Format per the architecture skill: context -> decision -> trade-offs. Dated. Section 3 copies the open decision register from doc 07 and fills only verified answers.

## 1. Confirmed decisions

- D-001 (2026-09-16) Stack: React + Vite + TypeScript SPA on Cloudflare Pages Free; Supabase Free for Postgres, auth, private storage and narrow server commands; GitHub for source. Source: planning README baseline + master contract + doc 08 section 4. Trade-off: no SSR - all authorization lives in Supabase RLS/RPC/storage policies, never in client code.
- D-002 (2026-09-16) Package manager: npm 11.17.0 (installed; pnpm/yarn/bun absent). One package manager; package-lock.json committed from P02 onward.
- D-003 (2026-09-16) Runtime: Node v24.19.0 locally. Pin for Cloudflare Pages via a .node-version file plus the NODE_VERSION env var set in BOTH Production and Preview environments (official Pages build-image docs).
- D-004 (2026-09-16) Test database route: local stack unavailable (no Docker, no Supabase CLI - E-005), so the documented disposable hosted project is the selected route. A populated project is never reset.
- D-005 (2026-09-16) Version proposal, verified against official sources (E-006); final pins lock at P02 install time from the live registry: React 19.3.x; Vite 8.x; TypeScript as pinned by the official Vite react-ts template at scaffold time; @supabase/supabase-js 2.x. Free-tier envelopes: Pages Free 500 builds/month, 1 concurrent build, 20-minute timeout, 20,000 files, 25 MiB per file; Supabase Free 2 active projects, 500 MB database, 1 GB file storage, 5 GB egress (+5 GB cached), 50,000 MAU, pause after 1 week of inactivity.
- D-006 (2026-09-16) PowerShell 5.1 conventions for every block: .NET file APIs for UTF-8-no-BOM writes; -LiteralPath everywhere (root contains parentheses); native commands captured with 2>&1 (never 2>$null); explicit $LASTEXITCODE checks; stop-on-error.
- D-007 (2026-09-16) Frontend architecture style (frontend-architecture skill): src/modules/{feature}/ with a curated barrel index.ts, pages as directories, strict server-state vs UI-state split, barrel-only cross-module imports, co-located styles, component promotion ladder, shared/ for cross-module building blocks. Applied from the P02 scaffold onward.
- D-008 (2026-09-16) VCS plan: git init in P02 with .gitignore BEFORE the first commit; planning pack committed first so history is provable; app code follows. No secrets ever committed.
- D-009 (2026-09-16) Remote repository visibility: PUBLIC at https://github.com/rxp017/Resource_share (user choice). Doc 08 plans GitHub as the source host and forbids GitHub Pages hosting - it does not require a private repo. Consequences: (a) the first push MUST exclude team_12_ppt.pptx (contains named team members), the WhatsApp JPEG, .env*, node_modules/ and dist/ plus every secret - enforced by the P02 .gitignore and a printed pre-push file list for review; (b) the Supabase service_role key and DB password go only to Supabase/Cloudflare dashboard settings, never to Git; (c) visibility can be flipped to private later without rework. Trade-off accepted: public source simplifies the Cloudflare Git integration and academic review.
- D-010 (2026-09-16) Supabase project: ONE free project in ap-south-1 (Mumbai - closest region to Hyderabad) serving as the known clean development project per doc 08 section 7.2; the same project backs the P08 demonstration. The free plan's second project slot stays unused for now. DB password is stored only by the user; the service_role key never enters Git or chat.

## 2. Skills ledger (paths read, concrete application)

| Date | Path | Application |
|---|---|---|
| 2026-09-16 | C:\Users\rajashekar\.agents\skills\architecture\SKILL.md | ADR format of this file; simplicity-first; P00 exit validation checklist |
| 2026-09-16 | C:\Users\rajashekar\.agents\skills\frontend-architecture\SKILL.md | D-007 layout rules; P01 route/component planning input |

Per-phase skills (doc 07 map) are read at their phases and logged here. No other skill is claimed as read.

## 3. Open decision register (from doc 07 section 3; verified answers only)

| ID | Verified answer / current status |
|---|---|
| D01 | VERIFIED: GLM 5.3 selected; coding app = this chat; no filesystem/shell/browser/network execution (E-005); skills readable only through user-pasted output (E-003) |
| D02 | 17 September 2026 deadline confirmed; exact hour UNKNOWN - OPEN. Use doc 08 ranges; no promise of 70 points |
| D03 | VERIFIED: zero hosting/DB budget; free tiers only (D-001, D-005) |
| D04 | hitam.org confirmed; public MX -> smtp.google.com (planner DNS check, doc 08 section 6); real OAuth login UNTESTED - resolves in P03 |
| D05 | OPEN: active student vs staff/alumni eligibility. Operator-approved eligibility required before real membership activation; the demo uses synthetic members only |
| D06 | VERIFIED (E-010, user-reported): GitHub, Cloudflare, Supabase and Google accounts all exist. Still to create: Supabase project, Google OAuth client, Cloudflare Pages project |
| D07 | VERIFIED: direct payer-to-owner payment + private receipt upload + separate payee acknowledgement; no gateway, escrow or bank-verification claim |
| D08 | Confirmed assumption: cash unsupported until a separate receipt policy is agreed |
| D09 | OPEN: moderation/support owners and coverage unknown; no unattended real marketplace |
| D10 | OPEN: item eligibility, minors, retention, pickup zones, disputes policy |
| D11 | OPEN: team number 11 (PPT slide 1) vs 12 (filename); originals preserved; report the discrepancy at academic submission |
| D12 | OPEN: app brand/name and logo; use the project title until confirmed; Pulse/Calm are style labels only |
| D13 | OPEN: actual demand, theme preference and savings unmeasured; no invented findings |
| D14 | OPEN: recovery storage/maintainer availability unknown; free manual copies only if an actual workflow/drill exists |

Unknowns block only the implementation/release actions that depend on them, per doc 07 section 3.
## Addendum 2026-09-17

- D-011 Environment variable naming: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (Vite only exposes VITE_-prefixed vars; the user's earlier NEXT_PUBLIC_ naming is superseded). .env is gitignored; .env.example is committed with the public URL and a placeholder for the anon key.
- D-012 Migration route: migrations are authored as reviewed files under supabase/migrations/ and applied to the named clean hosted project via the Supabase dashboard SQL editor (no local Docker/CLI available - E-005). Application evidence = pasted success output + follow-up verification queries. Supabase CLI adoption is optional later; a populated project is never reset.
- D-013 Scaffold: hand-authored deterministic file set (no interactive create-vite prompts). Versions: react/react-dom ^19.3.0, vite ^8.3.0, @supabase/supabase-js ^2.116.0, typescript ^5.8.0 (latest 5.x line), @types/react(-dom) ^19.0.0; @vitejs/plugin-react resolved to latest at install time because no Vite-8-compatible pin was verifiable in advance - the lockfile is the pin; resolved versions are recorded via npm list.
- D-014 ESLint is deferred to P04 (ISSUES I-008) to keep tonight's scaffold minimal; ENV-04's lint clause is tracked, not waived.
- D-015 P01 skills: frontend-architecture read and applied (D-007); frontend-design and accessibility-compliance-accessibility-audit SKILL.md read commands issued to the user - design docs derive from binding doc 02, and any conflict surfaced by those reads will be logged as an amendment.
- D-016 (2026-09-17) Security & workflow hardening: Authored 0003_security_fixes.sql resolving audit findings F1-F9. Revoked direct authenticated mutations on audit_events, transactions, and memberships; centralized exchange workflow into 8 SECURITY DEFINER RPCs with search_path=public and idempotency; added listing reservation-protection trigger and 30-day loan/rental bounds; enforced private storage buckets and participant-scoped policies; strict server-side hitam.org domain check.