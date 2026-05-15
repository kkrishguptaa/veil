import { readFile } from "node:fs/promises";

const requiredClaims = [
  "compensation-band",
  "startup-exposure",
  "skills",
  "leadership-scope",
  "employment-tenure",
  "education-credential",
  "performance-tier",
];

const requiredFlow = [
  "Evidence Documents",
  "Verified Claims",
  "Anonymous Recruiter View",
  "Recruiter Matching",
  "Disclosure Grant",
];

const readProjectFile = (path: string) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [
  fixtureSource,
  globalsCss,
  shellSource,
  homePage,
  candidatePage,
  recruiterPage,
  disclosurePage,
] = await Promise.all([
  readProjectFile("src/lib/fixtures.ts"),
  readProjectFile("src/app/globals.css"),
  readProjectFile("src/components/app-shell.tsx"),
  readProjectFile("src/app/page.tsx"),
  readProjectFile("src/app/candidate-vault/page.tsx"),
  readProjectFile("src/app/recruiter-search/page.tsx"),
  readProjectFile("src/app/disclosure/page.tsx"),
]);

const appSource = [homePage, candidatePage, recruiterPage, disclosurePage].join("\n");

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

for (const claimId of requiredClaims) {
  assert(fixtureSource.includes(claimId), `Missing fixture claim: ${claimId}`);
}

for (const step of requiredFlow) {
  assert(appSource.includes(step), `Missing demo flow copy: ${step}`);
}

const candidateCount = (fixtureSource.match(/legalName:/g) ?? []).length;
const evidenceCount = (fixtureSource.match(/rawText:/g) ?? []).length;

assert(candidateCount >= 3, "Expected candidate fixtures");
assert(evidenceCount >= 3, "Expected private raw Evidence Document fixtures");
assert(fixtureSource.includes('state: "requested"'), "Missing requested Disclosure Grant state");
assert(fixtureSource.includes('state: "approved"'), "Missing approved Disclosure Grant state");
assert(fixtureSource.includes('state: "denied"'), "Missing denied Disclosure Grant state");
assert(fixtureSource.includes("midnight:"), "Missing Midnight receipts");
assert(candidatePage.includes("raw visible: {String(document.rawTextVisible)}"), "Candidate page must show raw-doc boundary state");
assert(recruiterPage.includes("Raw documents shown"), "Recruiter page must state raw documents hidden");
assert(disclosurePage.includes("Raw document text stays sealed."), "Disclosure page must show sealed evidence state");
assert(!recruiterPage.includes("rawText"), "Recruiter page must not read raw evidence text");

assert(globalsCss.includes("--primary: #533afd"), "Missing DESIGN.md indigo CTA token");
assert(globalsCss.includes(".gradient-mesh"), "Missing gradient mesh implementation");
assert(globalsCss.includes("font-variant-numeric: tabular-nums"), "Missing tabular numeric treatment");
assert(globalsCss.includes("font-weight: 300"), "Missing thin display type treatment");
assert(shellSource.includes("rounded-full bg-[var(--primary)]"), "Missing indigo pill CTA");
assert(shellSource.includes("gradient-mesh"), "Missing shell gradient mesh");
assert(appSource.includes("Trusted Extraction Boundary"), "Missing privacy narrative boundary");

console.log(
  [
    "Veil demo verification passed.",
    `Fixture candidates: ${candidateCount}`,
    `Evidence fixtures: ${evidenceCount}`,
    "Flow: upload -> review -> anonymous match -> disclosure grant",
    "Design: gradient mesh, indigo CTA, thin type, pill buttons, cards, tabular numerics",
  ].join("\n"),
);
