# Research and source audit

Research date: 16 September 2026. This is a targeted literature and product review, not a systematic review or original user study. No competitor accounts were created and no competitor transactions were tested. Source statements and our design inferences are separated below.

The user subsequently confirmed GLM 5.3, zero hosting/database budget, approximately 500 students, exact verified `@hitam.org` email and private direct-payment receipt uploads, with a 70% milestone tomorrow. The final architecture is React/Vite + Cloudflare Pages Free + Supabase Free. Paid/Next.js options researched below are comparison evidence, not the selected stack. Model research, free-tier sources, Google identity constraints and the directly observed HITAM MX record are consolidated in [document 08](08-TOMORROW-AND-FREE-DEPLOYMENT.md).

## 1. What the uploads establish

| Evidence | What it says | Treatment |
|---|---|---|
| PPT slide 1 | Campus Resource Sharing and Marketplace Platform; HITAM; four named team members; guide; date 20/08/2026; Team 11 | Academic context; do not put student roll numbers into public product pages |
| Slides 2, 4–5 | Students have short-use items; affordability, idle resources and informal trust are problems | Problem hypotheses; quantify locally before claiming impact |
| Slides 2, 8 | Listings, photos, conditions, prices, search, dashboards, buying/selling/lending/borrowing/renting | Core functional scope |
| Slides 2, 8–9 | QR pickup/drop-off, ratings, trust, messaging, moderation | Core scope; mechanisms require specification |
| Slide 3 | Introduction heading and embedded illustration | Artwork is not an additional requirement or measured evidence |
| Slide 6 and uploaded JPEG | React/Next.js, backend services, SQL database, storage, Redis, identity and notifications | Conceptual architecture with alternatives, not confirmed infrastructure |
| Slide 7 | Four abbreviated literature references | Verify or clearly mark candidate matches before academic reuse |
| Slide 8 | Mobile app, payment gateway, multiple campuses are future scope | Defer them from the baseline first production release |
| Slide 9 | Unified modes, QR, trust and impact described as novel | Reframe as integrated contribution unless comparative evidence proves uniqueness |
| New user request | Excellent frontend; first-login style selection; settings changes; inclusive usability; skill-aware generator prompts | Added core requirements |

The two architecture images depict the same system. Visual inspection found these unresolved points: “KYC” is undefined; SMS appears current in one place and future in another; gateway routing is not clearly separated from rendering; Redis has no measured use case; rental conflicts, QR replay, offline failure, disputes, role administration and recovery of storage objects are absent. The plan resolves these explicitly.

## 2. Historical evidence and implications

### R01 — Trust and reputation in marketplaces, 2016/2017

Michael Luca, *Designing Online Marketplaces: Trust and Reputation Mechanisms*, NBER working paper 22616, September 2016; published version in *Innovation Policy and the Economy*, volume 17, 2017. The NBER record describes marketplace trust as a design problem and reviews reputation mechanisms. The PPT's 2017 date is plausible for the published version. Access: indexed official abstract and publication metadata; direct page retrieval returned 403. [NBER record](https://www.nber.org/papers/w22616).

Our inference: keep feedback tied to completed exchanges, show sample counts, moderate abuse, and give newcomers a neutral state. A numerical rating alone is insufficient evidence of safety. This research does not validate our particular scoring policy or establish adoption at HITAM.

### R02 — University P2P sharing, 2020

Rafael Laurenti and Fernando Manuel Barrios Acuña, *Exploring antecedents of behavioural intention and preferences in online peer-to-peer resource sharing: A Swedish university setting*, *Sustainable Production and Consumption* 21, 47–56; DOI 10.1016/j.spc.2019.10.002. The accepted manuscript identifies interviews (n=7) and a survey (n=325), linking attitudes with sustainability, belonging, trust and familiarity; process risk is a barrier. Access: university-hosted accepted manuscript, including abstract and methods context. [KTH accepted manuscript](https://www.diva-portal.org/smash/get/diva2:1373275/FULLTEXT01.pdf).

This is a strong candidate for the PPT's “University P2P Study, 2020”; the deck does not prove that attribution. Our inference: explain how an exchange works before asking for commitment; prioritize study materials and reliable handoffs. Swedish intention data is not evidence of actual Indian campus transaction volume.

### R03 — Secondhand reputation, 2018

*Secondhand seller reputation in online markets: A text analytics framework*, *Decision Support Systems* 108, 96–106; DOI 10.1016/j.dss.2018.02.008. The publisher search excerpt describes combining textual and numerical seller/product signals for reputation assessment. Access: publisher-indexed excerpt only; full page returned 403. [Publisher record](https://www.sciencedirect.com/science/article/pii/S016792361830037X).

It is a plausible match for the deck's abbreviated 2018 entry. Author details and full methodology were not verified from an accessible primary full text. Do not silently turn the deck entry into a complete authoritative citation. Our inference: structured condition details complement feedback; this does not justify deploying automated reputation profiling.

### R04 — Image quality and trust, 2018 preprint / WACV 2019

Xiao Ma et al., *Understanding Image Quality and Trust in Peer-to-Peer Marketplaces*. The abstract reports an association between image quality and sales, and better perceived trust for selected user images than stock imagery. Access: original arXiv abstract and metadata; no independent replication or full methodological appraisal performed. [Original paper record](https://arxiv.org/abs/1811.10648).

Our inference: ask for real item photos and visible defects, provide photography guidance, and preserve condition evidence. Better photos do not prove ownership, authenticity or condition. Do not beautify defects away with AI.

### R05 — Sustainability entry in the PPT, 2019

The abbreviated “Wang et al., 2019” may refer to *Unraveling customer sustainable consumption behaviors in sharing economy: A socio-economic approach based on social exchange theory*, *Journal of Cleaner Production* 208, 869–879. Access: publisher-indexed excerpt; direct retrieval returned 403. The abbreviated deck citation is insufficient to confirm the match. [Candidate publisher record](https://www.sciencedirect.com/science/article/abs/pii/S095965261833155X).

Do not claim the paper proves a campus marketplace reduces waste by a particular amount. Confirm authors and DOI against the actual paper before academic submission. Design implication: measure completed reuse and stated avoided purchases instead of inventing carbon savings.

### R06 — Limits of environmental claims

*Reviewing circular economy rebound effects: The case of online peer-to-peer boat sharing* examines rebound effects in sharing. Access: publisher-indexed abstract excerpt; page retrieval blocked. Boat sharing differs materially from campus books and calculators. [Publisher record](https://www.sciencedirect.com/science/article/pii/S2590289X19300258).

Our inference: additional purchases and transport can offset some benefits. Report “items recirculated” as an observed count; label avoided purchases and financial savings as estimates with stated inputs. Do not publish kilograms of CO₂ saved without a defensible lifecycle method.

## 3. Current alternatives and defensible positioning

| Alternative | Evidence available | Implication | Not established |
|---|---|---|---|
| Informal class groups / word of mouth | Described in the PPT; actual campus usage has not been observed | Interview students about response time, trust and missing records; preserve their low posting friction | Local market share, dispute rate, willingness to switch |
| Loot | Official page advertises verified student access, buy/sell/rent, reviews and annual re-verification; mixed launch/waitlist language and upcoming mobile apps | These ideas are not globally new; verification expiry and course-oriented discovery are useful comparison points | Actual scale, safety, conversion or fulfillment; marketing claims were not tested |
| CampusGroups / Ready Education | Current redirected official page describes commerce, inventory and material checkout with condition/due dates | Managed campus resource circulation already has commercial precedent | Feature parity with our P2P workflow; older marketplace page is no longer a reliable current feature checklist |
| General resale services | Broad category of alternatives, not tested in this review | Compare reach and discovery against campus proximity and membership boundaries in interviews | Specific current product functionality or local availability |

Sources: [Loot official site](https://lootapp.ca/); [Ready Education current product page](https://www.readyeducation.com/campusgroups/increasing-efficiency). Product claims are vendor descriptions, not verified outcomes.

**Defensible project statement:** “We design and evaluate a campus-restricted marketplace combining sale, loan and rental workflows with authenticated pickup/return acknowledgements, condition histories and accountable moderation.” This remains meaningful without claiming to be the first such platform.

**Testable contribution:** Does the guided exchange workflow reduce ambiguous handoffs and improve task completion compared with the campus's current process? Does style choice improve comfort without increasing onboarding abandonment? No answers are assumed.

## 4. Engineering evidence used in this plan

Each entry is intentionally brief. Detailed requirements elsewhere are our proposed engineering contract, not claims that a vendor guarantees this application.

| ID | Primary source and observed point | Planning implication |
|---|---|---|
| T01 | [Next.js data security](https://nextjs.org/docs/app/guides/data-security) and [authentication](https://nextjs.org/docs/app/guides/authentication): enforce authorization at server entry points | UI visibility and middleware alone cannot authorize transactions |
| T02 | [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) and [API keys](https://supabase.com/docs/guides/getting-started/api-keys): elevated server keys bypass RLS | Keep privileged credentials server-only; enforce actor checks inside privileged operations |
| T03 | [PostgreSQL range types](https://www.postgresql.org/docs/15/rangetypes.html): exclusion constraints express non-overlap | Rental booking integrity belongs in database constraints and transactions |
| T04 | [Supabase backups](https://supabase.com/docs/guides/platform/backups): database backups exclude storage object bytes | Back up and restore images as well as database metadata |
| T05 | [OWASP object-level authorization](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/): object identifiers are an authorization attack surface | Test another user's listing, chat, evidence, booking and campus IDs directly |
| T06 | [OWASP upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html): validate and restrict uploads | Enforce image allowlists, size limits, safe decoding and access controls |
| T07 | [WCAG 2.2](https://www.w3.org/TR/wcag/): accessibility criteria include keyboard, contrast and target sizing | Target AA; choose 44-pixel primary controls as our stronger design target, not the AA minimum |
| T08 | [Web Vitals](https://web.dev/articles/vitals): good thresholds include LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 | Use these as field targets at the 75th percentile; laboratory runs are separate evidence |
| T09 | [MeitY DPDP Rules portal](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025): official index lists Rules, corrigendum and enforcement timeline | Assign an operator to check provisions applicable at launch; a generated privacy page cannot establish compliance |
| T10 | [Supabase pricing](https://supabase.com/pricing): displayed Pro estimate is $25 with one Micro compute instance and credit | Treat as base scenario; compute, extra environments and usage alter costs |
| T11 | [Vercel pricing](https://vercel.com/pricing) and [Hobby rules](https://vercel.com/docs/plans/hobby): Pro starts at $20/month; Hobby is restricted to personal/non-commercial use | Budget for suitable production use and seat count rather than assuming free hosting eligibility |
| T12 | [Razorpay-hosted Route documentation](https://d6xcmfyh68wv8.cloudfront.net/docs/api/payments/route/): describes vendor transfers and linked accounts | Future marketplace payments require an approved settlement model; basic checkout is insufficient |

Access limitations: T09 index metadata was accessible through search; direct page exposed no readable body. Legal notification PDFs were not analyzed, so this pack does not assert exact effective dates or statutory retention periods. T12 was available as an indexed provider-hosted documentation excerpt; canonical page retrieval failed. Recheck its current canonical documentation and provider eligibility before payment design. Technical pages change; generator P00 must verify supported compatible versions and current APIs before installation.

## 5. Local research to perform before treating demand as proven

These are proposed activities, not research already completed.

**Recruitment:** 12–16 interviews across years, commuters/hostellers, people who buy and people who lend; include participants with accessibility needs where feasible. Add 2–3 library/lab/student-affairs operators. Avoid collecting unnecessary identity documents. Obtain permission to record; de-identify notes.

**Interview script:** Ask about the last real item exchange, what it cost, how they found it, time to arrange, confidence in condition, failed returns, preferred pickup places and what would prevent them using a college platform. Ask what they actually did before asking what they might do. Do not lead with “Would you use our amazing app?”

**Survey:** A convenience sample of roughly 50–100 students can rank initial categories, modes and concerns. Report recruitment bias, denominator and response counts; do not generalize it to the entire institution statistically.

**Demand test:** Obtain consent for 30–50 real listings in 2–3 high-demand categories; recruit a small distinct buyer/borrower cohort. Manually observe request-to-pickup friction. No fabricated public inventory or reviews. Campus permission and accountable operators precede real transactions.

**Usability sessions:** 8–12 participants perform signup, skip/change theme, search, list an item, request a loan, confirm condition, handle scan failure and report a problem. Counterbalance which style they see first. Track task success, errors, time and comprehension. Small-sample preference is directional, not proof that all Gen Z users agree.

**Evidence deliverables:** recruitment method, anonymized notes, category ranking, issue severity list, updated assumptions and an explicit proceed/change/stop recommendation. Keep raw participant data out of public repositories.

## 6. Research-to-requirement chain

| Finding or uncertainty | Requirement | Verification |
|---|---|---|
| Trust is multi-factor | Verified membership, completed-exchange reviews, sample counts, reporting | AUTH, TRU and ADM checks |
| Process risk can inhibit participation | Explicit price, dates, pickup location, state timeline, condition acknowledgement | TX and QR checks; usability sessions |
| Item photos affect perceived trust | Real photos, defect notes, limited private condition evidence | LST and SEC checks |
| Same physical object cannot serve overlapping rentals | Database-enforced booking invariants | TX concurrency checks |
| Broad novelty claims unsupported | Narrow contribution and honest literature table | DOC checks |
| Style preference unmeasured | Pulse/Calm choice with skip and persistent settings | UX checks and observed onboarding outcomes |
| Sustainability outcome unmeasured | Actual reuse counts and explicitly estimated savings | DATA and OPS checks |
| Operational backing unknown | Named campus owner, moderation coverage and restore drill | OPS and REL checks |
