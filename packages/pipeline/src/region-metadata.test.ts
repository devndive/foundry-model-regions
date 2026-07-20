import assert from "node:assert/strict";
import { test } from "node:test";
import { regionMetadata, REGIONS } from "./region-metadata.js";

test("regionMetadata describes an Asia Pacific region with its display name and group", () => {
  assert.deepEqual(regionMetadata("japaneast"), {
    id: "japaneast",
    displayName: "Japan East",
    geoGroup: "asia-pacific",
  });
});

test("regionMetadata groups a European region under europe", () => {
  assert.deepEqual(regionMetadata("francecentral"), {
    id: "francecentral",
    displayName: "France Central",
    geoGroup: "europe",
  });
});

test("regionMetadata groups Middle East and Africa regions per the Microsoft list", () => {
  assert.equal(regionMetadata("uaenorth")?.geoGroup, "middle-east");
  assert.equal(regionMetadata("qatarcentral")?.geoGroup, "middle-east");
  assert.equal(regionMetadata("southafricanorth")?.geoGroup, "africa");
});

test("regionMetadata describes an American region with a numeric display name", () => {
  assert.deepEqual(regionMetadata("eastus2"), {
    id: "eastus2",
    displayName: "East US 2",
    geoGroup: "americas",
  });
});

test("regionMetadata returns null for an unknown region", () => {
  assert.equal(regionMetadata("moonbase1"), null);
});

test("regionMetadata omits regions absent from the Microsoft regions list", () => {
  assert.equal(regionMetadata("jioindiawest"), null);
  assert.equal(regionMetadata("jioindiacentral"), null);
});

test("regionMetadata omits restricted-access regions", () => {
  assert.equal(regionMetadata("switzerlandwest"), null);
});

test("REGIONS is the full intended region set, partitioned across the geography groups", () => {
  const byGroup = {
    americas: REGIONS.filter((r) => r.geoGroup === "americas"),
    europe: REGIONS.filter((r) => r.geoGroup === "europe"),
    "middle-east": REGIONS.filter((r) => r.geoGroup === "middle-east"),
    africa: REGIONS.filter((r) => r.geoGroup === "africa"),
    "asia-pacific": REGIONS.filter((r) => r.geoGroup === "asia-pacific"),
  };

  assert.equal(byGroup.americas.length, 12);
  assert.equal(byGroup.europe.length, 12);
  assert.equal(byGroup["middle-east"].length, 2);
  assert.equal(byGroup.africa.length, 1);
  assert.equal(byGroup["asia-pacific"].length, 8);
  assert.equal(REGIONS.length, 35);

  // The groups partition REGIONS: every region lands in exactly one group.
  const grouped = Object.values(byGroup).reduce((sum, group) => sum + group.length, 0);
  assert.equal(grouped, REGIONS.length);

  // No duplicate region ids across the table.
  assert.equal(new Set(REGIONS.map((r) => r.id)).size, REGIONS.length);
});

test("REGIONS entries are consistent with regionMetadata lookups", () => {
  for (const region of REGIONS) {
    assert.deepEqual(regionMetadata(region.id), region, region.id);
  }
});
