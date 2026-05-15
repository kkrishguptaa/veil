# PRD: Confidential payrolling dApp

## Relationship to this repository

This document is a **product specification**. It does not describe the current Midnight scaffold (demo contract, deploy scripts, or recruiting UI) as the payroll product. Those assets are infrastructure and unrelated samples unless and until this PRD is implemented against them. Any reference to “Midnight ensures …” is a **design target**: confidentiality holds only for a correctly modeled contract, client, private-state store, and settlement rail—not for a public `disclose`-style demo field on chain.

## Problem statement

Employers need to run payroll without broadcasting salary details to the world, while employees still need credible evidence they were paid correctly. Regulators and internal HR often need something they can rely on for audits, but that need conflicts with the employee’s interest in keeping pay private from coworkers, competitors, and public chain history.

Default tools either centralize sensitive numbers in a vendor database or leave too much on a public ledger. The bet here is that private state plus zero-knowledge proofs can separate **pairwise privacy** (employee and employer, and chosen third parties) from **minimum regulatory visibility** (lawful disclosure bundles without putting full payroll on the indexer).

## Solution

A payrolling experience where compensation details live in private witnesses and policy-bound disclosures, not in public ledger fields. The employer authorizes a period payout against a **compensation commitment**; the employee holds a **payout receipt** they can show voluntarily; **selective disclosure packages** express what HR finance and regulators may see under a **policy matrix**. **Settlement** (tokens, shielded transfers, internal book entries) is specified separately from **obligation proofs**, so “payout provable” never silently promises “transfer graph invisible.”

Naming: reserve **regulatory disclosure bundle** or **attestation** for compliance-facing outputs; do not overload **audit** if the product also has generic “activity logs.”

## Trust model (explicit)

- **Who may see plaintext** (employer HRIS, payroll operator, SaaS host) must be stated per deployment mode; “confidential” cannot mean “the vendor never sees numbers” unless architecture enforces it.
- **Cryptographic roles** (keys, multisig, time-locked rotation) should map to org roles (approver, settler, reader of a disclosure package)—not assume “HR” is a primitive on chain.
- **Insider employer risk**: employers already see payroll data in normal systems; the privacy story is chiefly against **third parties and other employees**, plus chain observers—not against the employer’s own authorized admins.

## User stories

1. As an employee, I want my gross and net pay amounts hidden from public indexers, so that strangers cannot reconstruct my income from chain data.
2. As an employee, I want a cryptographic receipt for each pay period, so that I can prove I was paid under the agreed policy if the employer disputes it.
3. As an employee, I want to approve what gets shown to a third party, so that a background check or tax prep tool does not inherit my full pay history by default.
4. As an employee, I want a clear path to rotate payout addresses after device loss, so that payroll continuity does not trap me in a dead wallet.
5. As an employer, I want to authorize payroll runs against private schedule data, so that competitors cannot scrape our compensation structure from the ledger.
6. As an employer, I want an auditable trail of who approved which payout batch, so that internal fraud investigations have accountable actors, not anonymous transactions.
7. As payroll ops, I want to attach period metadata (tax year, pay code) to private bundles, so that downstream reporting tools can map proofs to accounting lines without leaking raw amounts to the public graph.
8. As HR finance, I want a disclosure package that proves aggregate withholding consistency for a period, so that finance can reconcile without publishing every individual’s exact salary on chain.
9. As a regulator (where law allows cryptographic attestation), I want a minimum necessary disclosure bundle, so that statutory reporting can be satisfied without publishing full payroll.
10. As compliance, I want the system to refuse “maximum privacy” modes that violate configured legal minimums, so that we do not ship a mode that is attractive but illegal in a chosen jurisdiction.
11. As an auditor hired by the employer, I want scoped read keys or one-time disclosure artifacts, so that my mandate does not permanently widen visibility.
12. As a terminated employee, I want final pay covered by the same privacy model, so that offboarding does not suddenly dump sensitive numbers into public state.
13. As an employer, I want support for correction payrolls, so that overpayments can be handled with explicit policy rather than silent ledger hacks.
14. As payroll ops, I want garnishment flows flagged when they conflict with headline confidentiality, so that legal obligations are not papered over by marketing language.
15. As a contractor, I want classification-sensitive fields isolated from employee payroll circuits, so that tax logic does not get mashed into one dangerous blob.
16. As an employee on variable comp, I want bonuses modeled as separate authorization types, so that base salary proofs are not invalidated by one-off adjustments.
17. As an employee paid hourly, I want optional binding to approved timesheet commitments, so that “hours worked” claims and pay line up under one policy.
18. As an employer, I want multi-currency or token policy to be explicit in v1 or explicitly deferred, so that users do not assume fiat settlement that the chain does not provide.
19. As security, I want private state backups defined (employer-held, employee-held, or split), so that disaster recovery does not collapse to “trust the vendor’s Postgres.”
20. As an employee, I want export of disclosure receipts in a portable format, so that I can store evidence outside the app.
21. As an employer, I want revocation of stale disclosure grants, so that an old auditor credential stops working at contract end.
22. As a developer, I want the Compact boundary small and swappable, so that we can start with commitment adapters and replace with on-circuit logic without rewriting the whole app shell.
23. As CI, I want an automated smoke path that deploys the payroll contract to devnet and reads expected state, so that regressions in proof wiring are caught early once a payroll contract exists.
24. As a product manager, I want in-app language that distinguishes product activity logs from regulatory disclosure bundles, so that “audit” is not overloaded in UI or code.
25. As an employee, I want clear UX when a proof fails verification, so that I know whether to blame network, keys, or employer input.
26. As an employer, I want batch payroll with bounded proof cost, so that large companies do not hit impractical proving times per run.
27. As legal, I want the trust model written down (who can see plaintext, who runs operators), so that SaaS hosting assumptions do not silently break confidentiality claims.
28. As an employee union rep (optional stakeholder), I want transparency features where law requires them, so that collective bargaining rights are not “privacy-washed” away.
29. As payroll ops, I want dry-run mode that validates policy without moving funds, so that fat-fingered period dates do not create irreversible transfers.
30. As an employee, I want notifications when a new payout authorization targets my bound identity, so that impersonation attempts surface early.
31. As an employer, I want role separation between approver and deployer keys where possible, so that one compromised laptop does not authorize and settle alone.
32. As a regulator (jurisdiction-specific), I want the v1 scope to name which statutes are in or out, so that sales does not promise universal compliance.
33. As a reader of marketing for this product, I want claims tied to obligation proofs vs settlement observability, so that expectations match what cryptography actually hides.
34. As a sibling product (e.g. recruiting), I want shared chain infrastructure but a separate glossary or context map, so that “compensation band” profile signals never collide with payroll **compensation commitments**.
35. As an employee, I want mobile-friendly signing flows or documented limits, so that hardware wallet users are not blocked on pay day.
36. As finance, I want GL mapping identifiers carried in private bundles, so that ERP integration does not require posting private salaries to chat tools.
37. As an employer acquiring another company, I want migration of payroll commitments without re-leaking historical salaries, so that M&A data handling has a story.
38. As an employee on leave without pay, I want zero-net periods modeled honestly, so that proofs do not look like “missing” payroll when they are intentional.
39. As observability, I want metrics on proof latency and failure rates without logging sensitive payloads, so that ops can keep the system healthy.
40. As a future integrator, I want a stable HTTP or SDK boundary for “create authorization” and “verify disclosure package,” so that HRIS vendors can integrate without forking internal types.
41. As an employee, I want optional plain-language explanations of a disclosure package (what each field proves and what it does not), so that I can consent without reading cryptography.
42. As payroll ops, I want AI-assisted categorization of **non-secret** metadata (pay codes, cost centers) with human confirmation, so that setup is faster without auto-classifying salary amounts.
43. As compliance, I want any AI-generated summaries of obligations to be labeled non-authoritative until a human approves, so that models never silently change legal posture.
44. As an employer, I want anomaly hints on **timing and batch integrity** (missing period, duplicate authorization id) without sending gross amounts to a model, so that ops get signal without new data exfiltration paths.

## AI in the product

AI fits where it **does not need raw salaries** and never **authorizes** proofs or settlements alone.

- **Explain and consent**: Turn fixed disclosure schemas into readable copy; always scoped to “what this package proves,” not “infer the employee’s life story.” Human review before sending third parties.
- **Ops acceleration**: Classify or suggest mappings for **public or employer-owned** metadata (GL codes, departments); block prompts that include witness payloads unless explicitly opted in and audited.
- **Anomaly detection**: Rules + models on **hashes, ids, timestamps, batch shapes**—signals like skipped pay period or mismatched policy id—without training on employee net pay.
- **Document intake (later)**: OCR or extraction for **tax forms or offer letters** only under encryption and policy; extraction output feeds human verification before any commitment is minted.
- **Hard red lines**: No AI as sole signer; no “regenerate proof to fix numbers”; no sending full private witness to external APIs unless product + legal explicitly allow and log that path.

## Implementation decisions

- **Compensation commitment**: payroll obligation anchored by private payload hash + public policy id; distinct from recruiting “compensation band” profile claims—namespace in types and UI.
- **Payout authorization**: employer intent for a period, recipient binding, authorization type (base, bonus, correction, final); proofs attach here first.
- **Settlement rail**: how value moves; threat model for indexer-visible transfers documented separately from obligation proofs.
- **Selective disclosure packages**: shapes for employee receipt, employer internal bundle, regulator minimum bundle; versioned schema.
- **Policy matrix**: jurisdiction pack lists minimum disclosures; engine rejects incompatible “privacy modes.”
- **Crypto boundary**: small exported surface; adapter-first acceptable; Compact replaces adapter when ready—same engineering habit as other Midnight apps, not tied to any current demo contract name.
- **Lifecycle**: recipient rotation, disputes, clawback, garnishment—specified as state machines plus legal process where crypto stops.
- **Deep modules (target)**: commitment and schedule; payout authorization; settlement adapter; disclosure package builder; lifecycle and corrections. Boundaries may shift when implementation starts.

## Testing decisions

- Test **observable behavior**: verifier accepts valid fixture bundles, rejects tampered; policy matrix rejects illegal modes; authorization lifecycle transitions.
- Avoid brittle snapshots of witness byte layout across circuit versions.
- **Smoke**: when a payroll contract exists, devnet deploy + read state (same discipline as generic Midnight CI smoke), with documented dev-seed warnings.
- **First unit-test targets** (proposal): disclosure verifier, policy matrix parser, commitment hash helpers—confirm with owners before locking.

## Out of scope

- Legal sign-off for any specific jurisdiction’s payroll, tax, wage transparency, AML, or sanctions rules.
- Full HRIS replacement, time clocks, or bank ACH unless added later.
- Claiming that ZK proofs alone equal statutory compliance without counsel and product design.
- Merging unrelated product lines (e.g. recruiting UX) into payroll v1 unless explicitly decided.

## Risks called out in review (grill)

- **Public vs private fields**: anything accidentally disclosed on ledger leaks permanently; discipline around `disclose` and public structs is non-negotiable.
- **Settlement vs proof**: shielded or public transfer graphs may still leak patterns if conflated with “payroll proof.”
- **Legal reality**: garnishment, contractor rules, wage transparency—may require disclosures that break a naive “only two parties ever see amounts” headline; product copy must use **minimum necessary** language.
- **Vendor mode**: if SaaS operators see plaintext, marketing must not imply otherwise.

## Open questions

- v1 jurisdiction set and policy packs.
- Gross vs net and withholdings inside witness vs separate tax tool.
- Recipient binding and rotation UX and on-chain representation.
- Token vs notional vs off-chain fiat representation for settlement.
- Disaster recovery: split custody vs single vendor backup.

## Further notes

- When implementation lands in a repo, add glossary files (`CONTEXT.md` / `CONTEXT-MAP.md`) using the terms above so code and issues do not drift synonyms.
- Proposed module list and test priority are starting points—adjust in the first engineering milestone after spike.
