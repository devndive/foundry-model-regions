import type { AvailabilityIndex } from "../data/index";
import type { NormalizedModel, Region } from "../data/types";

export type SortKey = "default" | "name" | "availability";

const DEPRECATED_STATUSES = new Set(["Deprecated", "Deprecating"]);

export interface FilterState {
  sku: string;
  models: string[];
  regions: string[];
  features: string[];
  capabilities: string[];
  geoGroups: string[];
  euSovereignOnly: boolean;
  lifecycle: string[];
  gaOnly: boolean;
  hideDeprecated: boolean;
  swapView: boolean;
  sort: SortKey;
}

export const defaultFilters: FilterState = {
  sku: "GlobalStandard",
  models: [],
  regions: [],
  features: [],
  capabilities: [],
  geoGroups: [],
  euSovereignOnly: false,
  lifecycle: [],
  gaOnly: false,
  hideDeprecated: true,
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
  cellStatus: (string | null)[][];
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
    if (
      filters.hideDeprecated &&
      m.lifecycleStatus !== null &&
      DEPRECATED_STATUSES.has(m.lifecycleStatus) &&
      !lifecycleSet.has(m.lifecycleStatus)
    ) {
      return false;
    }
    return true;
  });
  const geoSet = new Set(filters.geoGroups);
  const regions = index.regions.filter((r) => {
    if (regionSet.size > 0 && !regionSet.has(r.id)) return false;
    if (geoSet.size > 0 && !geoSet.has(r.geoGroup)) return false;
    if (filters.euSovereignOnly && !r.euSovereign) return false;
    return true;
  });

  // Deployment Fit: when Features are selected, prune to a single requirement basket.
  // A region survives only if every selected Feature (closed-world) is available there and
  // — when Models are selected — at least one selected Model is available there. Model rows
  // then keep only those present in a surviving region. Models are an OR constraint (not AND)
  // so picking a broad group like "OpenAI" narrows by feature without demanding every model
  // coexist in one region, which no region satisfies.
  let fitModels = models;
  let fitRegions = regions;
  if (filters.features.length > 0) {
    // The basket constrains regions on the raw `filters.models` selection, not the
    // `models` list above (which is already narrowed by capabilities/lifecycle/gaOnly/
    // hideDeprecated). This is intentional: the basket is "what the developer explicitly
    // asked for", independent of cosmetic row-visibility filters. A model selected via URL
    // that is also hidden (e.g. deprecated) therefore still constrains region columns.
    fitRegions = regions.filter(
      (r) =>
        filters.features.every((f) => index.isFeatureAvailable(f, r.id)) &&
        (filters.models.length === 0 ||
          filters.models.some((m) => index.isAvailable(filters.sku, m, r.id))),
    );
    fitModels = models.filter((m) =>
      fitRegions.some((r) => index.isAvailable(filters.sku, m.id, r.id)),
    );
  }

  const sortedModels = [...fitModels];
  const sortedRegions = [...fitRegions];
  if (filters.sort === "name") {
    sortedModels.sort((a, b) => a.name.localeCompare(b.name));
    sortedRegions.sort((a, b) => a.displayName.localeCompare(b.displayName));
  } else if (filters.sort === "availability") {
    const modelCount = (id: string) =>
      fitRegions.reduce((n, r) => n + (index.isAvailable(filters.sku, id, r.id) ? 1 : 0), 0);
    const regionCount = (id: string) =>
      fitModels.reduce((n, m) => n + (index.isAvailable(filters.sku, m.id, id) ? 1 : 0), 0);
    sortedModels.sort((a, b) => modelCount(b.id) - modelCount(a.id));
    sortedRegions.sort((a, b) => regionCount(b.id) - regionCount(a.id));
  }

  const modelColumns = sortedModels.map(modelAxis);
  const regionRows = sortedRegions.map(regionAxis);

  const baseCells = sortedRegions.map((r) =>
    sortedModels.map((m) => index.isAvailable(filters.sku, m.id, r.id)),
  );
  const baseStatus = sortedRegions.map((r) =>
    sortedModels.map((m) =>
      index.isAvailable(filters.sku, m.id, r.id) ? index.cellStatus(filters.sku, m.id, r.id) : null,
    ),
  );

  if (filters.swapView) {
    const cells = sortedModels.map((_, mi) => sortedRegions.map((_, ri) => baseCells[ri][mi]));
    const cellStatus = sortedModels.map((_, mi) =>
      sortedRegions.map((_, ri) => baseStatus[ri][mi]),
    );
    return { columns: regionRows, rows: modelColumns, cells, cellStatus, swapped: true };
  }

  return {
    columns: modelColumns,
    rows: regionRows,
    cells: baseCells,
    cellStatus: baseStatus,
    swapped: false,
  };
}
