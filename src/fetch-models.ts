import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const AZURE_REGIONS_EU = [
	"austriaeast",
	"belgiumcentral",
	"denmarkeast",
	"francecentral",
	"francesouth",
	"germanynorth",
	"germanywestcentral",
	"italynorth",
	"northeurope",
	"norwayeast",
	"norwaywest",
	"polandcentral",
	"spaincentral",
	"swedencentral",
	"switzerlandnorth",
	"switzerlandwest",
	"uksouth",
	"ukwest",
	"westeurope",
];

const AZURE_REGIONS = [
	"westus", "westus2", "westcentralus", "southcentralus", "eastus", "eastus2", "northcentralus", "centralus", "westus3"
];

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = resolve(ROOT_DIR, "cache");

function fetchModels(region: string): Promise<string> {
	return new Promise((resolve, reject) => {
		execFile(
			"az",
			["cognitiveservices", "model", "list", "--location", region],
			{ maxBuffer: 50 * 1024 * 1024 },
			(error: Error | null, stdout: string, stderr: string) => {
				if (error) {
					reject(new Error(`az CLI failed for ${region}: ${stderr || error.message}`));
				} else {
					resolve(stdout);
				}
			},
		);
	});
}

async function main(): Promise<void> {
	await mkdir(CACHE_DIR, { recursive: true });

	const outcomes = await Promise.all(
		AZURE_REGIONS.map(async (region) => {
			console.log(`Fetching models for ${region}...`);
			try {
				const json = await fetchModels(region);
				await writeFile(resolve(CACHE_DIR, `${region}.json`), json, "utf-8");
				console.log(`  ✓ Saved to cache/${region}.json`);
				return { region, ok: true as const };
			} catch (err) {
				console.error(`  ✗ Failed to fetch models for ${region}:`, (err as Error).message);
				return { region, ok: false as const };
			}
		}),
	);

	const failedRegions = outcomes.filter((o) => !o.ok).map((o) => o.region);

	console.log(`\nDone. ${AZURE_REGIONS.length} regions processed.`);

	if (failedRegions.length > 0) {
		console.error(`Failed regions (${failedRegions.length}): ${failedRegions.join(", ")}`);
		process.exit(1);
	}
}

main();
