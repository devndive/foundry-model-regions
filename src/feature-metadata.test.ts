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
    "switzerlandwest",
  ]);
});

test("Invocations (WebSocket) is a first-class Feature with a narrower region set than its parent", () => {
  const parent = featureMetadata("hosted-agents");
  const websocket = featureMetadata("hosted-agents-invocations-websocket");

  assert.deepEqual([...(websocket?.regions ?? [])], ["northcentralus"]);
  assert.equal(
    websocket?.sourceUrl,
    "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents",
  );

  // Closed-world narrowing: every websocket region is also a parent region,
  // and the sub-feature is strictly narrower.
  const parentRegions = new Set(parent?.regions ?? []);
  assert.ok((websocket?.regions ?? []).every((r) => parentRegions.has(r)));
  assert.ok((websocket?.regions.length ?? 0) < (parent?.regions.length ?? 0));
});

test("FEATURES is seeded from the three source articles (Foundry Agents included)", () => {
  assert.deepEqual(FEATURES.map((f) => f.id).sort(), [
    "ai-red-teaming-agent",
    "foundry-agents",
    "hosted-agents",
    "hosted-agents-invocations-websocket",
  ]);
  assert.equal(featureMetadata("foundry-agents")?.regions.length, 25);
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

  assert.ok(
    artifact.availability.some(
      (r) => r.featureId === "hosted-agents-invocations-websocket" && r.region === "northcentralus",
    ),
  );
});
