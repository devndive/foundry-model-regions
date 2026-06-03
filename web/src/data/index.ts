import type { NormalizedBundle, NormalizedModel, Region } from "./types";

export interface AvailabilityIndex {
  models: NormalizedModel[];
  regions: Region[];
  skus: string[];
  isAvailable(sku: string, modelId: string, regionId: string): boolean;
  cellStatus(sku: string, modelId: string, regionId: string): string | null;
}

const key = (sku: string, modelId: string, regionId: string) =>
  `${sku}\u0000${modelId}\u0000${regionId}`;

export function buildIndex(bundle: NormalizedBundle, regions: Region[]): AvailabilityIndex {
  const present = new Set<string>();
  const status = new Map<string, string | null>();
  const skuSet = new Set<string>();
  for (const fact of bundle.availability) {
    const k = key(fact.sku, fact.modelId, fact.region);
    present.add(k);
    status.set(k, fact.lifecycleStatus ?? null);
    skuSet.add(fact.sku);
  }

  return {
    models: bundle.models,
    regions,
    skus: [...skuSet].sort(),
    isAvailable: (sku, modelId, regionId) => present.has(key(sku, modelId, regionId)),
    cellStatus: (sku, modelId, regionId) => status.get(key(sku, modelId, regionId)) ?? null,
  };
}
