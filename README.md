# Veil

Privacy-first recruiting: candidates keep Evidence Documents private while
recruiters evaluate Midnight-backed Verified Claims and candidate-approved
Anonymous Recruiter Views. Product language lives in `CONTEXT.md` and
`PRODUCT.md`; visual system in `DESIGN.md`.

## App

- `src/app/candidate-vault`: candidate evidence vault, claim review, recruiter boundary.
- `src/app/recruiter-search`: core recruiter query over approved anonymous views.
- `src/app/disclosure`: claim-only Disclosure Grant workflow and receipts.
- `src/lib/domain.ts`: shared domain model for Evidence Documents, Verified Claims,
  Recruiter Views, Disclosure Grants, and audit events.
- `src/lib/fixtures.ts`: realistic demo data for the hackathon narrative.
- `src/lib/*.ts`: runnable privacy, matching, and extraction pipeline logic.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run test
npm run build
npm run verify
```
