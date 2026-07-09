import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";
import { type Model } from "@azure/arm-cognitiveservices";
import { compareBundles, readSnapshotBundle, twoLatestSnapshotDirs } from "./model-drift.js";

// Writes a snapshot dir on disk the way fetch-models would: one JSON file per
// region holding that region's raw ARM Model[] payload.
async function writeSnapshotDir(regions: Record<string, Model[]>): Promise<string> {
  const dir = await mkdtemp(resolve(tmpdir(), "model-drift-"));
  for (const [region, models] of Object.entries(regions)) {
    await writeFile(resolve(dir, `${region}.json`), JSON.stringify(models, null, 2), "utf-8");
  }
  return dir;
}

function model(name: string, skus: string[]): Model {
  return {
    model: {
      format: "OpenAI",
      name,
      version: "2024-11-20",
      skus: skus.map((s) => ({ name: s })),
    },
  } as Model;
}

test("reordered models and SKUs in the raw payload register as unchanged", async () => {
  const candidateDir = await writeSnapshotDir({
    westus: [model("gpt-4o", ["GlobalStandard", "Standard"]), model("o1", ["GlobalStandard"])],
  });
  const previousDir = await writeSnapshotDir({
    westus: [model("o1", ["GlobalStandard"]), model("gpt-4o", ["Standard", "GlobalStandard"])],
  });

  const candidate = await readSnapshotBundle(candidateDir);
  const previous = await readSnapshotBundle(previousDir);

  assert.equal(compareBundles(candidate, previous), "unchanged");
});

test("a Model Availability Fact present in only one snapshot registers as changed", async () => {
  const candidateDir = await writeSnapshotDir({
    westus: [model("gpt-4o", ["GlobalStandard", "Standard"])],
  });
  const previousDir = await writeSnapshotDir({
    westus: [model("gpt-4o", ["GlobalStandard"])],
  });

  const candidate = await readSnapshotBundle(candidateDir);
  const previous = await readSnapshotBundle(previousDir);

  assert.equal(compareBundles(candidate, previous), "changed");
  assert.equal(compareBundles(previous, candidate), "changed");
});

test("no prior snapshot makes the candidate a new baseline", async () => {
  const candidateDir = await writeSnapshotDir({
    westus: [model("gpt-4o", ["GlobalStandard"])],
  });
  const candidate = await readSnapshotBundle(candidateDir);

  assert.equal(compareBundles(candidate, null), "new");
});

test("twoLatestSnapshotDirs picks the newest as candidate and the next as previous", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "model-cache-"));
  for (const key of ["2026-06-08T09-00-00Z", "2026-06-09T09-00-00Z", "2026-06-10T09-00-00Z"]) {
    await mkdir(resolve(cacheDir, key), { recursive: true });
  }

  const { candidate, previous } = await twoLatestSnapshotDirs(cacheDir);
  assert.equal(candidate, resolve(cacheDir, "2026-06-10T09-00-00Z"));
  assert.equal(previous, resolve(cacheDir, "2026-06-09T09-00-00Z"));
});

test("twoLatestSnapshotDirs reports a null previous when only one snapshot exists", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "model-cache-"));
  await mkdir(resolve(cacheDir, "2026-06-10T09-00-00Z"), { recursive: true });

  const { candidate, previous } = await twoLatestSnapshotDirs(cacheDir);
  assert.equal(candidate, resolve(cacheDir, "2026-06-10T09-00-00Z"));
  assert.equal(previous, null);
});
