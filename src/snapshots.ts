import { mkdir, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { type Model } from "@azure/arm-cognitiveservices";

// The canonical snapshot-key grammar, shared by every cache that keys dated
// directories off `formatSnapshotKey` (model cache here, feature cache in
// feature-snapshots.ts). One owner so readers can't disagree on the format.
export const SNAPSHOT_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z$/;

export function formatSnapshotKey(date: Date): string {
  return date.toISOString().slice(0, 19).replace(/:/g, "-") + "Z";
}

export async function writeRegionSnapshot(
  cacheDir: string,
  snapshotKey: string,
  region: string,
  models: Model[],
): Promise<void> {
  const dir = resolve(cacheDir, snapshotKey);
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, `${region}.json`), JSON.stringify(models, null, 2), "utf-8");
}

export async function latestSnapshotDir(cacheDir: string): Promise<string | null> {
  const entries = await readdir(cacheDir, { withFileTypes: true });
  const keys = entries
    .filter((e) => e.isDirectory() && SNAPSHOT_KEY_PATTERN.test(e.name))
    .map((e) => e.name)
    .sort();

  const latest = keys.at(-1);
  return latest ? resolve(cacheDir, latest) : null;
}
