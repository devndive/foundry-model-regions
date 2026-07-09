export interface ModelDeprecation {
  inference: string | null;
  fineTune: string | null;
}

export interface NormalizedModel {
  id: string;
  name: string;
  version: string;
  format: string;
  lifecycleStatus: string | null;
  isDefaultVersion: boolean;
  capabilities: string[];
  createdAt: string | null;
  deprecation: ModelDeprecation;
}

export interface AvailabilityFact {
  modelId: string;
  region: string;
  sku: string;
  deprecationDate: string | null;
  lifecycleStatus: string | null;
}

export interface NormalizedBundle {
  models: NormalizedModel[];
  availability: AvailabilityFact[];
}

export interface Region {
  id: string;
  displayName: string;
  geoGroup: string;
}

export interface Feature {
  id: string;
  displayName: string;
  sourceUrl: string;
  sectionAnchor: string;
  regions: string[];
}

export interface FeatureAvailabilityFact {
  featureId: string;
  region: string;
}

export interface FeaturesArtifact {
  features: Feature[];
  availability: FeatureAvailabilityFact[];
}
