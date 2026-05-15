# Veil Product Context

## Register

product

## Product Purpose

Veil is a privacy-first recruiting product. Candidates upload private professional evidence into a vault, Veil converts that evidence into document-backed Verified Claims inside a Trusted Extraction Boundary, and recruiters search candidate-approved Anonymous Recruiter Views without seeing raw evidence.

Private Verification is the primary promise. Recruiter Matching is the product path that proves the promise: useful recruiting intelligence can be evaluated while revealing less private candidate data.

## Source Basis

This product context is derived from GitHub issues #1 through #9, `CONTEXT.md`, `DESIGN.md`, `HANDOFF.md` (operational notes from review loops), and the current app routes for the candidate vault, recruiter search, disclosure grant, privacy audit, fixtures, matching, pipeline, and Midnight private verification boundary.

## Users

- Candidates need a private professional identity vault, flexible Evidence Document upload, AI-derived candidate intelligence, claim review, Anonymous Recruiter View approval, disclosure control, and a privacy audit trail.
- Recruiters need natural-language search over approved anonymous views, ranked matches, explanations, compensation bands, startup exposure, skills, seniority, leadership scope, confidence, and proof status without raw documents or legal identity.
- Platform operators need a focused Claim Taxonomy, a real AI Intelligence Pipeline, Midnight-backed claim commitments and receipts, strict recruiter data boundaries, and tests that prove raw evidence stays private.
- Hackathon judges need to see AI and Midnight used together in the critical product path, not as disconnected demo panels.

## Product Model

- Evidence Documents are flexible private inputs such as resumes, offer letters, pay statements, performance reviews, education records, LinkedIn exports, certificates, or other professional documents.
- Raw Evidence Documents stay inside the Trusted Extraction Boundary. Recruiter-facing flows consume claims, recruiter views, grants, and receipts.
- The AI Intelligence Pipeline classifies documents, extracts structured candidate intelligence, produces Verified Claims, summarizes candidate fit, and avoids unsupported unsafe outputs.
- Verified Claims use a focused taxonomy: role family, skills, seniority, startup exposure, compensation band, leadership scope, employment tenure, education credential, and performance tier.
- Coarse Claims can be candidate-approved into an Anonymous Recruiter View. Precise Claims stay gated until a recruiter requests and the candidate approves a Disclosure Grant.
- Disclosure Grants reveal or upgrade only the requested precise claim for the requesting recruiter. Raw evidence never becomes recruiter-visible in the MVP.
- Midnight-backed Privacy is represented through claim commitments, recruiter-view approvals, disclosure grant receipts, and audit-visible proof artifacts.

## Product Principles

1. Candidate control comes first. Discovery and precise disclosure require explicit candidate action.
2. Reveal less by default. Use bands, categories, thresholds, and anonymous handles before exact facts.
3. Claims beat documents. Recruiters evaluate document-backed claims, not uploaded files.
4. AI stays bounded. The pipeline extracts into the supported taxonomy and rejects personality, culture-fit, protected-trait, demographic, and psychometric signals.
5. Privacy must be visible. UI should show what recruiters can see, what stays gated, what never leaves the vault, and which actions created receipts.
6. Product paths must be real. Candidate upload, claim generation, recruiter search, disclosure request, approval or denial, and audit inspection must operate through app-owned server paths and persistence.

## Tone

Trustworthy, precise, and candidate-protective. Use product language from `CONTEXT.md`: Private Verification, Evidence Document, Verified Claim, AI Intelligence Pipeline, Trusted Extraction Boundary, Anonymous Recruiter View, Disclosure Grant, Coarse Claim, Precise Claim, and Claim Taxonomy.

Avoid generic AI recruiting claims. Avoid overpromising legal-grade truth, zero-knowledge AI inference, issuer attestation, or raw document disclosure.

## Design Direction

Use `DESIGN.md` as the product UI reference: restrained indigo CTA hierarchy, gradient mesh where appropriate, thin display type, pill buttons, near-white cards, deep navy proof panels, and tabular numerics for scores, counts, confidence, and receipts.

Because this is product UI, design serves the task. Familiar app affordances, clear forms, consistent cards, explicit status chips, accessible controls, and visible privacy boundaries matter more than decorative novelty.

## Anti-References

- Generic recruiter CRM or sourcing database.
- Resume parser that exposes full resumes to recruiters.
- Matching-first AI recruiting with privacy as copy only.
- Culture-fit, personality, protected-trait, demographic, or psychometric analysis.
- Raw evidence sharing after disclosure.
- Static demo data that bypasses product storage, server validation, or audit trails.

## Current Product State

The current app contains product routes for candidate vault, recruiter search, disclosure grant, and Midnight receipts, plus TypeScript domain, pipeline, matching, privacy, fixture, storage, product-service, actor, and Midnight boundary modules. Product flows use durable local JSON storage and actor-scoped server actions as development adapters. Production should replace local JSON storage with a managed database and the local actor selector with Clerk or another managed auth provider while preserving the same product boundary.

For cross-session engineering notes (verify:live ports, Turbopack warnings, next-focus), see **`HANDOFF.md`** at the repo root.
