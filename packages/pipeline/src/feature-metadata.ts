import type { Feature, FeaturesArtifact } from "@foundry/data-types";

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
  "uaenorth",
  "uksouth",
  "westeurope",
  "westus",
  "westus2",
  "westus3",
] as const;

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
    // The "Class A*" column of the same table: support for private Class A IP
    // address ranges (10.x.x.x). A strict subset of the Agents column, so it can
    // rule out a region that base Agent Service availability would allow.
    id: "agents-private-class-a-ip-ranges",
    displayName: "Foundry Agents — Private Class A IP Ranges",
    group: "foundry-agents",
    sourceUrl: AGENTS_ARTICLE_URL,
    sectionAnchor: "supported-regions",
    regions: without(
      FOUNDRY_AGENTS_REGIONS,
      "canadacentral",
      "japanwest",
      "norwayeast",
      "polandcentral",
      "switzerlandnorth",
      "westcentralus",
    ),
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
  // Azure AI Content Safety. Its region-availability table keys each column on a
  // distinct capability, so every column is modelled as its own first-class
  // Feature (CONTEXT.md, ADR-0003) — closed-world, tracked regions only, with the
  // FairFax (USGov) rows excluded.
  {
    id: "content-safety-custom-categories-standard",
    displayName: "Content Safety — Custom Categories (standard)",
    group: "content-safety",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    regions: ["australiaeast", "eastus", "switzerlandnorth"],
  },
  {
    id: "content-safety-groundedness-detection",
    displayName: "Content Safety — Groundedness Detection",
    group: "content-safety",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    regions: ["eastus", "eastus2", "francecentral", "swedencentral", "uksouth", "westus"],
  },
  {
    id: "content-safety-image",
    displayName: "Content Safety — Analyze Image",
    group: "content-safety",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    // All tracked regions except Germany West Central and Italy North.
    regions: without(ALL_CONTENT_SAFETY_REGIONS, "germanywestcentral", "italynorth"),
  },
  {
    id: "content-safety-multimodal",
    displayName: "Content Safety — Multimodal (Image with Text)",
    group: "content-safety",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    regions: ["eastus", "westeurope"],
  },
  {
    id: "content-safety-custom-categories-rapid",
    displayName: "Content Safety — Custom Categories (rapid)",
    group: "content-safety",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    // All tracked regions except Korea Central and Poland Central.
    regions: without(ALL_CONTENT_SAFETY_REGIONS, "koreacentral", "polandcentral"),
  },
  {
    id: "content-safety-prompt-shields",
    displayName: "Content Safety — Prompt Shields",
    group: "content-safety",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    regions: ALL_CONTENT_SAFETY_REGIONS,
  },
  {
    id: "content-safety-protected-material-text",
    displayName: "Content Safety — Protected Material (Text)",
    group: "content-safety",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    regions: ALL_CONTENT_SAFETY_REGIONS,
  },
  {
    id: "content-safety-protected-material-code",
    displayName: "Content Safety — Protected Material (Code)",
    group: "content-safety",
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
    group: "content-safety",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    sectionAnchor: "region-availability",
    regions: ALL_CONTENT_SAFETY_REGIONS,
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
      "eastus2",
      "francecentral",
      "germanywestcentral",
      "northcentralus",
      "swedencentral",
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
    // Managed virtual network for the new Agent service / Foundry portal. The
    // supported-region list appears twice in the article: in the lead paragraph
    // (no heading id) and as an explicit "Support for managed virtual network is
    // only in the following " bullet under the "Limitations" heading.
    // We anchor to "limitations" because it is the addressable heading whose
    // slice carries the region list, so drift fires when Microsoft edits the
    // regions (ADR-0002), unlike "understand-isolation-modes", which describes
    // outbound modes and contains no region text, so region drift would go
    // silently unnoticed.
    id: "managed-virtual-network",
    displayName: "Managed Virtual Network",
    group: "networking",
    sourceUrl: "https://learn.microsoft.com/en-us/azure/foundry/how-to/managed-virtual-network",
    sectionAnchor: "limitations",
    regions: [
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
    ],
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
  return { features: FEATURES, availability };
}
