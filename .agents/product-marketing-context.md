# Product marketing context

*Last updated: 2026-05-16*

## Product overview

**One-liner:** Veil is confidential payroll infrastructure on Midnight: pay teams without turning salaries into public ledger trivia.

**What it does:** Employers run batches against a Midnight contract path that keeps sensitive compensation out of cleartext chain gossip. Employees still get receipts they can verify. Auditors can follow proofs and aggregates instead of asking HR to email spreadsheets around.

**Product category:** On-chain payroll and compliance demos built on programmable privacy.

**Product type:** Open-source developer demo (web app + contract scaffold + scripts).

**Business model:** Not a hosted product in this repo. Treat everything as **local devnet first**, with optional public testnets for show-and-tell.

## Target audience

**Who:** Hackathon judges, protocol engineers, and startup founders who already feel awkward about SaaS payroll databases.

**Primary use case:** Show a believable end-to-end story: company setup, employee record, batch run, employee verification, auditor view with limited disclosure.

**Jobs to be done:**

- "Let me prove we paid people without publishing everyone's number."
- "Let auditors stop asking for exports that should not leave HR."

## Problems and pain points

Payroll vendors see too much. Blockchains see too much by default if you write naively. Employees lose agency when receipts live only inside a portal they do not control.

## Differentiation

Midnight gives you a place to put **private state** and **proofs** in the same application model, so the story is not "trust our database," it is "here is what cryptography actually lets each role see."

## Objections

| Objection | Response |
| --- | --- |
| "Is this production payroll?" | No. It is a scaffold and demo narrative. Tax and banking are out of scope until explicitly built. |
| "Is my salary on chain?" | Not in cleartext in the target design. Today the repo ships the **Veil** Compact slice with **public** ledger placeholders plus real indexer reads; private compensation state is a follow-on milestone. |
| "Is the devnet seed safe?" | Only for local throwaway value. Read the README warning before touching public networks. |

## Customer language to prefer

confidential payroll, selective disclosure, verifiable batch, receipt, proof, employer, auditor, Midnight, Compact.

## Words to avoid for now

Obsolete working titles or hype phrases ("AI payroll," "fully automated tax," "mainnet ready," "bank grade") without the actual rails. The product name is **Veil** everywhere user-facing.

## Brand voice

Direct, slightly technical, honest about scope. Security-forward without horror-movie lighting in the copy.

## Goals

**Conversion action:** Clone the repo, run `npm run setup`, walk the demo checklist.

**Proof theme:** If someone reads the landing page and the README, they should understand roles, privacy boundaries, and what is real versus placeholder in one pass.
