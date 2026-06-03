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
  euSovereign: boolean;
}
