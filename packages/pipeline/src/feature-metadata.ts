import type { Feature, FeaturesArtifact, WithdrawnFeature } from "@foundry/data-types";

// The standalone Azure AI Content Safety table, intersected with REGIONS.
// Switzerland West is documented but deliberately untracked (ADR-0005).
const ALL_CONTENT_SAFETY_REGIONS = [
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
] as const;

const CONTENT_SAFETY_URL =
  "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/region-availability";
const CONTENT_SAFETY_ANCHOR = "guardrails-in-azure-ai-content-safety";
const CONTENT_SAFETY_AVAILABILITY_NOTE =
  "Standalone Azure AI Content Safety entries follow documented guardrail rows, not " +
  "independent API-variant region lists. Availability refers to resource regions, not " +
  "in-region processing or data residency; global or data-zone routing may process data elsewhere.";

export const WITHDRAWN_FEATURES: readonly WithdrawnFeature[] = [
  {
    id: "content-safety-text",
    displayName: "Content Safety — Analyze Text",
    reason:
      "Replaced by the broader Content harms entry; current regional tables do not independently list Analyze Text.",
  },
  {
    id: "content-safety-image",
    displayName: "Content Safety — Analyze Image",
    reason:
      "Replaced by the broader Content harms entry; current regional tables do not independently list Analyze Image.",
  },
  {
    id: "content-safety-protected-material-text",
    displayName: "Content Safety — Protected Material (Text)",
    reason:
      "Replaced by the broader Protected material entry; current regional tables do not independently list the text variant.",
  },
  {
    id: "content-safety-protected-material-code",
    displayName: "Content Safety — Protected Material (Code)",
    reason:
      "Replaced by the broader Protected material entry; current regional tables do not independently list the code variant.",
  },
  {
    id: "content-safety-multimodal",
    displayName: "Content Safety — Multimodal (Image with Text)",
    reason:
      "Withdrawn from this catalog because the inspected current documentation supplies no Multimodal regional list; this does not establish service unavailability.",
  },
  {
    id: "content-safety-custom-categories-standard",
    displayName: "Content Safety — Custom Categories (standard)",
    reason:
      "Documentation announces retirement on September 1, 2026, and supplies no current independent regional row.",
  },
  {
    id: "content-safety-custom-categories-rapid",
    displayName: "Content Safety — Custom Categories (rapid)",
    reason:
      "Withdrawn from this catalog because the inspected current documentation supplies no regional list for the rapid variant; this does not establish service unavailability.",
  },
];

// The canonical base set minus a few explicitly-named regions. Keeps the
// "all regions except X, Y" intent executable instead of re-listing a near-copy
// of the base by hand for each narrower column.
//
// Generic over the base list so every caller gets typo protection against *its
// own* base — `NoInfer` stops a misspelled exclusion from widening `T` and
// silently disabling the check. That can't catch a valid region that simply
// isn't in `base` (a logic error, not a typo), nor values that reach here via
// casts/untyped data. The runtime check is the closed-world backstop that fails
// loud instead of silently dropping nothing.
function without<T extends string>(
  base: readonly T[],
  ...drop: readonly NoInfer<T>[]
): readonly T[] {
  const baseSet = new Set(base);
  for (const r of drop) {
    if (!baseSet.has(r)) {
      throw new Error(`without(): "${r}" is not in base`);
    }
  }
  const removed = new Set(drop);
  return base.filter((region) => !removed.has(region));
}

// Curated from the article's region-availability list, intersected with the
// regions tracked in REGIONS. The article also lists Switzerland West, which is
// access-by-request and therefore permanently untracked (ADR-0005), so it is
// discarded here rather than encoded.
const HOSTED_AGENTS_REGIONS = [
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
] as const;

// Curated from the "Agents" column of the article's Supported regions table,
// intersected with the unrestricted regions tracked in REGIONS. Switzerland West
// is documented but permanently untracked (ADR-0005), so it is discarded here
// rather than encoded — and the same exclusion applies to every other Feature
// derived from this article.
const FOUNDRY_AGENTS_REGIONS = [
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
] as const;

const AGENTS_ARTICLE_URL =
  "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/limits-quotas-regions";

// The Private VNet column currently matches Agent Service availability. Managed
// Virtual Network delegates to this column, so reconcile both when it changes.
const PRIVATE_VNET_REGIONS = FOUNDRY_AGENTS_REGIONS;

// After intersecting the article's region-by-tool table with tracked REGIONS,
// its rows match the base Agent Service regions exactly. The article also lists
// Switzerland West, which stays excluded under ADR-0005.
const AGENT_TOOL_TABLE_REGIONS = FOUNDRY_AGENTS_REGIONS;

// The anchor covers two tables: the region-by-tool table encoded below and a
// model-by-tool matrix. Only the former becomes Feature Availability Facts — a
// Feature Availability Fact has no model dimension (CONTEXT.md, ADR-0003), so
// the model matrix is deliberately left unrepresented and merely snapshotted.
const AGENT_TOOL_SECTION_ANCHOR = "tool-support-by-region-and-model";

// Every tool column reading `yes` in all tracked rows of the region-by-tool
// table. Each stays a first-class Feature because its support is documented
// independently and can diverge from base Agent Service availability.
const UNIFORM_AGENT_TOOLS: readonly (readonly [string, string])[] = [
  ["agent-tool-agent2agent", "Agent2Agent"],
  ["agent-tool-azure-ai-search", "Azure AI Search"],
  ["agent-tool-code-interpreter", "Code Interpreter"],
  ["agent-tool-fabric-data-agent", "Fabric Data Agent"],
  ["agent-tool-grounding-bing-custom-search", "Grounding with Bing Custom Search"],
  ["agent-tool-grounding-bing-search", "Grounding with Bing Search"],
  ["agent-tool-image-generation", "Image Generation"],
  ["agent-tool-mcp", "MCP"],
  ["agent-tool-openapi", "OpenAPI"],
  ["agent-tool-sharepoint", "SharePoint"],
  ["agent-tool-web-search", "Web Search"],
];

function agentTool(id: string, toolName: string, regions: readonly string[]): Feature {
  return {
    id,
    displayName: `Agent Tool — ${toolName}`,
    group: "agent-tools",
    sourceUrl: AGENTS_ARTICLE_URL,
    sectionAnchor: AGENT_TOOL_SECTION_ANCHOR,
    regions,
  };
}

export const FEATURES: readonly Feature[] = [
  {
    id: "ai-red-teaming-agent",
    displayName: "AI Red Teaming Agent",
    group: "evaluation",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/foundry/concepts/ai-red-teaming-agent",
    sectionAnchor: "agentic-risks",
    regions: ["eastus2", "francecentral", "northcentralus", "swedencentral"],
  },
  {
    // Base Agent Service availability only. The article's other columns and the
    // per-tool table are modelled as their own first-class Features (ADR-0003);
    // this one deliberately stays the plain "is Agent Service here?" answer.
    id: "foundry-agents",
    displayName: "Foundry Agents",
    group: "foundry-agents",
    sourceUrl: AGENTS_ARTICLE_URL,
    sectionAnchor: "supported-regions",
    regions: FOUNDRY_AGENTS_REGIONS,
  },
  {
    // The "Responses API" column of the same table. Byte-identical to the Agents
    // column today, but kept first-class for the reason ADR-0003 gives for the
    // Hosted Agents protocols: it is documented independently and can diverge.
    id: "agents-responses-api",
    displayName: "Foundry Agents — Responses API",
    group: "foundry-agents",
    sourceUrl: AGENTS_ARTICLE_URL,
    sectionAnchor: "supported-regions",
    regions: FOUNDRY_AGENTS_REGIONS,
  },
  {
    // The "Private VNet" column covers network-secured/BYO virtual networks, not
    // the Microsoft-managed network represented by `managed-virtual-network`.
    // It currently matches the Agents column but can diverge independently.
    id: "agents-private-vnet",
    displayName: "Foundry Agents — Private VNet",
    group: "foundry-agents",
    sourceUrl: AGENTS_ARTICLE_URL,
    sectionAnchor: "supported-regions",
    regions: PRIVATE_VNET_REGIONS,
  },
  {
    // Networking limitations explicitly support private Class A address space
    // (10.0.0.0/8) for delegated subnets in every Agent Service region and link
    // to the Supported regions table for that region list.
    id: "agents-private-class-a-ip-ranges",
    displayName: "Foundry Agents — Private Class A IP Ranges",
    group: "foundry-agents",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/virtual-networks",
    sectionAnchor: "limitations",
    regions: FOUNDRY_AGENTS_REGIONS,
  },
  {
    // The private-networking subsection's Grounding with Bing Search region list.
    // Anchored to that h3 rather than the parent `supported-regions` table so
    // drift fires on the narrowest relevant text (ADR-0002).
    //
    // Not a subset of `foundry-agents`: the article lists West US 2 here but has
    // no West US 2 row in the Supported regions table. The contradiction is
    // Microsoft's; we encode both sections as written.
    id: "agents-grounding-bing-search-private-network",
    displayName: "Foundry Agents — Grounding with Bing Search (private network)",
    group: "foundry-agents",
    sourceUrl: AGENTS_ARTICLE_URL,
    sectionAnchor: "regional-support-for-private-networking",
    regions: [
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
    ],
  },
  // The region-by-tool table. Each column is a first-class Feature (ADR-0003);
  // the model-by-tool matrix under the same heading stays unrepresented.
  ...UNIFORM_AGENT_TOOLS.map(([id, toolName]) => agentTool(id, toolName, AGENT_TOOL_TABLE_REGIONS)),
  // Columns whose support varies within the table itself.
  agentTool(
    "agent-tool-browser-automation",
    "Browser Automation",
    without(AGENT_TOOL_TABLE_REGIONS, "japanwest", "westcentralus"),
  ),
  agentTool(
    "agent-tool-file-search",
    "File Search",
    without(AGENT_TOOL_TABLE_REGIONS, "brazilsouth", "italynorth"),
  ),
  agentTool(
    "agent-tool-function",
    "Function",
    without(AGENT_TOOL_TABLE_REGIONS, "brazilsouth", "northcentralus", "southcentralus", "westus"),
  ),
  // Listed explicitly rather than via `without(...)`: only eight of the 29 rows
  // say `yes`, so the exclusion list would be the noisier half.
  agentTool("agent-tool-computer-use", "Computer Use", [
    "canadacentral",
    "centralus",
    "eastus2",
    "japanwest",
    "southindia",
    "swedencentral",
    "westcentralus",
    "westeurope",
  ]),
  {
    id: "hosted-agents",
    displayName: "Hosted Agents",
    group: "hosted-agents",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents",
    sectionAnchor: "region-availability",
    regions: HOSTED_AGENTS_REGIONS,
  },
  {
    // Kept as a first-class Feature (CONTEXT.md, ADR-0003) because protocol
    // availability is documented independently and can drift from its parent.
    id: "hosted-agents-invocations-websocket",
    displayName: "Hosted Agents — Invocations (WebSocket)",
    group: "hosted-agents",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents",
    sectionAnchor: "protocols-responses-invocations-and-invocations-websocket",
    regions: HOSTED_AGENTS_REGIONS,
  },
  // Standalone Content Safety guardrail rows, not Foundry-integrated guardrails
  // or independently undocumented API variants (ADR-0008).
  {
    id: "content-safety-content-harms",
    displayName: "Content Safety — Content harms",
    group: "content-safety",
    sourceUrl: CONTENT_SAFETY_URL,
    sectionAnchor: CONTENT_SAFETY_ANCHOR,
    regions: ALL_CONTENT_SAFETY_REGIONS,
    availabilityNote: CONTENT_SAFETY_AVAILABILITY_NOTE,
  },
  {
    id: "content-safety-groundedness-detection",
    displayName: "Content Safety — Groundedness Detection",
    group: "content-safety",
    sourceUrl: CONTENT_SAFETY_URL,
    sectionAnchor: CONTENT_SAFETY_ANCHOR,
    regions: ["canadaeast", "eastus", "eastus2", "swedencentral", "uksouth", "westus"],
    availabilityNote: CONTENT_SAFETY_AVAILABILITY_NOTE,
  },
  {
    id: "content-safety-prompt-shields",
    displayName: "Content Safety — Prompt Shields",
    group: "content-safety",
    sourceUrl: CONTENT_SAFETY_URL,
    sectionAnchor: CONTENT_SAFETY_ANCHOR,
    regions: ALL_CONTENT_SAFETY_REGIONS,
    availabilityNote: CONTENT_SAFETY_AVAILABILITY_NOTE,
  },
  {
    id: "content-safety-protected-material",
    displayName: "Content Safety — Protected material",
    group: "content-safety",
    sourceUrl: CONTENT_SAFETY_URL,
    sectionAnchor: CONTENT_SAFETY_ANCHOR,
    regions: ALL_CONTENT_SAFETY_REGIONS,
    availabilityNote: CONTENT_SAFETY_AVAILABILITY_NOTE,
  },
  // Evaluation. Each independently documented region set is modelled as a
  // first-class Feature (CONTEXT.md, ADR-0003) — closed-world, tracked regions
  // only. Narrow evaluator variants remain separate from the general safety
  // evaluator set, and evaluation red teaming remains separate from the
  // standalone AI Red Teaming Agent.
  {
    id: "agent-playground-evaluations",
    displayName: "Agent Playground Evaluations",
    group: "evaluation",
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
    group: "evaluation",
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
    // The general safety evaluator table. Switzerland West is documented but
    // excluded because REGIONS tracks self-serve regions only (ADR-0005).
    id: "evaluators-risk-and-safety",
    displayName: "Evaluators — Risk and Safety",
    group: "evaluation",
    sourceUrl:
      "https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-regions-limits-virtual-network",
    sectionAnchor: "supported-regions-for-risk-and-safety-evaluators",
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
  {
    id: "evaluators-groundedness-pro",
    displayName: "Evaluators — Groundedness Pro",
    group: "evaluation",
    sourceUrl:
      "https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-regions-limits-virtual-network",
    sectionAnchor: "supported-regions-for-risk-and-safety-evaluators",
    regions: ["eastus2", "swedencentral"],
  },
  {
    id: "evaluators-protected-material",
    displayName: "Evaluators — Protected Material",
    group: "evaluation",
    sourceUrl:
      "https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-regions-limits-virtual-network",
    sectionAnchor: "supported-regions-for-risk-and-safety-evaluators",
    regions: ["eastus2"],
  },
  {
    id: "evaluations-ai-red-teaming",
    displayName: "Evaluations — AI Red Teaming",
    group: "evaluation",
    sourceUrl:
      "https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-regions-limits-virtual-network",
    sectionAnchor: "supported-regions-for-ai-red-teaming",
    regions: ["eastus2", "northcentralus"],
  },
  {
    // General managed-network availability follows the Private VNet column of
    // the Agents table, as explicitly delegated by this article's limitations.
    // Keep its own provenance and watch both sections for manual reconciliation.
    id: "managed-virtual-network",
    displayName: "Managed Virtual Network",
    group: "networking",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/foundry/how-to/managed-virtual-network",
    sectionAnchor: "limitations",
    regions: PRIVATE_VNET_REGIONS,
    availabilityNote:
      "General managed-network availability follows Foundry Agents' Private VNet regions. " +
      "The article separately limits managed networking with the new Agent service, Responses API, " +
      "and new Foundry portal to 18 regions; this entry does not establish that combination's availability.",
  },
];

const FEATURE_BY_ID: ReadonlyMap<string, Feature> = new Map(
  FEATURES.map((feature) => [feature.id, feature]),
);

export function featureMetadata(id: string): Feature | null {
  return FEATURE_BY_ID.get(id) ?? null;
}

// Derives the flat, closed-world (featureId, region) availability rows from the
// curated table — the shape consumed by the unified Deployment Fit view.
export function buildFeaturesArtifact(): FeaturesArtifact {
  const availability = FEATURES.flatMap((feature) =>
    feature.regions.map((region) => ({ featureId: feature.id, region })),
  );
  return { features: FEATURES, availability, withdrawnFeatures: WITHDRAWN_FEATURES };
}
