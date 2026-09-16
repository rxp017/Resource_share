# Campus Resource Sharing and Marketplace — planning pack

Prepared 16 September 2026 from the uploaded PPT, architecture image, and linked research. This is a specification and prompt pack. No application code has been generated. Nothing is implemented, deployed, load-tested, or certified production-ready by this pack.

## Start here

1. Read [Tomorrow's milestone and free deployment](08-TOMORROW-AND-FREE-DEPLOYMENT.md), then [Product and experience](02-PRODUCT-AND-EXPERIENCE.md).
2. Give your AI generator access to this entire `planning` folder and the original attachments.
3. Paste the **Master execution contract** from [Generator prompts](04-GENERATOR-PROMPTS.md), then paste **P00**.
4. Continue through P01–P15 in order. Paste one phase at a time. A failed gate must be repaired before dependent work continues.
5. Use [Acceptance checklist](05-ACCEPTANCE-CHECKLIST.md) as the acceptance contract. Generated claims and screenshots alone do not close a gate.
6. Use the resume/repair/audit prompts at the end of the prompt file when context is lost or the generator drifts.

If the generator cannot read local files, attach the Markdown documents to it. If its context window is small, provide the master contract, current phase, relevant specification sections, and current evidence ledger. Do not provide only the phase title.

## Documents

| File | Purpose |
|---|---|
| [00 — Improved planning prompt](00-IMPROVED-PLANNING-PROMPT.md) | Reusable improved version of your request; applied to prepare this pack |
| [01 — Research and source audit](01-RESEARCH-AND-SOURCE-AUDIT.md) | Past research, current alternatives, attachment corrections, sources, local validation |
| [02 — Product and experience](02-PRODUCT-AND-EXPERIENCE.md) | Scope, user journeys, themes, screens, accessibility and product rules |
| [03 — Architecture and contracts](03-ARCHITECTURE-AND-CONTRACTS.md) | Deployment model, entities, permissions, transaction states, APIs, failure handling |
| [04 — Generator prompts](04-GENERATOR-PROMPTS.md) | Master contract, 16 sequential phases, repair/resume/audit prompts |
| [05 — Acceptance checklist](05-ACCEPTANCE-CHECKLIST.md) | Individually traceable checks, evidence rules and release gates |
| [06 — Delivery, operations and future](06-DELIVERY-OPERATIONS-AND-FUTURE.md) | Estimates, costs, rollout, incidents, recovery, maintenance, expansion |
| [07 — Skills and execution ledger](07-SKILLS-AND-EXECUTION-LEDGER.md) | Verified skill paths, selection rules, tracking templates and open decisions |
| [08 — Tomorrow and free deployment](08-TOMORROW-AND-FREE-DEPLOYMENT.md) | GLM capability limits, 70-point milestone, zero-budget hosting and 500-account sizing |

## Working baseline

- One campus; verified students transact. Authorized campus operators moderate.
- Responsive web application; sales, free loans, paid rentals; pickup and return records.
- React + Vite + TypeScript frontend on Cloudflare Pages Free; PostgreSQL, authentication, private storage and narrow backend commands through Supabase Free. GitHub stores source and triggers deployment.
- Pulse and Calm visual styles; each supports light, dark and system appearance. Same capabilities and navigation in every style.
- Online payment collection, native mobile apps, multi-campus operation and AI recommendations are later phases, matching the PPT's future scope.
- Buyers/renters pay owners directly and upload private payment proof. Owners acknowledge receipt. This never means bank-verified settlement, escrow or insurance.

Confirmed: GLM 5.3 selected by the user; 70% target by 17 September 2026; zero hosting/database budget; approximately 500 students; exact verified `@hitam.org` identities; one campus; direct payments with proof upload. [Z.ai's GLM-5.3 model card](https://huggingface.co/zai-org/GLM-5.3) was verified; actual coding-app tool access and context limits remain environment-dependent. Public MX lookup on 16 September returned `smtp.google.com` for `hitam.org`, supporting Google Workspace as the initial authentication path; real OAuth login still needs testing. Deadline hour, student-status policy, operator and launch authorization remain open. This pack defines a 70-point functional milestone, not overnight production assurance.

## Important corrections

- `team_12_ppt.pptx` says **Team: 11** on slide 1. Confirm the intended team number before final academic submission.
- Campus email control does not necessarily establish current student enrollment.
- QR scanning links an authenticated exchange action to a transaction. Condition requires evidence and explicit participant acknowledgement.
- Similar products already advertise verified campus buying/selling/renting. The defensible contribution is the evaluated implementation and its exchange workflow, not an unverified claim of global novelty.
- Estimates, capacity targets and UX hypotheses below require validation. No prompt can guarantee accuracy, adoption or security.

The original PPT and JPEG are unchanged. `source-evidence` contains extracted copies of the PPT introduction artwork and architecture diagram for inspection.

Pack verification: 16 numbered phase prompts (P00–P15), three recovery/audit prompts and 224 uniquely identified acceptance checks. Local document links were checked. This verifies the planning pack's structure only; no application tests have run.
