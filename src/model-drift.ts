import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { type Model } from "@azure/arm-cognitiveservices";
import {
  type AvailabilityFact,
  type NormalizedBundle,
  type NormalizedModel,
  normalizeModels,
  type RegionSnapshot,
} from "./normalize-models.js";
import { SNAPSHOT_KEY_PATTERN } from "./snapshots.js";

export type ModelDriftStatus = "new" | "unchanged" | "changed";

// The candidate (newest) and the latest committed (next-newest) snapshot dirs
// in a model cache. `previous` is null when no prior snapshot exists yet — the
// candidate is then a brand-new baseline.
export interface SnapshotPair {
  candidate: string | null;
  previous: string | null;
}

// Resolves the two newest snapshot directories under a model cache, newest
// first. fetch-models writes the candidate as the newest dir, so the latest
// committed snapshot is the one before it.
export async function twoLatestSnapshotDirs(cacheDir: string): Promise<SnapshotPair> {
  let entries;
  try {
    entries = await readdir(cacheDir, { withFileTypes: true });
  } catch {
    return { candidate: null, previous: null };
  }

  const keys = entries
    .filter((e) => e.isDirectory() && SNAPSHOT_KEY_PATTERN.test(e.name))
    .map((e) => e.name)
    .sort()
    .reverse();

  return {
    candidate: keys[0] ? resolve(cacheDir, keys[0]) : null,
    previous: keys[1] ? resolve(cacheDir, keys[1]) : null,
  };
}

// Reads a snapshot directory's per-region JSON files (the raw ARM Model[]
// payloads fetch-models wrote) and normalizes them into the canonical Model
// Availability Facts bundle — the same shape emit-models produces.
export async function readSnapshotBundle(snapshotDir: string): Promise<NormalizedBundle> {
  // Sort the region files so the merge order in normalizeModels is
  // deterministic: it keeps the first non-empty value for a model's
  // per-region metadata (capabilities, lifecycleStatus, createdAt, …), so an
  // unsorted readdir could canonicalize two identical datasets differently and
  // cry "changed" — the exact spurious-commit failure ADR-0004 set out to avoid.
  const files = (await readdir(snapshotDir)).filter((f) => f.endsWith(".json")).sort();
  const snapshots: RegionSnapshot[] = [];
  for (const file of files) {
    const region = file.replace(/\.json$/, "");
    const models: Model[] = JSON.parse(await readFile(resolve(snapshotDir, file), "utf-8"));
    snapshots.push({ region, models });
  }
  return normalizeModels(snapshots);
}

function modelKey(m: NormalizedModel): string {
  return m.id;
}

function factKey(f: AvailabilityFact): string {
  return [f.modelId, f.region, f.sku, f.deprecationDate ?? "", f.lifecycleStatus ?? ""].join(
    "\u0000",
  );
}

// A stable, order-insensitive serialization of the bundle. The ARM API can
// return models and SKUs in varying order, so we sort every collection (model
// rows, availability facts, and each model's capability flags) before
// serializing. Two bundles are semantically equal iff their canonical forms are.
export function canonicalizeBundle(bundle: NormalizedBundle): string {
  const models = [...bundle.models]
    .map((m) => ({ ...m, capabilities: [...m.capabilities].sort() }))
    .sort((a, b) => modelKey(a).localeCompare(modelKey(b)));
  const availability = [...bundle.availability].sort((a, b) =>
    factKey(a).localeCompare(factKey(b)),
  );
  return JSON.stringify({ models, availability });
}

// Decides whether a freshly-fetched bundle differs semantically from the latest
// committed one. A null previous means there is no prior snapshot to compare
// against, so the candidate is a brand-new baseline.
export function compareBundles(
  candidate: NormalizedBundle,
  previous: NormalizedBundle | null,
): ModelDriftStatus {
  if (previous === null) return "new";
  return canonicalizeBundle(candidate) === canonicalizeBundle(previous) ? "unchanged" : "changed";
}
