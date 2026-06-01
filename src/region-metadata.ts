export type GeoGroup = "europe" | "americas" | "asia";

export interface RegionMetadata {
	id: string;
	displayName: string;
	geoGroup: GeoGroup;
	euSovereign: boolean;
}

// The single source of truth for region coverage, grouping and EU
// classification. Each row states the whole truth about one region.
//
// euSovereign marks EU member states only: UK, Switzerland and Norway are
// geographically European but deliberately not EU-sovereign, so the EU
// sovereign toggle distinguishes them.
export const REGIONS: readonly RegionMetadata[] = [
	{ id: "westeurope", displayName: "West Europe", geoGroup: "europe", euSovereign: true },
	{ id: "northeurope", displayName: "North Europe", geoGroup: "europe", euSovereign: true },
	{ id: "uksouth", displayName: "UK South", geoGroup: "europe", euSovereign: false },
	{ id: "francecentral", displayName: "France Central", geoGroup: "europe", euSovereign: true },
	{ id: "swedencentral", displayName: "Sweden Central", geoGroup: "europe", euSovereign: true },
	{ id: "switzerlandnorth", displayName: "Switzerland North", geoGroup: "europe", euSovereign: false },
	{ id: "switzerlandwest", displayName: "Switzerland West", geoGroup: "europe", euSovereign: false },
	{ id: "germanywestcentral", displayName: "Germany West Central", geoGroup: "europe", euSovereign: true },
	{ id: "norwayeast", displayName: "Norway East", geoGroup: "europe", euSovereign: false },
	{ id: "polandcentral", displayName: "Poland Central", geoGroup: "europe", euSovereign: true },
	{ id: "italynorth", displayName: "Italy North", geoGroup: "europe", euSovereign: true },
	{ id: "spaincentral", displayName: "Spain Central", geoGroup: "europe", euSovereign: true },
	{ id: "ukwest", displayName: "UK West", geoGroup: "europe", euSovereign: false },
	{ id: "brazilsouth", displayName: "Brazil South", geoGroup: "americas", euSovereign: false },
	{ id: "westus", displayName: "West US", geoGroup: "americas", euSovereign: false },
	{ id: "westus2", displayName: "West US 2", geoGroup: "americas", euSovereign: false },
	{ id: "westcentralus", displayName: "West Central US", geoGroup: "americas", euSovereign: false },
	{ id: "southcentralus", displayName: "South Central US", geoGroup: "americas", euSovereign: false },
	{ id: "eastus", displayName: "East US", geoGroup: "americas", euSovereign: false },
	{ id: "eastus2", displayName: "East US 2", geoGroup: "americas", euSovereign: false },
	{ id: "canadacentral", displayName: "Canada Central", geoGroup: "americas", euSovereign: false },
	{ id: "northcentralus", displayName: "North Central US", geoGroup: "americas", euSovereign: false },
	{ id: "centralus", displayName: "Central US", geoGroup: "americas", euSovereign: false },
	{ id: "westus3", displayName: "West US 3", geoGroup: "americas", euSovereign: false },
	{ id: "canadaeast", displayName: "Canada East", geoGroup: "americas", euSovereign: false },
	{ id: "australiaeast", displayName: "Australia East", geoGroup: "asia", euSovereign: false },
	{ id: "southeastasia", displayName: "Southeast Asia", geoGroup: "asia", euSovereign: false },
	{ id: "eastasia", displayName: "East Asia", geoGroup: "asia", euSovereign: false },
	{ id: "japaneast", displayName: "Japan East", geoGroup: "asia", euSovereign: false },
	{ id: "centralindia", displayName: "Central India", geoGroup: "asia", euSovereign: false },
	{ id: "japanwest", displayName: "Japan West", geoGroup: "asia", euSovereign: false },
	{ id: "koreacentral", displayName: "Korea Central", geoGroup: "asia", euSovereign: false },
	{ id: "southafricanorth", displayName: "South Africa North", geoGroup: "asia", euSovereign: false },
	{ id: "uaenorth", displayName: "UAE North", geoGroup: "asia", euSovereign: false },
	{ id: "jioindiawest", displayName: "Jio India West", geoGroup: "asia", euSovereign: false },
	{ id: "qatarcentral", displayName: "Qatar Central", geoGroup: "asia", euSovereign: false },
	{ id: "southindia", displayName: "South India", geoGroup: "asia", euSovereign: false },
	{ id: "jioindiacentral", displayName: "Jio India Central", geoGroup: "asia", euSovereign: false },
];

const REGION_BY_ID: ReadonlyMap<string, RegionMetadata> = new Map(
	REGIONS.map((region) => [region.id, region]),
);

export function regionMetadata(id: string): RegionMetadata | null {
	return REGION_BY_ID.get(id) ?? null;
}

