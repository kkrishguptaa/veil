# Midnight-Backed Private Verification Path

Issue #2 chooses the Hackathon MVP privacy path: **Midnight-backed claim commitments with candidate-approved selective disclosure receipts**.

## Product Boundary

Veil treats raw Evidence Documents as private inputs inside the Trusted Extraction Boundary. Recruiter-facing systems only receive Candidate Intelligence and Verified Claims.

The small boundary exposed to later slices is `src/privacy/midnight-private-verification.ts`. It supports:

- Evidence Document hashing without returning raw document bodies.
- Verified Claim commitments over private claim payloads.
- Candidate-approved Recruiter Views containing coarse claims.
- Disclosure Grant requests for precise claim upgrades.
- Disclosure receipts that reveal approved claim fields only, never raw evidence.

Later UI/API work should call this boundary rather than depending on Midnight internals.

## Chosen Midnight Path

The real Midnight implementation should use a Compact contract named `VeilClaimRegistry.compact` with three ledger concepts:

1. `ClaimCommitment`: commitment id, candidate id, claim type, body hash references, confidence, and a `transientCommit`-style commitment over the private witness payload.
2. `RecruiterViewApproval`: candidate-approved list of claim commitment ids and coarse claim payload commitment.
3. `DisclosureReceipt`: grant id, recruiter id, claim id, disclosed field names, disclosed value commitment, and receipt commitment.

Midnight docs support this path:

- Compact is privacy-by-default: witness data and values derived from witness data must be explicitly wrapped in `disclose()` before ledger storage, exported circuit returns, or passing to another contract.
- Compact treats `transientCommit(e)` as safe for witness-derived data without explicit disclosure, while ordinary hashes can still carry witness-disclosure concerns.
- Compiled Compact contracts produce JavaScript/TypeScript modules, so app tests can import generated circuits and verify behavior before full network/prover integration.

## Why Adapter First

This repo started as documentation only: no package, app shell, Compact compiler config, proof server config, or Midnight runtime scaffold existed. A direct SDK integration would require bootstrapping more toolchain than issue #2 asks for.

So this slice adds a local adapter that models the same contract boundary with deterministic SHA-256 commitments and receipts. It is intentionally small and executable. The adapter proves the shape of the privacy boundary now, then can be swapped behind the same public functions once the Compact contract is added.

## Swap Plan

Replace the local adapter in this order:

1. Add `contracts/VeilClaimRegistry.compact`.
2. Implement witnesses for private claim payloads, evidence hashes, candidate approval, and disclosure decisions.
3. Compile Compact to managed JavaScript/TypeScript output.
4. Replace `commitPrivateClaim`, `approveRecruiterView`, and `approveDisclosureGrant` internals with generated circuit calls.
5. Keep exported boundary functions stable for app/API callers.
6. Extend `npm test` so the existing behavior tests run against the generated Compact JavaScript implementation.
7. Add network/prover smoke test once Midnight node/proof infrastructure exists.

## Executable Proof

Run:

```sh
npm run prove:midnight
```

Expected proof:

- Claim commitments verify.
- Candidate-approved Recruiter View shows coarse claims only.
- Disclosure Grant reveals a precise claim value to a recruiter-specific receipt.
- Raw Evidence Document bodies are absent from recruiter-visible output.

Run:

```sh
npm run test:privacy
```

Covered behavior:

- Commitment creation and verification.
- Tamper detection.
- Recruiter View approval and coarse-only visibility.
- Disclosure receipt verification without raw evidence exposure.
