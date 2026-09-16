# Tomorrow's milestone, GLM 5.3 and zero-budget deployment

Target date: 17 September 2026, Asia/Kolkata; exact presentation time is unknown. This is a compressed delivery plan with a high risk of incomplete work, especially if OAuth/provider setup is delayed. A measured 70-point functional milestone is possible to pursue; completion cannot be promised before implementation exists.

## 1. GLM 5.3 — verified facts and practical prompting

The official [Z.ai GLM-5.3 model card](https://huggingface.co/zai-org/GLM-5.3) identifies it as a text-generation model focused on coding and long tasks, reports coding/tool benchmarks, and documents reasoning-effort values `low`, `high`, `max`, with `max` the stated default. These are provider-reported capabilities, not a test of your installation. The separate Flash variant is not interchangeable with the requested model. We do not transfer GLM-5's context limits to GLM-5.3 or treat benchmark context settings as your provider's available context.

Use your existing GLM-5.3 service; do not host the model as part of this student application. Its usage entitlement/cost is separate from free application hosting. No AI inference is required by the marketplace at runtime.

| Work | Suggested setting if supported by your provider | Prompt technique |
|---|---|---|
| Schema, authorization, booking and payment-proof rules | High; max for difficult unresolved correctness issues | Provide invariants, adversarial examples and a narrow acceptance gate |
| UI components and straightforward wiring | Low or high depending on failures | One screen family, shared tokens, exact states and checks |
| Final security/transaction audit | High or max | Require reproduction and evidence, not agreement with previous claims |

Settings are suggestions, not required tool calls or guaranteed provider parameters. P00 must record model identifier, coding app, filesystem/shell/browser capabilities, provider limits and available skill files. Model ability alone does not grant repository access. Do not paste all 16 phases into one giant generation. Keep a repository checkpoint after each passing phase; use the resume prompt in a new context.

Text-only model access may not inspect PPT images or screenshots by itself. Provide this pack's extracted requirements and visual specification; use a host-provided vision/browser tool only if actually available. Report visual review as blocked if no human or capable tool inspected it.

## 2. What “70%” means here

The weights below are a project reporting convention. They measure completed functional milestone groups, not lines of code, development effort, security coverage or production readiness. No points for placeholder buttons, localStorage substitutes for the database, screenshots without behavior or fake auth.

| Group | Points | Evidence needed to earn the group |
|---|---:|---|
| Foundation, migrations and deployment plumbing | 10 | Reproducible build, documented free environment, schema and core RLS/permissions tested |
| Exact HITAM sign-in and profile | 10 | Actual verified college Google account; wrong-domain denial; protected data; safe session handling |
| Responsive Pulse/Calm UI and preferences | 10 | First-login choose/skip, settings change, persistence, mobile navigation and keyboard checks |
| Listing, media and search | 15 | Create/edit/publish/browse/filter real stored item; upload limits; basic operator hide action |
| Sale request and direct-payment evidence | 15 | Two real test identities; request/accept, private proof upload, seller acknowledge/dispute, cancellation and record history |
| Loan/rental request and availability | 10 | Dates/rates, server quote, accepted reservations, overlap rejection and active obligation view |
| QR pickup/return and complete custody workflow | 8 | Two-party, replay-safe handoff and condition/custody tests |
| Contextual chat and durable notifications | 5 | Participant-only persisted messages, retry/reconnect and correct events |
| Complete trust and moderation workflows | 7 | Eligible reviews, sample counts, case management, appeal and role checks |
| Production verification and operations | 10 | Security/accessibility/performance tests, recovery drill, pilot evidence and accountable operator |
| **Total** | **100** | All evidence recorded against exact revision and environment |

Tomorrow's intended milestone is the first six groups: **70/100**. UI can show later transaction phases as “Not available in this preview,” with disabled actions and clear explanation. It must not mark unimplemented QR, chat or return behavior complete. The 70-point build is a controlled demonstration, unsuitable for unsupervised real borrowing or payments. Use synthetic listings/proof images and consenting test accounts; no student should pay for a demo.

Within each group track checklist items. Credit the group only when its stated evidence exists; if incomplete, show the missing items and do not round upward. Production guards for any exposed data are mandatory even in a demo. An auth or proof-privacy failure blocks external exposure irrespective of point total.

## 3. Timeboxed path to tomorrow

This is approximately 14–22 focused person-hours assuming accounts, tooling and OAuth are available; elapsed duration depends on GLM speed, API limits and repairs. It is not a delivery commitment. With fewer hours, preserve a smaller honest demonstration.

| Time allocation | Work | Stop condition |
|---|---|---|
| 0–1 h | P00 scope/tool audit; GitHub/Cloudflare/Supabase/Google project ownership; choose one stack | No actual model/tool access or provider account: record blocker immediately |
| 1–3 h | P01 design brief; P02 core migrations/RLS; P03 OAuth spike | Prove login and wrong-domain denial early; no full UI polishing before this |
| 3–6 h | P04 reusable interface, onboarding and settings | Shared tokens and persisted preferences; no duplicate themed apps |
| 6–10 h | P05 listings/media/search and minimal campus operator controls | Real database and safe uploads; no fake feed counted |
| 10–14 h | P06 sale request and private proof lifecycle | Two-account test including receipt privacy and seller denial |
| 14–17 h | P07 rental/loan requests, quotes and booking conflicts | Invalid overlap denied at database boundary |
| Final 2–5 h | P08 deploy, browser checks, demo rehearsal and report | Freeze features; fix only blockers; report actual points |

P00–P08 are the tomorrow path. P09–P15 finish the remaining workflows and production assurance afterward. Discovery interviews and full pilot evaluation continue after the academic demonstration; mark them pending, not fabricated.

If identity setup is blocked for more than roughly 60–90 minutes, continue local/synthetic UI and database tests. Do not turn off verification or claim deployed auth. The handover must then say “local demo, authentication blocked,” with points withheld. If the deadline is a morning session, the full 70-point target may be infeasible from the current starting state.

## 4. Free deployment recommendation

| Component | Choice | Verified basis and limits |
|---|---|---|
| Source and collaboration | GitHub repository | Source hosting; actual user files and secrets remain outside Git |
| Frontend hosting | Cloudflare Pages Free, provider `pages.dev` address | Official free tier includes static requests/bandwidth and 500 builds/month; functions have separate limits |
| UI runtime | React + Vite + TypeScript | Static build; no Node server needed on Pages |
| Database/auth/files | Supabase Free | Current published limits: 500 MB database, 1 GB file storage, 50,000 MAU, 5 GB ordinary egress and 5 GB cached egress; projects can pause after a week of inactivity |
| Backend | Supabase SQL/RPC; small Edge Functions only where needed | Free plan constraints apply; Edge Functions have bounded CPU/memory and must not do large image processing batches |
| Identity verification | Google OAuth for actual college Google accounts | No application-sent OTP dependency for this route; consent and college policies still apply |
| Notifications | In-app first | No paid SMS or email sender required for baseline marketplace notifications |
| Scheduled reminders | Supabase Cron if available/configured in project | Small database jobs with bounded run-log retention; keep command-time expiry checks even if jobs lag |
| Domain | Provider subdomain | No domain purchase; a HITAM subdomain would require campus DNS authority |
| Backup copies | Operator-managed encrypted copies on existing owned storage | Operational work required; no claim that free tier supplies production PITR |

Sources: [Cloudflare Pages](https://www.cloudflare.com/products/pages/), [Pages limits](https://developers.cloudflare.com/pages/platform/limits/), [Supabase pricing](https://supabase.com/pricing), [function limits](https://supabase.com/docs/guides/functions/limits), [Supabase Cron](https://supabase.com/docs/guides/cron). Checked 16 September 2026. Recheck actual account quotas before setup. Free today does not mean unlimited or permanently guaranteed.

**GitHub clarification:** GitHub Pages is static hosting and its published restrictions exclude sites primarily facilitating commercial transactions; it also warns against sensitive transactions. Use GitHub as the source repository connected to Cloudflare. [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

**Why not default to Vercel:** a Next.js deployment is unnecessary for this application, and Hobby eligibility is restricted to personal/non-commercial usage. Cloudflare static hosting avoids that architectural dependency. We are not purchasing Pro or adding paid services. [Vercel Hobby terms](https://vercel.com/docs/plans/hobby).

## 5. Is the free database enough for 500 students?

Likely for basic records, subject to actual schema/index/log size. Media and repeated downloads are the tighter limits. This is a sizing calculation, not a provider performance guarantee.

| Planning example | Approximate size |
|---|---:|
| 500 profile/membership/preference records at an assumed combined 5 KB per student | 2.5 MB before indexes and auth overhead |
| 500 listing records at assumed 4 KB | 2 MB before indexes |
| 2,000 transactions at assumed 8 KB | 16 MB before related events/indexes |
| 10,000 messages at assumed 1 KB | 10 MB before indexes |
| 500 listings × 3 photos × 250 KB | 375 MB media |
| 500 current receipt images × 500 KB | 250 MB media |
| 150 completed loans × 4 condition images × 250 KB | 150 MB media |
| **Example media subtotal** | **775 MB**, leaving limited space for thumbnails, corrections and pending files |

Database storage assumptions omit overhead intentionally; measure actual size and reserve room for auth, indexes, audit, jobs and migrations. Do not promise a specific final database footprint. Proof history and thumbnails can push the example above 1 GB; enforce quotas before uploads, clear abandoned staging objects, and run lawful retention jobs.

Bandwidth example: 500 students × 20 full-size photos/day × 250 KB × 30 days ≈75 GB/month, far beyond the ordinary free allowance. A lighter pattern of 100 daily users × 10 thumbnails × 50 KB × 30 ≈1.5 GB before detail images/API traffic. This is why thumbnail use, bounded pagination, demand measurement and access-aware caching matter. Cloudflare's static bandwidth allowance does not make private Supabase image delivery free or unlimited. Cached and ordinary Supabase allowances are distinct meters; do not assume every private read is cached.

Operational caps: monitor at 60%, warn at 75%, restrict new uploads at 85% of storage while preserving downloads and active obligations; use quota checks and cleanup to avoid filling the final reserve. At 80% of a monthly egress allowance, reduce image payloads and new-user invitations. A zero-budget ceiling means pausing growth if legitimate usage exceeds limits, not silently upgrading, deleting open-case evidence or creating extra accounts to evade quotas.

## 6. Google sign-in setup and verification plan

Public DNS lookup performed here: `hitam.org` MX → `smtp.google.com`, preference 1. This supports Google mail routing; it does not prove every student can use this OAuth app or authorize us to administer the domain.

1. The project owner creates/chooses a Google Cloud project and OAuth web client. Use only basic identity scopes: openid, email and profile. Do not request Gmail inbox, Drive or contacts.
2. Configure appropriate audience and support information. A student-owned project may use an external audience; “Internal” requires the relevant Workspace organization. College administrators may block untrusted third-party OAuth applications.
3. Add the exact Supabase OAuth callback URI to the Google client and put the Google client secret only in Supabase provider settings. Never into Vite environment variables or GitHub public files.
4. Configure the exact production `pages.dev` URL and known local callback URLs in Supabase redirects. Do not add a broad wildcard for production previews; use controlled test project redirects instead.
5. The backend checks trusted provider identity, confirmed normalized email domain `hitam.org`, current membership and enrollment approval. For Google Workspace assurance, validate the hosted-domain claim from a provider-verified source. Never trust a user-editable metadata field or the front-end `hd` hint. If the SDK does not expose trusted claim provenance, keep the member pending until a supported verified-claim path or approved enrollment confirmation is implemented; do not invent an API field.
6. Disable unused email/password/anonymous providers. Reject unsupported-domain registration through supported auth controls where available; regardless, an accidental identity-provider account must obtain no campus membership or data access. Verify role changes cannot be written through user metadata.
7. Test with two consenting real `@hitam.org` accounts and one personal Google account. Check first login, returning login, sign-out, cancellation, token expiry and redirected deep links. Test spoofed domain strings in backend inputs without creating fake external identities.

Sources: [Supabase Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google), [Google backend identity validation](https://developers.google.com/identity/sign-in/web/backend-auth). Google warns that verified third-party email without a hosted-domain claim may not establish current ownership; the domain hint alone is not access control.

Google audience/testing behavior has exceptions for basic identity scopes. Do not repeat a blanket “100-user maximum” claim without checking the actual app scopes/status and institution policy. [Google OAuth state and readiness](https://developers.google.com/identity/protocols/oauth2/production-readiness/overview).

If OAuth fails, do not assume Supabase's default SMTP can email 500 students: current documentation says it is restricted to project-team addresses with very low limits. A custom sender may require domain control or provider approval, so it is not a guaranteed zero-cost overnight fallback. [Supabase SMTP limitations](https://supabase.com/docs/guides/auth/auth-smtp).

## 7. Deployment sequence for the generator

P08/P14 must turn this into current, exact provider instructions based on the actual account state; no configuration is already done by this planning task.

1. Verify source is in the correct GitHub repository with secrets, source attachments containing student details, receipts, exports and test accounts excluded from public deployment artifacts.
2. Provision only free Supabase resources. Apply reviewed migrations to a known clean development project, inspect grants/RLS, configure private buckets and auth. Never reset a populated remote project.
3. Create a Cloudflare Pages Git integration for the repository. Set the supported runtime, build command and Vite output directory. Add only intentionally public frontend environment values. Configure SPA deep-link behavior and security headers.
4. Configure Supabase Edge secrets separately and deploy only needed functions. Authenticated commands must verify tokens even when invoked outside the frontend. Document CORS but never rely on it as authorization.
5. Configure exact auth callbacks, then verify real login on the deployed URL, direct refresh on nested routes, private evidence permissions and data persistence across devices.
6. Record actual URL, deployment ID, source revision, migration version, date and free-tier quota state. Do not invent a preview URL before the provider returns one.
7. Rehearse rollback to the previous frontend build. Database rollback uses compatible forward fixes or restore; rolling back the frontend does not automatically undo schema changes.

No live deployment or provider account creation was performed while preparing this pack.
