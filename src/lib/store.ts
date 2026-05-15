import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import type {
  CandidateRecord,
  CandidateVault,
  RecruiterView,
  VeilStoreState,
} from "./domain";
import { auditEvents, candidateVaults, disclosureGrants } from "./fixtures";
import { buildAnonymousRecruiterView } from "./privacy";

export interface VeilStore {
  read(): Promise<VeilStoreState>;
  write(state: VeilStoreState): Promise<void>;
  update(mutator: (state: VeilStoreState) => VeilStoreState | Promise<VeilStoreState>): Promise<VeilStoreState>;
}

export function createSeedStoreState(): VeilStoreState {
  const candidates: CandidateRecord[] = candidateVaults.map((vault) => ({
    candidateId: vault.candidateId,
    legalName: vault.legalName,
    anonymousHandle: vault.anonymousHandle,
    approvedForDiscovery: vault.approvedForDiscovery,
    createdAt: "2026-05-16T09:00:00.000Z",
  }));

  return {
    schemaVersion: 1,
    candidates,
    evidenceDocuments: candidateVaults.flatMap((vault) => vault.evidenceDocuments),
    verifiedClaims: candidateVaults.flatMap((vault) => vault.verifiedClaims),
    recruiterViews: candidateVaults
      .filter((vault) => vault.approvedForDiscovery)
      .map(buildAnonymousRecruiterView),
    disclosureGrants,
    auditEvents,
  };
}

export function createEmptyStoreState(): VeilStoreState {
  return {
    schemaVersion: 1,
    candidates: [],
    evidenceDocuments: [],
    verifiedClaims: [],
    recruiterViews: [],
    disclosureGrants: [],
    auditEvents: [],
  };
}

export function createJsonFileVeilStore({
  filePath = defaultStoreFile(),
  seed = createSeedStoreState,
}: {
  filePath?: string;
  seed?: () => VeilStoreState;
} = {}): VeilStore {
  return {
    async read() {
      try {
        const serialized = await readFile(filePath, "utf8");
        return parseState(serialized);
      } catch (error) {
        if (isMissingFile(error)) {
          const seeded = seed();
          await writeState(filePath, seeded);
          return seeded;
        }
        throw error;
      }
    },
    async write(state) {
      await writeState(filePath, state);
    },
    async update(mutator) {
      const current = await this.read();
      const next = await mutator(current);
      await this.write(next);
      return next;
    },
  };
}

export function getLocalVeilStore() {
  return createJsonFileVeilStore();
}

export function assembleCandidateVault(
  candidate: CandidateRecord,
  state: VeilStoreState,
): CandidateVault {
  const evidenceDocuments = state.evidenceDocuments.filter(
    (document) => document.candidateId === candidate.candidateId,
  );
  const verifiedClaims = state.verifiedClaims.filter(
    (claim) => claim.candidateId === candidate.candidateId,
  );

  return {
    candidateId: candidate.candidateId,
    legalName: candidate.legalName,
    anonymousHandle: candidate.anonymousHandle,
    approvedForDiscovery: candidate.approvedForDiscovery,
    evidenceDocuments,
    verifiedClaims,
    aiSummary: summarizeVault(candidate, verifiedClaims.length),
  };
}

export function assembleCandidateVaults(state: VeilStoreState): CandidateVault[] {
  return state.candidates.map((candidate) => assembleCandidateVault(candidate, state));
}

export function replaceRecruiterView(
  state: VeilStoreState,
  view: RecruiterView,
): VeilStoreState {
  return {
    ...state,
    recruiterViews: [
      ...state.recruiterViews.filter((candidateView) => candidateView.candidateId !== view.candidateId),
      view,
    ],
  };
}

function summarizeVault(candidate: CandidateRecord, claimCount: number) {
  if (claimCount === 0) {
    return `${candidate.anonymousHandle} has private evidence pending AI extraction.`;
  }

  return `${candidate.anonymousHandle} has ${claimCount} document-backed claim${claimCount === 1 ? "" : "s"} available for candidate review.`;
}

function defaultStoreFile() {
  if (process.env.VEIL_STORE_FILE) {
    return process.env.VEIL_STORE_FILE;
  }

  return process.env.NODE_ENV === "production"
    ? join("/tmp", "veil-store.json")
    : join(".veil-data", "store.json");
}

async function writeState(filePath: string, state: VeilStoreState) {
  await mkdir(dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

function parseState(serialized: string): VeilStoreState {
  const parsed = JSON.parse(serialized) as Partial<VeilStoreState>;

  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.candidates)) {
    throw new Error("unsupported Veil store state");
  }

  return parsed as VeilStoreState;
}

function isMissingFile(error: unknown) {
  return error instanceof Error && (error as NodeJS.ErrnoException).code === "ENOENT";
}
