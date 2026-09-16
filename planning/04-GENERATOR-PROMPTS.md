# GLM 5.3 execution prompts

These prompts are for the separate code generator. Preparing this document does not implement the application. Give GLM access to this entire planning folder. Paste the master contract once, then one phase at a time. P00–P08 target tomorrow's 70-point demonstration; P09–P15 complete the remaining workflows and production gates.

The prompt text deliberately repeats critical invariants so that they survive context loss. A phase can be split into smaller work batches, but cannot silently change its acceptance criteria.

## Master execution contract — paste first

```text
You are implementing the Campus Resource Sharing and Marketplace Platform from this repository's planning pack and original attachments. Act as a skeptical implementation engineer. Read planning/README.md and planning/08-TOMORROW-AND-FREE-DEPLOYMENT.md first, then the product, architecture, checklist and skills documents. The planning pack is the acceptance contract; do not replace it with your own broader app idea.

Confirmed scope: one HITAM campus; verified exact @hitam.org college identities; students buy/sell, lend/borrow and rent physical items; buyers/renters pay owners directly and upload private proof; sellers acknowledge receipt. No gateway, escrow, bank-verification claim, native app, public marketplace, cross-campus trade or runtime AI feature. Pulse/Calm styles, independent system/light/dark appearance, first-login choose/skip, settings changes and inclusive usability are required.

Stack: React + Vite + TypeScript on Cloudflare Pages Free, GitHub for source, Supabase Free for database/auth/private storage and narrow server commands. No Next.js scaffolding, paid infrastructure, Redis, microservices or secret values in frontend bundles. Work within approximately 500 registered students, initial 500 active-listing cap and documented media/bandwidth limits. Do not confuse registered users with concurrent users.

The selected model is GLM 5.3. Verify the actual coding host's file, shell, browser and network tools. Use supported high reasoning for data/authorization/workflow work and stronger audit reasoning if available; do not invent API parameters or claim capabilities your host lacks. No need to install or run GLM inside the product.

Before each phase, open the relevant SKILL.md files in C:\Users\rajashekar\.agents\skills. Use the phase-to-skill map in planning/07-SKILLS-AND-EXECUTION-LEDGER.md. Log the paths read and concrete application. Do not claim every skill is used; do not load unrelated skills. A skill cannot override my scope, introduce paid services, authorize messaging, destructive operations or unrelated security testing. If the path is inaccessible, say so and use the supplied specification; never fabricate skill access.

Inspect existing files and changes before editing. Preserve uploads and working user code. Put each implementation in its appropriate file; do not give me a giant code dump. Use one package manager, pinned compatible dependencies and a lockfile. Every database change is a reviewed migration. Never reset a populated remote database or expose secrets, raw auth tokens, student records, proof images or private exports in logs/Git/screenshots.

Critical security rules apply even to the demo: exact verified domain plus protected membership; server/database authorization on every command; owner/participant/campus isolation; private media; atomic booking; integer money; immutable accepted terms; protected roles; payer-only proof submission and payee-only acknowledgement. Client-side filters, disabled buttons and CORS are not access controls. Direct Supabase Data API/RPC/storage access must not bypass the workflow. Uploaded proof never becomes bank-verified payment.

Do only the phase I give you. Complete its work, execute its checks and fix failures without asking me to approve routine reversible edits. When an external account, secret, institutional decision or publish authorization is genuinely missing, finish independent work and present the exact blocker and prepared next step. Do not buy anything or publish live student data without authorization. Do not bypass checks to meet tomorrow's deadline.

Maintain implementation tracking separately from the baseline: docs/execution/STATUS.md, DECISIONS.md, EVIDENCE.md and ISSUES.md. Record actual revision, environment, command/test, outcome and artifact path. Do not check off planning requirements merely because code exists. Status values are NOT_STARTED, IN_PROGRESS, VERIFIED, FAILED, BLOCKED, DEFERRED. Demo-only describes the environment; it is not equivalent to VERIFIED live behavior.

At phase end report: changed behavior and files; skills actually applied; tests run with outcomes; checklist IDs satisfied; failed/blocked/deferred items; actual preview URL if one exists; exact next phase. Avoid self-praise and unsupported “production-ready” claims. If context is nearly full, save a checkpoint and resume from it; do not drop remaining checks.
```

## P00 — Source, tool and dependency checkpoint

Prerequisites: master contract and folder access. Skills: architecture, frontend-architecture.

```text
Execute P00 only. Inspect the repository, applicable AGENTS instructions, original PPT/JPEG and the complete planning index. Read research document 01 and deadline/free-host document 08. Report whether application code already exists; do not overwrite it or recreate it blindly.

Record the GLM model identifier, coding app, filesystem/shell/browser/network capabilities and accessible skill paths. Confirm React/Vite + Supabase + Cloudflare is the selected architecture. Verify current compatible framework/runtime/tool versions from official documentation and record them; don't install unrelated packages. Identify whether local Supabase/test database tooling is available and offer the documented disposable hosted-test route if not, without resetting real data.

Create the execution ledger and decisions/issues files. Copy the open decisions from document 07, filling only verified answers. Identify owners/access for GitHub, Cloudflare, Supabase and Google OAuth; keep credentials out of output. Public HITAM MX points to Google, but actual OAuth access remains untested.

Translate tomorrow's six milestone groups into a dependency list. Begin provider/OAuth preparation early; don't hide access blockers until deployment. Resolve routine implementation choices yourself within the specification. If model vision or browser inspection is unavailable, explicitly mark visual verification pending and use the text specification.

Exit gate: source scope and constraints captured, exact stack/version proposal, tool capability report, required external inputs and phase ledger exist. No unsupported claims about enrollment, study findings or current implementation. Checklist DOC-01 through DOC-06 and foundational planning portions of ENV are mapped, not falsely completed as runtime tests. Stop before P01.
```

## P01 — Design contract and route plan

Prerequisites: P00. Skills: frontend-design, frontend-architecture, accessibility-compliance-accessibility-audit.

```text
Execute P01 only. Read product document 02, architecture document 03 and the UX checklist. Define the actual route/screen map, component inventory and design token contract for Pulse and Calm, each with light/dark/system appearance. Preserve one shared navigation and shared business behavior.

Specify mobile Explore / My exchanges / Create / Inbox / Profile, desktop navigation, marketplace card, listing detail, guided listing form, requests, private payment-proof panel, settings and minimal admin queue. Specify disabled “not available in preview” treatment for post-tomorrow features; no fake functional controls. Prepare text wireframes and exact content hierarchy, including loading, empty, error, forbidden, expired and retry states.

Make first successful login style choice skippable, persist the completed onboarding state and preserve a safe destination. Preferences are independent from age or demographic labels. Specify account-aware caching, rollback on save failure and no theme flash. Include keyboard, focus, reduced motion, 320px reflow, text scaling and 44px primary controls.

Deliver docs/design/DESIGN-CONTRACT.md, ROUTES.md and a small prioritized implementation task list. If you can create a preview without delaying architecture work, label all data synthetic; otherwise deliver the design specification first. Do not implement the entire app or add decorative 3D/video.

Exit gate: every core screen and its failure states is mapped; both styles have a coherent token palette, typography, spacing and interaction contract; PAY and UX requirements appear in routes. Record design assumptions, not invented user testing results. Stop before P02.
```

## P02 — Project foundation and database authorization

Prerequisites: P00–P01. Skills: database-design, supabase-postgres-best-practices, api-security-best-practices.

```text
Execute P02 only. Implement the minimal React/Vite/TypeScript project structure and reproducible check/build commands. Build the first migrations for campus, identities/memberships/roles/preferences, assets/listings/media, requests/transactions/reservations, payment proof/acknowledgement, audit/idempotency and a minimal durable outbox. Workers/notification delivery come in P10; durable domain events can be recorded from the start. Future workflow tables can be added in later migrations; document their planned relations without exposing dummy endpoints.

Implement same-campus relational constraints, one live listing per asset, integer INR amounts, immutable participant/accepted-term fields and database-enforced valid booking operations. Enable RLS and least-privilege grants. Prevent generic client updates of role, verification, campus, accepted price, transaction state and proof acknowledgement. Critical commands must authenticate the actor and enforce allowed transitions inside their database transaction, even if called directly through Supabase. Elevated functions must have restricted execution and recheck permissions internally.

Create only synthetic fixtures in a test environment. Include active student A/B/C, pending, suspended, expired, wrong-domain identity, assigned/unassigned moderator and second synthetic campus. Never add test role-switching or auth bypass to a deployed public app.

Test migrations from a clean disposable database, positive/negative RLS cases, invalid parent campus links, self-request, unauthorized state mutations, forged price and two concurrent accepted reservations. Do not count mocked database responses as RLS evidence. If no test database is available, report that gate blocked while completing inspectable migrations.

Exit gate: build/typecheck pass; reviewed migrations and schema diagram exist; core DB constraints and negative authorization tests pass in the named environment. Log ENV, DATA and SEC evidence and exact migration revision. Stop before P03.
```

## P03 — Real HITAM login and protected membership

Prerequisites: P02 plus configured OAuth project access. Skills: api-security-best-practices, privacy-by-design; inspect a relevant auth skill only if compatible with this SPA stack.

```text
Execute P03 only. Read account rules in document 02 and Google setup in document 08. Implement managed Google OAuth with basic openid/email/profile scopes and exact callback/redirect allowlists. The frontend's hosted-domain hint is only UX. Backend membership requires trusted verified identity, exact normalized email domain hitam.org and approved student eligibility. Do not trust editable user_metadata for role, verification or Workspace proof. Disable unused anonymous/password providers.

Verify how the actual SDK/provider supplies trusted email and hosted-domain evidence. If a reliable claim is unavailable, document the supported validation/enrollment-review path; do not invent a field. Prevent unsupported-domain users from obtaining membership or data even if an auth identity gets created. Personal Google accounts, hitam.org.evil.com and fakehitam.org must fail the appropriate boundary.

Implement pending, active, expired and suspended states; session restoration/sign-out and safe deep-link return. Restricted existing-obligation and account-support routes must survive expiry/suspension without opening the feed. Add minimal operator membership approval, MFA-protected admin access and audit trail; no student-selected admin role.

Test two consenting real @hitam.org accounts on the actual callback URL and a personal Google account. Also test expired sessions, canceled consent, malicious redirect, direct API access and attempted role changes. If college OAuth policy blocks access, report the exact provider message safely and keep real auth blocked; do not disable email confirmation or use fake login as a replacement.

Exit gate: AUTH checks relevant to real signup/session/domain/roles pass; report external OAuth evidence separately from synthetic permission tests. Stop before P04.
```

## P04 — Responsive interface, onboarding and persistent preferences

Prerequisites: P01–P03. Skills: frontend-design, tailwind-design-system, accessibility-compliance-accessibility-audit.

```text
Execute P04 only. Implement the approved shared component system and navigation. Build Pulse/Calm semantic tokens, independent appearance and reduced-motion controls, readable type, visible focus and responsive shell. Neither theme can remove features or lower contrast. Avoid inaccessible novelty effects.

Implement skippable first-login style selection after authentication, persisted onboarding completion and Settings changes. A new pending member can set preferences but remains on verification status. Canonical account preferences synchronize across devices; an account-aware local preference mirror prevents initial flash. Clear account-specific state on sign-out/account switch. Handle failed saves with explicit retry and the last confirmed state; preserve transaction drafts.

Use clearly labeled synthetic content only in local design fixtures. Live pages must reflect loading/empty/error/forbidden backend states and cannot quietly fall back to demo data. Build skeletons with stable dimensions and clear primary actions. Include accessible toasts/errors and usable keyboard dialogs.

Verify both styles in both explicit appearances plus System behavior at 320, 390, 768 and 1440px. Test choose/skip/return/login-as-different-user, browser refresh, reduced motion, keyboard and text zoom. Inspect actual rendered screens using an available browser/vision tool or record human visual review pending; never claim a screenshot was seen if it wasn't.

Exit gate: persisted preference journeys and core shell UX tests pass; record screenshots and measured contrast for each theme. Stop before P05.
```

## P05 — Listings, private media, search and basic moderation

Prerequisites: P02–P04. Skills: frontend-design, supabase-postgres-best-practices, api-security-best-practices, webapp-testing.

```text
Execute P05 only. Implement create/edit/draft/preview/submit/publish/pause/archive for one physical item and one mode at a time. Require real item photo, category, condition/defects, description and mode-specific amount/rate. Keep accepted terms immutable and forbid mode changes that conflict with reservations.

Implement private, validated raster uploads with user/campus ownership, byte/pixel limits, safe processing, metadata stripping, thumbnails and abandoned-upload cleanup. Enforce the free-tier photo/listing/storage quotas. Test the image processing path against actual Edge Function CPU/memory constraints; reduce accepted formats/dimensions with a clear message if necessary, never remove server validation. Paid image transformations are not allowed.

Build campus-scoped Explore, listing details, own listings and search/filter/pagination. Price filters must distinguish sale amount from rental daily rate; dates are preview availability only. No public feed, hidden-item leakage or fake empty-state inventory. Implement minimum operator approve/reject/hide actions with reason and audit; unauthorized students cannot use them.

Verify create then refresh and access from the other authorized test account; wrong user cannot edit; hidden/draft items are not discoverable; malformed images fail; receipt/evidence buckets are never treated as listing-photo sources. Check mobile form recovery and meaningful no-results states. Test counts/search/API access with other-campus and suspended fixtures.

Exit gate: LST and search-relevant DATA/SEC/UX checks pass with persistent backend evidence. Record quota sizes from representative uploads. Stop before P06.
```

## P06 — Sale requests and direct-payment proof

Prerequisites: P05. Skills: api-security-best-practices, database-design, webapp-testing, privacy-by-design.

```text
Execute P06 only. Implement sale request, owner acceptance, requester withdrawal, decline, expiry and pre-pickup cancellation. Freeze agreed INR amount, participants and listing snapshot; require expected versions and idempotency. Concurrent acceptance for one item must produce only one valid reservation.

Implement the complete private payment-evidence workflow from document 02. Buyer pays outside the platform, uploads a legible receipt image and optional masked reference; seller separately acknowledges in-app after checking their own payment app. States are Not submitted, Proof submitted, Seller acknowledged and Seller disputed. No gateway, wallet, OCR claim, verified-payment badge or automated refund. Use synthetic receipt images during testing; don't ask real students to pay for the demo.

Only buyer can upload and only seller can acknowledge the current proof version. Validate amount/currency against frozen terms, image limits, object ownership, proof revision, transaction state and retry keys on the backend. Corrections append versions; stale acknowledgements fail. Private proofs are accessible only to participants and assigned case staff. Capture basic dispute reports now, even though full case management comes later.

For the tomorrow milestone, pickup completion remains disabled until P09; explicitly show accepted/seller-acknowledged status without falsely completing a sale. Normal paid handoff later must require proof plus payee acknowledgement, while actual custody reconciliation remains a distinct audited operation.

Test two-account sale/proof flow, personal/third-account denial, wrong payer/payee, malicious media path, overwritten proof, wrong amount, duplicate retry, canceled transaction, seller denial and download after permission change. Verify direct Storage/Data API calls cannot leak receipts or alter payment state.

Exit gate: sale reservation and PAY-01 through PAY-13 plus PAY-16 pass. PAY-14 handoff integration belongs to P09; PAY-15 executed retention jobs belong to P11, with data/retention contract specified now. Record trace and DB state, not screenshots alone. Stop before P07.
```

## P07 — Loan/rental requests, quotes and availability

Prerequisites: P06. Skills: database-design, supabase-postgres-best-practices, webapp-testing.

```text
Execute P07 only. Add free-loan and paid-rental requests to the same transaction domain. Free loan is zero price and bypasses payment evidence. Rental uses integer paise per 24-hour day, ceiling billing and exact total displayed before requesting. Store UTC and display explicit campus-local date/time. Enforce allowed duration, lead time, horizon and turnaround buffer as centralized configurable policy.

On acceptance, atomically check eligibility, current asset custody and non-overlapping reservation ranges. Pending requests do not reserve inventory. Cancel/decline/expiry behavior must release only actual holds. Implement accepted reservation and due-date dashboards. Do not claim pickup, overdue return or QR works before P09.

Test adjacent/buffered intervals, overlaps, zero/negative duration, cross-midnight and fractional-day quotes, stale rates, free-loan proof bypass and rental proof requirement. Race several callers against one date range using a real database; show exactly which requests won and whether final rows satisfy the invariant. Test direct command invocation with forged actor/campus/amount.

Document extension and overdue handling contracts for P09; don't add a fake button that silently changes accepted dates. Preserve all shared sale behavior from P06.

Exit gate: tomorrow's loan/rental request group has working backend, quote and conflict evidence. Core TX checks through acceptance/cancellation pass. Later custody/return checks remain NOT_STARTED. Stop before P08.
```

## P08 — Free deployment and tomorrow's demonstration gate

Prerequisites: P00–P07 passing or explicitly blocked; provider ownership available. Skills: deployment-procedures, webapp-testing, accessibility-compliance-accessibility-audit.

```text
Execute P08 only. Freeze feature scope and prepare the tomorrow demonstration. Read document 08's deployment plan and weighted milestone definitions. Inspect current provider terms/quotas. Use GitHub source + Cloudflare Pages Free + Supabase Free, with provider subdomain; do not enable billing or GitHub Pages marketplace hosting.

Prepare exact build/output settings, public frontend variables, private backend secrets, migrations, private bucket rules, exact Google/Supabase callback URLs, SPA deep-link handling and security headers. Deploy the demonstration only within the user's actual authorization and available accounts. If deployment authorization/access is missing, finish the build and a ready-to-run configuration handover; state the remaining step precisely. Never publish secret files, payment receipts, identity exports or student roll numbers.

On the actual deployed URL test a nested-route reload, real HITAM login, wrong-domain denial, theme settings, listing creation from account A and visibility to B, sale/proof acknowledgement, free loan and rental conflict. Use test data and no real payments. Check console/network errors, private receipt URLs and API failure states. Run build, typecheck, lint and the relevant behavioral tests; fix regressions without expanding scope.

Create DEMO-HANDOVER.md with actual URL, tested revision/migrations, two-account demonstration steps, true milestone points, missing features and known issues. No points for untested groups; no unsupported 70% rounding. QR/chat/full reviews may remain unavailable and must be visibly labeled. Record all baseline confidentiality/authorization failures as blockers to external exposure even if feature points are high.

Exit gate: a reproducible, honestly scored demonstration and evidence package exist. It is not a production launch. Stop before P09.
```

## P09 — Authenticated pickup, return, condition and extensions

Prerequisites: stable P08 baseline. Skills: api-security-best-practices, database-design, webapp-testing.

```text
Execute P09 only. Read the complete state and QR protocols in document 03. Implement pickup/return sessions with random hashed single-use phase/actor/transaction/version-bound challenges, five-minute expiry, rate-limited typed fallback and explicit two-party confirmation. Scanning alone never transfers custody or certifies condition.

Finalize immutable condition reports and bind acknowledgements to their revisions. Paid handoff needs current submitted proof and payee acknowledgement; free loans do not. Sale pickup completes a sale; loan/rental pickup enters In progress. Return agreement completes; returned-item condition disagreement records owner custody plus a dispute. A dispute is separate from physical custody, and elapsed due time never marks an item returned.

Implement overdue display, reminders data, future reservation blocking when actual custody is still out, owner-accepted extensions with conflict checking and revised terms, pre-pickup cancellation races and staff-assisted off-process reconciliation. Staff actions cannot fabricate a scan or verified payment.

Test wrong participant, expired/wrong-phase/replayed token, concurrent redemption, changed evidence, changed terms, cancellation race, two distinct acknowledgements, no camera, keyboard-only fallback, offline finalization, extension overlap and returned-but-disputed custody. Verify subsequent bookings cannot collect an item still overdue. Store audit/outbox atomically and run sale/loan/rental regression flows.

Exit gate: QR and custody/extension TX checks pass through browser and real DB assertions. Capture participant-specific traces; no raw tokens in logs/evidence. Stop before P10.
```

## P10 — Chat, in-app notifications and reliable jobs

Prerequisites: P09. Skills: supabase-postgres-best-practices, api-security-best-practices, observability-and-instrumentation, webapp-testing.

```text
Execute P10 only. Implement participant-only contextual text chat with persisted messages, stable pagination, client message IDs, blocked-contact rules and reconnect recovery. Realtime is optional delivery acceleration; DB persistence is canonical. Do not claim end-to-end encryption or add voice/video/file attachments.

Implement in-app notifications from committed outbox events for request decisions, proof decisions, upcoming handoff, due/overdue return and moderation updates. Keep private proof details and QR tokens out of notification previews. Configure small scheduled jobs through supported Supabase Cron/worker paths, with authenticated invocation, leases, dedupe, bounded retries, dead-letter visibility and run-log retention.

Email is optional until an approved free sender is actually configured. Do not use Supabase's default SMTP for a 500-user rollout or add a paid provider. Show notification delivery state honestly; provider failure must not undo the underlying exchange. Recheck canceled/completed transactions before sending stale reminders.

Test third-party conversation access, cross-campus subscription, suspension/block during chat, duplicate send, refresh/reconnect recovery, out-of-order delivery, worker overlap/crash/retry and cancel-before-reminder. Confirm polling and jobs stay within free-tier budgets.

Exit gate: MSG and JOB checks pass with delivery/permission evidence. Optional email can remain DEFERRED with in-app behavior verified. Stop before P11.
```

## P11 — Trust, case moderation and privacy workflows

Prerequisites: P09–P10. Skills: privacy-by-design, api-security-best-practices, frontend-design, webapp-testing.

```text
Execute P11 only. Implement completed-exchange reviews, bilateral/time-delayed publication, dispute holds, sample counts, the neutral-newcomer state and the documented repeated-counterparty aggregation limit. Label the visible score as community rating, not a safety guarantee. No opaque AI fraud score, leaderboard or fake seed reviews in live data.

Complete campus-scoped report/dispute queues, assignment, evidence access reasons, moderation actions, appeal and audit history. A moderator only sees assigned case context, not all chats/receipts. Require MFA for administrative work. Protect against last-admin removal and self-promotion; no endpoint may impersonate a student or overwrite custody/payment evidence.

Implement account export/deletion requests, policy versions, data minimization and retention tasks for receipts, condition evidence, abandoned uploads and logs. Case holds need a reason, owner and review date. Avoid promising immediate erasure of lawful active-obligation evidence or retaining everything indefinitely. Deletion must not break counterpart histories or expose exported records publicly.

Test review ineligibility, duplicate/self-review, new-member display, publication deadline, appeal, unassigned moderator denial, role revocation, proof retention and deletion/export with open transactions. Document privacy/operator policy decisions still needed; don't claim legal compliance from generated text.

Exit gate: TRU, ADM and privacy-related SEC/OPS checks pass; unresolved institutional policy blockers remain explicit. Stop before P12.
```

## P12 — Security and data-integrity audit

Prerequisites: P00–P11. Skills: api-security-best-practices, supabase-postgres-best-practices, webapp-testing.

```text
Execute P12 only. Review the full implementation as if earlier completion claims are wrong. Build a threat-to-test matrix from document 03. Inspect all reachable routes, RPC functions, table/column grants, RLS policies, storage buckets, signed URLs, realtime channels, worker endpoints and privileged credentials. Test only our owned local/staging resources.

Attempt direct role/verification/price/status mutation, object-ID and campus substitution, another user's proof/chat/evidence read, forged payer/payee acknowledgements, QR replay, duplicate acceptances, stale terms and membership revocation. Verify CSP/XSS protections and malicious/oversized uploads, dependency and secret scans, redacted logging, callback restrictions and safe provider failure handling. A publishable client key is not a secret; it must still confer no unintended access.

Use real database sessions and reproducible test cases. Include concurrent hot-item requests and final invariant queries. If a test tool cannot run, mark the check unverified; don't replace it with reading code or fabricating output. Fix confirmed defects with targeted changes and add regression tests for those defects. Do not rewrite unrelated working features or perform an unrestricted security scan against external systems.

Exit gate: no unresolved critical/high confidentiality or integrity issue; all mandatory SEC/DATA/TX/PAY/QR checks have evidence for the current revision. Medium issues require explicit severity rationale and tracking, not silent suppression. Stop before P13.
```

## P13 — Accessibility, usability and measured performance

Prerequisites: P12. Skills: accessibility-compliance-accessibility-audit, frontend-design, webapp-testing, k6-load-testing.

```text
Execute P13 only. Verify actual rendered Pulse/Calm light/dark themes, System behavior and reduced motion across the documented viewport/browser matrix. Test keyboard, focus, zoom/reflow, screen-reader announcements, form errors, date selection, proof upload and QR typed fallback. Run automated accessibility checks plus manual core flows; report WCAG AA findings precisely, not a blanket 100% accessibility claim.

Run the proposed local formative usability sessions only with actual available participants and consent. If unavailable, leave their findings pending; do not simulate human quotes. Ensure critical price/payment/return obligations are understood. Fix usability failures that prevent tasks before decorative polish.

Measure app/image payload, slow-network behavior, representative search plans and controlled performance. Use the free-tier 500-record workload and 25-active-session/5-RPS pilot scenario from document 03, within owned environment/provider limits. Record actual throughput, duration, region, p95 latency, unexpected errors and integrity outcomes. Do not load Google sign-in or claim 500 simultaneous users. Laboratory performance is separate from post-launch field Web Vitals.

Exit gate: UX and PERF checks pass for the stated environment or show precise unresolved gates; no inaccessible alternative theme accepted. Record measured quota impact and tune without removing required privacy or integrity checks. Stop before P14.
```

## P14 — Recovery, pilot, production launch and rollback

Prerequisites: P12–P13 technical gates; named operator and launch decisions. Skills: deployment-procedures, observability-and-instrumentation, privacy-by-design, webapp-testing.

```text
Execute P14 only. Read document 06 and all REL/OPS checks. Prepare the real deployment manifest, migration review, private environment configuration, budget/quota controls, operator access, monitoring and runbooks. Validate free-tier limitations and do not enable paid upgrades. Review necessary launch policy decisions with the actual owner after preparing the concrete release candidate.

Back up database and private storage objects separately to approved encrypted storage. Restore into an isolated environment and verify membership/roles, transaction states, proof/condition bytes, media links and no unauthorized data exposure. Measure achieved recovery time and loss window; don't claim the aspirational targets if free-tier tooling cannot meet them. Rehearse frontend rollback and schema-compatible forward fixes; never reset the live database as a rollback shortcut.

Conduct the controlled 20–30-person pilot when authorized, using actual staff coverage and clear scope. Record incidents, blocked exchanges, permission issues, usability problems and usage quotas. Expand only after evidence supports it. If authorization, staffing, restore or policy gates are missing, finish the release candidate and record blocked launch, not production-ready status.

For authorized launch, record the exact deployment URL/revision/migrations, smoke-test two identities and representative transactions, check alerts and quota thresholds, then monitor the initial window. Stop/rollback on confidentiality or transaction-integrity failure. No real public launch was authorized merely by the existence of these prompts.

Exit gate: release decision, pilot evidence, recovery drill, operational owner and accurate live limitations are documented. Separate demo-complete, technically verified, pilot-approved and launched status. Stop before P15.
```

## P15 — Post-launch maintenance and future-scope gate

Prerequisites: actual launch, or use this phase to prepare scheduled work without claiming it ran. Skills: observability-and-instrumentation, deployment-procedures, architecture.

```text
Execute P15 only. Establish the maintenance responsibilities and first-day/first-week/first-month review from document 06. Record actual service errors, real successful exchanges, due-return issues, moderation backlog, auth failures, quota consumption and support feedback. Do not fabricate elapsed monitoring or ask an unscheduled agent to pretend it will keep working later.

Verify retention, restore cadence, account ownership handover, dependency updates and membership expiry. For every incident capture impact, containment, repair and regression prevention. Keep current deployment and schema versions tied to test evidence.

Evaluate future requests using the roadmap's evidence triggers. Payment gateways, mobile apps, another campus, AI recommendations and sustainability estimates require separate scoped decisions, funding/eligibility checks and revised tests. Do not build them merely because the original architecture diagram mentions them. Publish observed reuse counts only; label financial/impact estimates with their assumptions.

Deliver the maintained operations handover, current known limitations, measured adoption/capacity report and ranked next decisions. If no real users or elapsed observation exist, mark those items pending and provide the review plan. Production readiness is maintained through evidence, not permanently granted by this phase.
```

## Repair prompt — use whenever a phase fails

```text
Stop adding features. Read the current failed phase, relevant specification, actual diff and evidence. Reproduce each reported failure before changing code. List root cause, smallest scope-preserving fix and affected acceptance IDs. Apply the fix in the correct files, preserve migrations/history and rerun failed plus directly affected regression checks. Do not disable RLS/auth, weaken tests, hide errors, replace real data with mocks or add paid services. If an external blocker remains, finish independent repairs and record exact next action. Update STATUS/EVIDENCE/ISSUES honestly; do not advance the phase until its dependent gate passes.
```

## Resume prompt — paste after changing chat/context

```text
Resume this existing project; do not restart it. Read the master contract in planning/04-GENERATOR-PROMPTS.md, planning/README.md, planning/08-TOMORROW-AND-FREE-DEPLOYMENT.md and docs/execution/{STATUS,DECISIONS,EVIDENCE,ISSUES}. Inspect the actual working tree, current revision and migration status. Treat older passing evidence as valid only for unchanged behavior and the recorded environment. State the last verified phase, current unfinished phase and next missing acceptance item. Read the relevant skills and continue only that phase. Preserve exact @hitam.org verification, zero budget, private proof, Pulse/Calm and booking invariants. Never overwrite working code or recreate a completed scaffold.
```

## Skeptical final audit prompt — use in a fresh generator context

```text
Audit this project against planning documents 02, 03, 05 and 08 without trusting STATUS.md. Start with read-only inspection and reproduce high-risk flows using owned test accounts/environment. Build an itemized table: requirement ID, claimed status, actual evidence, verdict, severity and repair. Check exact HITAM identity, direct database/RPC/storage authorization, private payment proof, payer/payee roles, double booking, QR replay, condition/custody separation, all themes, free-tier limits, real deployment URL and database/media restore evidence. Report VERIFIED, FAILED, BLOCKED, UNVERIFIED and DEFERRED separately. Recalculate tomorrow's functional score from the fixed milestone groups. Never infer production readiness from build success, screenshots, provider marketing or the implementation agent's self-report. Do not mutate the project during this audit unless I give the repair prompt.
```
