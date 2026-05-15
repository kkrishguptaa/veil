## Agent skills

### Issue tracker

Issues and PRDs for this repo live in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

The default triage labels map 1:1 to the Matt Pocock skill roles. See `docs/agents/triage-labels.md`.

### Domain docs

This is a multi-context repo: `CONTEXT-MAP.md` at the root points to per-context domain docs. See `docs/agents/domain.md`.

For current product language, read `CONTEXT.md` first. Veil's Hackathon MVP is privacy-first: Midnight-backed Private Verification and real AI candidate intelligence are the core path; Recruiter Matching demonstrates that path.

### Design direction

Use `DESIGN.md` for UI work. Preserve the gradient mesh, indigo CTA hierarchy, thin display type, pill buttons, cards, and tabular numeric treatment unless a task explicitly changes the design system.

### Product context for UI

Keep root `PRODUCT.md` aligned with `CONTEXT.md` (purpose, users, principles). Impeccable-style UI work should treat it as the product register; refresh it when domain language shifts, not from ad-hoc prompts alone.

### Ship checklist

Run `npm run verify` before merging UI or privacy changes. Recruiter routes must never render `legalName`, raw `EvidenceDocument.rawText`, or other vault-only fields except on candidate-scoped surfaces.

### TypeScript runtime

Project-owned runtime code, scripts, and tests should be TypeScript. JavaScript config files are acceptable only when a tool does not support TypeScript config.

### Privacy boundary

Midnight-backed Private Verification starts in `src/privacy/midnight-private-verification.ts`. Keep app/API slices behind that boundary: raw Evidence Documents stay inside the Trusted Extraction Boundary; recruiter-facing flows consume Verified Claim commitments, candidate-approved Recruiter Views, Disclosure Grants, and receipts.
