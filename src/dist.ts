import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const DIST_DIR = resolve(ROOT_DIR, "dist");

// Single place that knows how the dist artifacts are serialized: pretty-printed
// JSON under dist/, with a one-line summary. Every emit-* script writes here.
export async function writeArtifact(name: string, data: unknown, summary: string): Promise<void> {
  await mkdir(DIST_DIR, { recursive: true });
  await writeFile(resolve(DIST_DIR, name), JSON.stringify(data, null, 2), "utf-8");
  console.log(summary);
}
