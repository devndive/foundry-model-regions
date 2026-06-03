import { describe, it, expect } from "vitest";
import { buildIndex } from "../data/index";
import { buildMatrix, defaultFilters } from "./buildMatrix";
import type { NormalizedBundle, NormalizedModel, Region } from "../data/types";

const model = (id: string, over: Partial<NormalizedModel> = {}): NormalizedModel => ({
  id,
  name: id,
  version: "1",
  format: "OpenAI",
  lifecycleStatus: "GenerallyAvailable",
  isDefaultVersion: true,
  capabilities: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  deprecation: { inference: null, fineTune: null },
  ...over,
});

const region = (id: string, over: Partial<Region> = {}): Region => ({
  id,
  displayName: id,
  geoGroup: "us",
  euSovereign: false,
  ...over,
});

const avail = (
  modelId: string,
  region: string,
  sku = "GlobalStandard",
  lifecycleStatus: string | null = "GenerallyAvailable",
) => ({
  modelId,
  region,
  sku,
  deprecationDate: null,
  lifecycleStatus,
});

describe("buildMatrix", () => {
  it("places models on columns, regions on rows, and marks available cells", () => {
    const bundle: NormalizedBundle = {
      models: [model("m1"), model("m2")],
      availability: [avail("m1", "eastus"), avail("m2", "westus")],
    };
    const regions = [region("eastus"), region("westus")];
    const index = buildIndex(bundle, regions);

    const matrix = buildMatrix(index, { ...defaultFilters, sku: "GlobalStandard" });

    expect(matrix.columns.map((c) => c.id)).toEqual(["m1", "m2"]);
    expect(matrix.rows.map((r) => r.id)).toEqual(["eastus", "westus"]);
    // rows x columns
    expect(matrix.cells).toEqual([
      [true, false],
      [false, true],
    ]);
  });

  it("only marks cells available under the selected SKU", () => {
    const bundle: NormalizedBundle = {
      models: [model("m1")],
      availability: [avail("m1", "eastus", "GlobalStandard"), avail("m1", "westus", "Standard")],
    };
    const regions = [region("eastus"), region("westus")];
    const index = buildIndex(bundle, regions);

    const global = buildMatrix(index, { ...defaultFilters, sku: "GlobalStandard" });
    const standard = buildMatrix(index, { ...defaultFilters, sku: "Standard" });

    expect(global.cells).toEqual([[true], [false]]);
    expect(standard.cells).toEqual([[false], [true]]);
  });

  it("restricts columns to selected models and rows to selected regions", () => {
    const bundle: NormalizedBundle = {
      models: [model("m1"), model("m2"), model("m3")],
      availability: [avail("m1", "eastus"), avail("m2", "westus"), avail("m3", "eastus")],
    };
    const regions = [region("eastus"), region("westus"), region("northeurope")];
    const index = buildIndex(bundle, regions);

    const matrix = buildMatrix(index, {
      ...defaultFilters,
      models: ["m1", "m3"],
      regions: ["eastus"],
    });

    expect(matrix.columns.map((c) => c.id)).toEqual(["m1", "m3"]);
    expect(matrix.rows.map((r) => r.id)).toEqual(["eastus"]);
    expect(matrix.cells).toEqual([[true, true]]);
  });

  it("keeps only models having at least one selected capability", () => {
    const bundle: NormalizedBundle = {
      models: [
        model("vision", { capabilities: ["imageGenerations", "chatCompletion"] }),
        model("audio", { capabilities: ["audio"] }),
        model("chat", { capabilities: ["chatCompletion"] }),
      ],
      availability: [avail("vision", "eastus"), avail("audio", "eastus"), avail("chat", "eastus")],
    };
    const regions = [region("eastus")];
    const index = buildIndex(bundle, regions);

    const matrix = buildMatrix(index, {
      ...defaultFilters,
      capabilities: ["audio", "imageGenerations"],
    });

    expect(matrix.columns.map((c) => c.id)).toEqual(["vision", "audio"]);
  });

  it("filters regions by geo group and EU sovereign toggle", () => {
    const bundle: NormalizedBundle = {
      models: [model("m1")],
      availability: [avail("m1", "eastus"), avail("m1", "westeurope"), avail("m1", "uksouth")],
    };
    const regions = [
      region("eastus", { geoGroup: "us", euSovereign: false }),
      region("westeurope", { geoGroup: "europe", euSovereign: true }),
      region("uksouth", { geoGroup: "europe", euSovereign: false }),
    ];
    const index = buildIndex(bundle, regions);

    const byGeo = buildMatrix(index, { ...defaultFilters, geoGroups: ["europe"] });
    expect(byGeo.rows.map((r) => r.id)).toEqual(["westeurope", "uksouth"]);

    const euOnly = buildMatrix(index, {
      ...defaultFilters,
      geoGroups: ["europe"],
      euSovereignOnly: true,
    });
    expect(euOnly.rows.map((r) => r.id)).toEqual(["westeurope"]);
  });

  it("filters models by lifecycle status and GA-only toggle", () => {
    const bundle: NormalizedBundle = {
      models: [
        model("ga", { lifecycleStatus: "GenerallyAvailable" }),
        model("prev", { lifecycleStatus: "Preview" }),
        model("dep", { lifecycleStatus: "Deprecated" }),
      ],
      availability: [avail("ga", "eastus"), avail("prev", "eastus"), avail("dep", "eastus")],
    };
    const regions = [region("eastus")];
    const index = buildIndex(bundle, regions);

    const byLifecycle = buildMatrix(index, {
      ...defaultFilters,
      lifecycle: ["Preview", "Deprecated"],
    });
    expect(byLifecycle.columns.map((c) => c.id)).toEqual(["prev", "dep"]);

    const gaOnly = buildMatrix(index, { ...defaultFilters, gaOnly: true });
    expect(gaOnly.columns.map((c) => c.id)).toEqual(["ga"]);
  });

  it("transposes axes when swapView is on", () => {
    const bundle: NormalizedBundle = {
      models: [model("m1"), model("m2")],
      availability: [avail("m1", "eastus"), avail("m2", "westus")],
    };
    const regions = [region("eastus"), region("westus")];
    const index = buildIndex(bundle, regions);

    const matrix = buildMatrix(index, { ...defaultFilters, swapView: true });

    expect(matrix.swapped).toBe(true);
    expect(matrix.columns.map((c) => c.id)).toEqual(["eastus", "westus"]);
    expect(matrix.rows.map((r) => r.id)).toEqual(["m1", "m2"]);
    // rows (models) x columns (regions)
    expect(matrix.cells).toEqual([
      [true, false],
      [false, true],
    ]);
  });

  it("sorts models and regions by name when sort=name", () => {
    const bundle: NormalizedBundle = {
      models: [model("zebra"), model("alpha")],
      availability: [avail("zebra", "westus"), avail("alpha", "eastus")],
    };
    const regions = [
      region("westus", { displayName: "West US" }),
      region("eastus", { displayName: "East US" }),
    ];
    const index = buildIndex(bundle, regions);

    const matrix = buildMatrix(index, { ...defaultFilters, sort: "name" });

    expect(matrix.columns.map((c) => c.id)).toEqual(["alpha", "zebra"]);
    expect(matrix.rows.map((r) => r.id)).toEqual(["eastus", "westus"]);
    // cell grid must follow the sorted order: alpha@eastus true, zebra@westus true
    expect(matrix.cells).toEqual([
      [true, false],
      [false, true],
    ]);
  });

  it("sorts by availability count descending when sort=availability", () => {
    const bundle: NormalizedBundle = {
      models: [model("rare"), model("common")],
      availability: [avail("common", "eastus"), avail("common", "westus"), avail("rare", "eastus")],
    };
    const regions = [region("eastus"), region("westus")];
    const index = buildIndex(bundle, regions);

    const matrix = buildMatrix(index, { ...defaultFilters, sort: "availability" });

    expect(matrix.columns.map((c) => c.id)).toEqual(["common", "rare"]);
  });

  it("exposes per-cell lifecycle status for available cells and null otherwise", () => {
    const bundle: NormalizedBundle = {
      models: [model("m1"), model("m2")],
      availability: [
        avail("m1", "eastus", "GlobalStandard", "GenerallyAvailable"),
        avail("m1", "swedencentral", "GlobalStandard", "Preview"),
      ],
    };
    const regions = [region("eastus"), region("swedencentral")];
    const index = buildIndex(bundle, regions);

    const matrix = buildMatrix(index, { ...defaultFilters, sku: "GlobalStandard" });

    // rows: eastus, swedencentral; columns: m1, m2
    expect(matrix.cellStatus).toEqual([
      ["GenerallyAvailable", null],
      ["Preview", null],
    ]);
  });

  it("keeps cellStatus aligned with cells when axes are swapped", () => {
    const bundle: NormalizedBundle = {
      models: [model("m1")],
      availability: [avail("m1", "swedencentral", "GlobalStandard", "Preview")],
    };
    const regions = [region("eastus"), region("swedencentral")];
    const index = buildIndex(bundle, regions);

    const matrix = buildMatrix(index, { ...defaultFilters, swapView: true });

    // rows: m1; columns: eastus, swedencentral
    expect(matrix.cells).toEqual([[false, true]]);
    expect(matrix.cellStatus).toEqual([[null, "Preview"]]);
  });
});
