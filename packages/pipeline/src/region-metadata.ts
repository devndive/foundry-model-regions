import type { Region } from "@foundry/data-types";

// The single source of truth for region coverage and grouping. Each row states
// the whole truth about one region. Regions are grouped by geography exactly as
// the Microsoft reliability regions list groups them.
//
// A region belongs here only if any customer can deploy into it without
// requesting special access. Everything else — access-by-request, not yet
// launched, absent from the Microsoft regions list — stays out indefinitely;
// that is a decision, not a backlog. Switzerland West is access-by-request and
// is excluded on that basis, even though several curated feature articles list
// it: a feature article is evidence about a feature, not about region access.
// See docs/adr/0005-track-only-self-serve-regions.md.
export const REGIONS: readonly Region[] = [
  { id: "brazilsouth", displayName: "Brazil South", geoGroup: "americas" },
  { id: "canadacentral", displayName: "Canada Central", geoGroup: "americas" },
  { id: "canadaeast", displayName: "Canada East", geoGroup: "americas" },
  { id: "centralus", displayName: "Central US", geoGroup: "americas" },
  { id: "eastus", displayName: "East US", geoGroup: "americas" },
  { id: "eastus2", displayName: "East US 2", geoGroup: "americas" },
  { id: "northcentralus", displayName: "North Central US", geoGroup: "americas" },
  { id: "southcentralus", displayName: "South Central US", geoGroup: "americas" },
  { id: "westcentralus", displayName: "West Central US", geoGroup: "americas" },
  { id: "westus", displayName: "West US", geoGroup: "americas" },
  { id: "westus2", displayName: "West US 2", geoGroup: "americas" },
  { id: "westus3", displayName: "West US 3", geoGroup: "americas" },
  { id: "francecentral", displayName: "France Central", geoGroup: "europe" },
  { id: "germanywestcentral", displayName: "Germany West Central", geoGroup: "europe" },
  { id: "italynorth", displayName: "Italy North", geoGroup: "europe" },
  { id: "northeurope", displayName: "North Europe", geoGroup: "europe" },
  { id: "norwayeast", displayName: "Norway East", geoGroup: "europe" },
  { id: "polandcentral", displayName: "Poland Central", geoGroup: "europe" },
  { id: "spaincentral", displayName: "Spain Central", geoGroup: "europe" },
  { id: "swedencentral", displayName: "Sweden Central", geoGroup: "europe" },
  { id: "switzerlandnorth", displayName: "Switzerland North", geoGroup: "europe" },
  { id: "uksouth", displayName: "UK South", geoGroup: "europe" },
  { id: "ukwest", displayName: "UK West", geoGroup: "europe" },
  { id: "westeurope", displayName: "West Europe", geoGroup: "europe" },
  { id: "qatarcentral", displayName: "Qatar Central", geoGroup: "middle-east" },
  { id: "uaenorth", displayName: "UAE North", geoGroup: "middle-east" },
  { id: "southafricanorth", displayName: "South Africa North", geoGroup: "africa" },
  { id: "australiaeast", displayName: "Australia East", geoGroup: "asia-pacific" },
  { id: "centralindia", displayName: "Central India", geoGroup: "asia-pacific" },
  { id: "eastasia", displayName: "East Asia", geoGroup: "asia-pacific" },
  { id: "japaneast", displayName: "Japan East", geoGroup: "asia-pacific" },
  { id: "japanwest", displayName: "Japan West", geoGroup: "asia-pacific" },
  { id: "koreacentral", displayName: "Korea Central", geoGroup: "asia-pacific" },
  { id: "southeastasia", displayName: "Southeast Asia", geoGroup: "asia-pacific" },
  { id: "southindia", displayName: "South India", geoGroup: "asia-pacific" },
];

const REGION_BY_ID: ReadonlyMap<string, Region> = new Map(
  REGIONS.map((region) => [region.id, region]),
);

export function regionMetadata(id: string): Region | null {
  return REGION_BY_ID.get(id) ?? null;
}
