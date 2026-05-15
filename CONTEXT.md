# Veil

Veil is a privacy-first recruiting context where candidates keep sensitive career data private while recruiters evaluate verified, selectively disclosed intelligence.

## Language

**Private Verification**:
The primary product promise that recruiting signals can be verified without exposing the raw evidence behind them.
_Avoid_: Generic AI recruiting, matching-first recruiting

**Midnight-backed Privacy**:
The hackathon constraint that Veil's privacy story must use Midnight as core infrastructure, not as branding alone.
_Avoid_: Midnight narrative only, generic privacy adapter

**Verified Claim**:
A document-backed claim that exposes a derived recruiting signal while keeping the private evidence hidden.
_Avoid_: Legal verification, issuer attestation, guaranteed truth

**Evidence Document**:
Any candidate-uploaded private document that can support verified claims.
_Avoid_: Resume slot, fixed document type

**Candidate Intelligence**:
Structured recruiting signals derived from a candidate's private professional data.
_Avoid_: Candidate data, profile enrichment

**AI Intelligence Pipeline**:
The real AI workflow that extracts, summarizes, and matches candidate intelligence from private documents.
_Avoid_: Seeded AI output, mocked AI capability

**Trusted Extraction Boundary**:
The internal Veil boundary where raw private documents may be processed into candidate intelligence.
_Avoid_: Recruiter-visible AI processing, zero-knowledge AI inference

**Recruiter Matching**:
A discovery workflow that uses candidate intelligence to demonstrate private verification.
_Avoid_: Primary product differentiator

**Recruiter View**:
The candidate-approved set of claims and summaries that can appear in recruiter discovery.
_Avoid_: Public profile, full candidate profile

**Anonymous Recruiter View**:
A recruiter view that hides the candidate's real-world identity by default.
_Avoid_: Named profile, resume profile

**Disclosure Grant**:
A candidate-approved permission that reveals or upgrades specific claims for a specific recruiter without exposing raw evidence.
_Avoid_: General consent, blanket document access, raw document disclosure

**Coarse Claim**:
A recruiter-visible claim expressed as a category, threshold, or band that avoids identifying exact private facts.
_Avoid_: Exact claim, raw fact

**Precise Claim**:
A more identifying or exact claim that requires a disclosure grant before a recruiter can see it.
_Avoid_: Default-visible claim

**Claim Taxonomy**:
The supported set of claim types Veil extracts and matches against in the first PRD.
_Avoid_: Free-form AI facts, arbitrary claim types

**Hackathon MVP**:
The first implementation slice proving Midnight-backed private verification and real AI candidate intelligence.
_Avoid_: Full recruiting platform, long-term talent graph

## Relationships

- **Private Verification** is the main demo priority for the first PRD.
- **Midnight-backed Privacy** is required for the hackathon demo.
- A **Verified Claim** is backed by one or more **Evidence Documents**, not by issuer attestation in the first PRD.
- The **AI Intelligence Pipeline** must be real across extraction, summarization, and matching.
- The **AI Intelligence Pipeline** classifies flexible **Evidence Documents** rather than relying only on fixed upload slots.
- The **Trusted Extraction Boundary** can inspect raw documents, but recruiter-facing systems consume **Candidate Intelligence** and **Verified Claims**.
- **Recruiter Matching** uses **Candidate Intelligence** to make **Private Verification** visible to recruiters.
- An **Anonymous Recruiter View** makes a candidate searchable without revealing raw evidence or real-world identity.
- A **Disclosure Grant** is separate from a **Recruiter View** and applies only to specific claim upgrades.
- An **Anonymous Recruiter View** contains **Coarse Claims** by default.
- A **Disclosure Grant** can reveal **Precise Claims** without exposing raw evidence.
- The initial **Claim Taxonomy** includes role family, skills, seniority, startup exposure, compensation band, leadership scope, employment tenure, education credential, and performance tier.
- The **Hackathon MVP** is implementation scope; the broader marketplace, career agent, and talent graph are long-term direction.

## Example Dialogue

> **Dev:** "Should we spend more time improving ranking quality or making disclosure boundaries obvious?"
> **Domain expert:** "Make disclosure boundaries obvious first; matching only needs to be strong enough to prove private verification matters."

## Implementation map (for agents)

These are pointers for navigating the codebase, not new glossary terms.

- **Product flows:** server actions and services under `src/` (candidate vault, recruiter search, disclosure, audit). Flows must hit app-owned persistence, not static page-only fixtures.
- **Persistence:** local JSON store (e.g. `.veil-data/` in dev) behind a replaceable adapter; production expects DB/blob storage while keeping the same domain boundaries.
- **Actor boundary:** `src/lib/actors.ts` (or equivalent) gates candidate vs recruiter until Clerk or another managed auth maps real identities and roles.
- **Midnight path:** `src/privacy/midnight-private-verification.ts` implements the local commitment/receipt story; on-chain or hosted Midnight integration remains roadmap.
- **Session handoff:** root **`HANDOFF.md`** logs multi-iteration review notes, Turbopack/NFT risks on file-backed imports, and next-focus items.

## Flagged Ambiguities

- "AI-native recruiting platform" can imply generic recruiter matching; resolved: Veil is privacy-first, and recruiter matching is a narrative vehicle for private verification in the first PRD.
- "Verified" can imply issuer-attested or legal-grade truth; resolved: in the first PRD, a **Verified Claim** means document-backed and privacy-preserved.
- "AI analyzes privately" can imply private LLM inference; resolved: in the first PRD, AI processing happens inside Veil's **Trusted Extraction Boundary**, not through a claimed zero-knowledge inference system.
- "Candidate approval" can mean search visibility or deeper claim access; resolved: a **Recruiter View** controls discovery, while a **Disclosure Grant** controls claim upgrades without raw evidence disclosure.
- "Selective disclosure" can imply exposing documents; resolved: the first PRD discloses claims only, not raw source evidence.
- "Candidate card" can imply a named resume profile; resolved: recruiter search shows an **Anonymous Recruiter View** by default.
- "Recruiter-visible claim" can mean either coarse or precise; resolved: **Coarse Claims** are default-visible, while **Precise Claims** require a **Disclosure Grant**.
- "Midnight integration" can mean branding or implementation; resolved: for the Midnight AI track, Midnight must be core infrastructure in the first PRD.
- Which Midnight primitive anchors the demo is not fully resolved; working assumption: claim commitments and selective claim disclosure are the core Midnight path.
- "AI-powered" can mean mocked demo output; resolved: the first PRD requires a real **AI Intelligence Pipeline**.
- "Culture-fit analysis" is bias-prone in hiring; resolved: fit analysis is out of scope for the first PRD.
- "Candidate uploads" can imply fixed document slots; resolved: Veil accepts flexible **Evidence Documents** and classifies them through AI.
- "Structured intelligence" can imply open-ended AI facts; resolved: the first PRD uses a focused **Claim Taxonomy** and excludes personality, culture fit, protected traits, and psychometric labels.
- "Veil platform" can imply the whole long-term product; resolved: the PRD should specify the **Hackathon MVP** and keep long-term modules as direction only.
