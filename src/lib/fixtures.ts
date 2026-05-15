import type {
  AuditEvent,
  CandidateVault,
  DisclosureGrant,
  EvidenceDocument,
  VerifiedClaim,
} from "./domain";
import { buildFixtureDisclosureGrants, materializeMidnightForVault } from "./midnight-seed-materialize";

const now = "2026-05-16T09:20:00.000Z";

const candidate7KQDocuments: EvidenceDocument[] = [
  {
    id: "doc-7kq-offer-2024",
    candidateId: "candidate-7kq",
    title: "Series B offer letter",
    kind: "offer-letter",
    uploadedAt: "2026-05-16T09:12:00.000Z",
    rawText:
      "Northstar Robotics offer for legal-name Priya Raman, Backend Platform Staff Engineer, exact cash INR 46L, equity 0.16%, Series B.",
    privateSummary:
      "Contains legal identity, exact employer, exact compensation, and equity details. Recruiters see banded compensation only.",
    midnightCommitment: "midnight:commitment:7kq-offer:c8e41f",
  },
  {
    id: "doc-7kq-review-2023",
    candidateId: "candidate-7kq",
    title: "Annual performance packet",
    kind: "performance-review",
    uploadedAt: "2026-05-16T09:14:00.000Z",
    rawText:
      "Manager notes: led 11 engineers across privacy search launch, exceeded expectations four cycles, strong TypeScript and distributed systems work.",
    privateSummary:
      "Contains manager notes and peer feedback. Recruiters see a coarse performance tier and leadership scope.",
    midnightCommitment: "midnight:commitment:7kq-review:92ab01",
  },
  {
    id: "doc-7kq-education",
    candidateId: "candidate-7kq",
    title: "Graduate credential",
    kind: "education-record",
    uploadedAt: "2026-05-16T09:17:00.000Z",
    rawText:
      "Master of Science in Computer Science, private institution identifier, legal-name Priya Raman.",
    privateSummary:
      "Contains legal name and institution identifiers. Recruiters see credential level only by default.",
    midnightCommitment: "midnight:commitment:7kq-education:4bd822",
  },
];

const candidate2VMDocuments: EvidenceDocument[] = [
  {
    id: "doc-2vm-linkedin",
    candidateId: "candidate-2vm",
    title: "LinkedIn export",
    kind: "linkedin-export",
    uploadedAt: "2026-05-16T09:24:00.000Z",
    rawText:
      "Backend engineer with fintech platform roles, 5 years tenure, Java/Kotlin, one startup after Series C, target cash INR 58L.",
    privateSummary:
      "Contains exact employers and compensation target. Recruiters see abstract experience and salary band only.",
    midnightCommitment: "midnight:commitment:2vm-linkedin:31cb75",
  },
];

const candidate4PXDocuments: EvidenceDocument[] = [
  {
    id: "doc-4px-resume",
    candidateId: "candidate-4px",
    title: "Project resume",
    kind: "resume",
    uploadedAt: "2026-05-16T09:28:00.000Z",
    rawText:
      "Engineering manager for consumer app launch, React Native, team of 6, no compensation evidence included.",
    privateSummary:
      "Contains named project and employer trail. Recruiters see role family and leadership band only.",
    midnightCommitment: "midnight:commitment:4px-resume:b628c9",
  },
];

const allEvidenceDocuments = [
  ...candidate7KQDocuments,
  ...candidate2VMDocuments,
  ...candidate4PXDocuments,
];

const candidateVaultsBase: CandidateVault[] = [
  {
    candidateId: "candidate-7kq",
    legalName: "Priya Raman",
    anonymousHandle: "Anonymous Candidate 7KQ",
    approvedForDiscovery: true,
    evidenceDocuments: candidate7KQDocuments,
    aiSummary:
      "Backend privacy systems engineer with startup exposure, senior leadership scope, and compensation inside the target band.",
    verifiedClaims: [
      claim("claim-7kq-role", "candidate-7kq", "role-family", "Role family", "Backend engineering", "Backend Platform Staff Engineer", "coarse", 0.94, [
        "doc-7kq-offer-2024",
        "doc-7kq-review-2023",
      ]),
      claim("claim-7kq-skills", "candidate-7kq", "skills", "Skills", "TypeScript, distributed systems, privacy search", "TypeScript, secure parsing, search ranking, RAG evals", "coarse", 0.91, [
        "doc-7kq-review-2023",
      ]),
      claim("claim-7kq-seniority", "candidate-7kq", "seniority", "Seniority", "Senior+", "Staff-level scope across 11 engineers", "coarse", 0.88, [
        "doc-7kq-review-2023",
      ]),
      claim("claim-7kq-startup", "candidate-7kq", "startup-exposure", "Startup exposure", "Series A-C operating history", "Series B robotics company", "coarse", 0.9, [
        "doc-7kq-offer-2024",
      ]),
      claim("claim-7kq-comp", "candidate-7kq", "compensation-band", "Compensation band", "INR 40L-50L target cash", "INR 46L exact cash plus 0.16% equity", "coarse", 0.92, [
        "doc-7kq-offer-2024",
      ]),
      claim("claim-7kq-leadership", "candidate-7kq", "leadership-scope", "Leadership scope", "Led multi-team delivery", "Led 11 engineers across privacy search launch", "precise", 0.89, [
        "doc-7kq-review-2023",
      ]),
      claim("claim-7kq-tenure", "candidate-7kq", "employment-tenure", "Employment tenure", "Stable 3+ year recent tenure", "3 years 7 months in current role", "precise", 0.87, [
        "doc-7kq-review-2023",
      ]),
      claim("claim-7kq-education", "candidate-7kq", "education-credential", "Education credential", "Graduate technical degree", "M.S. Computer Science, institution hidden", "coarse", 0.86, [
        "doc-7kq-education",
      ]),
      claim("claim-7kq-performance", "candidate-7kq", "performance-tier", "Performance tier", "Top performance band", "Exceeded expectations in 4 consecutive cycles", "precise", 0.93, [
        "doc-7kq-review-2023",
      ]),
    ],
  },
  {
    candidateId: "candidate-2vm",
    legalName: "Mateo Silva",
    anonymousHandle: "Anonymous Candidate 2VM",
    approvedForDiscovery: true,
    evidenceDocuments: candidate2VMDocuments,
    aiSummary:
      "Strong backend engineer with relevant skills, but compensation band sits above the core demo query.",
    verifiedClaims: [
      claim("claim-2vm-role", "candidate-2vm", "role-family", "Role family", "Backend engineering", "Fintech backend engineer", "coarse", 0.88, ["doc-2vm-linkedin"]),
      claim("claim-2vm-skills", "candidate-2vm", "skills", "Skills", "Kotlin, Java, platform APIs", "Kotlin services, Java ledger APIs", "coarse", 0.84, ["doc-2vm-linkedin"]),
      claim("claim-2vm-startup", "candidate-2vm", "startup-exposure", "Startup exposure", "Growth-stage startup exposure", "Series C fintech operator", "coarse", 0.78, ["doc-2vm-linkedin"]),
      claim("claim-2vm-comp", "candidate-2vm", "compensation-band", "Compensation band", "INR 55L-65L target cash", "INR 58L exact target cash", "coarse", 0.8, ["doc-2vm-linkedin"]),
    ],
  },
  {
    candidateId: "candidate-4px",
    legalName: "Anika Chen",
    anonymousHandle: "Anonymous Candidate 4PX",
    approvedForDiscovery: false,
    evidenceDocuments: candidate4PXDocuments,
    aiSummary:
      "Engineering management background is promising, but the candidate has not approved discovery.",
    verifiedClaims: [
      claim("claim-4px-role", "candidate-4px", "role-family", "Role family", "Engineering management", "Consumer app engineering manager", "coarse", 0.83, ["doc-4px-resume"]),
      claim("claim-4px-leadership", "candidate-4px", "leadership-scope", "Leadership scope", "Managed small team", "Managed 6 mobile engineers", "precise", 0.79, ["doc-4px-resume"]),
    ],
  },
];

export const candidateVaults = candidateVaultsBase.map(materializeMidnightForVault);

export const disclosureGrants: DisclosureGrant[] = buildFixtureDisclosureGrants(candidateVaults);

function disclosureGrantReceipt(grantId: string) {
  const grant = disclosureGrants.find((candidate) => candidate.id === grantId);
  if (!grant) {
    throw new Error(`missing disclosure grant fixture: ${grantId}`);
  }
  return grant.midnightReceipt;
}

export const auditEvents: AuditEvent[] = [
  event("audit-upload-7kq", "candidate-7kq", "candidate", "evidence.uploaded", "doc-7kq-offer-2024", "midnight:commitment:7kq-offer:c8e41f"),
  event("audit-extract-7kq", "candidate-7kq", "veil", "ai.extracted", "candidate-7kq", "midnight:extraction:7kq:7bc111"),
  event("audit-claim-7kq", "candidate-7kq", "veil", "claim.created", "claim-7kq-comp", "midnight:claim:7kq-comp:db7259"),
  event("audit-view-7kq", "candidate-7kq", "candidate", "recruiter-view.approved", "candidate-7kq", "midnight:view:7kq:907ac0"),
  event("audit-search-7kq", "candidate-7kq", "recruiter", "recruiter-search.visible", "recruiter-northstar", "midnight:search-visible:7kq:0bb8f3"),
  event("audit-request-7kq", "candidate-7kq", "recruiter", "disclosure.requested", "claim-7kq-leadership", disclosureGrantReceipt("grant-7kq-leadership-northstar")),
  event("audit-approve-7kq", "candidate-7kq", "candidate", "disclosure.approved", "claim-7kq-tenure", disclosureGrantReceipt("grant-7kq-tenure-northstar")),
  event("audit-deny-7kq", "candidate-7kq", "candidate", "disclosure.denied", "claim-7kq-performance", disclosureGrantReceipt("grant-7kq-performance-contoso")),
  event("audit-upgrade-7kq", "candidate-7kq", "veil", "claim.upgraded", "claim-7kq-tenure", disclosureGrantReceipt("grant-7kq-tenure-northstar")),
];

function claim(
  id: string,
  candidateId: string,
  kind: VerifiedClaim["kind"],
  label: string,
  coarseValue: string,
  preciseValue: string,
  privacyLevel: VerifiedClaim["privacyLevel"],
  confidence: number,
  evidenceIds: string[],
): VerifiedClaim {
  return {
    id,
    candidateId,
    kind,
    label,
    coarseValue,
    preciseValue,
    privacyLevel,
    confidence,
    evidenceIds,
    provenance: evidenceIds.map((evidenceId) => {
      const document = allEvidenceDocuments.find((candidateDocument) => candidateDocument.id === evidenceId);

      return {
        evidenceId,
        documentKind: document?.kind ?? "other",
        support: "direct",
      };
    }),
    privacyPolicy: {
      defaultVisibility: privacyLevel === "coarse" ? "recruiter-view" : "gated",
      preciseClaimRequiresDisclosureGrant: true,
      rawEvidenceVisibleToRecruiter: false,
    },
    extractionNotes: `${label} fixture extracted from private evidence for demo narrative.`,
    source: "fixture",
    midnightCommitment: `midnight:claim:${id}`,
  };
}

function event(
  id: string,
  candidateId: string,
  actor: AuditEvent["actor"],
  action: AuditEvent["action"],
  targetId: string,
  receipt: string,
): AuditEvent {
  return {
    id,
    candidateId,
    actor,
    action,
    targetId,
    timestamp: now,
    receipt,
  };
}
