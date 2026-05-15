## Agent skills

### Issue tracker

Issues and PRDs for this repo live in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

The default triage labels map 1:1 to the Matt Pocock skill roles. See `docs/agents/triage-labels.md`.

### Domain docs

This is a multi-context repo: `CONTEXT-MAP.md` at the root points to per-context domain docs. See `docs/agents/domain.md`.

Read in this order for product work: **`PRODUCT.md`** (purpose, users, principles, anti-references), then **`CONTEXT.md`** (glossary). Veil's Hackathon MVP is privacy-first: Midnight-backed Private Verification and real AI candidate intelligence are the core path; Recruiter Matching demonstrates that path.

### Long-run review / handoff

For scheduled or multi-session improvement loops, read **`HANDOFF.md`** at the repo root. It holds the iteration contract (pull → verify → live check → fix → PR), timestamped notes, known risks (Turbopack NFT on file-backed store, production DB/auth/Midnight), and **next focus** so the next agent does not duplicate discovery.

### Design direction

Use `DESIGN.md` for UI work. Preserve the gradient mesh, indigo CTA hierarchy, thin display type, pill buttons, cards, and tabular numeric treatment unless a task explicitly changes the design system.

### Product context for UI

Keep root `PRODUCT.md` aligned with `CONTEXT.md` (purpose, users, principles). Impeccable-style UI work should treat it as the product register; refresh it when domain language shifts, not from ad-hoc prompts alone.

### Ship checklist

Run `npm run verify` before merging UI or privacy changes. When changing recruiter surfaces or server actions, also run **`npm run verify:live`** with a running app (`next start` or `next dev`) and set **`VEIL_BASE_URL`** to that origin (see `package.json` / scripts). Recruiter routes must never render `legalName`, raw `EvidenceDocument.rawText`, or other vault-only fields except on candidate-scoped surfaces; a quick grep for `legalName` and `rawText` under `src/app` helps catch leaks before merge.

### TypeScript runtime

Project-owned runtime code, scripts, and tests should be TypeScript. JavaScript config files are acceptable only when a tool does not support TypeScript config.

### Privacy boundary

Midnight-backed Private Verification starts in `src/privacy/midnight-private-verification.ts`. Keep app/API slices behind that boundary: raw Evidence Documents stay inside the Trusted Extraction Boundary; recruiter-facing flows consume Verified Claim commitments, candidate-approved Recruiter Views, Disclosure Grants, and receipts.

### Productized MVP path

Do not regress the product back to static demo fixtures. Candidate upload, AI extraction, Recruiter View approval, recruiter search, Disclosure Grant decisions, and audit inspection should flow through app-owned TypeScript storage and server actions. Local JSON storage and the explicit actor selector are development adapters only; production auth should map managed identities and org roles into the same candidate/recruiter actor boundary before calling product services.

### Durable productization

Static fixtures are acceptable only as seed data. Product paths must flow through app-owned TypeScript storage and server-side service functions, even when the local adapter is file-backed for development. Keep the store interface ready for a later DB adapter and avoid module-level mutable request state.

When external auth secrets are absent, use the explicit local actor selector in `src/lib/actors.ts` and validate every server action against candidate or recruiter scope. Future Clerk/Auth integration should replace actor selection at the boundary, not weaken candidate/recruiter data separation.

### Build / bundler notes

`next build` may emit a **Turbopack trace / NFT warning** when server code resolves filesystem paths for the local JSON store (e.g. `store.ts` used from app routes). Treat it as a known dev-store smell until the store is split behind a server-only boundary, dynamic import, or replaced with remote storage. Prefer fixing over silencing warnings without understanding the graph.

### Repo hygiene

Do not commit **`.cursor/hooks/state/continual-learning.json`**. This repo is **npm-first**; do not add `pnpm-lock.yaml` / `pnpm-workspace.yaml` unless the project explicitly migrates to pnpm and updates CI/docs in the same change.

## Learned User Preferences

- When the user disallows human intervention or asks for autonomous execution, resolve unknowns with tooling or subagents instead of blocking on questions to the user.
- When subagent output is already visible in the Cursor UI, do not restate that output; keep replies minimal unless multiple subagent results must be synthesized together.
- When the user invokes caveman mode, follow that skill’s terse style until they explicitly exit the mode.

## Learned Workspace Facts

- Manual product QA for the hackathon slice usually exercises `/`, `/candidate-vault`, `/recruiter-search`, and `/disclosure`.
