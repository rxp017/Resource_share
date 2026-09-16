# Route and screen map

SPA routes; all deep links must survive direct reload after deploy (ENV-11). Auth guard column: Public / Member (active verified) / Pending-restricted / Participant / Operator. State legend: L=loading skeleton, E=empty, Er=error+retry, F=forbidden, X=expired/stale, U="Not available in this preview" (disabled + explained). Every route implements L/E/Er plus the listed specifics (UX-18).

| Route | Screen | Guard | Core content (hierarchy) | Specific states | Checks |
|---|---|---|---|---|---|
| / | Public overview | Public | What it is, eligibility, 3 modes, exchange steps, sign-in CTA, accessibility statement | Er (outage), campus-not-accepting notice | UX-24 |
| /login | Sign in | Public | Google college-account button, eligibility notice, help link | wrong-domain denial, consent canceled, callback failure, session expiry; ?next= allowlisted same-origin only | AUTH-01..10 |
| /verify | Verification status | Pending-restricted | Pending/approved/expired/declined state, next action, preferences entry | manual review unavailable, domain unsupported | AUTH-05/06, UX |
| /onboarding | First-login style choice | Member (once) | Equal Pulse/Calm previews, appearance, Continue + Skip | save failure keeps choice locally + retry; interrupted onboarding resumes | UX-03/04/08 |
| /explore | Explore feed | Member | Search, mode/category/condition/price/date filters, result cards with exchange strip | E (no inventory), no-matches + reset, Er outage; price filter splits sale amount vs daily rate | UX-10/11, LST-09/10/11 |
| /listings/:id | Listing detail | Member | Photos, defects, mode + amount/rate, availability preview, pickup zone, owner trust summary, request CTA | removed/reserved/unavailable, owner view, stale price | LST, TX dates=preview only |
| /listings/:id/request | Request form | Member | Mode, immutable server quote preview, dates/time, pickup zone, note | own item (F), overlap warning, inactive seller, outdated version | TX-01..07, UX-20 |
| /listings/new, /listings/:id/edit | Create/edit listing (guided) | Member | photo -> details -> terms -> preview -> publish | upload retry, validation errors, draft recovery, moderation rejection reason | LST-01..06, UX-13 |
| /my/listings | Own listings | Member | drafts, pending moderation, active, paused, archived + edit rules | E; edit conflicts with reservations | LST-12/13 |
| /exchanges | My exchanges | Member | tabs: incoming, outgoing, upcoming, in progress, history + deadlines | E per tab, request expired, overdue, disputed | TX, UX-10 |
| /exchanges/:id | Exchange detail (receipt) | Participant | state timeline, frozen accepted terms, participant actions, payment-evidence panel, chat link (U until P10), handoff link (U until P09) | canceled, missed pickup, extension denied, staff-assisted return | TX-11/12, PAY-01..13/16 |
| /exchanges/:id/handoff | Pickup/return | Participant | U until P09: phase, item, scan/typed code, explicit two-party confirm | (P09) expired/replayed token, camera denied, offline | QR (P09) |
| /inbox, /inbox/:id | Inbox/chat | Member | U until P10: contextual conversations, unread, block/report | (P10) sending/retry, blocked contact | MSG (P10) |
| /feedback | Reviews | Member | U until P11: eligible completed exchanges, star rating + text | (P11) already submitted, disputed | TRU (P11) |
| /profile | Own profile | Member | display name, verified status, own listings shortcut | save failure + retry | AUTH-12 |
| /profile/:userId | Trust profile | Member | display name, verified status, completed exchanges, rating with count | new member ("Not enough ratings yet"), unavailable | TRU-04 |
| /notifications | Notifications | Member | U until P10 (list renders with unavailable notice) | E, stale target | JOB-05 (P10) |
| /settings | Settings | Member | style, appearance, motion, density, verification, export/delete | save failure + retry + last confirmed, reconfirmation | UX-05..09, SEC-17 |
| /help | Help/report | Member | category, details, contextual item/exchange link | duplicate report, submission failure | ADM-09 |
| /admin/moderation | Moderation queue | Operator | pending listings, evidence, approve/reject/hide + reason, audit | no authority (F), stale case version | LST-14, ADM-01/02 |
| /admin/members | Membership review | Operator | verification queue, approve/decline + reason | F, last-admin protection (later) | AUTH-05, ADM |
| * | 404 + error boundary | Public | friendly not-found; boundary catches render errors | Er | UX-18 |

Navigation: mobile bottom bar - Explore, My exchanges, Create, Inbox, Profile. Desktop: sidebar/topbar with same destinations + persistent search + visible campus context. Notifications live in a labeled header action. Detail pages: one mode-specific primary CTA; sticky action area never hides focused content (UX-10..12).

Deferred post-tomorrow routes remain in the table marked U so entry points exist honestly (UX-25) - they must never render fake success.