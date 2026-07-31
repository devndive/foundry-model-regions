import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";
import {
  readLatestWatchedSourceSnapshot,
  writeWatchedSourceSnapshot,
} from "./watched-source-snapshots.js";

const HOSTED_AGENTS = "azure-foundry-agents-concepts-hosted-agents--region-availability";
const AGENT_LIMITS = "azure-foundry-agents-concepts-limits-quotas-regions--supported-regions";

test("readLatestWatchedSourceSnapshot returns null when nothing has been snapshotted", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "feat-snap-"));
  assert.equal(await readLatestWatchedSourceSnapshot(cacheDir, HOSTED_AGENTS), null);
});

test("writeWatchedSourceSnapshot stores a section's text under its snapshot key", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "feat-snap-"));
  await writeWatchedSourceSnapshot(
    cacheDir,
    "2026-05-29T13-45-07Z",
    HOSTED_AGENTS,
    "regions: westus",
  );

  assert.equal(await readLatestWatchedSourceSnapshot(cacheDir, HOSTED_AGENTS), "regions: westus");
});

test("readLatestWatchedSourceSnapshot returns the most recent snapshot for a section", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "feat-snap-"));
  await writeWatchedSourceSnapshot(cacheDir, "2026-05-28T09-00-00Z", HOSTED_AGENTS, "old");
  await writeWatchedSourceSnapshot(cacheDir, "2026-05-30T09-00-00Z", HOSTED_AGENTS, "new");
  await writeWatchedSourceSnapshot(cacheDir, "2026-05-29T09-00-00Z", HOSTED_AGENTS, "middle");

  assert.equal(await readLatestWatchedSourceSnapshot(cacheDir, HOSTED_AGENTS), "new");
});

test("sections drift independently: latest snapshot may live in an older directory", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "feat-snap-"));
  // The Agent limits section only ever drifted once, in an early directory;
  // Hosted Agents drifted again later. Each section resolves to its own newest.
  await writeWatchedSourceSnapshot(cacheDir, "2026-05-28T09-00-00Z", AGENT_LIMITS, "limits-only");
  await writeWatchedSourceSnapshot(cacheDir, "2026-05-28T09-00-00Z", HOSTED_AGENTS, "ha-old");
  await writeWatchedSourceSnapshot(cacheDir, "2026-05-30T09-00-00Z", HOSTED_AGENTS, "ha-new");

  assert.equal(await readLatestWatchedSourceSnapshot(cacheDir, AGENT_LIMITS), "limits-only");
  assert.equal(await readLatestWatchedSourceSnapshot(cacheDir, HOSTED_AGENTS), "ha-new");
});

test("readLatestWatchedSourceSnapshot ignores directories without this section's file", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "feat-snap-"));
  await writeWatchedSourceSnapshot(cacheDir, "2026-05-28T09-00-00Z", HOSTED_AGENTS, "present");
  await writeWatchedSourceSnapshot(cacheDir, "2026-05-30T09-00-00Z", AGENT_LIMITS, "other");

  // The newest directory only holds the Agent limits section; Hosted Agents
  // must fall back to the older one.
  assert.equal(await readLatestWatchedSourceSnapshot(cacheDir, HOSTED_AGENTS), "present");
});

test("re-writing the same snapshot key refreshes the text without duplicating", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "feat-snap-"));
  await writeWatchedSourceSnapshot(cacheDir, "2026-05-29T13-45-07Z", HOSTED_AGENTS, "old");
  await writeWatchedSourceSnapshot(cacheDir, "2026-05-29T13-45-07Z", HOSTED_AGENTS, "new");

  assert.equal(await readLatestWatchedSourceSnapshot(cacheDir, HOSTED_AGENTS), "new");
});

test("a legacy per-Feature snapshot serves as the baseline for its section", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "feat-snap-"));
  // Committed before drift was deduped: one byte-identical file per Feature.
  await writeWatchedSourceSnapshot(
    cacheDir,
    "2026-05-28T09-00-00Z",
    "content-safety-text",
    "table",
  );
  await writeWatchedSourceSnapshot(
    cacheDir,
    "2026-05-28T09-00-00Z",
    "content-safety-image",
    "table",
  );

  assert.equal(
    await readLatestWatchedSourceSnapshot(
      cacheDir,
      "azure-ai-services-content-safety-overview--region-availability",
      ["content-safety-text", "content-safety-image"],
    ),
    "table",
  );
});

test("a section snapshot wins over a legacy per-Feature file in the same directory", async () => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "feat-snap-"));
  await writeWatchedSourceSnapshot(cacheDir, "2026-05-28T09-00-00Z", "hosted-agents", "legacy");
  await writeWatchedSourceSnapshot(cacheDir, "2026-05-30T09-00-00Z", HOSTED_AGENTS, "current");

  assert.equal(
    await readLatestWatchedSourceSnapshot(cacheDir, HOSTED_AGENTS, ["hosted-agents"]),
    "current",
  );
});
