import assert from "node:assert/strict";
import { test } from "node:test";
import { regionMetadata, REGIONS } from "./region-metadata.js";

test("regionMetadata describes an Asian region with its display name and group", () => {
	assert.deepEqual(regionMetadata("japaneast"), {
		id: "japaneast",
		displayName: "Japan East",
		geoGroup: "asia",
		euSovereign: false,
	});
});

test("regionMetadata flags an EU-member European region as EU-sovereign", () => {
	assert.deepEqual(regionMetadata("francecentral"), {
		id: "francecentral",
		displayName: "France Central",
		geoGroup: "europe",
		euSovereign: true,
	});
});

test("regionMetadata leaves a non-EU European region (UK) not EU-sovereign", () => {
	const uk = regionMetadata("uksouth");
	assert.equal(uk?.geoGroup, "europe");
	assert.equal(uk?.euSovereign, false);
});

test("regionMetadata leaves Switzerland and Norway European but not EU-sovereign", () => {
	for (const id of ["switzerlandnorth", "switzerlandwest", "norwayeast"]) {
		const meta = regionMetadata(id);
		assert.equal(meta?.geoGroup, "europe", `${id} geoGroup`);
		assert.equal(meta?.euSovereign, false, `${id} euSovereign`);
	}
});

test("regionMetadata describes an American region with a numeric display name", () => {
	assert.deepEqual(regionMetadata("eastus2"), {
		id: "eastus2",
		displayName: "East US 2",
		geoGroup: "americas",
		euSovereign: false,
	});
});

test("regionMetadata returns null for an unknown region", () => {
	assert.equal(regionMetadata("moonbase1"), null);
});

test("REGIONS is the full intended region set, partitioned across the three groups", () => {
	const byGroup = {
		europe: REGIONS.filter((r) => r.geoGroup === "europe"),
		americas: REGIONS.filter((r) => r.geoGroup === "americas"),
		asia: REGIONS.filter((r) => r.geoGroup === "asia"),
	};

	assert.equal(byGroup.europe.length, 13);
	assert.equal(byGroup.americas.length, 12);
	assert.equal(byGroup.asia.length, 13);
	assert.equal(REGIONS.length, 38);

	// No duplicate region ids across the table.
	assert.equal(new Set(REGIONS.map((r) => r.id)).size, REGIONS.length);
});

test("REGIONS entries are consistent with regionMetadata lookups", () => {
	for (const region of REGIONS) {
		assert.deepEqual(regionMetadata(region.id), region, region.id);
	}
});

test("exactly the eight EU member-state regions are flagged EU-sovereign", () => {
	const sovereign = REGIONS.filter((r) => r.euSovereign).map((r) => r.id).sort();
	assert.deepEqual(sovereign, [
		"francecentral",
		"germanywestcentral",
		"italynorth",
		"northeurope",
		"polandcentral",
		"spaincentral",
		"swedencentral",
		"westeurope",
	]);
	// Every EU-sovereign region is also in the europe geo group.
	assert.ok(REGIONS.filter((r) => r.euSovereign).every((r) => r.geoGroup === "europe"));
});
