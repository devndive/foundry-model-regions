import { useEffect, useState } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  createHashHistory,
  defaultParseSearch,
  defaultStringifySearch,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import type { AvailabilityIndex } from "./data/index";
import { loadIndex } from "./data/load";
import { parseFilters, filtersToSearch } from "./filters/search";
import type { FilterState } from "./matrix/buildMatrix";
import { App } from "./App";

const rootRoute = createRootRoute();

function IndexRoute() {
  const filters = useSearch({ from: indexRoute.id });
  const navigate = useNavigate();
  const [index, setIndex] = useState<AvailabilityIndex | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadIndex()
      .then((idx) => {
        if (!cancelled) setIndex(idx);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="empty">Failed to load data: {error}</p>;
  if (!index) return <p className="empty">Loading…</p>;

  const onFiltersChange = (patch: Partial<FilterState>) => {
    const next = { ...filters, ...patch };
    navigate({ to: "/", search: next });
  };

  return <App index={index} filters={filters} onFiltersChange={onFiltersChange} />;
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>): FilterState =>
    parseFilters(search),
  component: IndexRoute,
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
  // Pin JSON-based search (de)serialization so booleans/arrays survive the URL
  // round-trip (see filters/search.ts and search.test.ts). The router hands
  // stringifySearch the raw, un-validated search object (e.g. `{}` on first
  // load), so we run it through parseFilters first to get a complete
  // FilterState before filtersToSearch reads array/scalar fields. validateSearch
  // parses back to a full FilterState, so components never re-parse.
  parseSearch: defaultParseSearch,
  stringifySearch: (search) =>
    defaultStringifySearch(
      filtersToSearch(parseFilters(search as Record<string, unknown>)),
    ),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
