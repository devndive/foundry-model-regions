import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { SNAPSHOT_KEY_PATTERN } from "./snapshots.js";

// Mirrors the model-cache convention (snapshots.ts) but stores a feature's
// article section as text under cache/features/<timestamp>/<featureId>.txt. A
// snapshot is written only when the section changed, so a new directory here
// literally means "drift happened."

export async function writeFeatureSnapshot(
  featuresCacheDir: string,
  snapshotKey: string,
  featureId: string,
  text: string,
): Promise<void> {
  const dir = resolve(featuresCacheDir, snapshotKey);
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, `${featureId}.txt`), text, "utf-8");
}

// Returns the most recent stored snapshot text for a feature, scanning the
// dated directories newest-first. Features drift independently, so the latest
// snapshot for one feature may live in an older directory than another's.
export async function readLatestFeatureSnapshot(
  featuresCacheDir: string,
  featureId: string,
): Promise<string | null> {
  let entries;
  try {
    entries = await readdir(featuresCacheDir, { withFileTypes: true });
  } catch {
    return null;
  }

  const keys = entries
    .filter((e) => e.isDirectory() && SNAPSHOT_KEY_PATTERN.test(e.name))
    .map((e) => e.name)
    .sort()
    .reverse();

  for (const key of keys) {
    try {
      return await readFile(resolve(featuresCacheDir, key, `${featureId}.txt`), "utf-8");
    } catch {
      continue;
    }
  }
  return null;
}
