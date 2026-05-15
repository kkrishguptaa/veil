"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateLocalActor } from "@/lib/actors";
import type { EvidenceDocumentKind } from "@/lib/domain";
import {
  approveAnonymousRecruiterView,
  decidePreciseClaimGrant,
  recordRecruiterSearch,
  requestPreciseClaimGrant,
  uploadEvidenceAndExtractClaims,
} from "@/lib/product-service";
import { getLocalVeilStore } from "@/lib/store";

const evidenceKinds = [
  "resume",
  "offer-letter",
  "pay-statement",
  "performance-review",
  "education-record",
  "linkedin-export",
  "certificate",
  "other",
] as const satisfies readonly EvidenceDocumentKind[];

export async function uploadEvidenceAction(formData: FormData) {
  const actor = validateLocalActor({
    actorId: formData.get("actorId"),
    expectedRole: "candidate",
  });
  const kind = parseEvidenceKind(formData.get("kind"));

  await uploadEvidenceAndExtractClaims(getLocalVeilStore(), {
    actor,
    candidateId: parseString(formData.get("candidateId")),
    legalName: parseString(formData.get("legalName")),
    anonymousHandle: parseString(formData.get("anonymousHandle")),
    title: parseString(formData.get("title")),
    kind,
    rawText: parseString(formData.get("rawText")),
  });

  revalidatePath("/");
  revalidatePath("/candidate-vault");
  revalidatePath("/recruiter-search");
  redirect(`/candidate-vault?candidateId=${encodeURIComponent(actor.candidateId ?? "")}`);
}

export async function approveRecruiterViewAction(formData: FormData) {
  const actor = validateLocalActor({
    actorId: formData.get("actorId"),
    expectedRole: "candidate",
  });
  const candidateId = parseString(formData.get("candidateId"));

  await approveAnonymousRecruiterView(getLocalVeilStore(), {
    actor,
    candidateId,
  });

  revalidatePath("/");
  revalidatePath("/candidate-vault");
  revalidatePath("/recruiter-search");
  redirect(`/candidate-vault?candidateId=${encodeURIComponent(candidateId)}`);
}

export async function requestDisclosureGrantAction(formData: FormData) {
  const actor = validateLocalActor({
    actorId: formData.get("actorId"),
    expectedRole: "recruiter",
  });

  await requestPreciseClaimGrant(getLocalVeilStore(), {
    actor,
    candidateId: parseString(formData.get("candidateId")),
    recruiterViewCandidateId: parseString(formData.get("candidateId")),
    claimId: parseString(formData.get("claimId")),
    reason: parseOptionalString(formData.get("reason")),
  });

  revalidatePath("/recruiter-search");
  revalidatePath("/disclosure");
  redirect("/disclosure");
}

export async function runRecruiterSearchAction(formData: FormData) {
  const actor = validateLocalActor({
    actorId: formData.get("actorId"),
    expectedRole: "recruiter",
  });
  const query = parseString(formData.get("query"));

  await recordRecruiterSearch(getLocalVeilStore(), {
    actor,
    query,
  });

  revalidatePath("/candidate-vault");
  revalidatePath("/recruiter-search");
  redirect(`/recruiter-search?query=${encodeURIComponent(query)}&recruiterId=${encodeURIComponent(actor.id)}`);
}

export async function decideDisclosureGrantAction(formData: FormData) {
  const actor = validateLocalActor({
    actorId: formData.get("actorId"),
    expectedRole: "candidate",
  });
  const decision = formData.get("decision");
  if (decision !== "approved" && decision !== "denied") {
    throw new Error("decision must be approved or denied");
  }

  await decidePreciseClaimGrant(getLocalVeilStore(), {
    actor,
    grantId: parseString(formData.get("grantId")),
    decision,
  });

  revalidatePath("/disclosure");
  revalidatePath("/recruiter-search");
  redirect("/disclosure");
}

function parseEvidenceKind(value: FormDataEntryValue | null): EvidenceDocumentKind {
  if (typeof value !== "string" || !evidenceKinds.includes(value as EvidenceDocumentKind)) {
    throw new Error("invalid evidence document kind");
  }

  return value as EvidenceDocumentKind;
}

function parseString(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("required form field missing");
  }

  return value.trim();
}

function parseOptionalString(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}
