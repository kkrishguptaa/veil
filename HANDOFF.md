# Veil long-run review handoff

## Loop contract

- Target: ~8h wall clock from recorded start, or max 25 iterations; sleep 1200–1800s between iterations unless hotfix.
- One thread: pull → docs skim → `npm run verify` (+ `verify:live` when server up) → browser QA → small PR → update this file.

## Iteration log

### 2026-05-16T01:57:42 IST — iteration 1 (subagent session)

- **Git:** `git pull --ff-only origin main` (fast-forward to `1b73829`); local stray `pnpm-lock.yaml` / `pnpm-workspace.yaml` removed (npm-only repo).
- **Verify:** `npm run verify` green; `VEIL_BASE_URL=http://localhost:4173 npm run verify:live` green after `next start` on port 4173.
- **Privacy grep:** `legalName` / `rawText` only on `candidate-vault` + `actions` (expected); absent from `/`, `/recruiter-search`, `/disclosure` sources.
- **Code changes:** `.gitignore` duplicate `.veil-data/` line removed; `defaultStoreFile()` dev path uses `join(/*turbopackIgnore: true*/ process.cwd(), ".veil-data", "store.json")` for explicit cwd-relative store.
- **Open risks / gaps**
  - **Turbopack NFT:** `next build` still warns (fs/path in `store.ts` via `candidate-vault`); needs deeper split (dynamic import / server-only data layer) or upstream Next guidance — not fixed this iteration.
  - **Production:** file-backed JSON store (`/tmp` in prod) — replace with DB + real auth (Clerk etc.); map identities per `AGENTS.md`.
  - **Midnight:** local commitment adapter only; chain/contract integration still roadmap.
- **Next focus:** silence or scope NFT trace safely; expand `verify:live` (status codes + no `legalName` in recruiter HTML); optional README “local dev + env” section.

## Start timestamp (wall clock)

`Sat May 16 01:57:42 IST 2026` (IST, UTC+5:30)
