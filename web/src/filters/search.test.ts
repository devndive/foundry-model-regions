import { describe, it, expect } from "vitest";
import { defaultParseSearch, defaultStringifySearch } from "@tanstack/react-router";
import { parseFilters, filtersToSearch } from "./search";
import { defaultFilters } from "../matrix/buildMatrix";

describe("filter search params", () => {
  it("defaults to GlobalStandard with empty selections", () => {
    expect(parseFilters({})).toEqual(defaultFilters);
  });

  it("round-trips a non-default filter state", () => {
    const state = {
      ...defaultFilters,
      sku: "Standard",
      models: ["m1", "m2"],
      capabilities: ["audio"],
      euSovereignOnly: true,
      gaOnly: true,
      swapView: true,
      sort: "name" as const,
    };
    expect(parseFilters(filtersToSearch(state))).toEqual(state);
  });

  it("omits default values from the serialized search", () => {
    expect(filtersToSearch(defaultFilters)).toEqual({});
  });

  it("tolerates a raw/partial search object from the router", () => {
    // The router calls filtersToSearch with the raw, un-validated search
    // object (e.g. `{}` on first load), where array fields are undefined.
    // parseFilters normalizes it first, so this must not throw.
    expect(() =>
      filtersToSearch(parseFilters({} as Record<string, unknown>)),
    ).not.toThrow();
    expect(filtersToSearch(parseFilters({}))).toEqual({});
    expect(
      filtersToSearch(parseFilters({ models: "solo", gaOnly: true })),
    ).toEqual({ models: ["solo"], gaOnly: true });
  });
});

describe("filter search params URL round-trip", () => {
  // Run filters through the router's actual search (de)serialization, the same
  // way a shareable URL is produced and consumed. This guards the boolean/array
  // assumptions in parseFilters (e.g. `=== true`, real arrays) against changes
  // to the router's parse/stringify config.
  const roundTrip = (filters: typeof defaultFilters) => {
    const url = defaultStringifySearch(filtersToSearch(filters));
    return parseFilters(defaultParseSearch(url) as Record<string, unknown>);
  };

  it("preserves booleans through stringify/parse", () => {
    const state = {
      ...defaultFilters,
      euSovereignOnly: true,
      gaOnly: true,
      swapView: true,
    };
    expect(roundTrip(state)).toEqual(state);
  });

  it("preserves multi-element arrays", () => {
    const state = {
      ...defaultFilters,
      models: ["m1", "m2"],
      regions: ["r1", "r2"],
    };
    expect(roundTrip(state)).toEqual(state);
  });

  it("preserves single-element arrays as arrays", () => {
    const state = { ...defaultFilters, models: ["solo"] };
    const result = roundTrip(state);
    expect(Array.isArray(result.models)).toBe(true);
    expect(result).toEqual(state);
  });

  it("round-trips a fully populated non-default state", () => {
    const state = {
      ...defaultFilters,
      sku: "Standard",
      models: ["m1", "m2"],
      regions: ["eastus"],
      capabilities: ["audio"],
      geoGroups: ["us"],
      euSovereignOnly: true,
      lifecycle: ["ga"],
      gaOnly: true,
      swapView: true,
      sort: "name" as const,
    };
    expect(roundTrip(state)).toEqual(state);
  });

  it("returns defaults for an empty search string", () => {
    expect(roundTrip(defaultFilters)).toEqual(defaultFilters);
  });
});
