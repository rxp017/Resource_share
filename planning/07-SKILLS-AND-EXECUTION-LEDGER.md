# Skill use and execution tracking

## 1. Verified local skill inventory

The following `SKILL.md` paths existed when checked on 16 September 2026. Existence does not mean all instructions were reviewed or applied in this planning task. The planner actually read `architecture/SKILL.md` and its relevant references, and `frontend-design/SKILL.md`. Other skills below are for the implementation generator to inspect at the matching phase.

Root: `C:\Users\rajashekar\.agents\skills`

| Skill directory | Relevant phase | Why |
|---|---|---|
| architecture | P00, P15 | Requirements, tradeoffs and decision records |
| frontend-architecture | P00–P01 | Shared UI/domain boundaries for the selected SPA |
| frontend-design | P01, P04–P05, P11, P13 | Distinctive Pulse/Calm design and screen consistency |
| tailwind-design-system | P04 | Semantic shared tokens and reusable components if Tailwind chosen |
| accessibility-compliance-accessibility-audit | P01, P04, P08, P13 | Keyboard, contrast, reflow and assistive technology |
| database-design | P02, P06–P07, P09 | Entities, constraints, state integrity and migrations |
| supabase-postgres-best-practices | P02, P05, P07, P10, P12 | PostgreSQL query/RLS/constraint checks |
| api-security-best-practices | P02–P03, P05–P06, P09–P12 | Identity, actor/object authorization and safe commands |
| privacy-by-design | P03, P06, P11, P14 | Private payment/condition evidence and data lifecycle |
| webapp-testing | P05–P14 as relevant | Actual browser and integration behavior |
| k6-load-testing | P13 | Bounded workload and honest load evidence |
| deployment-procedures | P08, P14–P15 | Free deployment, smoke checks and rollback |
| observability-and-instrumentation | P10, P14–P15 | Redacted operational events, jobs and incident detection |

For example, the frontend-design path is `C:\Users\rajashekar\.agents\skills\frontend-design\SKILL.md`. Expand every directory in the same way. Do not assume the selected generator has access to this Windows path merely because this planning session did.

The inventory also contains Next.js-related skills, but the final baseline uses React/Vite. Do not apply a Next.js auth or deployment recipe to the SPA just because it mentions Supabase. Search for a compatible skill when needed; use official provider docs for current APIs. A skill name is not evidence of compatibility.

## 2. Selection and conflict protocol

1. State the concrete phase need, choose usually 1–3 relevant skills, and read the actual instructions plus only referenced material needed for that task.
2. Record skill path, phase, what was applied, and any conflict. Do not read the entire large skills directory or install every suggested dependency.
3. Follow explicit user scope and the current project contract. Generic templates cannot add a paid host, force Next.js, change privacy rules or expand future features.
4. A skill may request implementation code; that belongs only in the separate generator phase, never this planning-only task.
5. Treat scripts in skill folders as code to inspect before running. No automatic destructive cleanup, cloud deployment, external messages or broad penetration testing based solely on a skill example.
6. If unavailable or obsolete, report it and use the specific accepted requirement plus current primary documentation. Missing optional skill access does not justify inventing completion.
7. Security and accessibility requirements take precedence over aesthetic advice. A ban on system fonts does not eliminate fallback fonts; a visual preference cannot excuse poor contrast or performance.

## 3. Open decision register

| ID | Current status | Needed before | Default / impact |
|---|---|---|---|
| D01 | User selected GLM 5.3; official model card verified; coding host unknown | P00 execution | Inspect actual tool/context access; prompts are host-neutral |
| D02 | 17 September deadline confirmed; hour unknown | Tomorrow scheduling | Use document 08 ranges; no promise of 70 points |
| D03 | Zero hosting/DB budget confirmed | Architecture/deploy | Cloudflare Pages + Supabase Free; no paid upgrades |
| D04 | Exact hitam.org domain confirmed; public MX points to Google | P03 | Google OAuth first; prove real account access |
| D05 | Who qualifies as an active student versus staff/alumni unresolved | Real membership activation | Operator-approved eligibility; email control alone insufficient |
| D06 | GitHub/Cloudflare/Supabase/Google project ownership/access unverified | P03/P08 setup | Prepare configuration; credentials stay outside chat/Git |
| D07 | Direct payer-to-owner transfer and receipt upload confirmed | P06 | Private screenshot + payee acknowledgement; gateway deferred |
| D08 | Cash support not requested; bank-transfer proof requirement assumed | Any cash flow | Cash unavailable until a separate receipt policy is agreed |
| D09 | Moderation/support owners and coverage unknown | Real pilot | No unattended real marketplace |
| D10 | Policy: item eligibility, minors, retention, pickup zones, disputes | Real pilot | Draft defaults in docs 02/06; confirm operator policy |
| D11 | Team number conflict (11 in PPT vs 12 filename) unresolved | Academic submission | Preserve originals and report discrepancy |
| D12 | App brand/name and logo not confirmed | Public branding | Use project title; Pulse/Calm are style labels only |
| D13 | Actual local demand, theme preference and savings unknown | Adoption/impact claims | Conduct proposed study; no invented findings |
| D14 | Recovery storage/maintainer availability unknown | Production approval | Free manual copies only if actual workflow/drill exists |

Unknowns do not block completing this planning pack. They block only implementation/release actions that depend on their resolution.

## 4. Execution ledger templates

The generator creates these under `docs/execution`, preserving the planning pack as the agreed baseline. These are templates, not results.

### STATUS.md

| Phase | Status | Revision/environment | Gate evidence | Remaining blocker | Next action |
|---|---|---|---|---|---|
| P00 | NOT_STARTED | — | — | — | Inspect sources and actual tools |

Track functional points using the fixed groups in document 08. Include separate fields: functional score, local/demo status, deployed status, pilot approval, production decision. A single “done” flag is insufficient.

### EVIDENCE.md

| Evidence ID | Checklist IDs | Revision + migration | Environment + actor | Procedure/command | Expected | Actual | Verdict | Artifact/date |
|---|---|---|---|---|---|---|---|---|
| E-001 | To fill | To fill | Local/staging/live; role only | Exact reproducible steps | To fill | To fill | NOT_RUN | To fill |

Record test command output and exit status where applicable; for browser evidence record steps and resulting state plus trace/screenshots. Redact private data. A screenshot proves appearance, not database enforcement. A negative permission test must demonstrate the forbidden request was actually attempted under the correct identity.

### DECISIONS.md

| Decision | Requirement/source | Options considered | Chosen reason | Cost/risk | Revisit trigger | Owner/date |
|---|---|---|---|---|---|---|
| To fill | To fill | To fill | To fill | To fill | To fill | To fill |

### ISSUES.md

| Issue | Reproduction | Severity/impact | Affected gate | Owner | Proposed repair | Retest evidence | State |
|---|---|---|---|---|---|---|---|
| To fill | To fill | To fill | To fill | To fill | To fill | To fill | OPEN |

### Skill application log

| Phase | Actual SKILL.md path read | Concrete instruction applied | Conflicts/override | Result artifact |
|---|---|---|---|---|
| To fill | To fill | To fill | To fill | To fill |

## 5. Checkpoint format

Before context reset, save: current phase; tested revision; migrations applied and to which environment; files modified but not verified; failing exact command/test; open external inputs; three immediate next actions; applicable invariants; actual preview URL if any. Do not paste secret values or a full private database dump into the checkpoint.

After resuming, inspect real files/diff before trusting the checkpoint. Reuse passing evidence for unchanged behavior; rerun when code, configuration, schema, deployment or relevant environment changed. Do not repeat a complete test suite without a reason, and do not skip changed behavior because an older release passed.
