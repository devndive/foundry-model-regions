import type { AvailabilityIndex } from "../data/index";

export interface Option {
  value: string;
  label: string;
}

export interface FilterOptions {
  skus: Option[];
  geoGroups: Option[];
  lifecycles: Option[];
  capabilities: Option[];
  models: Option[];
  regions: Option[];
}

function distinct(values: string[]): string[] {
  return [...new Set(values)].filter((v) => v.length > 0).sort();
}

export function buildOptions(index: AvailabilityIndex): FilterOptions {
  const lifecycles = distinct(
    index.models.map((m) => m.lifecycleStatus ?? "").filter((s) => s.length > 0),
  );
  const capabilities = distinct(index.models.flatMap((m) => m.capabilities));
  const geoGroups = distinct(index.regions.map((r) => r.geoGroup));

  return {
    skus: index.skus.map((s) => ({ value: s, label: s })),
    geoGroups: geoGroups.map((g) => ({ value: g, label: g })),
    lifecycles: lifecycles.map((l) => ({ value: l, label: l })),
    capabilities: capabilities.map((c) => ({ value: c, label: c })),
    models: index.models.map((m) => ({ value: m.id, label: `${m.name} (${m.version})` })),
    regions: index.regions.map((r) => ({ value: r.id, label: r.displayName })),
  };
}
