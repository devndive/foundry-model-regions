import { describe, it, expect } from "vitest";
import { buildOptions } from "./options";
import { buildIndex } from "../data/index";
import type {
  Feature,
  FeatureGroup,
  NormalizedBundle,
  NormalizedModel,
  Region,
} from "@foundry/data-types";

function model(id: string, format: string): NormalizedModel {
  return {
    id,
    name: id,
    version: "1",
    format,
    lifecycleStatus: "GenerallyAvailable",
    isDefaultVersion: true,
    capabilities: ["chatCompletion"],
    createdAt: null,
    deprecation: { inference: null, fineTune: null },
  };
}

const regions: Region[] = [{ id: "eastus", displayName: "East US", geoGroup: "americas" }];

function indexFor(models: NormalizedModel[]) {
  const bundle: NormalizedBundle = { models, availability: [] };
  return buildIndex(bundle, regions);
}

describe("buildOptions modelGroups", () => {
  it("exposes OpenAI and Anthropic provider groups with their model ids", () => {
    const index = indexFor([
      model("OpenAI:gpt-4o:1", "OpenAI"),
      model("OpenAI:gpt-35:0613", "OpenAI"),
      model("Anthropic:claude:1", "Anthropic"),
      model("Meta:llama:1", "Meta"),
    ]);

    const { modelGroups } = buildOptions(index);

    expect(modelGroups).toEqual([
      {
        value: "OpenAI",
        label: "OpenAI",
        values: ["OpenAI:gpt-4o:1", "OpenAI:gpt-35:0613"],
      },
      {
        value: "Anthropic",
        label: "Anthropic",
        values: ["Anthropic:claude:1"],
      },
    ]);
  });

  it("omits a provider group when no models match that provider", () => {
    const index = indexFor([model("Meta:llama:1", "Meta")]);

    expect(buildOptions(index).modelGroups).toEqual([]);
  });
});

describe("buildOptions featureGroups", () => {
  function feature(id: string, displayName: string, group: FeatureGroup): Feature {
    return {
      id,
      displayName,
      group,
      sourceUrl: "https://example.com",
      sectionAnchor: "region-availability",
      regions: ["eastus"],
    };
  }

  function indexForFeatures(features: Feature[]) {
    const bundle: NormalizedBundle = { models: [], availability: [] };
    return buildIndex(bundle, regions, {
      features,
      availability: features.map((f) => ({ featureId: f.id, region: "eastus" })),
    });
  }

  it("orders the groups by reading order, not by the order features arrive in", () => {
    const index = indexForFeatures([
      feature("managed-virtual-network", "Managed Virtual Network", "networking"),
      feature("foundry-agents", "Foundry Agents", "foundry-agents"),
      feature("content-safety-text", "Text moderation", "content-safety"),
    ]);

    expect(buildOptions(index).featureGroups.map((g) => g.id)).toEqual([
      "foundry-agents",
      "content-safety",
      "networking",
    ]);
  });

  it("labels each group for reading and keeps its features in curated order", () => {
    // Reverse-alphabetical on purpose: a sort would reorder these, curation won't.
    const index = indexForFeatures([
      feature("agent-tool-sharepoint", "Agent Tool — SharePoint", "agent-tools"),
      feature("agent-tool-fabric", "Agent Tool — Microsoft Fabric", "agent-tools"),
      feature("agent-tool-bing", "Agent Tool — Grounding with Bing", "agent-tools"),
    ]);

    expect(buildOptions(index).featureGroups).toEqual([
      {
        id: "agent-tools",
        label: "Agent Tools",
        options: [
          { value: "agent-tool-sharepoint", label: "SharePoint" },
          { value: "agent-tool-fabric", label: "Microsoft Fabric" },
          { value: "agent-tool-bing", label: "Grounding with Bing" },
        ],
      },
    ]);
  });

  it("drops the qualifier a group already states, keeping only the specific half", () => {
    const index = indexForFeatures([
      feature("content-safety-image", "Content Safety — Image moderation", "content-safety"),
      feature("hosted-agents", "Hosted Agents", "hosted-agents"),
    ]);

    const labels = buildOptions(index).featureGroups.flatMap((g) =>
      g.options.map((o) => o.label),
    );
    expect(labels).toEqual(["Hosted Agents", "Image moderation"]);
  });

  it("splits on the first separator only, so a qualified specific stays whole", () => {
    const index = indexForFeatures([
      feature("x", "Evaluators — Risk and safety — preview", "evaluation"),
    ]);

    expect(buildOptions(index).featureGroups[0].options[0].label).toBe(
      "Risk and safety — preview",
    );
  });

  it("omits a group no indexed feature belongs to", () => {
    const index = indexForFeatures([feature("hosted-agents", "Hosted Agents", "hosted-agents")]);

    expect(buildOptions(index).featureGroups.map((g) => g.id)).toEqual(["hosted-agents"]);
  });

  it("leaves the flat feature options spelling out the full display name", () => {
    const index = indexForFeatures([
      feature("content-safety-image", "Content Safety — Image moderation", "content-safety"),
    ]);

    expect(buildOptions(index).features).toEqual([
      { value: "content-safety-image", label: "Content Safety — Image moderation" },
    ]);
  });
});

describe("buildOptions features", () => {

  it("exposes each indexed feature as an option labelled by displayName", () => {
    const bundle: NormalizedBundle = { models: [], availability: [] };
    const features = {
      features: [
        {
          id: "hosted-agents",
          displayName: "Hosted Agents",
          group: "hosted-agents" as const,
          sourceUrl: "https://example.com",
          sectionAnchor: "region-availability",
          regions: ["eastus"],
        },
      ],
      availability: [{ featureId: "hosted-agents", region: "eastus" }],
    };
    const index = buildIndex(bundle, regions, features);

    expect(buildOptions(index).features).toEqual([
      { value: "hosted-agents", label: "Hosted Agents" },
    ]);
  });

  it("exposes no feature options when the index has no features", () => {
    expect(buildOptions(indexFor([])).features).toEqual([]);
  });
});
