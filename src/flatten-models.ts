import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = resolve(ROOT_DIR, "cache");
const DIST_DIR = resolve(ROOT_DIR, "dist");

interface RawSku {
  name: string;
  capacity?: {
    default?: number | null;
    maximum?: number | null;
    minimum?: number | null;
  } | null;
  deprecationDate?: string | null;
  rateLimits?: Array<{
    count: number;
    key: string;
    renewalPeriod: number;
  }> | null;
}

interface RawModel {
  kind: string;
  location: string;
  model: {
    name: string;
    version: string;
    format: string;
    isDefaultVersion: boolean;
    lifecycleStatus: string;
    maxCapacity: number | null;
    capabilities: Record<string, string> | null;
    deprecation: {
      deprecationStatus: string | null;
      fineTune: string | null;
      inference: string | null;
    } | null;
    skus: RawSku[] | null;
    systemData: {
      createdAt: string;
      lastModifiedAt: string;
    } | null;
  };
}

interface GroupedModel {
  modelName: string;
  modelVersion: string;
  format: string;
  lifecycleStatus: string;
  isDefaultVersion: boolean;
  capabilities: string[];
  deprecationStatus: string | null;
  inferenceDeprecationDate: string | null;
  fineTuneDeprecationDate: string | null;
  createdAt: string | null;
  locationSKUs: string[];
}

const DIRTY_SKU_PATTERN = /batch|globalstandard|globalprovisionedmanaged/i;

function getLocationSkuTags(raw: RawModel, region: string): string[] {
  const skus = raw.model.skus ?? [];
  return skus
    .filter((sku) => !DIRTY_SKU_PATTERN.test(sku.name))
    .map((sku) => `${region}-${sku.name.toLowerCase()}`);
}

async function main(): Promise<void> {
  const files = (await readdir(CACHE_DIR)).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    console.error("No cache files found. Run fetch-models first.");
    process.exit(1);
  }

  // Collect all entries tagged with their region
  const allEntries: { raw: RawModel; region: string }[] = [];

  for (const file of files) {
    const region = file.replace(".json", "");
    console.log(`Processing ${file}...`);

    const raw: RawModel[] = JSON.parse(
      await readFile(resolve(CACHE_DIR, file), "utf-8"),
    );

    for (const entry of raw) {
      allEntries.push({ raw: entry, region });
    }
  }

  // Sort by createdAt (matching the bash script's sort_by(.model.systemData.createdAt))
  allEntries.sort((a, b) =>
    (a.raw.model.systemData?.createdAt ?? "").localeCompare(
      b.raw.model.systemData?.createdAt ?? "",
    ),
  );

  // Group by model.name
  const groups = new Map<string, typeof allEntries>();
  for (const entry of allEntries) {
    const name = entry.raw.model.name;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name)!.push(entry);
  }

  const models: GroupedModel[] = [];

  for (const [, entries] of groups) {
    const first = entries[0].raw;
    const capabilities = Object.keys(first.model.capabilities ?? {}).filter(
      (k) => first.model.capabilities![k] === "true",
    );

    // Collect all region-sku tags across all regions for this model
    const tags = new Set<string>();
    for (const { raw, region } of entries) {
      for (const tag of getLocationSkuTags(raw, region)) {
        tags.add(tag);
      }
    }

    models.push({
      modelName: first.model.name,
      modelVersion: first.model.version,
      format: first.model.format,
      lifecycleStatus: first.model.lifecycleStatus,
      isDefaultVersion: first.model.isDefaultVersion,
      capabilities,
      deprecationStatus: first.model.deprecation?.deprecationStatus ?? null,
      inferenceDeprecationDate: first.model.deprecation?.inference ?? null,
      fineTuneDeprecationDate: first.model.deprecation?.fineTune ?? null,
      createdAt: first.model.systemData?.createdAt ?? null,
      locationSKUs: [...tags].sort(),
    });
  }

  models.sort((a, b) => a.modelName.localeCompare(b.modelName));

  await mkdir(DIST_DIR, { recursive: true });
  const outPath = resolve(DIST_DIR, "models.json");
  await writeFile(outPath, JSON.stringify(models, null, 2), "utf-8");

  console.log(`\nDone. ${models.length} models written to dist/models.json`);
  console.log(`  Source files: ${files.length}`);
  const allTags = models.flatMap((m) => m.locationSKUs);
  console.log(`  Total location-SKU tags: ${allTags.length}`);
  const regions = new Set(allTags.map((t) => t.split("-")[0]));
  console.log(`  Regions: ${regions.size}`);
}

main();
