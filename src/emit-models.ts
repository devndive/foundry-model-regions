import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type Model } from "@azure/arm-cognitiveservices";
import { latestSnapshotDir } from "./snapshots.js";
import { normalizeModels, type RegionSnapshot } from "./normalize-models.js";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = resolve(ROOT_DIR, "cache");
const DIST_DIR = resolve(ROOT_DIR, "dist");

async function main(): Promise<void> {
  const snapshotDir = await latestSnapshotDir(CACHE_DIR);

  if (!snapshotDir) {
    console.error("No cache snapshots found. Run fetch-models first.");
    process.exit(1);
  }

  const files = (await readdir(snapshotDir)).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    console.error("No cache files found. Run fetch-models first.");
    process.exit(1);
  }

  const snapshots: RegionSnapshot[] = [];
  for (const file of files) {
    const region = file.replace(".json", "");
    console.log(`Processing ${file}...`);
    const models: Model[] = JSON.parse(await readFile(resolve(snapshotDir, file), "utf-8"));
    snapshots.push({ region, models });
  }

  const bundle = normalizeModels(snapshots);

  await mkdir(DIST_DIR, { recursive: true });
  const outPath = resolve(DIST_DIR, "models.json");
  await writeFile(outPath, JSON.stringify(bundle, null, 2), "utf-8");

  console.log(`\nDone. Normalized bundle written to dist/models.json`);
  console.log(`  Source files: ${files.length}`);
  console.log(`  Models: ${bundle.models.length}`);
  console.log(`  Availability rows: ${bundle.availability.length}`);
  const regions = new Set(bundle.availability.map((a) => a.region));
  console.log(`  Regions with availability: ${regions.size}`);
}

main();
