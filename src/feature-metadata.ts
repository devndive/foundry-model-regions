export interface Feature {
  id: string;
  displayName: string;
  sourceUrl: string;
  sectionAnchor: string;
  regions: readonly string[];
}

// The full set of tracked regions in the Azure AI Content Safety
// region-availability table (FairFax / USGov rows excluded). Reused by the
// Content Safety columns that are available in every tracked region.
const ALL_CONTENT_SAFETY_REGIONS = [
  "australiaeast",
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
  "southcentralus",
  "southindia",
  "swedencentral",
  "switzerlandnorth",
  "switzerlandwest",
  "uaenorth",
  "uksouth",
  "westeurope",
  "westus",
  "westus2",
  "westus3",
] as const;

// A region is any member of the canonical Content Safety set. Derived from the
// data so the list stays the single source of truth: adding/removing an entry
// above updates the type automatically, and typo'd region names become a
// compile-time error at every call site.
type Region = (typeof ALL_CONTENT_SAFETY_REGIONS)[number];

// The canonical base set minus a few explicitly-named regions. Keeps the
// "all regions except X, Y" intent executable instead of re-listing a near-copy
// of ALL_CONTENT_SAFETY_REGIONS by hand for each narrower column.
//
// The Region type catches misspelled names at compile time, but it can't catch
// a valid region that simply isn't in `base` (a logic error, not a typo), nor
// values that reach here via casts/untyped data. The runtime check is the
// closed-world backstop that fails loud instead of silently dropping nothing.
function without(base: readonly Region[], ...drop: readonly Region[]): readonly Region[] {
  const baseSet = new Set(base);
  for (const r of drop) {
    if (!baseSet.has(r)) {
      throw new Error(`without(): "${r}" is not in base`);
    }
  }
  const removed = new Set(drop);
  return base.filter((region) => !removed.has(region));
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
  // Azure AI Content Safety. Its region-availability table keys each column on a
  // distinct capability, so every column is modelled as its own first-class
  // Feature (CONTEXT.md, ADR-0003) — closed-world, tracked regions only, with the
  // FairFax (USGov) rows excluded.
  {
    id: "content-safety-custom-categories-standard",
    displayName: "Content Safety — Custom Categories (standard)",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    regions: ["australiaeast", "eastus", "switzerlandnorth"],
  },
  {
    id: "content-safety-groundedness-detection",
    displayName: "Content Safety — Groundedness Detection",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    regions: ["eastus", "eastus2", "francecentral", "swedencentral", "uksouth", "westus"],
  },
  {
    id: "content-safety-image",
    displayName: "Content Safety — Analyze Image",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    // All tracked regions except Germany West Central and Italy North.
    regions: without(ALL_CONTENT_SAFETY_REGIONS, "germanywestcentral", "italynorth"),
  },
  {
    id: "content-safety-multimodal",
    displayName: "Content Safety — Multimodal (Image with Text)",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    regions: ["eastus", "westeurope"],
  },
  {
    id: "content-safety-custom-categories-rapid",
    displayName: "Content Safety — Custom Categories (rapid)",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    // All tracked regions except Korea Central and Poland Central.
    regions: without(ALL_CONTENT_SAFETY_REGIONS, "koreacentral", "polandcentral"),
  },
  {
    id: "content-safety-prompt-shields",
    displayName: "Content Safety — Prompt Shields",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    regions: ALL_CONTENT_SAFETY_REGIONS,
  },
  {
    id: "content-safety-protected-material-text",
    displayName: "Content Safety — Protected Material (Text)",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    regions: ALL_CONTENT_SAFETY_REGIONS,
  },
  {
    id: "content-safety-protected-material-code",
    displayName: "Content Safety — Protected Material (Code)",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    // All tracked regions except Germany West Central, Italy North and Korea Central.
    regions: without(
      ALL_CONTENT_SAFETY_REGIONS,
      "germanywestcentral",
      "italynorth",
      "koreacentral",
    ),
  },
  {
    id: "content-safety-text",
    displayName: "Content Safety — Analyze Text",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    regions: ALL_CONTENT_SAFETY_REGIONS,
  },
  // Evaluation. The article keys each of its three evaluation surfaces on its
  // own region table, so each is modelled as a first-class Feature
  // (CONTEXT.md, ADR-0003) — closed-world, tracked regions only.
  {
    id: "agent-playground-evaluations",
    displayName: "Agent Playground Evaluations",
    sourceUrl:
      "https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-regions-limits-virtual-network",
    sectionAnchor: "supported-regions-for-agent-playground-evaluations",
    regions: [
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
      "westus",
      "westus2",
      "westus3",
    ],
  },
  {
    id: "batch-evaluations",
    displayName: "Batch Evaluations",
    sourceUrl:
      "https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-regions-limits-virtual-network",
    sectionAnchor: "supported-regions-for-batch-evaluations",
    regions: [
      "australiaeast",
      "brazilsouth",
      "canadacentral",
      "canadaeast",
      "centralindia",
      "centralus",
      "eastasia",
      "eastus",
      "eastus2",
      "francecentral",
      "germanywestcentral",
      "italynorth",
      "japaneast",
      "japanwest",
      "koreacentral",
      "northcentralus",
      "northeurope",
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
      "westus2",
      "westus3",
    ],
  },
  {
    // The article's "Risk and safety evaluators and AI red teaming region
    // support" section — the AI-assisted Evaluators surface. Modelled as its
    // own Feature, distinct from the standalone AI Red Teaming Agent article.
    id: "evaluators-risk-and-safety",
    displayName: "Evaluators — Risk and Safety",
    sourceUrl:
      "https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-regions-limits-virtual-network",
    sectionAnchor: "risk-and-safety-evaluators-and-ai-red-teaming-region-support",
    regions: ["eastus2", "francecentral", "northcentralus", "swedencentral", "switzerlandwest"],
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
