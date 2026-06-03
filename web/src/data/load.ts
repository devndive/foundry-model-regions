import type { NormalizedBundle, Region } from "./types";
import { buildIndex, type AvailabilityIndex } from "./index";

const DATA_BASE = `${import.meta.env.BASE_URL}data`;

export async function loadIndex(fetchImpl: typeof fetch = fetch): Promise<AvailabilityIndex> {
  const [bundleRes, regionsRes] = await Promise.all([
    fetchImpl(`${DATA_BASE}/models.json`),
    fetchImpl(`${DATA_BASE}/regions.json`),
  ]);
  if (!bundleRes.ok || !regionsRes.ok) {
    throw new Error("Failed to load data artifacts");
  }
  const bundle = (await bundleRes.json()) as NormalizedBundle;
  const regions = (await regionsRes.json()) as Region[];
  return buildIndex(bundle, regions);
}
