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

test("Hosted Agents carries the curated region set from its region-availability list", () => {
  // Double-entry check against the curated table. The article also lists
  // Switzerland West, discarded because it is not self-serve deployable (ADR-0005).
  assert.deepEqual(featureMetadata("hosted-agents")?.regions, [
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
    "japanwest",
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
    "ukwest",
    "westcentralus",
    "westeurope",
    "westus",
    "westus3",
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
    "agent-tool-agent2agent",
    "agent-tool-azure-ai-search",
    "agent-tool-browser-automation",
    "agent-tool-code-interpreter",
    "agent-tool-computer-use",
    "agent-tool-fabric-data-agent",
    "agent-tool-file-search",
    "agent-tool-function",
    "agent-tool-grounding-bing-custom-search",
    "agent-tool-grounding-bing-search",
    "agent-tool-image-generation",
    "agent-tool-mcp",
    "agent-tool-openapi",
    "agent-tool-sharepoint",
    "agent-tool-web-search",
    "agents-grounding-bing-search-private-network",
    "agents-private-class-a-ip-ranges",
    "agents-responses-api",
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
    "evaluations-ai-red-teaming",
    "evaluators-groundedness-pro",
    "evaluators-protected-material",
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
    "japanwest",
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
    "westcentralus",
    "westeurope",
    "westus",
    "westus3",
  ]);
});

test("private Class A IP range support is a Feature narrower than base Agent Service availability", () => {
  const classA = featureMetadata("agents-private-class-a-ip-ranges");

  assert.equal(classA?.displayName, "Foundry Agents — Private Class A IP Ranges");
  assert.equal(
    classA?.sourceUrl,
    "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/limits-quotas-regions",
  );
  assert.equal(classA?.sectionAnchor, "supported-regions");
  assert.deepEqual(classA?.regions, [
    "australiaeast",
    "brazilsouth",
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
    "southafricanorth",
    "southcentralus",
    "southeastasia",
    "southindia",
    "spaincentral",
    "swedencentral",
    "uaenorth",
    "uksouth",
    "westeurope",
    "westus",
    "westus3",
  ]);

  // The Class A column is a `No` in exactly six regions the Agents column
  // supports, so it must be a strict subset of `foundry-agents`.
  const agents = featureMetadata("foundry-agents")?.regions ?? [];
  const agentsSet = new Set(agents);
  assert.ok((classA?.regions ?? []).every((r) => agentsSet.has(r)));
  assert.deepEqual(
    agents.filter((r) => !new Set(classA?.regions ?? []).has(r)),
    [
      "canadacentral",
      "japanwest",
      "norwayeast",
      "polandcentral",
      "switzerlandnorth",
      "westcentralus",
    ],
  );
});

test("the Responses API column is its own Feature even while it matches base Agent Service availability", () => {
  // Kept first-class for the same reason as the Hosted Agents WebSocket protocol
  // (ADR-0003): it is documented as an independent column and can drift away
  // from the Agents column at any time.
  const responses = featureMetadata("agents-responses-api");

  assert.equal(responses?.displayName, "Foundry Agents — Responses API");
  assert.equal(
    responses?.sourceUrl,
    "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/limits-quotas-regions",
  );
  assert.equal(responses?.sectionAnchor, "supported-regions");
  assert.deepEqual(responses?.regions, featureMetadata("foundry-agents")?.regions);
});

test("private-network Grounding with Bing Search is a Feature that is deliberately not a subset of Foundry Agents", () => {
  const bing = featureMetadata("agents-grounding-bing-search-private-network");

  assert.equal(bing?.displayName, "Foundry Agents — Grounding with Bing Search (private network)");
  assert.equal(
    bing?.sourceUrl,
    "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/limits-quotas-regions",
  );
  // The narrowest heading whose slice carries the region list (ADR-0002), not
  // the broader `supported-regions` table above it.
  assert.equal(bing?.sectionAnchor, "regional-support-for-private-networking");
  assert.deepEqual([...(bing?.regions ?? [])].sort(), [
    "australiaeast",
    "brazilsouth",
    "canadacentral",
    "canadaeast",
    "centralus",
    "eastus",
    "eastus2",
    "francecentral",
    "italynorth",
    "japaneast",
    "koreacentral",
    "norwayeast",
    "polandcentral",
    "southafricanorth",
    "southeastasia",
    "southindia",
    "spaincentral",
    "swedencentral",
    "switzerlandnorth",
    "uaenorth",
    "uksouth",
    "westeurope",
    "westus",
    "westus2",
    "westus3",
  ]);

  // The article contradicts itself: this list names West US 2, which the
  // Supported regions table has no row for at all. Pinned as a deliberate
  // non-subset so nobody "corrects" it into agreement with `foundry-agents`.
  const agents = new Set(featureMetadata("foundry-agents")?.regions ?? []);
  assert.deepEqual(
    (bing?.regions ?? []).filter((r) => !agents.has(r)),
    ["westus2"],
  );
});

test("every tool column is a Feature narrower than base Agent Service availability", () => {
  // The region-by-tool table lists 24 regions; the Agents column lists 29. Under
  // the closed-world rule (ADR-0003) that silence makes even a column reading
  // `yes` in all 24 rows narrower than `foundry-agents`, so all 15 columns earn
  // their own Feature rather than only the ones that vary within the table.
  const uniformColumns = [
    "agent-tool-agent2agent",
    "agent-tool-azure-ai-search",
    "agent-tool-browser-automation",
    "agent-tool-code-interpreter",
    "agent-tool-fabric-data-agent",
    "agent-tool-grounding-bing-custom-search",
    "agent-tool-grounding-bing-search",
    "agent-tool-image-generation",
    "agent-tool-mcp",
    "agent-tool-openapi",
    "agent-tool-sharepoint",
    "agent-tool-web-search",
  ];

  const baseline = [
    "australiaeast",
    "brazilsouth",
    "canadaeast",
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
    "westus",
    "westus3",
  ];

  for (const id of uniformColumns) {
    const feature = featureMetadata(id);
    assert.equal(
      feature?.sourceUrl,
      "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/limits-quotas-regions",
      `${id} source`,
    );
    assert.equal(feature?.sectionAnchor, "tool-support-by-region-and-model", `${id} anchor`);
    assert.deepEqual([...(feature?.regions ?? [])].sort(), baseline, `${id} regions`);
  }

  assert.equal(featureMetadata("agent-tool-web-search")?.displayName, "Agent Tool — Web Search");

  // The five regions where Agent Service is supported but the tool table is
  // silent. This gap is the whole reason a uniform column is not a duplicate.
  const agents = featureMetadata("foundry-agents")?.regions ?? [];
  const baselineSet = new Set(baseline);
  assert.deepEqual(
    agents.filter((r) => !baselineSet.has(r)),
    ["canadacentral", "centralus", "japanwest", "westcentralus", "westeurope"],
  );
});

test("tool columns that vary within the table carry their own narrower region sets", () => {
  assert.deepEqual(featureMetadata("agent-tool-computer-use")?.regions, [
    "eastus2",
    "southindia",
    "swedencentral",
  ]);

  // Double-entry check against the `without(...)` args: each narrow column must
  // be the table baseline minus exactly the regions marked `no`, with no strays.
  const baseline = featureMetadata("agent-tool-web-search")?.regions ?? [];
  const baselineSet = new Set(baseline);

  const exclusions: Record<string, string[]> = {
    "agent-tool-file-search": ["brazilsouth", "italynorth"],
    "agent-tool-function": ["brazilsouth", "northcentralus", "southcentralus", "westus"],
    "agent-tool-computer-use": baseline
      .filter((r) => !["eastus2", "southindia", "swedencentral"].includes(r))
      .sort(),
  };

  for (const [id, dropped] of Object.entries(exclusions)) {
    const regions = featureMetadata(id)?.regions ?? [];
    assert.deepEqual(
      baseline.filter((r) => !regions.includes(r)).sort(),
      [...dropped].sort(),
      `${id} excludes exactly its documented regions`,
    );
    assert.ok(
      regions.every((r) => baselineSet.has(r)),
      `${id} stays within the tool table baseline`,
    );
  }

  assert.equal(featureMetadata("agent-tool-file-search")?.regions.length, 22);
  assert.equal(featureMetadata("agent-tool-function")?.regions.length, 20);
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
  // correctness (that is `check-source-drift`'s job, ADR-0002). The all-regions
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

  const expected: Record<string, { anchor: string; regions: string[] }> = {
    "evaluators-risk-and-safety": {
      anchor: "supported-regions-for-risk-and-safety-evaluators",
      regions: ["australiaeast", "eastus2", "francecentral", "northcentralus", "swedencentral"],
    },
    "evaluators-groundedness-pro": {
      anchor: "supported-regions-for-risk-and-safety-evaluators",
      regions: ["eastus2", "swedencentral"],
    },
    "evaluators-protected-material": {
      anchor: "supported-regions-for-risk-and-safety-evaluators",
      regions: ["eastus2"],
    },
    "evaluations-ai-red-teaming": {
      anchor: "supported-regions-for-ai-red-teaming",
      regions: ["eastus2", "northcentralus"],
    },
  };

  for (const [id, { anchor, regions }] of Object.entries(expected)) {
    const feature = featureMetadata(id);
    assert.equal(
      feature?.sourceUrl,
      "https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-regions-limits-virtual-network",
      `${id} source`,
    );
    assert.equal(feature?.sectionAnchor, anchor, `${id} anchor`);
    assert.deepEqual(feature?.regions, regions, `${id} regions`);
  }

  // Closed-world: agent playground evaluations are a strict subset of the
  // broader batch evaluations region set.
  const batch = new Set(featureMetadata("batch-evaluations")?.regions ?? []);
  const playground = featureMetadata("agent-playground-evaluations")?.regions ?? [];
  assert.ok(playground.every((r) => batch.has(r)));
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

test("every Feature is filed in a Feature Group, and every declared Group has members", () => {
  // The compiler already rejects an unknown group string. What it cannot catch is
  // a Group left declared after its last Feature moves out, so the guard is stated
  // as an exact membership count rather than a subset check (ADR-0007).
  const expected: Record<string, number> = {
    "foundry-agents": 4,
    "agent-tools": 15,
    "hosted-agents": 2,
    "content-safety": 9,
    evaluation: 7,
    networking: 1,
  };

  const counts: Record<string, number> = {};
  for (const feature of FEATURES) {
    counts[feature.group] = (counts[feature.group] ?? 0) + 1;
  }

  assert.deepEqual(counts, expected);
  assert.equal(
    Object.values(expected).reduce((a, b) => a + b, 0),
    FEATURES.length,
  );
});

test("the standalone AI Red Teaming Agent is filed beside evaluation red teaming", () => {
  // Microsoft documents these in two different articles; a Feature Group is a
  // curated subject area, not an article, so they sit in one column where the
  // distinction between them is visible (ADR-0007, CONTEXT.md).
  assert.equal(featureMetadata("ai-red-teaming-agent")?.group, "evaluation");
  assert.equal(featureMetadata("evaluations-ai-red-teaming")?.group, "evaluation");
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
