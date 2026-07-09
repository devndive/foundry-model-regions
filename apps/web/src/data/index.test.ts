import { describe, it, expect } from "vitest";
import { buildIndex } from "./index";
import type { NormalizedBundle, NormalizedModel, Region } from "@foundry/data-types";

const model = (id: string, over: Partial<NormalizedModel> = {}) => ({
  id,
  name: id,
  version: "1",
  format: "OpenAI",
  lifecycleStatus: "GenerallyAvailable",
  isDefaultVersion: true,
  capabilities: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  deprecation: { inference: null, fineTune: null },
  ...over,
});

const region = (id: string, over: Partial<Region> = {}): Region => ({
  id,
  displayName: id,
  geoGroup: "americas",
  ...over,
});

describe("buildIndex", () => {
  it("reports a model available in a region for a given SKU when a fact exists", () => {
    const bundle: NormalizedBundle = {
      models: [model("m1")],
      availability: [
        {
          modelId: "m1",
          region: "eastus",
          sku: "GlobalStandard",
          deprecationDate: null,
          lifecycleStatus: "Preview",
        },
      ],
    };
    const regions = [region("eastus")];

    const index = buildIndex(bundle, regions);

    expect(index.isAvailable("GlobalStandard", "m1", "eastus")).toBe(true);
    expect(index.isAvailable("GlobalStandard", "m1", "westus")).toBe(false);
    expect(index.isAvailable("Standard", "m1", "eastus")).toBe(false);
    expect(index.cellStatus("GlobalStandard", "m1", "eastus")).toBe("Preview");
    expect(index.cellStatus("GlobalStandard", "m1", "westus")).toBe(null);
  });

  it("reports a feature available only in the regions its closed-world list names", () => {
    const bundle: NormalizedBundle = { models: [], availability: [] };
    const regions = [region("eastus"), region("westus")];
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

    expect(index.features.map((f) => f.id)).toEqual(["hosted-agents"]);
    expect(index.isFeatureAvailable("hosted-agents", "eastus")).toBe(true);
    expect(index.isFeatureAvailable("hosted-agents", "westus")).toBe(false);
    expect(index.isFeatureAvailable("unknown-feature", "eastus")).toBe(false);
  });

  it("exposes an empty feature list when no features artifact is provided", () => {
    const index = buildIndex({ models: [], availability: [] }, [region("eastus")]);

    expect(index.features).toEqual([]);
    expect(index.isFeatureAvailable("hosted-agents", "eastus")).toBe(false);
  });
});
