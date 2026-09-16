# Delivery, operations and future scope

All estimates are planning ranges. The user has confirmed zero hosting/database budget and a 70% milestone by 17 September 2026. The deadline plan in document 08 governs tomorrow; this document governs the work after the demonstration. Production readiness requires functioning software, real checks, policies and operators, not just a percentage.

## 1. Delivery stages and accountable roles

The PPT names four students; this plan does not assume their availability or assign them responsibilities without agreement. One person may fill multiple roles, but every responsibility needs an owner.

| Role | Responsibility | Backup requirement |
|---|---|---|
| Product/campus owner | Eligibility, prohibited items, dispute policy, pilot recruitment and release decision | A campus contact who can approve continuity decisions |
| Technical maintainer | Schema, auth, transaction integrity, deploy and incident repairs | Another person with documented recovery access |
| Experience/QA owner | Both themes, usability, browser/device tests and acceptance evidence | Someone who can replay the core test journeys |
| Moderation/support operator | Reports, verification, return issues and appeals | Coverage during absences/exams/holidays |

An AI generator helps implement and test; it is not the accountable operator, bank, legal reviewer or permanent incident responder.

| Stage | Proposed duration after prerequisites | Exit |
|---|---|---|
| Tomorrow's functional demonstration | 14–22 focused person-hours; high risk if setup delayed | P08 evidence and actual 0–70 score |
| Remaining core functionality | Roughly 4–8 focused development days | P09–P11 complete sale/loan/rental/custody/chat/cases |
| Security, UX and operational hardening | Roughly 4–8 focused days, plus external wait time | P12–P14 technical evidence and successful restore |
| Controlled pilot | At least 7–14 calendar days to observe real exchange cycles | Pilot issues assessed; no major exposure/integrity failures |
| Wider campus rollout | Staged over roughly 1–2 weeks after approval | Capacity, support and eligibility controls hold |
| Ongoing maintenance | Weekly/monthly responsibilities | Current versions, policies, quotas and recovery evidence |

Ranges overlap where independent work is possible, but user interviews, real returns and pilot observation cannot be truthfully accelerated by generating more tokens. Exams, campus permission, Google OAuth policy and provider setup can dominate elapsed time.

## 2. Zero-budget operating envelope

The baseline is Cloudflare Pages Free + Supabase Free + Google OAuth + in-app notifications, using provider subdomains. Use actual quota readings and the calculations in document 08. Do not purchase a domain, enable paid transformations, use SMS, add a paid monitoring service or silently move to Pro.

Free resources can support a bounded campus experiment, not an unlimited service promise. 500 accounts is a reasonable planning scale for modest records; activity and image traffic determine feasibility. If quotas approach exhaustion, reduce new invitations/uploads, optimize payloads and seek institutional sponsorship. Preserve ongoing exchange access and evidence. Do not delete active receipts/cases or shard accounts across free projects to evade limits.

**Possible later funded route:** paid managed database/hosting and automated recovery if institutional sponsorship is approved. Published base prices reviewed were Supabase Pro $25 and Vercel Pro $20, but that is not a full quote and Vercel is not required for the chosen SPA. Extra environments, compute, usage, taxes and seats change totals. No purchase is part of this plan. [Supabase pricing](https://supabase.com/pricing), [Vercel pricing](https://vercel.com/pricing).

## 3. Pilot design

Start with 20–30 verified participants and 30–50 permitted listings in 2–3 categories. Obtain campus authorization and publish staffed support hours. Use actual listing-owner permission; do not preload people's possessions or invent reviews. Early categories should be selected from local research, with books/calculators/safe study accessories as hypotheses.

1. First run staff-observed synthetic exchanges and negative permission cases.
2. Invite the pilot cohort only after identity, proof privacy, booking and handoff controls pass.
3. For real direct payments, explain that the seller independently checks receipt; the platform does not guarantee goods or refunds.
4. Observe request creation, acceptance, proof submission, handoff and scheduled return across real days.
5. Review issues daily during staffed hours. Capture time-to-resolution, abandoned flows and user comprehension.
6. Expand to 100, then approximately 500 registered students only after quotas, workload and moderation capacity support it. Enrollment size is not a promise of simultaneous capacity.

Proposed pilot go/no-go: zero known cross-user proof/chat exposure; zero unresolved double-booking/custody defects; all observed critical failures fixed and replayed; every unresolved overdue case has an operator; no hidden provider quota breach. Report raw counts and small-sample limitations. Low demand is an outcome to investigate, not something to cover with synthetic activity.

## 4. Metrics and their interpretation

| Metric | Definition | Decision it supports |
|---|---|---|
| Activation | Verified eligible members who view listings or publish/request within seven days / newly verified eligible members | Whether login/onboarding blocks value |
| Supply usefulness | Active listings by category with at least one valid request / active listings in that category | Which categories need more supply or clearer demand |
| Request conversion | Accepted valid requests / valid submitted requests, with expiry/cancellation reasons separate | Owner responsiveness and matching friction |
| Completion | Completed exchanges / accepted exchanges whose scheduled completion date has passed | Workflow health; exclude not-yet-due activity |
| Return reliability | Loans/rentals acknowledged returned by due time / those due in the period | Return friction, not an automatic personal punishment score |
| Payment-evidence friction | Paid requests with proof accepted by payee; time and disputed/unreadable counts | Whether receipt steps confuse or obstruct users |
| Safety workload | New cases, oldest unassigned case, open overdue cases and repeat confirmed incidents | Staffing capacity and rollout limits |
| Theme usability | Choose/skip rates, settings changes, task success and onboarding abandonment | Whether two styles help; preference alone is not usability |
| Resource reuse | Distinct physical assets with completed recirculation, plus separately counted loan cycles | Honest observed impact |
| Estimated savings | Participant-reported comparable alternative minus agreed amount, with method/date | Directional self-reported benefit; not audited cash savings |
| Capacity | Active sessions, latency/error rates, DB/media/egress and job backlog | Whether the free envelope can sustain growth |

Use privacy-minimal aggregated analytics; exclude receipt contents, private conversations, full student emails and raw authentication data. Do not send sensitive activity to third-party session replay by default.

## 5. Recovery and data lifecycle

Proposed pilot targets: recovery point within 24 hours and recovery time within 8 staffed hours. These are goals requiring a successful drill and actual owner coverage, not free-provider guarantees. If only manual weekly copies exist, disclose that larger loss window and do not claim a daily RPO. More demanding future targets require funded infrastructure and staffing.

Supabase database backups do not include stored object bytes. Maintain an object manifest and separate approved copies of required media, including private receipts and finalized condition evidence. Protect copies with encryption, least-privilege access and retention. [Supabase backup guidance](https://supabase.com/docs/guides/platform/backups).

The restore drill must recover database roles/grants/policies, auth configuration dependencies, transaction states, term revisions, payment decisions, receipt/condition images and application secrets through approved secret recovery. Reconnect media using the manifest and verify samples/checksums. Test in isolation so restored jobs do not send real notifications. Record backup time, restore duration, missing data and who performed it.

Proposed retention table — requires operator/legal review before real-data launch:

| Data | Default proposal | Exception |
|---|---|---|
| Abandoned upload staging | Delete after 24 hours if unreferenced | In-progress uploads protected with bounded lease |
| Ordinary closed-exchange receipts | 90 days after closure | Active dispute/justified hold with review date |
| Closed-exchange condition evidence | 90 days after closure | Active claim/return issue under policy |
| Chat | 90 days after conversation closure | Scoped case hold |
| Diagnostic logs | 14 days, sensitive fields redacted at source | Retain minimum incident evidence under controlled policy |
| Job execution details | 7–14 days for successful runs | Keep bounded failure summaries until resolved |
| Audit summaries | Proposed 180 days with minimal personal detail | Confirm applicable institution/legal requirement |
| Account identity | While eligible/active plus necessary account closure handling | De-identify under approved rights/retention process |
| Recovery copies | Proposed rolling 7 daily/4 weekly copies if feasible on owned storage | Erasure propagation and legal holds explicitly handled |

These are product proposals, not statutory retention requirements. MeitY's official portal lists the DPDP Rules, corrigendum and phased enforcement materials; applicable duties and launch dates must be reviewed for this operator. Do not imply all provisions have the same effective date. [Official DPDP Rules index](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025).

## 6. Incident runbooks

| Incident | Immediate action | Recovery and evidence |
|---|---|---|
| Receipt/chat exposure | Restrict affected read paths; stop invitations; preserve redacted incident evidence; notify accountable operator | Fix policy/grants, invalidate URLs where possible, assess scope and required notifications, retest all identities |
| Double booking or custody corruption | Disable new acceptance/handoff for affected asset or function | Inspect immutable events, reconcile with participants/operator, fix invariant and replay race test |
| OAuth outage/college app block | Show honest sign-in failure and support route; do not bypass verification | Check provider status/config/policy, restore callback access, test real accounts |
| Storage/egress nearing quota | Restrict new uploads/invitations before failure; preserve existing obligations | Remove only expired unreferenced objects, optimize sizes, publish capacity limits |
| Supabase pause/outage | Present unavailable state; never pretend writes succeeded | Resume/restore through provider tools; reconcile pending commands with idempotency |
| Proof mismatch/external refund claim | Open case; no automatic accusation or refund promise | Request minimal relevant statements; seller checks their payment app; record case outcome |
| Late/unreturned item | Notify involved parties using scoped channels and operator workflow | Resolve physical custody and future bookings; no automated payment penalty |
| Lost sole administrator access | Use protected documented recovery ownership | Restore access with audit and rotate compromised credentials; no hidden superadmin password |

Severity and response expectations must fit actual staffing. The student team cannot promise 24/7 emergency response without providing it. Clearly direct immediate physical safety concerns to real campus/emergency contacts once confirmed.

## 7. Maintenance and handover

- Daily during pilot: inspect error/permission alerts, due/overdue items, proof disputes, moderation queue and quota usage.
- Weekly: review failed jobs, storage retention, actual demand, dependency advisories and backup completion. Test one critical flow after changes.
- Monthly: restore sample data/media, review operator access and policy exceptions, assess use versus quotas and update supported browsers.
- Each academic term/year: reverify membership, remove graduated operators, hand over source/provider ownership and test account recovery.
- Before every release: reviewed migrations, targeted regression evidence, compatibility/rollback plan and exact deployment manifest.
- When team members leave: revoke unnecessary access, rotate shared secrets through approved tools and appoint a maintainer before adding features.

No recurring automation has been created by this planning task. Assign these tasks to actual people or explicitly configure a scheduler later.

## 8. Future scope — invest only after a trigger

| Priority | Capability | Evidence trigger | Dependencies / main risk | Acceptance before enabling |
|---|---|---|---|---|
| 1 | Better course/edition discovery | Repeated failed searches for equivalent study materials | Clean taxonomy; duplicate/ambiguous editions | Search success improves on observed queries without scope leaks |
| 1 | Improved return scheduling and calendar reminders | Missed-return cases reflect scheduling friction | Notification permissions and reliable jobs | Reminders accurate, opt-in, deduplicated and within quota |
| 1 | Telugu/Hindi interface | Local research shows language-related task failures | Human-reviewed translations and fonts | Critical terms/amounts understood; no machine-translated policy mistakes |
| 2 | Installable PWA and optional push | Repeat mobile use and notification demand | Browser support, permission UX, secure cache design | No offline false confirmation or private cached data after logout |
| 2 | Library/lab-managed inventory | Explicit institutional request and ownership process | Separate staff/inventory policy and safe equipment scope | Staff circulation does not weaken student marketplace permissions |
| 2 | More active listings / richer media | Demand reaches free storage/egress limit | Sponsorship or measured storage design | Capacity and retention verified; no hidden paid upgrades |
| 3 | Native mobile application | PWA cannot meet demonstrated camera/push/accessibility requirements | App-store accounts, distribution, ongoing maintenance | Feature parity and device tests; deployment budget approved |
| 3 | Multiple campuses | A second campus has an accountable sponsor | Tenant policies, moderation teams, isolation migration | Cross-tenant negative tests, data export and operator scope verified |
| 3 | Payment gateway | Strong need for platform-managed payment, eligible operator and funding | Provider approval, seller onboarding, settlement/refund model | Signed events, reconciliation, refunds, duplicate/out-of-order delivery and real operator readiness |
| 4 | AI-assisted listing text/category | Listing friction persists after simple form improvements | Privacy, inference budget, evaluation and human control | Grounded suggestions; no invented condition, ownership or payment proof |
| 4 | Recommendations | Enough consented interactions to evaluate against basic sorting | Cold start, bias, evaluation data and cost | Offline/online benefit over simple baseline with privacy checks |
| 4 | Image-assisted condition guidance | Repeated unclear photos despite guided capture | Suitable dataset, consent and model evaluation | Advice only; never automatic damage or liability adjudication |
| 4 | Environmental impact estimates | Campus needs defensible measured impact | Lifecycle method, transport/rebound assumptions and review | Transparent uncertainties; no unsupported CO₂ claims |

Future research must revisit current competitors, provider terms and technical standards. The generic architecture boxes in the PPT do not justify every service today.

## 9. Sustainability of the project itself

The largest long-term risk is maintenance after the academic submission. If no operator remains, stop accepting new exchanges, resolve open obligations, provide account/export support, notify users through authorized channels and archive/de-identify data under policy. Remove public access and provider secrets only after the approved retention/recovery requirements are handled. A graceful closure plan is part of responsible production ownership.
