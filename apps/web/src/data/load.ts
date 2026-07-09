import type { FeaturesArtifact, NormalizedBundle, Region } from "@foundry/data-types";
import { buildIndex, type AvailabilityIndex } from "./index";

const DATA_BASE = `${import.meta.env.BASE_URL}data`;

export async function loadIndex(fetchImpl: typeof fetch = fetch): Promise<AvailabilityIndex> {
  const [bundleRes, regionsRes, featuresRes] = await Promise.all([
    fetchImpl(`${DATA_BASE}/models.json`),
    fetchImpl(`${DATA_BASE}/regions.json`),
    fetchImpl(`${DATA_BASE}/features.json`),
  ]);
  if (!bundleRes.ok || !regionsRes.ok || !featuresRes.ok) {
    throw new Error("Failed to load data artifacts");
  }
  const bundle = (await bundleRes.json()) as NormalizedBundle;
  const regions = (await regionsRes.json()) as Region[];
  const features = (await featuresRes.json()) as FeaturesArtifact;
  return buildIndex(bundle, regions, features);
}
