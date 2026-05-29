import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type Model } from "@azure/arm-cognitiveservices";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = resolve(ROOT_DIR, "cache");
const DIST_DIR = resolve(ROOT_DIR, "dist");

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

function getLocationSkuTags(raw: Model, region: string): string[] {
  const skus = raw.model?.skus ?? [];
  return skus.flatMap((sku) => {
    if (!sku.name || DIRTY_SKU_PATTERN.test(sku.name)) return [];
    return [`${region}-${sku.name.toLowerCase()}`];
  });
}

async function main(): Promise<void> {
  const files = (await readdir(CACHE_DIR)).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    console.error("No cache files found. Run fetch-models first.");
    process.exit(1);
  }

  // Collect all entries tagged with their region
  const allEntries: { raw: Model; region: string }[] = [];

  for (const file of files) {
    const region = file.replace(".json", "");
    console.log(`Processing ${file}...`);

    const raw: Model[] = JSON.parse(
      await readFile(resolve(CACHE_DIR, file), "utf-8"),
    );

    for (const entry of raw) {
      allEntries.push({ raw: entry, region });
    }
  }

  // Sort by createdAt (matching the bash script's sort_by(.model.systemData.createdAt))
  allEntries.sort((a, b) =>
    String(a.raw.model?.systemData?.createdAt ?? "").localeCompare(
      String(b.raw.model?.systemData?.createdAt ?? ""),
    ),
  );

  // Group by model.name
  const groups = new Map<string, typeof allEntries>();
  for (const entry of allEntries) {
    const name = entry.raw.model?.name;
    if (!name) continue;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name)!.push(entry);
  }

  const models: GroupedModel[] = [];

  for (const [name, entries] of groups) {
    const model = entries[0].raw.model;
    if (!model) continue;
    const capabilities = Object.entries(model.capabilities ?? {})
      .filter(([, value]) => value === "true")
      .map(([key]) => key);

    // Collect all region-sku tags across all regions for this model
    const tags = new Set<string>();
    for (const { raw, region } of entries) {
      for (const tag of getLocationSkuTags(raw, region)) {
        tags.add(tag);
      }
    }

    models.push({
      modelName: name,
      modelVersion: model.version ?? "",
      format: model.format ?? "",
      lifecycleStatus: model.lifecycleStatus ?? "",
      isDefaultVersion: model.isDefaultVersion ?? false,
      capabilities,
      deprecationStatus: model.deprecation?.deprecationStatus ?? null,
      inferenceDeprecationDate: model.deprecation?.inference ?? null,
      fineTuneDeprecationDate: model.deprecation?.fineTune ?? null,
      createdAt: model.systemData?.createdAt
        ? String(model.systemData.createdAt)
        : null,
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
