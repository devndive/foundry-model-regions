import type { NormalizedBundle, NormalizedModel, Region } from "./types";

export interface AvailabilityIndex {
  models: NormalizedModel[];
  regions: Region[];
  skus: string[];
  isAvailable(sku: string, modelId: string, regionId: string): boolean;
}

const key = (sku: string, modelId: string, regionId: string) =>
  `${sku}\u0000${modelId}\u0000${regionId}`;

export function buildIndex(bundle: NormalizedBundle, regions: Region[]): AvailabilityIndex {
  const present = new Set<string>();
  const skuSet = new Set<string>();
  for (const fact of bundle.availability) {
    present.add(key(fact.sku, fact.modelId, fact.region));
    skuSet.add(fact.sku);
  }

  return {
    models: bundle.models,
    regions,
    skus: [...skuSet].sort(),
    isAvailable: (sku, modelId, regionId) => present.has(key(sku, modelId, regionId)),
  };
}
