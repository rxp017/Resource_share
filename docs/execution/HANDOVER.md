# HANDOVER / CHECKPOINT - 2026-09-17, written by the previous chat agent (GLM 5.3)

Checkpoint per planning\07 section 5. Read together with docs\execution\{STATUS,DECISIONS,EVIDENCE,ISSUES}.md and the planning pack. This file records state only; it is not runtime-test evidence.

## Phase state
- P00, P01: VERIFIED + CLOSED (details in STATUS.md; evidence E-001..E-015).
- P02: IN PROGRESS. Done: scaffold files; npm install (0 vulnerabilities); typecheck PASS; production build PASS (vite 8.3.0, 306 ms). NOT done: git commit/push; migrations; RLS; negative authorization tests.
- P03-P15: NOT_STARTED. Deadline 17 Sep 2026; target = FIRST SIX milestone groups = 70/100 (table in STATUS.md). No rounding up; unimplemented features never render fake success.

## Exact git state
- git init -b main ran; git add -A staged everything; NO commit; NO remote; NO push. The prior block aborted at its forbidden-file guard: the regex ^\.env$|^\.env\.|... wrongly matched .env.example, which MUST be committed. (The final P02.3b repair block from the old agent was truncated in chat and was NEVER RUN - do not trust any partial copy of it; redo it yourself.)

## Fix list before the first commit (P02.3b)
1. Delete the 0-byte file named Get-Content in the project root (paste artifact) if still 0 bytes.
2. src\modules\.gitkeep and src\shared\.gitkeep were never created (PowerShell 5.1 rejects empty-string Content binding). Create src\modules\README.md and src\shared\README.md instead (one descriptive line each).
3. Corrected forbidden-file guard: forbid exactly .env, .env.local, .env.*.local, team_12_ppt.pptx, WhatsApp Image*.jpeg, planning/source-evidence/, node_modules/, dist/. .env.example is ALLOWED and must be committed.
4. Append docs/execution/backups/ to .gitignore (ledger backups stay local).
5. Then: git add -A; run the corrected guard over git ls-files; commit (planning pack + docs + scaffold + lockfile); git remote add origin https://github.com/rxp017/Resource_share.git; git push -u origin main (a GitHub login window may appear once for the user).

## Environment (verified via pasted output; see EVIDENCE.md)
- Windows 11 build 26200; PowerShell 5.1; Node v24.19.0; npm 11.17.0; git 2.55.0. gh / supabase CLI / wrangler / docker NOT installed and NOT required: deploy via Cloudflare Pages Git integration; migrations applied via the Supabase dashboard SQL editor.
- Deps (npm list, 0 vulnerabilities): react 19.3.0, react-dom 19.3.0, @supabase/supabase-js 2.116.0, vite 8.3.0, typescript 5.9.3, @vitejs/plugin-react 6.1.1. Commit package-lock.json. One package manager only: npm.
- Supabase: https://nvpbapjfeeyrbczdvjix.supabase.co, region ap-south-1, Free, EMPTY (clean). Liveness verified (E-012). DB password + service_role key are USER-ONLY; never print, never commit.
- .env (gitignored) holds VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (anon/publishable key, user-placed; public-by-design only after RLS is verified). Env naming is VITE_* (decision D-011); the user's earlier NEXT_PUBLIC_ naming is superseded.
- Google OAuth: web client configured (external audience, basic scopes, localhost origins, Supabase callback), secret entered in Supabase provider settings (user-reported, E-013). Real login UNTESTED - that is the P03 gate.
- GitHub: rxp017/Resource_share, PUBLIC by user choice (D-009); exclusions enforced by .gitignore + the guard.

## Non-negotiable invariants
1. The planning\ pack is the acceptance contract (224 checks in planning\05). Never replace it with a broader app idea.
2. One campus; exact normalized @hitam.org only (reject fakehitam.org, hitam.org.evil.com, subdomains, personal addresses); enforced in the database/backend, never client-only.
3. Modes: sale / free loan / rental. Buyers pay owners directly and upload private proof; the seller separately acknowledges. No gateway, escrow, wallet, OCR or bank-verification claim. Money is integer paise (INR).
4. Authorization lives in RLS/RPC/storage policies; direct Data API/RPC/storage calls must not bypass the workflow; client filters and disabled buttons are UX only.
5. Free tier only. Never buy anything, never enable paid services.
6. Never commit or print: .env, service_role key, DB password, team_12_ppt.pptx, the WhatsApp image, student roll numbers, receipts, proof images.
7. Evidence discipline: VERIFIED only with executed command/test output; statuses NOT_STARTED/IN_PROGRESS/VERIFIED/FAILED/BLOCKED/DEFERRED; demo-only is not verified-live.
8. Post-tomorrow features (QR handoff, chat, reviews, notification delivery) render as disabled controls labeled "Not available in this preview" with a one-line reason.
9. PowerShell 5.1 rules: Set-Location/-LiteralPath everywhere (parentheses in the root path); capture native stderr with 2>&1, never 2>$null (exit -1 artifact); UTF-8 without BOM via .NET WriteAllText; explicit $LASTEXITCODE checks; back up before replacing; refuse to overwrite un-inspected files.
10. Every database change is a reviewed migration file under supabase\migrations\; never reset a populated project.

## Three immediate next actions (doc 07 checkpoint format)
1. P02.3b: apply the fix list, commit, push, record evidence.
2. P02.4: author supabase\migrations\0001_schema.sql + 0002_rls_and_policies.sql per planning\03 section 4 (campus; membership/roles/preferences; assets/listings/media; requests/transactions/reservations with a non-overlap exclusion constraint; payment proof/acknowledgement; audit/idempotency/outbox). The user applies them via the Supabase dashboard SQL editor (give exact numbered steps). Then run negative REST authorization tests with the anon key (unauthenticated reads/mutations must fail or return empty) and record evidence with migration names.
3. P03: real Google login + exact-domain gate; test with two consenting real @hitam.org accounts plus one personal Google account (must be denied membership/data).

## Open external inputs
- Publish/launch authorization for any live student-facing exposure (D09/D10). Exact presentation hour (D02). Team-number discrepancy 11 vs 12 (D11; report at academic submission).

## Files modified but not yet committed
- All staged files (scaffold, planning pack, docs, lockfile) - verified on disk via pasted output; none committed or pushed yet.

## Preview URL
- None. The Cloudflare Pages project is created in P08.

## Ledger byte sizes at handover (integrity check)
- STATUS.md 9474 / DECISIONS.md 7585 / EVIDENCE.md 6661 / ISSUES.md 2248 (HANDOVER.md is new). If actual sizes differ, read the files and adapt; never blind-overwrite; back up before replacing. Your first bookkeeping action: append a handover note to STATUS.md, EVIDENCE.md and ISSUES.md in their existing style.