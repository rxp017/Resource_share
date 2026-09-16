# Product and experience specification

Status: proposed baseline incorporating the user's zero-budget, 500-student, exact `@hitam.org`, direct-payment-proof and 17 September milestone constraints. Other numbers are configurable planning defaults, not confirmed campus policies. Changes require a recorded reason, affected requirements and revised tests.

## 1. Product objective and boundaries

Help verified students find useful items on their campus and complete a sale, free loan or paid rental with clear terms and an accountable exchange record.

“Buy” and “sell” are opposite sides of one sale. “Lend” and “borrow” are opposite sides of a free loan. Rent is temporary access for an agreed fee. Model three transaction modes, not five unrelated systems.

| Release | Included | Explicitly outside this release |
|---|---|---|
| Internal prototype | All three modes using synthetic accounts; complete journeys; both styles | Real student data and claims of launch readiness |
| Controlled campus pilot | Verified members, real listings, requests, chat, pickup/return, feedback, moderation | Broad public signup, unattended operations, gateway payments |
| First production release | Hardened pilot capabilities, operator coverage, monitoring, recovery and all release gates | Native apps, cross-campus trading, escrow, deposits, delivery, bidding, barter, AI agents and automated damage decisions |
| Future releases | Only separately approved, validated capabilities from the roadmap | Automatic accumulation of every suggested feature |

The platform does not own inventory, guarantee goods, certify student honesty, adjudicate legal liability or verify external cash/UPI transfers. It records participant statements and the workflow. UI copy must not imply protections that do not exist.

## 2. People and access

- **Visitor:** public explanation, accessibility information, policies and signup only. No student directory, live listing feed or private media.
- **Pending member:** verification status, help, own preferences and account controls; no listing, messaging or trading.
- **Verified active student:** campus feed; own listings; counterpart profiles with limited trust summary; exchange requests; participant chat; own evidence and feedback.
- **Expired member:** re-verification plus restricted access to existing obligations, own history and account requests. Cannot initiate new marketplace activity.
- **Suspended member:** restricted case/return assistance and own account controls; cannot contact unrelated students. Staff-assisted return path prevents stranded items.
- **Moderator:** assigned campus reports, listing decisions and scoped case evidence. Chat access requires an assigned case and reason; no unrestricted inbox browsing.
- **Campus administrator:** manages campus policy, verification decisions and operator assignments within that campus; MFA required.
- **Platform operator:** infrastructure and controlled bootstrap responsibilities. No self-service public route to acquire this role. Emergency access is logged and narrowly scoped.

Students never choose an administrator role during registration. Faculty are operators only if explicitly appointed; they do not become trading users by accident.

## 3. Account and campus membership

1. Only the exact domain `hitam.org` is allowed. Compare the normalized domain of a valid verified email. Reject `hitam.org.evil.com`, `fakehitam.org`, subdomains and personal addresses. Display names and client-submitted emails are not proof.
2. Use managed Google OAuth as the initial path: public MX records returned `smtp.google.com` for `hitam.org`. Validate trusted provider identity, confirmed email and institutional hosted-domain evidence on the backend. A Google hosted-domain UI hint is not enforcement. Test actual college accounts and OAuth consent restrictions. If this path is unavailable, email OTP requires a working custom SMTP sender and actual verified delivery; never disable email confirmation to meet the deadline. See the free-deployment document for setup details.
3. Email control and active student eligibility are distinct. If the campus domain includes alumni/staff, require an approved roster/invitation or minimal manual confirmation before activating membership.
4. Store verification method, verified time, membership expiry, policy version and decision actor. Baseline re-verification is once per academic year; campus policy determines the actual interval.
5. An operator-reviewed invitation can establish student eligibility but cannot waive verified `@hitam.org` email. If that mailbox cannot be verified, keep access pending. Avoid Aadhaar, PAN, biometrics and full student-ID scans in the baseline.
6. Account recovery uses the identity provider plus operator-reviewed enrollment recovery when necessary; possession of a roll number is not sufficient.
7. Account deletion/export and support remain accessible. Open loans/disputes require a documented restricted retention/closure workflow, not permanent denial of deletion.

## 4. Theme and inclusive design contract

### Direction

Working design identity: a contemporary campus noticeboard with clear exchange receipts. “Pulse” is expressive editorial design; “Calm” uses the same structure with restrained typography and quieter surfaces. Product naming remains open; do not publish a new brand name as if approved.

Memorable anchor: listing cards include a compact exchange strip showing **Sale / Free loan / Rental**, relevant amount and availability; transaction details use a clear vertical receipt showing terms, handoff and return. Decorative sticker-like category labels are allowed only in Pulse and must not compete with condition/price.

Provisional design feasibility assessment, 1–5: impact 4, audience fit 4, feasibility 5, performance 5, consistency risk 2. Applying the frontend-design skill's stated arithmetic gives 16; its printed range incorrectly caps at 15. Treat these as subjective planning ratings, not measured evidence or a reason to ignore user testing.

### Preference model

| Preference | Options | Default and behavior |
|---|---|---|
| Visual style | Pulse, Calm | Calm if skipped; either can be selected by anyone |
| Appearance | System, Light, Dark | System; responds to OS changes only when System is selected |
| Motion | System, Reduced | System; OS reduced-motion preference is always respected; never force animation |
| Content density | Comfortable, Compact | Comfortable; both preserve control target sizes |

Do not bundle “Gen Z,” age, gender or disability into the style choice. Style is a preference, not a demographic classification.

### First successful login

Show a skippable “Make it feel like you” step after authentication, before marketplace entry. Show two previews of the same sample listing with equal content, Pulse and Calm radio choices, appearance control and an immediate accessible preview. Explain “You can change this in Settings.” Buttons: “Continue” and “Skip for now.” No questionnaire or animation gate.

Save `onboarding_completed_at` even when skipped. Returning users and cross-device users do not repeat the step. Preserve a safe intended destination, such as an item link, through verification and onboarding. Reject external redirect destinations. A pending member may choose a style but remains on verification status afterward.

Preference precedence: authenticated server profile is canonical across devices; a local cookie mirrors it for first paint. A current unsaved preview applies only locally. Anonymous users use cookie/OS defaults. Switching accounts clears the previous account's preference cache. Save failure retains the last confirmed value and explains retry; it must not reset authentication or transaction drafts. No flash of unreadable theme, hydration mismatch or page reload is acceptable.

### Visual specification

- Pulse light: warm off-white canvas, ink text, deep teal primary controls, citrus accents on nonessential labels; strong display headings and restrained body text.
- Pulse dark: charcoal canvas, warm light text, teal/citrus accent surfaces with independently validated foreground colors.
- Calm light: soft neutral canvas, crisp white panels, slate text and restrained teal actions.
- Calm dark: deep neutral surfaces and a clear luminance hierarchy; no pure low-contrast grey-on-grey interface.
- Use semantic tokens for background, surface, text, muted text, border, accent, focus, success, warning and danger. Theme variants replace tokens; they do not fork business components.
- Proposed typography: one expressive licensed display face such as Space Grotesk for Pulse, a readable licensed body face such as Source Sans 3 for both; Calm can use the body family throughout. Verify licenses and glyph coverage before bundling; retain system fallbacks and readable offline behavior.
- Base body 16–18 px, line-height around 1.5, reading widths around 65–75 characters. Type must adapt to text zoom rather than depend on fixed-height containers.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48 px. Cards generally use 16–24 px padding. Control minimum target design goal: 44 × 44 CSS px.
- Use real authorized item photos. No stock seller avatars, invented reviews, fake inventory counts, fabricated savings or “students online” counters in live mode.
- Motion generally 120–180 ms for feedback. No parallax, autoplay video, endless floating objects, mandatory 3D, cursor replacement or animated checkout/QR backgrounds.
- One icon family; labels accompany important controls. Status uses words and icons as well as color.
- Rounded corners and depth should separate content, not create a dashboard full of nested boxes. No unrelated marketing charts above the marketplace feed.

### Accessibility and performance

Target WCAG 2.2 AA. Meet text contrast of 4.5:1 for ordinary text, 3:1 for qualifying large text and relevant non-text controls. Use a clearly visible focus indicator in every theme. The 44-pixel control target is our product target; WCAG AA's minimum target criterion is 24 pixels with exceptions. [W3C WCAG 2.2](https://www.w3.org/TR/wcag/).

Provide semantic headings, landmarks, visible labels, skip link, correct error association, announced async status, keyboard dialogs and focus restoration. Support 320 px reflow, 200% text scaling, 400% browser zoom where applicable, portrait/landscape and on-screen keyboards. Photo reorder has button alternatives to drag. QR has a typed-code fallback. Screen-reader users must be able to confirm handoff without scanning. Never describe an inaccessible theme as acceptable because the other theme passes.

Use optimized responsive photos, reserved image dimensions, lazy loading below the fold and a small interactive surface. Target field p75 LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1 after sufficient observations. Prelaunch controlled measurements do not establish field compliance. [Web Vitals](https://web.dev/articles/vitals).

## 5. Navigation and screens

Mobile primary navigation: Explore, My exchanges, Create, Inbox, Profile. Desktop: compact sidebar or top navigation with the same named destinations, persistent search and visible campus context. Put notifications in a labeled header action. A detail page has one mode-specific primary CTA and a sticky action area that does not hide focused content.

| Screen | Required content and actions | Non-happy states |
|---|---|---|
| Public overview | What the platform does, eligibility, modes, exchange steps, sign in | Service outage; campus not accepting registrations |
| Signup/sign in | Google college-account sign-in, eligibility notice, help | Wrong domain/provider, consent denied, callback failure, session expiry |
| Verification status | Pending/approved/expired/declined state, next action | Domain unsupported; manual review unavailable |
| First-login style | Equal Pulse/Calm previews, appearance, skip | Save failure; interrupted onboarding |
| Explore | Search, mode/category/condition/price/available-date filters, useful categories | No inventory; loading; outage; no matches with reset |
| Listing detail | Actual photos, defects, mode, amount/rate, availability, campus pickup zones, trust summary | Removed, reserved, unavailable, owner view, stale price |
| Create/edit listing | Guided photo → details → terms → preview → publish | Upload retry; validation; draft recovery; moderation rejection |
| Own listings | Drafts, pending moderation, active, paused, archived; edit rules | No listings; action conflicts with reservations |
| Request form | Mode, immutable quote preview, dates/time, pickup zone, note | Own item; overlap; inactive seller; outdated listing version |
| My exchanges | Incoming/outgoing requests, upcoming, in progress, history; deadlines | Empty tab; request expired; overdue; disputed |
| Exchange detail | State timeline, accepted terms, participant actions, chat link | Canceled, missed pickup, extension denied, staff-assisted return |
| Payment evidence | Agreed amount, buyer-uploaded receipt, seller acknowledgement, correction history | Missing/unreadable proof, wrong amount, denial, private-media failure |
| Pickup/return | Phase, item, participants, condition evidence, scan/typed code, explicit final confirm | Expired/replayed token, camera denied, mismatch, offline |
| Inbox/chat | Listing/transaction context, messages, unread state, block/report | Sending/retry, forbidden, offline, blocked contact, removed message |
| Feedback | Completed-exchange eligibility, star rating, optional text | Already submitted; disputed exchange; deadline passed |
| Trust profile | Display name, verified status, completed exchanges, rating with count | New member; insufficient ratings; unavailable profile |
| Notifications | Requests, acceptance, cancellation, reminders, moderation updates | Empty; stale target; already read |
| Settings | Style, appearance, motion, density, notifications, verification, export/delete | Save failure; reconfirmation; pending data request |
| Help/report | Category, details, contextual item/exchange, limited attachments | Duplicate report; emergency direction; submission failure |
| Moderation | Queue, evidence, decision/reason, appeal, audit history | No authority; conflicting decisions; stale case version |
| Campus administration | Verification queue, categories, pickup zones, operator roles, policies | Invalid change; last-admin removal prevention; MFA required |

Core copy examples: “₹40 per day”, “Free loan · return by 18 Sep, 5:00 pm”, “Payment arranged directly with the owner”, “Both participants confirmed this handoff”, “No completed exchanges yet.” Avoid “Guaranteed safe,” “Verified payment” or “QR-certified condition.”

## 6. Listing rules

- One physical item per asset record; one non-archived listing per asset. One listing mode at a time. Do not allow separate active sale and rental listings for the same registered asset.
- No bulk quantities in baseline. Duplicate physical items entered dishonestly cannot be fully prevented; flag possible duplicates for review without claiming ownership verification.
- Required: title, category, description, standardized condition, explicit defect declaration, real photo, mode, campus, pickup zone and availability. Optional academic metadata: course code and book edition; do not require enrollment details publicly.
- Categories initially configurable for books, calculators, safe personal electronics, sports gear and permitted study/lab accessories. Exclude regulated goods, chemicals, weapons, stolen goods, identity documents, account credentials, pirated materials, academic cheating services and prohibited institutional property.
- Condition vocabulary: Like new, Good, Fair, Needs repair. Permit “Needs repair” only for sale with conspicuous disclosure; do not rent unsafe or nonfunctional equipment. The actual campus prohibited-items policy must be approved.
- Free-tier defaults: title 100 characters; description 2,000; 1–3 processed photos targeting ≤250 KB each; raw input ≤5 MB with decoded pixel limits; maximum 3 active listings per member and initially 500 active listings campus-wide. Apply storage-aware admission; 500 students each listing three items exceeds the intended media budget. Show limits before upload. Payment/condition evidence have separate private quotas.
- Sale amount is a positive integer in paise. Free loan amount is zero. Rental rate is positive paise per 24-hour day. Baseline currency INR only; no floating point money.
- Accepted terms are snapshotted. Owners may edit marketing text/photos for future requests; mode/rate changes and archiving cannot alter existing obligations. Require no active reservations before switching mode. Delete means archive, not erasure of transaction history.
- Pilot listings enter moderation pending; a moderator publishes or rejects with a reason. Changed material details return to review. Evaluate trusted-user post-moderation later, rather than leave a new live marketplace unattended.

## 7. Transaction policies

All policy numbers below must be visible in the terms and confirmed before pilot. The generator must not scatter them as conflicting constants across pages.

- A request expires after 48 hours or the requested pickup time, whichever comes first. The server calculates this. Requests do not reserve inventory until accepted.
- Sale: owner accepts one buyer at a time. Completion occurs only after authenticated handoff acknowledgement by both parties. Baseline sales have no automated return/refund flow; misrepresentation goes through a report/dispute workflow.
- Loan/rental: requester supplies pickup and return timestamps. Rental billing uses the ceiling of elapsed hours divided by 24, minimum one day, with exact total shown before requesting. Store UTC; display Asia/Kolkata by default with explicit date and time.
- Initially allow 1–30 day borrowing/rental periods with pickup at least one hour ahead and at most 30 days ahead. These are adjustable pilot rules, not requirements from the PPT.
- Block overlapping accepted or active reservations, including a proposed one-hour turnaround buffer. At acceptance, check the item is not currently overdue or under a blocking dispute.
- Either participant can cancel before pickup with a reason; cancel atomically releases the hold. After pickup, “cancel” is unavailable; use return, extension or dispute.
- Missed pickup: after a proposed two-hour grace period, a job may mark an uncollected reservation expired. An open, timely handoff session prevents a job racing the final confirmation. No automatic trust penalty from an unverified no-show claim.
- Return extensions require the owner's explicit acceptance, new immutable terms and overlap checks. There are no automatic fees, penalties, deposits or charges.
- Overdue status is derived from an active loan/rental whose due time has passed. It does not complete the exchange. Block new handoffs for that item; notify affected future reservations and let participants cancel or agree new dates.
- Returns record item receipt separately from agreement on condition. A condition disagreement must not leave the system pretending the borrower still has an item already returned.
- Paid sales/rentals require payer proof submission and payee receipt acknowledgement before normal handoff completion. Free loans bypass payment. Enforce this on the server separately from custody/condition. Staff reconciliation may record actual physical custody after an off-process exchange but must preserve unconfirmed/disputed payment status and an audit reason.

### Direct payment and private proof

Buyer/renter pays the owner outside the platform, preferably at meetup after inspection, then uploads a transaction receipt image. The amount is frozen in accepted terms. Cash is not enabled in baseline because this flow requires a transfer receipt; adding cash needs a separately approved acknowledgement policy. No gateway, wallet, OCR verification or public proof gallery.

States: Not submitted → Proof submitted → Seller acknowledged or Seller disputed. Corrections create a new proof version; never erase the earlier decision. Only the payer submits and only the payee acknowledges. Moderator decisions are case outcomes, not bank-verification. Display “Proof submitted” and “Receipt acknowledged by seller.”

Record transaction, payer, proof version, claimed amount/currency, optional masked reference, time and seller decision. One current image, maximum three versions before review; processed JPEG/PNG/WebP ≤500 KB and input ≤5 MB. Validate legibility; guide users to crop balances, unrelated transactions and unnecessary account details. Never request PIN, OTP, card details or full bank statements. Separate private receipt storage from listing photos. Access only the two parties and assigned dispute staff.

Duplicate reference/amount checks are review signals, not fraud proof. Seller checks their own payment app/bank before acknowledging. Upload cannot auto-acknowledge. On network failure, show pending status and reconcile; never suggest paying again automatically. External refund disagreements require a case; the platform cannot issue refunds. Proposed ordinary proof retention is 90 days after closure unless a justified case hold applies; confirm institutional/legal policy before real use.

## 8. Trust, messaging and disputes

Use “Trust summary” with membership verification, completed exchange count and community rating. Implement the PPT's rating score as a simple visible average of eligible published 1–5 star reviews with count, not an opaque 0–100 “safety” score. Show a numeric average only after at least three distinct counterparties have published eligible reviews; otherwise show “Not enough ratings yet.” Display counts even when the average is withheld. The three-counterparty threshold is a conservative product default, not a validated fraud model.

One review per reviewer per completed transaction. Both sides can review for seven days; publish when both submit or the window closes to reduce retaliation. An open dispute holds publication until resolution; define the revised deadline in the case. Restrict repeated counterparties' contribution to the aggregate to one latest eligible review per pair per 90 days. Preserve eligible history but show the aggregation policy. Never reward volume through public leaderboards or penalize users for not having disposable goods to sell.

Chat is contextual to a listing inquiry or exchange. Two same-campus eligible participants only; no public chat rooms. Messages are plain text with safe link treatment; general file attachments, voice/video and read receipts are deferred. “Secure” means authenticated access and encrypted transport, not end-to-end encryption. New-message blocking must preserve a restricted existing-exchange resolution route.

Dispute categories: condition mismatch, item not returned, missed pickup, external payment disagreement, prohibited item, harassment, other. Capture reporter statement, relevant immutable terms, event history and limited evidence. A moderator can remove listings, restrict activity, record a resolution and permit/reject feedback under policy. They cannot create a fake payment refund or overwrite history. Appeals go to another authorized operator where available. Publish actual staffed hours and emergency campus contact information only after confirmation.

## 9. Product acceptance targets

Proposed usability targets: at least 80% of the small formative test group completes each core task without facilitator intervention; median theme choice/skip under 20 seconds; median simple listing draft under three minutes once photos are ready. Report raw counts and denominator, not unsupported population claims. Any failure to understand rental total, return obligations or final handoff confirmation is a blocking UX issue even if the overall target is met.

The full release checklist, not these targets alone, controls launch.
