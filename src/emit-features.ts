import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildFeaturesArtifact } from "./feature-metadata.js";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST_DIR = resolve(ROOT_DIR, "dist");

async function main(): Promise<void> {
  await mkdir(DIST_DIR, { recursive: true });
  const artifact = buildFeaturesArtifact();
  const outPath = resolve(DIST_DIR, "features.json");
  await writeFile(outPath, JSON.stringify(artifact, null, 2), "utf-8");
  console.log(
    `Wrote ${artifact.features.length} features and ${artifact.availability.length} availability rows to dist/features.json`,
  );
}

main();
