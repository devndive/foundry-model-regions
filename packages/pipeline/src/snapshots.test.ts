import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";
import { formatSnapshotKey, writeRegionSnapshot, latestSnapshotDir } from "./snapshots.js";
import { type Model } from "@azure/arm-cognitiveservices";

// Round-trip tests use opaque sentinel payloads; the Model shape is irrelevant
// to what they assert (that bytes are written and read back identically).
const sentinel = (value: unknown): Model[] => value as Model[];

test("formatSnapshotKey renders a UTC instant as a sortable, path-safe key", () => {
  const date = new Date("2026-05-29T13:45:07.123Z");
  assert.equal(formatSnapshotKey(date), "2026-05-29T13-45-07Z");
});

test("formatSnapshotKey keys sort chronologically as plain strings", () => {
  const earlier = formatSnapshotKey(new Date("2026-05-29T08:00:00Z"));
  const later = formatSnapshotKey(new Date("2026-05-29T16:30:00Z"));
  assert.ok(earlier < later);
});

test("writeRegionSnapshot stores a region's models under its snapshot key", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "snap-"));
  await writeRegionSnapshot(cacheDir, "2026-05-29T13-45-07Z", "westus", sentinel([{ id: 1 }]));

  const stored = JSON.parse(
    await readFile(resolve(cacheDir, "2026-05-29T13-45-07Z", "westus.json"), "utf-8"),
  );
  assert.deepEqual(stored, [{ id: 1 }]);
});

test("writing two snapshots retains both, each independently readable", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "snap-"));
  await writeRegionSnapshot(cacheDir, "2026-05-28T09-00-00Z", "westus", sentinel([{ day: 28 }]));
  await writeRegionSnapshot(cacheDir, "2026-05-29T09-00-00Z", "westus", sentinel([{ day: 29 }]));

  const earlier = JSON.parse(
    await readFile(resolve(cacheDir, "2026-05-28T09-00-00Z", "westus.json"), "utf-8"),
  );
  const later = JSON.parse(
    await readFile(resolve(cacheDir, "2026-05-29T09-00-00Z", "westus.json"), "utf-8"),
  );
  assert.deepEqual(earlier, [{ day: 28 }]);
  assert.deepEqual(later, [{ day: 29 }]);
});

test("re-writing the same snapshot key refreshes it without duplicating", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "snap-"));
  await writeRegionSnapshot(cacheDir, "2026-05-29T13-45-07Z", "westus", sentinel([{ v: "old" }]));
  await writeRegionSnapshot(cacheDir, "2026-05-29T13-45-07Z", "westus", sentinel([{ v: "new" }]));

  const stored = JSON.parse(
    await readFile(resolve(cacheDir, "2026-05-29T13-45-07Z", "westus.json"), "utf-8"),
  );
  assert.deepEqual(stored, [{ v: "new" }]);
});

test("latestSnapshotDir resolves the most recent snapshot directory", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "snap-"));
  await writeRegionSnapshot(cacheDir, "2026-05-28T09-00-00Z", "westus", sentinel([]));
  await writeRegionSnapshot(cacheDir, "2026-05-29T09-00-00Z", "westus", sentinel([]));
  await writeRegionSnapshot(cacheDir, "2026-05-27T09-00-00Z", "westus", sentinel([]));

  assert.equal(await latestSnapshotDir(cacheDir), resolve(cacheDir, "2026-05-29T09-00-00Z"));
});

test("multiple runs on the same day are retained as distinct snapshots", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "snap-"));
  await writeRegionSnapshot(cacheDir, "2026-05-29T08-00-00Z", "westus", sentinel([{ run: 1 }]));
  await writeRegionSnapshot(cacheDir, "2026-05-29T16-30-00Z", "westus", sentinel([{ run: 2 }]));

  const morning = JSON.parse(
    await readFile(resolve(cacheDir, "2026-05-29T08-00-00Z", "westus.json"), "utf-8"),
  );
  const afternoon = JSON.parse(
    await readFile(resolve(cacheDir, "2026-05-29T16-30-00Z", "westus.json"), "utf-8"),
  );
  assert.deepEqual(morning, [{ run: 1 }]);
  assert.deepEqual(afternoon, [{ run: 2 }]);
  assert.equal(await latestSnapshotDir(cacheDir), resolve(cacheDir, "2026-05-29T16-30-00Z"));
});

test("latestSnapshotDir returns null when no snapshots exist", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "snap-"));
  assert.equal(await latestSnapshotDir(cacheDir), null);
});

test("latestSnapshotDir ignores entries that are not snapshot keys", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "snap-"));
  await writeRegionSnapshot(cacheDir, "2026-05-29T09-00-00Z", "westus", sentinel([]));
  await writeFile(resolve(cacheDir, "README.txt"), "not a snapshot", "utf-8");
  await mkdir(resolve(cacheDir, "scratch"), { recursive: true });
  await mkdir(resolve(cacheDir, "2026-05-29"), { recursive: true });

  assert.equal(await latestSnapshotDir(cacheDir), resolve(cacheDir, "2026-05-29T09-00-00Z"));
});
