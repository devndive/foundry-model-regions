import type { AvailabilityIndex } from "../data/index";
import type { NormalizedModel, Region } from "../data/types";

export type SortKey = "default" | "name" | "availability";

export interface FilterState {
  sku: string;
  models: string[];
  regions: string[];
  capabilities: string[];
  geoGroups: string[];
  euSovereignOnly: boolean;
  lifecycle: string[];
  gaOnly: boolean;
  swapView: boolean;
  sort: SortKey;
}

export const defaultFilters: FilterState = {
  sku: "GlobalStandard",
  models: [],
  regions: [],
  capabilities: [],
  geoGroups: [],
  euSovereignOnly: false,
  lifecycle: [],
  gaOnly: false,
  swapView: false,
  sort: "default",
};

export interface AxisItem {
  id: string;
  label: string;
  kind: "model" | "region";
  model?: NormalizedModel;
  region?: Region;
}

export interface Matrix {
  columns: AxisItem[];
  rows: AxisItem[];
  cells: boolean[][];
  swapped: boolean;
}

const modelAxis = (m: NormalizedModel): AxisItem => ({
  id: m.id,
  label: m.name,
  kind: "model",
  model: m,
});

const regionAxis = (r: Region): AxisItem => ({
  id: r.id,
  label: r.displayName,
  kind: "region",
  region: r,
});

export function buildMatrix(index: AvailabilityIndex, filters: FilterState): Matrix {
  const modelSet = new Set(filters.models);
  const regionSet = new Set(filters.regions);

  const lifecycleSet = new Set(filters.lifecycle);
  const models = index.models.filter((m) => {
    if (modelSet.size > 0 && !modelSet.has(m.id)) return false;
    if (
      filters.capabilities.length > 0 &&
      !filters.capabilities.some((c) => m.capabilities.includes(c))
    ) {
      return false;
    }
    if (
      lifecycleSet.size > 0 &&
      (m.lifecycleStatus === null || !lifecycleSet.has(m.lifecycleStatus))
    ) {
      return false;
    }
    if (filters.gaOnly && m.lifecycleStatus !== "GenerallyAvailable") return false;
    return true;
  });
  const geoSet = new Set(filters.geoGroups);
  const regions = index.regions.filter((r) => {
    if (regionSet.size > 0 && !regionSet.has(r.id)) return false;
    if (geoSet.size > 0 && !geoSet.has(r.geoGroup)) return false;
    if (filters.euSovereignOnly && !r.euSovereign) return false;
    return true;
  });

  const sortedModels = [...models];
  const sortedRegions = [...regions];
  if (filters.sort === "name") {
    sortedModels.sort((a, b) => a.name.localeCompare(b.name));
    sortedRegions.sort((a, b) => a.displayName.localeCompare(b.displayName));
  } else if (filters.sort === "availability") {
    const modelCount = (id: string) =>
      regions.reduce((n, r) => n + (index.isAvailable(filters.sku, id, r.id) ? 1 : 0), 0);
    const regionCount = (id: string) =>
      models.reduce((n, m) => n + (index.isAvailable(filters.sku, m.id, id) ? 1 : 0), 0);
    sortedModels.sort((a, b) => modelCount(b.id) - modelCount(a.id));
    sortedRegions.sort((a, b) => regionCount(b.id) - regionCount(a.id));
  }

  const modelColumns = sortedModels.map(modelAxis);
  const regionRows = sortedRegions.map(regionAxis);

  const baseCells = sortedRegions.map((r) =>
    sortedModels.map((m) => index.isAvailable(filters.sku, m.id, r.id)),
  );

  if (filters.swapView) {
    const cells = sortedModels.map((_, mi) => sortedRegions.map((_, ri) => baseCells[ri][mi]));
    return { columns: regionRows, rows: modelColumns, cells, swapped: true };
  }

  return { columns: modelColumns, rows: regionRows, cells: baseCells, swapped: false };
}
