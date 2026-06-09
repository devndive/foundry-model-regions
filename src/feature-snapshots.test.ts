import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";
import { readLatestFeatureSnapshot, writeFeatureSnapshot } from "./feature-snapshots.js";

test("readLatestFeatureSnapshot returns null when nothing has been snapshotted", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "feat-snap-"));
  assert.equal(await readLatestFeatureSnapshot(cacheDir, "hosted-agents"), null);
});

test("writeFeatureSnapshot stores a feature's section text under its snapshot key", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "feat-snap-"));
  await writeFeatureSnapshot(cacheDir, "2026-05-29T13-45-07Z", "hosted-agents", "regions: westus");

  assert.equal(await readLatestFeatureSnapshot(cacheDir, "hosted-agents"), "regions: westus");
});

test("readLatestFeatureSnapshot returns the most recent snapshot for a feature", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "feat-snap-"));
  await writeFeatureSnapshot(cacheDir, "2026-05-28T09-00-00Z", "hosted-agents", "old");
  await writeFeatureSnapshot(cacheDir, "2026-05-30T09-00-00Z", "hosted-agents", "new");
  await writeFeatureSnapshot(cacheDir, "2026-05-29T09-00-00Z", "hosted-agents", "middle");

  assert.equal(await readLatestFeatureSnapshot(cacheDir, "hosted-agents"), "new");
});

test("features drift independently: latest snapshot may live in an older directory", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "feat-snap-"));
  // foundry-agents only ever drifted once, in an early directory; hosted-agents
  // drifted again later. Each feature resolves to its own newest snapshot.
  await writeFeatureSnapshot(cacheDir, "2026-05-28T09-00-00Z", "foundry-agents", "fa-only");
  await writeFeatureSnapshot(cacheDir, "2026-05-28T09-00-00Z", "hosted-agents", "ha-old");
  await writeFeatureSnapshot(cacheDir, "2026-05-30T09-00-00Z", "hosted-agents", "ha-new");

  assert.equal(await readLatestFeatureSnapshot(cacheDir, "foundry-agents"), "fa-only");
  assert.equal(await readLatestFeatureSnapshot(cacheDir, "hosted-agents"), "ha-new");
});

test("readLatestFeatureSnapshot ignores directories without this feature's file", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "feat-snap-"));
  await writeFeatureSnapshot(cacheDir, "2026-05-28T09-00-00Z", "hosted-agents", "present");
  await writeFeatureSnapshot(cacheDir, "2026-05-30T09-00-00Z", "foundry-agents", "other");

  // The newest directory only holds foundry-agents; hosted-agents must fall back.
  assert.equal(await readLatestFeatureSnapshot(cacheDir, "hosted-agents"), "present");
});

test("re-writing the same snapshot key refreshes the text without duplicating", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "feat-snap-"));
  await writeFeatureSnapshot(cacheDir, "2026-05-29T13-45-07Z", "hosted-agents", "old");
  await writeFeatureSnapshot(cacheDir, "2026-05-29T13-45-07Z", "hosted-agents", "new");

  assert.equal(await readLatestFeatureSnapshot(cacheDir, "hosted-agents"), "new");
});
