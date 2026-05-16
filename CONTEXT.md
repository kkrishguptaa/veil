# Veil domain context

Single-page glossary for issues, PRs, and code. Extend this file when terminology shifts.

## Product

**Veil** is a confidential payroll experience on **Midnight Network**. Employers run payroll in a way that does not broadcast individual salaries to the world. Employees still get evidence they were paid. Auditors can work from proofs and aggregates instead of raw HR spreadsheets.

The repository ships the **toolchain vertical** first (local devnet, compile, deploy, read-back smoke test). On top of that you get a **Next.js** UI with live indexer reads for public Veil ledger fields, plus an incremental **Compact** payroll slice in `contracts/veil.compact` where private payout logic is still roadmap work.

## Glossary

| Term | Meaning |
| --- | --- |
| **Midnight Network** | A ledger stack where contracts can use private state and zero-knowledge proofs so not every field is public by default. |
| **Compact** | The domain-specific language used to author Midnight contracts. Source lives under `contracts/*.compact`; compiled artifacts land in `contracts/managed/<name>/` (gitignored). |
| **Circuit** | A callable entry point in a Compact contract. Private inputs stay with the prover unless explicitly disclosed to ledger or proof outputs. |
| **Selective disclosure** | Revealing a minimal view (aggregate, policy bit, receipt) to a third party without handing over the full underlying record set. This is the core demo beat for Veil. |
| **Payroll batch** | One employer-initiated run that pays everyone in a cycle. Outputs include a batch identifier and proof-oriented artifacts. |
| **Receipt** | Employee-facing evidence that a batch included their payout. May bundle hashes, verification status, and encrypted detail the employee can open. |
| **NIGHT / DUST** | Native assets on Midnight devnets used for fees and contract interactions in the scaffold scripts. |
| **Proof server** | Service that builds ZK proofs for transactions that need them. Local compose exposes it on port 6300 by default. |
| **Indexer** | GraphQL interface for querying chain data, including contract state summaries. |
| **Undeployed / devnet** | The bundled Docker devnet used for fast local demos. Uses a well-known genesis seed; never reuse that setup with real funds. |

## Personas

- **Employer admin**: configures org context, employees, pay parameters, runs batches, reads aggregate status.
- **Employee**: authenticates with a wallet, opens payslips, downloads receipts, checks verification.
- **Auditor**: receives time-bounded disclosure, validates proofs and aggregates, avoids unnecessary PII.

## Explicit non-goals (current milestone)

Production payroll tax engines, bank settlement, fiat off-ramps, equity, benefits, multi-country compliance products, and full enterprise RBAC. Tax language in UI or copy should stay labeled as illustrative until a real engine exists.
