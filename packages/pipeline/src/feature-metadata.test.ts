import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildFeaturesArtifact,
  FEATURES,
  featureMetadata,
  WITHDRAWN_FEATURES,
} from "./feature-metadata.js";
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
    "agents-private-vnet",
    "agents-responses-api",
    "ai-red-teaming-agent",
    "batch-evaluations",
    "content-safety-content-harms",
    "content-safety-groundedness-detection",
    "content-safety-prompt-shields",
    "content-safety-protected-material",
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

test("private Class A IP range support follows the networking guide's explicit Agent Service coverage", () => {
  const classA = featureMetadata("agents-private-class-a-ip-ranges");

  assert.equal(classA?.displayName, "Foundry Agents — Private Class A IP Ranges");
  assert.equal(
    classA?.sourceUrl,
    "https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/virtual-networks",
  );
  assert.equal(classA?.sectionAnchor, "limitations");
  assert.deepEqual(classA?.regions, [
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

  assert.deepEqual(classA?.regions, featureMetadata("foundry-agents")?.regions);
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

test("Private VNet and Managed Virtual Network retain independent identities and provenance", () => {
  const privateVnet = featureMetadata("agents-private-vnet");
  const managedVnet = featureMetadata("managed-virtual-network");

  assert.ok(privateVnet && managedVnet);
  assert.equal(privateVnet.displayName, "Foundry Agents — Private VNet");
  assert.equal(
    privateVnet.sourceUrl,
    "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/limits-quotas-regions",
  );
  assert.equal(privateVnet.sectionAnchor, "supported-regions");
  assert.deepEqual(privateVnet.regions, featureMetadata("foundry-agents")?.regions);
  assert.notEqual(privateVnet.id, managedVnet.id);
  assert.notEqual(privateVnet.group, managedVnet.group);
  assert.notEqual(privateVnet.sourceUrl, managedVnet.sourceUrl);
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

test("every uniform tool column is a Feature across all tracked Agent Service regions", () => {
  // Even when a tool currently matches base Agent Service availability, it stays
  // first-class because the tool table documents it independently and can drift.
  const uniformColumns = [
    "agent-tool-agent2agent",
    "agent-tool-azure-ai-search",
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

  const agents = featureMetadata("foundry-agents")?.regions ?? [];
  assert.deepEqual(baseline, agents);
});

test("tool columns that vary within the table carry their own narrower region sets", () => {
  assert.deepEqual(featureMetadata("agent-tool-computer-use")?.regions, [
    "canadacentral",
    "centralus",
    "eastus2",
    "japanwest",
    "southindia",
    "swedencentral",
    "westcentralus",
    "westeurope",
  ]);

  // Double-entry check against the `without(...)` args: each narrow column must
  // be the table baseline minus exactly the regions marked `no`, with no strays.
  const baseline = featureMetadata("agent-tool-web-search")?.regions ?? [];
  const baselineSet = new Set(baseline);

  const exclusions: Record<string, string[]> = {
    "agent-tool-browser-automation": ["japanwest", "westcentralus"],
    "agent-tool-file-search": ["brazilsouth", "italynorth"],
    "agent-tool-function": ["brazilsouth", "northcentralus", "southcentralus", "westus"],
    "agent-tool-computer-use": baseline
      .filter(
        (r) =>
          ![
            "canadacentral",
            "centralus",
            "eastus2",
            "japanwest",
            "southindia",
            "swedencentral",
            "westcentralus",
            "westeurope",
          ].includes(r),
      )
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

  assert.equal(featureMetadata("agent-tool-browser-automation")?.regions.length, 27);
  assert.equal(featureMetadata("agent-tool-file-search")?.regions.length, 27);
  assert.equal(featureMetadata("agent-tool-function")?.regions.length, 25);
  assert.equal(featureMetadata("agent-tool-computer-use")?.regions.length, 8);
});

test("Content Safety curates four standalone guardrail rows with explicit availability scope", () => {
  const features = FEATURES.filter((feature) => feature.group === "content-safety");
  assert.deepEqual(
    features.map((feature) => feature.id),
    [
      "content-safety-content-harms",
      "content-safety-groundedness-detection",
      "content-safety-prompt-shields",
      "content-safety-protected-material",
    ],
  );
  for (const feature of features) {
    assert.equal(
      feature.sourceUrl,
      "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/region-availability",
    );
    assert.equal(feature.sectionAnchor, "guardrails-in-azure-ai-content-safety");
    assert.match(feature.availabilityNote ?? "", /not independent API-variant region lists/);
    assert.match(feature.availabilityNote ?? "", /not in-region processing or data residency/);
  }
});

test("Content harms, Prompt Shields and Protected material each cover exactly 27 Tracked Regions", () => {
  const expected = [
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
    "westus2",
    "westus3",
  ];
  assert.equal(expected.length, 27);
  for (const id of [
    "content-safety-content-harms",
    "content-safety-prompt-shields",
    "content-safety-protected-material",
  ]) {
    assert.deepEqual(featureMetadata(id)?.regions, expected, id);
  }
});

test("Groundedness uses Canada East instead of France Central and keeps the other five regions", () => {
  assert.deepEqual(featureMetadata("content-safety-groundedness-detection")?.regions, [
    "canadaeast",
    "eastus",
    "eastus2",
    "swedencentral",
    "uksouth",
    "westus",
  ]);
});

test("withdrawn Content Safety IDs retain historical labels and reasons but emit no facts", () => {
  assert.deepEqual(WITHDRAWN_FEATURES.map((feature) => feature.id).sort(), [
    "content-safety-custom-categories-rapid",
    "content-safety-custom-categories-standard",
    "content-safety-image",
    "content-safety-multimodal",
    "content-safety-protected-material-code",
    "content-safety-protected-material-text",
    "content-safety-text",
  ]);
  const artifact = buildFeaturesArtifact();
  assert.deepEqual(artifact.withdrawnFeatures, WITHDRAWN_FEATURES);
  for (const feature of WITHDRAWN_FEATURES) {
    assert.equal(featureMetadata(feature.id), null);
    assert.ok(feature.displayName.startsWith("Content Safety"));
    assert.ok(feature.reason.length > 0);
    assert.ok(artifact.availability.every((fact) => fact.featureId !== feature.id));
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
      regions: [
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
        "northcentralus",
        "norwayeast",
        "polandcentral",
        "southcentralus",
        "spaincentral",
        "swedencentral",
        "switzerlandnorth",
        "westcentralus",
        "westeurope",
        "westus",
        "westus3",
      ],
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

test("Managed Virtual Network follows all 29 tracked Private VNet regions with an explicit scope caveat", () => {
  const mvn = featureMetadata("managed-virtual-network");
  assert.ok(mvn);
  assert.equal(mvn.displayName, "Managed Virtual Network");
  assert.equal(mvn.group, "networking");
  assert.equal(
    mvn.sourceUrl,
    "https://learn.microsoft.com/en-us/azure/foundry/how-to/managed-virtual-network",
  );
  assert.equal(mvn.sectionAnchor, "limitations");
  assert.deepEqual([...mvn.regions].sort(), [
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
  assert.deepEqual(mvn.regions, featureMetadata("agents-private-vnet")?.regions);
  assert.match(mvn.availabilityNote ?? "", /new Agent service/);
  assert.match(mvn.availabilityNote ?? "", /Responses API/);
  assert.match(mvn.availabilityNote ?? "", /new Foundry portal/);
  assert.match(mvn.availabilityNote ?? "", /18 regions/);
  const emittedRegions = buildFeaturesArtifact()
    .availability.filter((row) => row.featureId === mvn.id)
    .map((row) => row.region);
  assert.equal(emittedRegions.length, 29);
  assert.deepEqual(emittedRegions, mvn.regions);
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
    "foundry-agents": 5,
    "agent-tools": 15,
    "hosted-agents": 2,
    "content-safety": 4,
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
