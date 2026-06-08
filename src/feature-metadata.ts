export interface Feature {
  id: string;
  displayName: string;
  sourceUrl: string;
  sectionAnchor: string;
  regions: readonly string[];
}

export const FEATURES: readonly Feature[] = [
  {
    id: "ai-red-teaming-agent",
    displayName: "AI Red Teaming Agent",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/foundry/concepts/ai-red-teaming-agent",
    sectionAnchor: "agentic-risks",
    regions: ["eastus2", "francecentral", "northcentralus", "swedencentral", "switzerlandwest"],
  },
  {
    // The article defers its region list to the Azure OpenAI Responses API
    // "Supported regions" section, so the curated list mirrors that set.
    id: "foundry-agents",
    displayName: "Foundry Agents",
    sourceUrl:
      "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/limits-quotas-regions",
    sectionAnchor: "supported-regions",
    regions: [
      "australiaeast",
      "brazilsouth",
      "canadacentral",
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
    ],
  },
  {
    id: "hosted-agents",
    displayName: "Hosted Agents",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents",
    sectionAnchor: "region-availability",
    regions: [
      "australiaeast",
      "brazilsouth",
      "canadacentral",
      "canadaeast",
      "eastus2",
      "francecentral",
      "germanywestcentral",
      "japaneast",
      "koreacentral",
      "northcentralus",
      "norwayeast",
      "polandcentral",
      "southafricanorth",
      "southeastasia",
      "southindia",
      "spaincentral",
      "swedencentral",
      "switzerlandnorth",
      "westus",
      "westus3",
    ],
  },
  {
    // Sub-feature promoted to a first-class Feature (CONTEXT.md, ADR-0003): the
    // Invocations (WebSocket) protocol is preview-only in a single region.
    id: "hosted-agents-invocations-websocket",
    displayName: "Hosted Agents — Invocations (WebSocket)",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents",
    sectionAnchor: "protocols-responses-invocations-and-invocations-websocket",
    regions: ["northcentralus"],
  },
];

const FEATURE_BY_ID: ReadonlyMap<string, Feature> = new Map(
  FEATURES.map((feature) => [feature.id, feature]),
);

export function featureMetadata(id: string): Feature | null {
  return FEATURE_BY_ID.get(id) ?? null;
}

export interface FeatureAvailabilityRow {
  featureId: string;
  region: string;
}

export interface FeaturesArtifact {
  features: readonly Feature[];
  availability: readonly FeatureAvailabilityRow[];
}

// Derives the flat, closed-world (featureId, region) availability rows from the
// curated table — the shape consumed by the unified Deployment Fit view.
export function buildFeaturesArtifact(): FeaturesArtifact {
  const availability = FEATURES.flatMap((feature) =>
    feature.regions.map((region) => ({ featureId: feature.id, region })),
  );
  return { features: FEATURES, availability };
}
