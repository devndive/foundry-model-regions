// The wire contract for the emitted artifacts (models.json, regions.json,
// features.json). This is the single source of truth shared by the pipeline
// (which produces the artifacts) and the web app (which consumes them), so a
// change to a serialized shape breaks the web typecheck instead of drifting
// silently. Types only — no runtime code. See docs/adr/0004-*.md.

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
  deprecation: ModelDeprecation | null;
}

// A Model Availability Fact: a Model can be deployed in a Region under a SKU.
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

// Geography groups mirror the Azure regions list in the Microsoft reliability
// documentation: https://learn.microsoft.com/azure/reliability/regions-list
export type GeoGroup = "americas" | "europe" | "middle-east" | "africa" | "asia-pacific";

export interface Region {
  id: string;
  displayName: string;
  geoGroup: GeoGroup;
}

export interface Feature {
  id: string;
  displayName: string;
  sourceUrl: string;
  sectionAnchor: string;
  regions: readonly string[];
}

// A Feature Availability Fact: a closed-world (feature, region) pair stating a
// Foundry Feature is available in a Region.
export interface FeatureAvailabilityFact {
  featureId: string;
  region: string;
}

export interface FeaturesArtifact {
  features: readonly Feature[];
  availability: readonly FeatureAvailabilityFact[];
}
