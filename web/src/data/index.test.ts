import { describe, it, expect } from "vitest";
import { buildIndex } from "./index";
import type { NormalizedBundle, Region } from "./types";

const model = (id: string, over: Partial<import("./types").NormalizedModel> = {}) => ({
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
  geoGroup: "us",
  euSovereign: false,
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
});
