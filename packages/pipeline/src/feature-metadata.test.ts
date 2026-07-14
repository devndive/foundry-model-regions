import assert from "node:assert/strict";
import { test } from "node:test";
import { buildFeaturesArtifact, FEATURES, featureMetadata } from "./feature-metadata.js";
import { REGIONS } from "./region-metadata.js";

test("featureMetadata returns null for an unknown feature", () => {
  assert.equal(featureMetadata("teleportation-agent"), null);
});

test("featureMetadata describes a Feature with its source descriptor and region list", () => {
  const redTeaming = featureMetadata("ai-red-teaming-agent");
  assert.equal(redTeaming?.displayName, "AI Red Teaming Agent");
  assert.equal(
    redTeaming?.sourceUrl,
    "https://learn.microsoft.com/en-us/azure/foundry/concepts/ai-red-teaming-agent",
  );
  assert.equal(redTeaming?.sectionAnchor, "agentic-risks");
  assert.deepEqual([...(redTeaming?.regions ?? [])].sort(), [
    "eastus2",
    "francecentral",
    "northcentralus",
    "swedencentral",
  ]);
});

test("Invocations (WebSocket) is a first-class Feature available in every Hosted Agents region", () => {
  const parent = featureMetadata("hosted-agents");
  const websocket = featureMetadata("hosted-agents-invocations-websocket");

  assert.equal(
    websocket?.sourceUrl,
    "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents",
  );
  assert.deepEqual(websocket?.regions, parent?.regions);
});

test("FEATURES is seeded from the source articles (Foundry Agents and Content Safety included)", () => {
  assert.deepEqual(FEATURES.map((f) => f.id).sort(), [
    "agent-playground-evaluations",
    "ai-red-teaming-agent",
    "batch-evaluations",
    "content-safety-custom-categories-rapid",
    "content-safety-custom-categories-standard",
    "content-safety-groundedness-detection",
    "content-safety-image",
    "content-safety-multimodal",
    "content-safety-prompt-shields",
    "content-safety-protected-material-code",
    "content-safety-protected-material-text",
    "content-safety-text",
    "evaluators-risk-and-safety",
    "foundry-agents",
    "hosted-agents",
    "hosted-agents-invocations-websocket",
    "managed-virtual-network",
  ]);
  assert.deepEqual(featureMetadata("foundry-agents")?.regions, [
    "australiaeast",
    "brazilsouth",
    "canadacentral",
    "canadaeast",
    "centralus",
    "eastus",
    "eastus2",
    "francecentral",
    "germanywestcentral",
    "italynorth",
    "japaneast",
    "koreacentral",
    "northcentralus",
    "norwayeast",
    "polandcentral",
    "southafricanorth",
    "southcentralus",
    "southeastasia",
    "southindia",
    "spaincentral",
    "swedencentral",
    "switzerlandnorth",
    "uaenorth",
    "uksouth",
    "westeurope",
    "westus",
    "westus3",
  ]);
});

test("Content Safety models every region-availability column as a first-class Feature", () => {
  // Per-column region counts read straight from the region-availability table
  // (FairFax / USGov rows excluded).
  const expectedCounts: Record<string, number> = {
    "content-safety-custom-categories-standard": 3,
    "content-safety-groundedness-detection": 6,
    "content-safety-image": 20,
    "content-safety-multimodal": 2,
    "content-safety-custom-categories-rapid": 20,
    "content-safety-prompt-shields": 22,
    "content-safety-protected-material-text": 22,
    "content-safety-protected-material-code": 19,
    "content-safety-text": 22,
  };

  for (const [id, count] of Object.entries(expectedCounts)) {
    const feature = featureMetadata(id);
    assert.equal(
      feature?.sourceUrl,
      "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    );
    assert.equal(feature?.sectionAnchor, "region-availability");
    assert.equal(feature?.regions.length, count, `${id} region count`);
  }

  // Multimodal is the narrowest column and a subset of the all-regions columns.
  const multimodal = new Set(featureMetadata("content-safety-multimodal")?.regions ?? []);
  const text = new Set(featureMetadata("content-safety-text")?.regions ?? []);
  assert.ok([...multimodal].every((r) => text.has(r)));
});

test("Content Safety columns stay anchored to the all-regions baseline (drift guard)", () => {
  // Double-entry check against the `without(...)` args in the source table: it
  // catches source/test divergence in the hand-curated exclusions, not article
  // correctness (that is `check-feature-drift`'s job, ADR-0002). The all-regions
  // columns must equal the baseline; the narrower columns must be the baseline
  // minus exactly their listed exclusions, with no stray regions.
  const baseline = featureMetadata("content-safety-text")?.regions ?? [];
  const baselineSet = new Set(baseline);

  for (const id of ["content-safety-prompt-shields", "content-safety-protected-material-text"]) {
    assert.deepEqual(
      [...(featureMetadata(id)?.regions ?? [])].sort(),
      [...baseline].sort(),
      `${id} equals baseline`,
    );
  }

  const exclusions: Record<string, string[]> = {
    "content-safety-image": ["germanywestcentral", "italynorth"],
    "content-safety-custom-categories-rapid": ["koreacentral", "polandcentral"],
    "content-safety-protected-material-code": ["germanywestcentral", "italynorth", "koreacentral"],
  };

  for (const [id, dropped] of Object.entries(exclusions)) {
    const regions = featureMetadata(id)?.regions ?? [];
    const missing = baseline.filter((r) => !regions.includes(r)).sort();
    assert.deepEqual(missing, [...dropped].sort(), `${id} excludes exactly its documented regions`);
    assert.ok(
      [...regions].every((r) => baselineSet.has(r)),
      `${id} stays within the baseline`,
    );
  }
});

test("Evaluation surfaces are modelled as first-class Features with their documented region sets", () => {
  const counts: Record<string, number> = {
    "agent-playground-evaluations": 15,
    "batch-evaluations": 33,
    "evaluators-risk-and-safety": 4,
  };

  for (const [id, count] of Object.entries(counts)) {
    const feature = featureMetadata(id);
    assert.equal(
      feature?.sourceUrl,
      "https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-regions-limits-virtual-network",
      `${id} source`,
    );
    assert.equal(feature?.regions.length, count, `${id} region count`);
  }

  // Closed-world: agent playground evaluations are a strict subset of the
  // broader batch evaluations region set.
  const batch = new Set(featureMetadata("batch-evaluations")?.regions ?? []);
  const playground = featureMetadata("agent-playground-evaluations")?.regions ?? [];
  assert.ok(playground.every((r) => batch.has(r)));

  // The risk-and-safety Evaluators surface lists its own four regions. Asserted
  // directly (not by deep-equal against the AI Red Teaming Agent) so drift in
  // either independent article can't break the other's test.
  assert.deepEqual([...(featureMetadata("evaluators-risk-and-safety")?.regions ?? [])].sort(), [
    "eastus2",
    "francecentral",
    "northcentralus",
    "swedencentral",
  ]);
});

test("Managed Virtual Network is a first-class Feature with its documented region set", () => {
  const mvn = featureMetadata("managed-virtual-network");
  assert.equal(mvn?.displayName, "Managed Virtual Network");
  assert.equal(
    mvn?.sourceUrl,
    "https://learn.microsoft.com/en-us/azure/foundry/how-to/managed-virtual-network",
  );
  assert.equal(mvn?.sectionAnchor, "limitations");
  assert.deepEqual([...(mvn?.regions ?? [])].sort(), [
    "australiaeast",
    "brazilsouth",
    "canadaeast",
    "eastus",
    "eastus2",
    "francecentral",
    "germanywestcentral",
    "italynorth",
    "japaneast",
    "southafricanorth",
    "southcentralus",
    "southindia",
    "spaincentral",
    "swedencentral",
    "uaenorth",
    "uksouth",
    "westus",
    "westus3",
  ]);
});

test("every Feature region is a tracked region in REGIONS (closed-world guard)", () => {
  const known = new Set(REGIONS.map((r) => r.id));
  const strays = FEATURES.flatMap((f) =>
    f.regions.filter((region) => !known.has(region)).map((region) => `${f.id}:${region}`),
  );
  assert.deepEqual(strays, []);
});

test("buildFeaturesArtifact emits feature metadata plus flat (featureId, region) rows", () => {
  const artifact = buildFeaturesArtifact();

  assert.deepEqual(artifact.features, FEATURES);

  const expectedRowCount = FEATURES.reduce((sum, f) => sum + f.regions.length, 0);
  assert.equal(artifact.availability.length, expectedRowCount);

  // Each row is a flat pair; no model dimension.
  for (const row of artifact.availability) {
    assert.deepEqual(Object.keys(row).sort(), ["featureId", "region"]);
  }

  const parentRegions = artifact.availability
    .filter((row) => row.featureId === "hosted-agents")
    .map((row) => row.region);
  const websocketRegions = artifact.availability
    .filter((row) => row.featureId === "hosted-agents-invocations-websocket")
    .map((row) => row.region);
  assert.deepEqual(
    websocketRegions,
    parentRegions,
    "artifact emits WebSocket availability for every Hosted Agents region",
  );
});
