import { defaultFilters, type FilterState, type SortKey } from "../matrix/buildMatrix";

export type FilterSearch = Partial<{
  sku: string;
  models: string[];
  regions: string[];
  capabilities: string[];
  geoGroups: string[];
  euSovereignOnly: boolean;
  lifecycle: string[];
  gaOnly: boolean;
  hideDeprecated: boolean;
  swapView: boolean;
  sort: SortKey;
}>;

const SORTS: SortKey[] = ["default", "name", "availability"];

function strArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
}

export function parseFilters(search: Record<string, unknown>): FilterState {
  const sort = SORTS.includes(search.sort as SortKey) ? (search.sort as SortKey) : "default";
  return {
    sku: typeof search.sku === "string" ? search.sku : defaultFilters.sku,
    models: strArray(search.models),
    regions: strArray(search.regions),
    capabilities: strArray(search.capabilities),
    geoGroups: strArray(search.geoGroups),
    euSovereignOnly: search.euSovereignOnly === true,
    lifecycle: strArray(search.lifecycle),
    gaOnly: search.gaOnly === true,
    hideDeprecated: search.hideDeprecated !== false,
    swapView: search.swapView === true,
    sort,
  };
}

export function filtersToSearch(filters: FilterState): FilterSearch {
  const search: FilterSearch = {};
  if (filters.sku !== defaultFilters.sku) search.sku = filters.sku;
  if (filters.models.length) search.models = filters.models;
  if (filters.regions.length) search.regions = filters.regions;
  if (filters.capabilities.length) search.capabilities = filters.capabilities;
  if (filters.geoGroups.length) search.geoGroups = filters.geoGroups;
  if (filters.euSovereignOnly) search.euSovereignOnly = true;
  if (filters.lifecycle.length) search.lifecycle = filters.lifecycle;
  if (filters.gaOnly) search.gaOnly = true;
  if (!filters.hideDeprecated) search.hideDeprecated = false;
  if (filters.swapView) search.swapView = true;
  if (filters.sort !== defaultFilters.sort) search.sort = filters.sort;
  return search;
}
