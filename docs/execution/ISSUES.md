# Issues

- I-001 (OPEN - narrowed): remaining unread planning documents: 05 (full), 02, 03. Fix issued 2026-09-16: three single-line Get-Content commands, one document per paste message, to stay under the platform paste limit. Impact: P01 inputs; DOC-01..06 exact text; per-check tracking of the 224 acceptance checks.
- I-002 (OPEN - partially resolved): all four provider accounts exist (E-010); gh, supabase CLI, wrangler and docker remain uninstalled. Not blockers: deployment uses the Cloudflare Pages Git integration; Supabase is managed via the dashboard (SQL editor for migrations) until the CLI is optionally installed; git is present.
- I-003 (NOTED - mitigated): PowerShell 5.1 2>$null produced exit -1 artifacts in P00.4; all future blocks capture native output with 2>&1 and check $LASTEXITCODE explicitly.
- I-004 (OPEN - external): Google OAuth access untested (no local check exists). Resolves in the P03 spike; synthetic permission tests are not a substitute.
- I-005 (NOTED): no local git repository yet - intentional; git init happens in P02 with the .gitignore before the first commit, planning pack committed first (D-008).
- I-006 (OPEN - mitigation planned): PUBLIC GitHub repo vs personal data in the project root: team_12_ppt.pptx contains four named team members and guide details; the WhatsApp JPEG is unreviewed; planning\source-evidence\ holds extracted PPT artwork/architecture diagram (assessed as non-personal). No exposure has occurred (repo empty). Mitigation: D-009 - the .gitignore created in P02 BEFORE the first commit excludes the PPT, the JPEG, .env*, node_modules/ and dist/, and a pre-push file list is printed for review before anything is pushed.
- I-007 (NOTED): the doc 05 paste truncated at line 1 of 305 because the combined output (multi-block console echo + three documents) exceeded the platform paste limit. Single-line read commands re-issued; one document per message.
## Update 2026-09-17

- I-001 RESOLVED: all planning documents needed for P00-P08 are now read in full (doc 06 remains deliberately deferred to P14).
- I-008 (OPEN - deferred): ESLint not yet configured; planned for P04. ENV-04 requires a working lint before the Foundation group can be credited at P08; tracked in TASKS.md.