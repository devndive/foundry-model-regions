import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { SNAPSHOT_KEY_PATTERN } from "./snapshots.js";

// Mirrors the model-cache convention (snapshots.ts) but stores a Watched
// Source's article section as text under cache/sources/<timestamp>/<key>.txt.
// A snapshot is written only when the section changed, so a new directory here
// literally means "drift happened."
//
// One file per section, not per Feature: several Features are curated from the
// same section, and snapshotting each of them wrote N byte-identical files.

export async function writeWatchedSourceSnapshot(
  sourcesCacheDir: string,
  snapshotKey: string,
  sourceKey: string,
  text: string,
): Promise<void> {
  const dir = resolve(sourcesCacheDir, snapshotKey);
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, `${sourceKey}.txt`), text, "utf-8");
}

// Returns the most recent stored snapshot text for a Watched Source, scanning
// the dated directories newest-first. Sections drift independently, so the
// latest snapshot for one may live in an older directory than another's.
//
// `legacyFeatureIds` names the Features curated from this section. Snapshots
// committed before drift was deduped are filed under `<featureId>.txt`, and
// each of those files holds this very section's text, so any of them is a valid
// baseline. Without the fallback, the first deduped run would report a fresh
// baseline for every section instead of the truth: nothing changed.
export async function readLatestWatchedSourceSnapshot(
  sourcesCacheDir: string,
  sourceKey: string,
  legacyFeatureIds: readonly string[] = [],
): Promise<string | null> {
  let entries;
  try {
    entries = await readdir(sourcesCacheDir, { withFileTypes: true });
  } catch {
    return null;
  }

  const keys = entries
    .filter((e) => e.isDirectory() && SNAPSHOT_KEY_PATTERN.test(e.name))
    .map((e) => e.name)
    .sort()
    .reverse();

  for (const key of keys) {
    for (const name of [sourceKey, ...legacyFeatureIds]) {
      try {
        return await readFile(resolve(sourcesCacheDir, key, `${name}.txt`), "utf-8");
      } catch {
        continue;
      }
    }
  }
  return null;
}
