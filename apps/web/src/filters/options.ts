import type { AvailabilityIndex } from "../data/index";

export interface Option {
  value: string;
  label: string;
}

export interface OptionGroup {
  value: string;
  label: string;
  values: string[];
}

export interface FilterOptions {
  skus: Option[];
  geoGroups: Option[];
  lifecycles: Option[];
  capabilities: Option[];
  models: Option[];
  modelGroups: OptionGroup[];
  regions: Option[];
  features: Option[];
}

const PROVIDER_GROUPS = ["OpenAI", "Anthropic"];

// Human-readable labels for the geography groups, mirroring the tab names in the
// Microsoft reliability regions list.
const GEO_GROUP_LABELS: Record<string, string> = {
  americas: "Americas",
  europe: "Europe",
  "middle-east": "Middle East",
  africa: "Africa",
  "asia-pacific": "Asia Pacific",
};

function distinct(values: string[]): string[] {
  return [...new Set(values)].filter((v) => v.length > 0).sort();
}

function buildModelGroups(index: AvailabilityIndex): OptionGroup[] {
  return PROVIDER_GROUPS.map((provider) => ({
    value: provider,
    label: provider,
    values: index.models.filter((m) => m.format === provider).map((m) => m.id),
  })).filter((group) => group.values.length > 0);
}

export function buildOptions(index: AvailabilityIndex): FilterOptions {
  const lifecycles = distinct(
    index.models.map((m) => m.lifecycleStatus ?? "").filter((s) => s.length > 0),
  );
  const capabilities = distinct(index.models.flatMap((m) => m.capabilities));
  const geoGroups = distinct(index.regions.map((r) => r.geoGroup));

  return {
    skus: index.skus.map((s) => ({ value: s, label: s })),
    geoGroups: geoGroups.map((g) => ({ value: g, label: GEO_GROUP_LABELS[g] ?? g })),
    lifecycles: lifecycles.map((l) => ({ value: l, label: l })),
    capabilities: capabilities.map((c) => ({ value: c, label: c })),
    models: index.models.map((m) => ({ value: m.id, label: `${m.name} (${m.version})` })),
    modelGroups: buildModelGroups(index),
    regions: index.regions.map((r) => ({ value: r.id, label: r.displayName })),
    features: index.features.map((f) => ({ value: f.id, label: f.displayName })),
  };
}
