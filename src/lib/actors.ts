export type ActorRole = "candidate" | "recruiter";

export interface LocalActor {
  id: string;
  role: ActorRole;
  label: string;
  candidateId?: string;
}

export interface ActorContext extends LocalActor {
  authMode: "local-dev-selector";
}

export const localActors = [
  {
    id: "candidate-7kq",
    role: "candidate",
    label: "Priya Raman (candidate)",
    candidateId: "candidate-7kq",
  },
  {
    id: "candidate-2vm",
    role: "candidate",
    label: "Mateo Silva (candidate)",
    candidateId: "candidate-2vm",
  },
  {
    id: "candidate-4px",
    role: "candidate",
    label: "Anika Chen (candidate)",
    candidateId: "candidate-4px",
  },
  {
    id: "recruiter-northstar",
    role: "recruiter",
    label: "Northstar Robotics recruiter",
  },
  {
    id: "recruiter-contoso",
    role: "recruiter",
    label: "Contoso Talent recruiter",
  },
] as const satisfies readonly LocalActor[];

export const futureAuthIntegration =
  "Local actor selector is a dev-mode stand-in. Production should replace it with Clerk on Vercel Marketplace, mapping Clerk user IDs and organization roles to candidate or recruiter actors before server actions run.";

export function validateLocalActor(input: {
  actorId: unknown;
  expectedRole: ActorRole;
}): ActorContext {
  if (typeof input.actorId !== "string" || input.actorId.length === 0) {
    throw new Error("actorId is required");
  }

  const actor = localActors.find(
    (candidateActor) =>
      candidateActor.id === input.actorId && candidateActor.role === input.expectedRole,
  );

  if (!actor) {
    throw new Error(`invalid ${input.expectedRole} actor`);
  }

  return {
    ...actor,
    authMode: "local-dev-selector",
  };
}

export function requireCandidateScope(actor: ActorContext, candidateId: string) {
  if (actor.role !== "candidate" || actor.candidateId !== candidateId) {
    throw new Error("candidate actor cannot mutate another candidate vault");
  }
}

export const candidateActors = localActors.filter((actor) => actor.role === "candidate");
export const recruiterActors = localActors.filter((actor) => actor.role === "recruiter");
