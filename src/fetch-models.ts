import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	CognitiveServicesManagementClient,
	type Model,
} from "@azure/arm-cognitiveservices";
import { DefaultAzureCredential } from "@azure/identity";
import { formatSnapshotKey, writeRegionSnapshot } from "./snapshots.js";
import { REGIONS } from "./region-metadata.js";

// Single source of truth for which regions to fetch: the region metadata table.
const AZURE_REGIONS = REGIONS.map((r) => r.id);

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = resolve(ROOT_DIR, "cache");


async function fetchModels(
	client: CognitiveServicesManagementClient,
	region: string,
): Promise<Model[]> {
	return Array.fromAsync(client.models.list(region));
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

	const snapshotKey = formatSnapshotKey(new Date());

	const outcomes = await Promise.all(
		AZURE_REGIONS.map(async (region) => {
			console.log(`Fetching models for ${region}...`);
			try {
				const models = await fetchModels(client, region);
				await writeRegionSnapshot(CACHE_DIR, snapshotKey, region, models);
				console.log(`  ✓ Saved to cache/${snapshotKey}/${region}.json`);
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
