import { describe, it, expect } from "vitest";
import { buildOptions } from "./options";
import { buildIndex } from "../data/index";
import type { NormalizedBundle, NormalizedModel, Region } from "@foundry/data-types";

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

describe("buildOptions features", () => {
  it("exposes each indexed feature as an option labelled by displayName", () => {
    const bundle: NormalizedBundle = { models: [], availability: [] };
    const features = {
      features: [
        {
          id: "hosted-agents",
          displayName: "Hosted Agents",
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
