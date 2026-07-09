import { describe, it, expect, vi } from "vitest";
import { loadIndex } from "./load";
import type { FeaturesArtifact, NormalizedBundle, Region } from "@foundry/data-types";

const bundle: NormalizedBundle = {
  models: [
    {
      id: "m1",
      name: "m1",
      version: "1",
      format: "OpenAI",
      lifecycleStatus: "GenerallyAvailable",
      isDefaultVersion: true,
      capabilities: [],
      createdAt: null,
      deprecation: { inference: null, fineTune: null },
    },
  ],
  availability: [
    {
      modelId: "m1",
      region: "eastus",
      sku: "GlobalStandard",
      deprecationDate: null,
      lifecycleStatus: "GenerallyAvailable",
    },
  ],
};

const regions: Region[] = [{ id: "eastus", displayName: "East US", geoGroup: "americas" }];

const featuresArtifact: FeaturesArtifact = {
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

const ok = (body: unknown): Response =>
  ({ ok: true, json: async () => body }) as unknown as Response;

describe("loadIndex", () => {
  it("loads models, regions, and features into the index", async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.endsWith("models.json")) return ok(bundle);
      if (url.endsWith("regions.json")) return ok(regions);
      if (url.endsWith("features.json")) return ok(featuresArtifact);
      throw new Error(`unexpected url ${url}`);
    }) as unknown as typeof fetch;

    const index = await loadIndex(fetchImpl);

    expect(index.models.map((m) => m.id)).toEqual(["m1"]);
    expect(index.features.map((f) => f.id)).toEqual(["hosted-agents"]);
    expect(index.isFeatureAvailable("hosted-agents", "eastus")).toBe(true);
  });

  it("throws when a data artifact fails to load", async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.endsWith("features.json")) {
        return { ok: false, json: async () => ({}) } as unknown as Response;
      }
      if (url.endsWith("models.json")) return ok(bundle);
      return ok(regions);
    }) as unknown as typeof fetch;

    await expect(loadIndex(fetchImpl)).rejects.toThrow();
  });
});
