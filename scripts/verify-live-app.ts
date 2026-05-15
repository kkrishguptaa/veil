const baseUrl = process.env.VEIL_BASE_URL ?? "http://localhost:3000";

const routes = [
  ["/", "AI candidate intelligence without raw document exposure."],
  ["/candidate-vault", "Upload Evidence Document"],
  ["/recruiter-search", "Search approved anonymous views"],
  ["/disclosure", "Upgrade precise claims without exposing raw evidence."],
] as const;

const failures: string[] = [];

for (const [route, expectedText] of routes) {
  const response = await fetch(new URL(route, baseUrl));
  const body = await response.text();

  if (!response.ok) {
    failures.push(`${route} returned ${response.status}`);
    continue;
  }
  if (!body.includes(expectedText)) {
    failures.push(`${route} missing expected text: ${expectedText}`);
  }
  if (route === "/recruiter-search" && body.includes("rawText")) {
    failures.push("/recruiter-search leaked rawText marker");
  }
}

if (failures.length > 0) {
  throw new Error(failures.join("\n"));
}

console.log(`Live app verification passed at ${baseUrl}`);

export {};
