import type {
  Feature,
  FeaturesArtifact,
  NormalizedBundle,
  NormalizedModel,
  Region,
} from "@foundry/data-types";

export interface AvailabilityIndex {
  models: NormalizedModel[];
  regions: Region[];
  features: readonly Feature[];
  skus: string[];
  isAvailable(sku: string, modelId: string, regionId: string): boolean;
  cellStatus(sku: string, modelId: string, regionId: string): string | null;
  isFeatureAvailable(featureId: string, regionId: string): boolean;
}

const key = (sku: string, modelId: string, regionId: string) =>
  `${sku}\u0000${modelId}\u0000${regionId}`;

const featureKey = (featureId: string, regionId: string) => `${featureId}\u0000${regionId}`;

export function buildIndex(
  bundle: NormalizedBundle,
  regions: Region[],
  featuresArtifact?: FeaturesArtifact,
): AvailabilityIndex {
  const present = new Set<string>();
  const status = new Map<string, string | null>();
  const skuSet = new Set<string>();
  for (const fact of bundle.availability) {
    const k = key(fact.sku, fact.modelId, fact.region);
    present.add(k);
    status.set(k, fact.lifecycleStatus ?? null);
    skuSet.add(fact.sku);
  }

  const featurePresent = new Set<string>();
  for (const fact of featuresArtifact?.availability ?? []) {
    featurePresent.add(featureKey(fact.featureId, fact.region));
  }

  return {
    models: bundle.models,
    regions,
    features: featuresArtifact?.features ?? [],
    skus: [...skuSet].sort(),
    isAvailable: (sku, modelId, regionId) => present.has(key(sku, modelId, regionId)),
    cellStatus: (sku, modelId, regionId) => status.get(key(sku, modelId, regionId)) ?? null,
    isFeatureAvailable: (featureId, regionId) =>
      featurePresent.has(featureKey(featureId, regionId)),
  };
}
