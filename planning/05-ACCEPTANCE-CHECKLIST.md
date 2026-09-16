# Acceptance checklist — no implementation checks passed yet

Every box starts unchecked. This pack documents requirements; it is not evidence that the future app satisfies them. Track actual execution in `docs/execution/EVIDENCE.md` with checklist ID, revision, migration version, environment, actor, command/steps, expected/actual result, artifact and date. Redact sensitive content.

## How gates work

- **D — tomorrow demonstration:** DOC, applicable ENV, AUTH, UX foundation, DATA core, LST, PAY and TX request/reservation checks. P08 records exact passed IDs and the six 70-point groups. Anything not implemented is explicitly unavailable. All security checks applicable to exposed demo functionality still apply.
- **F — complete functional scope:** D plus full TX/QR/MSG/JOB/TRU/ADM behavior. No production claim yet.
- **P — controlled production:** F plus full SEC, UX, PERF, OPS and REL evidence, real pilot and accountable operator. Optional email may remain deferred when in-app notifications satisfy the approved scope. Future mobile/gateway/multi-campus/AI features are excluded, not failed V1 checks.
- `VERIFIED` requires an executed relevant check; `UNVERIFIED/BLOCKED` cannot be treated as a pass. Documentation can prove a planning requirement, not a runtime permission. A failed high-risk item blocks external release regardless of percentage.
- For omitted tomorrow features, hide/disable entry points truthfully. Do not let incomplete data or unsafe workflows become accessible just to increase the score.

### Tomorrow's explicit acceptance mapping

| Milestone group | Checks that must be evidenced for its points |
|---|---|
| Foundation (10) | DOC-01–06, ENV-01–12, DATA-01–09, plus storage/auth/schema security guards below |
| HITAM identity (10) | AUTH-01–15 and AUTH-17; AUTH-18 only if OTP is enabled. AUTH-16's later return behavior remains pending, but support/account access must exist |
| UI/preferences (10) | UX-01–16, UX-18–22, UX-24–25 on exposed screens; manual keyboard and readable mobile flow required |
| Listing/search (15) | LST-01–14 and DATA-10–11 for implemented data; at least minimal operator approve/hide behavior |
| Sale/proof (15) | PAY-01–13, PAY-16 and TX-01–05, TX-11–12; handoff integration/retention jobs remain later |
| Loan/rental requests (10) | TX-06–10 plus regression of TX-01–05; accepted-reservation timeline verified |

Non-negotiable external-demo guards: SEC-01–05 and SEC-07–15 for all implemented surfaces; SEC-06 for implemented reads/caches (realtime portion later); SEC-20; no open high-severity privacy/integrity defect. If any guard fails, keep the build local/restricted and report the blocker regardless of earned functionality. Do not expose real receipts or use real payments during tomorrow's demonstration. Full UX-17/23/26, later workflow checks and operational recovery remain required for the complete release, not silently waived.

## Source and scope — DOC

- [ ] DOC-01 Original PPT and architecture JPEG inspected; their source requirements and future scope mapped.
- [ ] DOC-02 Team 11 versus filename Team 12 discrepancy tracked; no invented correction or public roll-number exposure.
- [ ] DOC-03 Single campus, exact verified `hitam.org`, 500 accounts, zero budget, GLM 5.3 and deadline recorded.
- [ ] DOC-04 Research links and access limitations preserved; candidate literature matches not presented as certain.
- [ ] DOC-05 Three modes modeled consistently; online gateway/mobile/multi-campus/AI remain future scope.
- [ ] DOC-06 Tomorrow's 70-point definition and later production gates remain separate, with no false progress claim.
- [ ] DOC-07 User research results have actual participant evidence or are marked pending; no fabricated quotes/metrics.
- [ ] DOC-08 Actual implementation route/schema/API documentation matches final behavior and known limitations.

## Environment and delivery — ENV

- [ ] ENV-01 Existing files, applicable instructions and user changes inspected before modifications.
- [ ] ENV-02 Actual GLM host/tools/model and accessible skills verified; unavailable tools are disclosed.
- [ ] ENV-03 React/Vite/TypeScript stack, supported versions and one package-manager lockfile recorded.
- [ ] ENV-04 Clean reproducible installation/build/typecheck/lint succeeds on the documented runtime.
- [ ] ENV-05 Application, test fixtures and execution evidence are organized in appropriate files.
- [ ] ENV-06 GitHub source connects to Cloudflare Pages; marketplace is not deployed on GitHub Pages.
- [ ] ENV-07 Supabase project/environment IDs and migration versions documented without secrets.
- [ ] ENV-08 No paid upgrade, domain purchase, SMS dependency or required runtime AI service introduced.
- [ ] ENV-09 Frontend artifact contains no secret/service-role key, OAuth client secret, receipt, export or source PPT.
- [ ] ENV-10 Local/test/live environments separated; synthetic accounts cannot access real production data.
- [ ] ENV-11 Deployed SPA supports direct nested-route navigation and refresh; errors route correctly.
- [ ] ENV-12 Actual deployment URL and revision verified; no guessed URL or “deployed” claim based only on build.

## Identity and membership — AUTH

- [ ] AUTH-01 Actual college Google account completes login; identity comes from the managed provider.
- [ ] AUTH-02 Backend requires confirmed exact normalized `hitam.org` email, not arbitrary substring matching.
- [ ] AUTH-03 Personal email, `fakehitam.org`, `hitam.org.evil.com`, unapproved subdomain and client spoof denied.
- [ ] AUTH-04 Workspace hosted-domain assurance uses trusted provider evidence; UI hint/editable metadata is insufficient.
- [ ] AUTH-05 Non-student/staff/alumni eligibility handled by approved membership policy, separately from email control.
- [ ] AUTH-06 Anonymous, pending, expired and suspended identities have the documented restricted permissions.
- [ ] AUTH-07 Wrong-domain auth identities, if created, have no campus data access or membership.
- [ ] AUTH-08 Sign-in cancellation, invalid callback, expired session and provider outage have honest recovery states.
- [ ] AUTH-09 Session restoration and sign-out work across refresh; logout clears private account caches.
- [ ] AUTH-10 Redirects are exact/allowlisted; malicious external next URLs cannot redirect users off-site.
- [ ] AUTH-11 Unused auth providers disabled; no public test login, account-role switcher or bypass flag.
- [ ] AUTH-12 Students cannot write their role, campus verification, enrollment approval or another account's profile.
- [ ] AUTH-13 MFA and least-privilege role assignment protect administrative entry points.
- [ ] AUTH-14 Role/membership revocation denies subsequent commands without relying solely on stale client/JWT claims.
- [ ] AUTH-15 Reverification/recovery paths cannot be satisfied merely by knowing a roll number.
- [ ] AUTH-16 Restricted returns, support and data rights remain possible after expiry/suspension without reopening the marketplace.
- [ ] AUTH-17 OAuth audience/scopes/college policy tested for intended users; no unsupported assumption about 100-user limits.
- [ ] AUTH-18 If OTP exists, custom sender and real delivery are verified; confirmation never disabled as a shortcut.

## Interface and inclusion — UX

- [ ] UX-01 Pulse and Calm have a deliberate, consistent visual system beyond a color-only placeholder.
- [ ] UX-02 Same core functions/navigation exist in both styles; neither is assigned by age or demographic inference.
- [ ] UX-03 First successful login shows equal-content previews with choose and skip options.
- [ ] UX-04 Skipping records onboarding complete; returning users do not repeat it.
- [ ] UX-05 Settings changes persist across refresh, sign-out/in and another device.
- [ ] UX-06 System/light/dark appearance is independent of Pulse/Calm; OS updates affect only System mode.
- [ ] UX-07 Reduced motion follows OS/user choice and does not remove required information.
- [ ] UX-08 Failed preference save provides retry and restores last confirmed value without losing drafts/session.
- [ ] UX-09 Initial paint avoids theme flash; changing accounts does not inherit previous private preferences/data.
- [ ] UX-10 Explore/Create/Exchanges/Inbox/Profile are reachable on mobile and desktop with clear labels.
- [ ] UX-11 At 320/390/768/1440px, no clipped core content or unintended horizontal scrolling.
- [ ] UX-12 Text zoom/reflow remains usable; sticky controls do not cover focused elements or error messages.
- [ ] UX-13 Every form input has visible label, help where needed, keyboard access and associated errors.
- [ ] UX-14 Dialog focus, escape behavior and focus restoration work; no keyboard traps.
- [ ] UX-15 All theme variants pass relevant text/non-text contrast; status is not conveyed by color alone.
- [ ] UX-16 Primary controls meet the 44px product target; dense elements meet relevant WCAG criteria.
- [ ] UX-17 Screen-reader flow covers login, search, listing, payment proof, request and typed handoff fallback.
- [ ] UX-18 Loading, empty, no matches, forbidden, stale, unavailable, failure and retry states exist on relevant screens.
- [ ] UX-19 Errors and network failure never silently produce demo data or success feedback.
- [ ] UX-20 Rental amount shows rate, duration and total; sale/loan wording cannot be confused.
- [ ] UX-21 Payment proof is labeled submitted/acknowledged; no bank-verification or escrow claim.
- [ ] UX-22 Photos have useful context/alt behavior, stable sizes and accessible non-drag reorder controls.
- [ ] UX-23 On-screen keyboards, date entry and touch interactions work on actual representative phones.
- [ ] UX-24 UI uses authorized/synthetic-labeled imagery; no fake reviews, scarcity, savings or active-user counts.
- [ ] UX-25 Unimplemented preview features are explicitly unavailable; no inert unlabeled action counted complete.
- [ ] UX-26 Formative usability targets evaluated with real participants or honestly pending; critical misunderstandings resolved.

## Data integrity — DATA

- [ ] DATA-01 Migrations apply cleanly to a disposable database and document upgrade/compatibility behavior.
- [ ] DATA-02 Parent-child campus relationships enforced; mismatched references fail at database boundary.
- [ ] DATA-03 One non-archived listing per asset and one mode per listing enforced.
- [ ] DATA-04 Money uses integer minor units/currency; negative/mode-invalid amounts rejected.
- [ ] DATA-05 Accepted participant, amount, listing and term snapshots cannot be rewritten through generic CRUD.
- [ ] DATA-06 State transitions validate expected version and actor; stale operations fail safely.
- [ ] DATA-07 Critical state/reservation/audit/outbox writes commit or roll back together.
- [ ] DATA-08 Repeated command key/payload returns original outcome; same key/different payload fails.
- [ ] DATA-09 Constraints still prevent duplicates after idempotency-record cleanup.
- [ ] DATA-10 Search/messages/jobs have measured indexes and bounded pagination; no unbounded dashboard query.
- [ ] DATA-11 Archival and de-identification do not cascade-delete active obligations or counterpart history.
- [ ] DATA-12 Reuse counts use completed non-duplicate exchanges; financial/CO₂ estimates are not invented facts.

## Listings and discovery — LST

- [ ] LST-01 Owner can create draft, validate, preview, submit and retrieve it after reload.
- [ ] LST-02 Required photo/category/condition/defect/mode/price/availability fields enforce consistent rules.
- [ ] LST-03 Forbidden categories/institutional property rules are visible and enforceable by moderation.
- [ ] LST-04 Unsupported, spoofed, oversized or decompression-heavy image input fails safely.
- [ ] LST-05 Server-approved media ownership/path validated; EXIF stripped and safe derivatives created.
- [ ] LST-06 Free photo limits, listing caps and storage-aware admission enforced on server, including concurrent uploads.
- [ ] LST-07 Abandoned uploads expire safely; finalized case/transaction media are not deleted accidentally.
- [ ] LST-08 Pending/rejected/hidden/draft items unavailable to unrelated members and search/count endpoints.
- [ ] LST-09 Same-campus users can browse published listings and use category/mode/condition/price/date filters.
- [ ] LST-10 Price filter/sort meaning is clear across sale/rental; no comparison between total and daily rate by accident.
- [ ] LST-11 Empty/no-results, pagination and stale-availability behavior are correct.
- [ ] LST-12 Only owner edits permitted fields; reserved terms/mode changes are blocked as specified.
- [ ] LST-13 Archive/pause does not erase reservations; hidden item history remains available to rightful participants.
- [ ] LST-14 Minimum approve/reject/hide operator workflow has role checks, reason and audit from the demo stage.

## Direct payment evidence — PAY

- [ ] PAY-01 Buyer/renter sees frozen amount/currency and explicit external-payment instructions.
- [ ] PAY-02 Only payer uploads proof for their own accepted paid transaction; free loans require no payment.
- [ ] PAY-03 Receipt media is private and physically/access-logically separate from listing media.
- [ ] PAY-04 Participant and assigned-case staff access tested; third user, other campus and unassigned moderator denied.
- [ ] PAY-05 Uploaded amount claim must match accepted terms; screenshot text is not treated as authoritative bank data.
- [ ] PAY-06 Proof type/size/pixel limits and maximum versions enforced; balances/unneeded details minimization explained.
- [ ] PAY-07 Proof submission never auto-acknowledges receipt or marks bank verification.
- [ ] PAY-08 Only payee can acknowledge/dispute the current proof version; payer/admin cannot impersonate payee.
- [ ] PAY-09 Replaced proof invalidates stale pending acknowledgement; previous decisions remain auditable.
- [ ] PAY-10 Duplicate upload/acknowledgement retries create one authoritative outcome.
- [ ] PAY-11 Wrong transaction/object path or canceled/ineligible-state submissions rejected.
- [ ] PAY-12 Seller denial creates a recoverable case; no automatic refund/penalty or fraud accusation.
- [ ] PAY-13 Network failures preserve pending state and never instruct automatic duplicate payment.
- [ ] PAY-14 Normal paid handoff requires proof plus payee acknowledgement; staff custody reconciliation preserves disputed payment.
- [ ] PAY-15 Proof retention/deletion/hold jobs respect policy and keep active-case material available.
- [ ] PAY-16 No proof or payment details leak through logs, analytics, notifications, public URLs, Git or test screenshots.

## Requests, booking and custody — TX

- [ ] TX-01 Self-request, inactive seller and unauthorized campus request fail server-side.
- [ ] TX-02 Sale request freezes a server-derived quote and expires under the documented clock policy.
- [ ] TX-03 Exactly one concurrent sale acceptance can reserve the asset; other callers get safe conflict.
- [ ] TX-04 Decline/withdraw/expiry closes only eligible requests; pending requests do not reserve inventory.
- [ ] TX-05 Cancellation before pickup releases hold and invalidates handoff tokens atomically.
- [ ] TX-06 Free loan and rental request dates enforce positive duration, lead time and horizon.
- [ ] TX-07 Rental uses integer daily rate with correct ceiling; fractional day/cross-midnight examples tested.
- [ ] TX-08 UTC storage/local display is consistent; no hidden date/time shift after refresh or device change.
- [ ] TX-09 Overlapping accepted rentals/loans fail at DB boundary, including direct API and concurrent calls.
- [ ] TX-10 Adjacent ranges respect the exact half-open interval and turnaround-buffer policy.
- [ ] TX-11 Changed listing price/version cannot silently alter an existing accepted deal.
- [ ] TX-12 Same asset cannot concurrently sell and rent through separate active listings.
- [ ] TX-13 Sale completion requires correct two-party pickup; loan/rental pickup enters active custody.
- [ ] TX-14 Post-pickup cancellation unavailable; return/extension/dispute is used.
- [ ] TX-15 Extension requires owner acceptance and new immutable terms, and rejects future booking overlap.
- [ ] TX-16 Overdue is derived without auto-return; future handoff blocked while item remains out.
- [ ] TX-17 Delayed future borrowers can cancel/reschedule with clear notification and history.
- [ ] TX-18 Return disagreement records actual owner receipt separately from condition dispute.
- [ ] TX-19 Dispute preserves participant/custody/term history; case resolution never fabricates payment or receipt.
- [ ] TX-20 Cancellation/expiry/finalization races produce a single valid final state with correct inventory.
- [ ] TX-21 Expired/suspended participant has audited support-assisted return without unrestricted contact.
- [ ] TX-22 Longitudinal two-account sale, free loan and paid rental flows pass without direct database hand editing.

## QR and condition evidence — QR

- [ ] QR-01 Challenges are random, scoped to actor/transaction/phase/version, hashed at rest and short-lived.
- [ ] QR-02 Raw challenges absent from logs, analytics, notification previews and persistent browser storage.
- [ ] QR-03 Wrong actor/campus/phase, canceled transaction and changed terms cannot redeem.
- [ ] QR-04 Expiry, replay, screenshot reuse and simultaneous redemption tested; one redemption wins.
- [ ] QR-05 Typed fallback is authenticated, session-scoped, rate-limited and expires with the QR.
- [ ] QR-06 Camera permission requested only when needed; denial and unavailable-camera routes work.
- [ ] QR-07 Scan redemption opens review; it cannot alone finalize custody or condition.
- [ ] QR-08 Two distinct participant acknowledgements required and bound to finalized evidence revision.
- [ ] QR-09 Editing evidence invalidates old acknowledgement; finalized evidence cannot be silently overwritten.
- [ ] QR-10 Return receipt and condition agreement remain distinct; photos not described as authenticity proof.
- [ ] QR-11 Offline confirmation never reports success; reconnect fetches authoritative state.
- [ ] QR-12 Staff-assisted reconciliation captures real statements/reason and cannot backdate a fabricated QR event.

## Messaging and notifications — MSG / JOB

- [ ] MSG-01 Conversation membership is contextual and same-campus; no unrelated/global inbox access.
- [ ] MSG-02 Messages persist before broadcast and have idempotent client IDs.
- [ ] MSG-03 Refresh/reconnect recovers missed messages in stable order without duplicate display.
- [ ] MSG-04 Realtime subscriptions enforce equivalent permissions and respond to membership changes.
- [ ] MSG-05 Block/report prevents new unwanted contact while preserving restricted active-case resolution.
- [ ] MSG-06 Text/links are safely rendered; chat is not falsely described as end-to-end encrypted.
- [ ] MSG-07 Unread state, empty state, sending/failure/retry and pagination behave correctly.
- [ ] MSG-08 Moderator chat access requires assigned case and access reason, with audit.
- [ ] JOB-01 Domain event and outbox job created in one transaction; failed mutation sends no success event.
- [ ] JOB-02 Worker entry points authenticated; bounded leases prevent overlapping duplicate work.
- [ ] JOB-03 Retries/backoff/dedupe and dead-letter handling tested with worker failure.
- [ ] JOB-04 Reminders recheck live transaction state; canceled/completed exchanges do not produce stale action alerts.
- [ ] JOB-05 In-app notifications are recipient-only and contain no secrets/private evidence links.
- [ ] JOB-06 Database command-time expiry remains correct even if scheduler is late or disabled.
- [ ] JOB-07 Run logs and retry records have bounded retention compatible with free database limits.
- [ ] JOB-08 Optional outbound email is deferred or verified through an actual configured sender; default SMTP not misrepresented.

## Trust and moderation — TRU / ADM

- [ ] TRU-01 Reviews require an eligible completed exchange and correct reviewer/reviewee pair.
- [ ] TRU-02 One review per actor/transaction; no self-review or unauthorized edit.
- [ ] TRU-03 Bilateral/deadline publication and open-dispute holds work as specified.
- [ ] TRU-04 New members receive neutral wording; average withheld below the distinct-counterparty threshold.
- [ ] TRU-05 Rating count/average and 90-day repeated-pair policy agree with stored eligible reviews.
- [ ] TRU-06 Rating is not a safety guarantee, credit score or automatic disciplinary decision.
- [ ] TRU-07 Hidden/appealed reviews have documented moderation reason and correct aggregate recalculation.
- [ ] ADM-01 Assigned campus roles control queues, identity review, listing actions and policies.
- [ ] ADM-02 Every moderation action has actor, time, reason and previous/resulting state.
- [ ] ADM-03 Proof, chat and condition evidence access limited to necessary assigned cases.
- [ ] ADM-04 Appeals retain history and use another authorized reviewer when available.
- [ ] ADM-05 Admin role changes require proper authority/MFA; last-admin loss and self-promotion prevented.
- [ ] ADM-06 Operators cannot fabricate student acknowledgements, settled payments, scan history or refunds.
- [ ] ADM-07 Blocked/suspended users retain a controlled support/return path.
- [ ] ADM-08 Published support hours and emergency contacts are real and owner-approved.
- [ ] ADM-09 Abuse report and prohibited-item removal available before real campus rollout.

## Security and privacy — SEC

- [ ] SEC-01 Every exposed table/view/function has reviewed grants and RLS or an explicitly restricted backend-only design.
- [ ] SEC-02 Direct Data API/RPC calls cannot bypass critical application workflow or role restrictions.
- [ ] SEC-03 Privileged functions restrict execution/search path and recheck actor/campus/operation internally.
- [ ] SEC-04 Secrets absent from source, build, browser requests/logs and exported evidence; rotation procedure documented.
- [ ] SEC-05 Object-ID substitution tested across listings, requests, proof, condition, messages, roles and notifications.
- [ ] SEC-06 Campus/user private data cannot leak through search counts, cache keys, realtime or storage metadata.
- [ ] SEC-07 Signed URL TTL and residual access after revocation documented/tested; no permanent public evidence URLs.
- [ ] SEC-08 Profile fields minimize contact/enrollment exposure; no public directory of full email/roll numbers.
- [ ] SEC-09 XSS payloads inert in listings, chat, reviews, errors and administration.
- [ ] SEC-10 Upload content validation enforces ownership, limits and safe processing independent of client checks.
- [ ] SEC-11 Rate limits protect costly/auth/proof/QR/chat actions at backend boundaries, including direct calls.
- [ ] SEC-12 CSP/security headers, safe URL handling and dependency configuration reviewed for deployed SPA.
- [ ] SEC-13 CORS is documented but not used as authentication or authorization.
- [ ] SEC-14 Known vulnerable dependencies/secret scan findings resolved or explicitly triaged; unavailable audit is not a pass.
- [ ] SEC-15 Logs exclude tokens, full email where unnecessary, chat text, receipt data and QR values.
- [ ] SEC-16 Privacy notice, policy versions, operator and applicable launch obligations reviewed; no generated compliance guarantee.
- [ ] SEC-17 Account export requires correct actor/re-authentication and produces scoped expiring private output.
- [ ] SEC-18 Deletion and retention with case holds tested; cleanup cannot leak or erase needed active evidence.
- [ ] SEC-19 Minors/age eligibility decision explicitly resolved before collecting real student data.
- [ ] SEC-20 Provider outages never switch production to fake/demo responses or ignore failed writes.

## Performance and capacity — PERF

- [ ] PERF-01 500-account data assumptions measured against real schema/index/job growth.
- [ ] PERF-02 Listing thumbnails, detail photos and private proof sizes measured; no raw 5MB feed images.
- [ ] PERF-03 Separate DB, storage, cached/ordinary egress and function usage limits recorded from actual project.
- [ ] PERF-04 Search and dashboards profiled on representative data with appropriate query plans.
- [ ] PERF-05 Controlled 25-session/5-RPS test records duration/region/throughput/p95/errors and allowed provider scope.
- [ ] PERF-06 Hot-item concurrency tests validate final integrity separately from general throughput.
- [ ] PERF-07 Slow network, retries, cold starts and image failure tested on core mobile journeys.
- [ ] PERF-08 Laboratory LCP/CLS/interaction measurements reported honestly; field p75 metrics remain pending until enough observations.
- [ ] PERF-09 Performance work retains privacy, correct authorization, image legibility and accessible behavior.
- [ ] PERF-10 500 registered students is never reported as evidence of 500 concurrent supported sessions.

## Operations and release — OPS / REL

- [ ] OPS-01 Named campus owner, technical maintainer, moderation contact and backup maintainer accept responsibility.
- [ ] OPS-02 Real enrollment, prohibited-item, receipt/condition retention, age and support policies recorded.
- [ ] OPS-03 Quota warning/restriction thresholds and no-paid-upgrade policy configured and rehearsed.
- [ ] OPS-04 Database and storage objects both included in recovery procedure; keys/access are protected.
- [ ] OPS-05 Actual restore drill verifies records, roles, proof/condition bytes and file links in isolated environment.
- [ ] OPS-06 Measured RPO/RTO and free-tier limitations reported; aspirational targets not claimed achieved.
- [ ] OPS-07 Frontend rollback and compatible schema forward-fix path rehearsed; no live DB reset shortcut.
- [ ] OPS-08 Incident triage for exposure, double booking, OAuth outage, quota exhaustion and late returns documented.
- [ ] OPS-09 Log/receipt/job cleanup, membership reverification and abandoned media retention are assigned and tested.
- [ ] OPS-10 Student project handover/credential ownership survives graduation; no dependence on one private account only.
- [ ] OPS-11 Legitimate inactivity pause behavior and recovery procedure understood; no quota-evasion workarounds.
- [ ] OPS-12 Adoption/reuse/support metrics have defined denominators and exclude synthetic data.
- [ ] REL-01 Full core sale/loan/rental/payment/QR flows tested on the actual release revision and deployed environment.
- [ ] REL-02 No unresolved critical/high confidentiality or transaction-integrity issues; other risks explicitly dispositioned.
- [ ] REL-03 Browser/accessibility/performance evidence current after the last relevant change.
- [ ] REL-04 Controlled pilot completed with actual participants/consent and issue outcomes, or launch remains blocked.
- [ ] REL-05 Operator/policy/hosting/identity prerequisites resolved before broad real-data rollout.
- [ ] REL-06 Release manifest records URL, source revision, migrations, feature states, rollback and known limits.
- [ ] REL-07 Authorized launch receives immediate smoke tests and staffed initial observation.
- [ ] REL-08 No fake user counts, “100% accuracy,” payment guarantee, carbon savings or unsupported production-ready claim.
- [ ] REL-09 Future features are separately gated by evidence; generator has not silently added them.
- [ ] REL-10 Post-launch reviews scheduled by an actual owner/tool or explicitly pending; no fictional monitoring results.

## Minimum two-account rehearsal

Use two consenting HITAM test accounts and one denied outsider; use synthetic items and receipt images. Do not transact real money during rehearsal.

1. A signs in, chooses Pulse; B signs in, skips to Calm. Reload, change style in Settings and verify account separation.
2. A posts a sale listing; authorized operator publishes; B finds it; outsider cannot browse or see its media.
3. B requests; A accepts; a concurrent C request cannot claim the same asset. B uploads synthetic proof; unrelated user cannot download it; A acknowledges.
4. For tomorrow stop here with pickup labeled unavailable. For full scope, both complete pickup and then submit eligible reviews.
5. Repeat with a free loan: no payment screen; choose dates; reject overlapping acceptance. Complete pickup, accepted extension, return and condition disagreement case during full testing.
6. Repeat paid rental: total correct, receipt private, seller acknowledgement required, QR replay denied, overdue never auto-returns the item.
7. Switch network off during a critical action. Confirm no false success; reconnect and verify actual server state with no duplicate effects.
8. Suspend a participant; ensure new activity stops while existing obligation can be safely resolved with staff.

Preserve test outcomes with redacted traces and final database state. A narrated walkthrough without executed behavior is not a pass.
