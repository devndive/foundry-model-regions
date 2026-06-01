import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { REGIONS } from "./region-metadata.js";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST_DIR = resolve(ROOT_DIR, "dist");

async function main(): Promise<void> {
	await mkdir(DIST_DIR, { recursive: true });
	const outPath = resolve(DIST_DIR, "regions.json");
	await writeFile(outPath, JSON.stringify(REGIONS, null, 2), "utf-8");
	console.log(`Wrote ${REGIONS.length} regions to dist/regions.json`);
}

main();
