# ADR 0001: Veil hackathon MVP scope (public anchors first)

## Status

Accepted

## Context

Veil demonstrates confidential payroll on Midnight. The team needs a **demoable vertical** before private salary cryptography is complete: local devnet, compile, deploy, indexer read-back, and role-oriented UI.

`DESIGN.md` in this repository is a **third-party marketing design register** (Cursor brand tokens). Veil **product** surfaces are governed by `PRODUCT.md`: payroll workflows, honest scope labeling, and a privacy-oriented visual register—not that marketing token file.

## Decision

1. **Ship `contracts/veil.compact` as the canonical contract** with **public** ledger fields (`organization_id`, `employee_registry_version`, `batch_count`, `last_batch_hash`, `status_message`) and **placeholder** circuits (`bootstrap`, `registerEmployeePlaceholder`, `runBatchPlaceholder`, `setStatusMessage`) until private payout logic is specified and audited.
2. **Toolchain golden path** remains `npm run setup` → `npm run test:e2e`, with managed output at `contracts/managed/veil/`.
3. **Next.js** reads public contract state via `getVeilPublicLedger` / `app/api/veil-ledger` for demo surfaces; employer actions that need transactions stay explicitly disabled or scripted until a browser-wallet vertical slice lands.
4. **Glossary and personas** follow `CONTEXT.md` (employer admin, employee, auditor; payroll batch, receipt, selective disclosure).

## Consequences

- Positive: Judges and contributors see real indexer-backed state, not only mocks.
- Positive: Naming and scripts stay single-path (`veil` module), avoiding split-brain deploys.
- Negative: Individual salaries are **not** hidden on-chain in this milestone; copy and issues must say so.
- Follow-on ADRs or issues should capture the first **private-state** payroll circuit milestone without rewriting this decision retroactively.
