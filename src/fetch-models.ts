import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	CognitiveServicesManagementClient,
	type Model,
} from "@azure/arm-cognitiveservices";
import { DefaultAzureCredential } from "@azure/identity";

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

async function fetchModels(
	client: CognitiveServicesManagementClient,
	region: string,
): Promise<Model[]> {
	const models: Model[] = [];
	for await (const model of client.models.list(region)) {
		models.push(model);
	}
	return models;
}

async function main(): Promise<void> {
	const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
	if (!subscriptionId) {
		console.error("AZURE_SUBSCRIPTION_ID environment variable is required.");
		process.exit(1);
	}

	await mkdir(CACHE_DIR, { recursive: true });

	const client = new CognitiveServicesManagementClient(
		new DefaultAzureCredential(),
		subscriptionId,
	);

	const outcomes = await Promise.all(
		AZURE_REGIONS.map(async (region) => {
			console.log(`Fetching models for ${region}...`);
			try {
				const models = await fetchModels(client, region);
				await writeFile(
					resolve(CACHE_DIR, `${region}.json`),
					JSON.stringify(models, null, 2),
					"utf-8",
				);
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
