# ADR 0002: Payroll Compact roadmap (Veil)

## Status

Accepted — 2026-05-16

## Context

The hackathon MVP ships `contracts/veil.compact` with public ledger anchors and placeholder circuits (`registerEmployeePlaceholder`, `runBatchPlaceholder`). Issue “Veil slice 7: Payroll Compact v0 (cryptographic)” tracks evolving this module toward richer payroll state machines without breaking the golden `npm run setup` / `npm run test:e2e` path.

## Decision

- Keep **`contracts/veil.compact` → `contracts/managed/veil/`** as the single compiled surface until a future ADR splits modules.
- Treat deeper payroll state machines (company lifecycle, employee lifecycle, disclosure circuits) as **incremental PRs** that each keep local devnet demos runnable.
- Document narrative scope in [`docs/prd/confidential-payroll.md`](../prd/confidential-payroll.md); track engineering slices as GitHub issues referencing this ADR.

## Consequences

- Toolchain issues block contract refactors: CI and contributors must see green e2e before expanding circuits.
- Marketing and UI must continue to distinguish **obligation proofs** from **settlement** and from **regulatory disclosure bundles**, per the PRD trust model.
