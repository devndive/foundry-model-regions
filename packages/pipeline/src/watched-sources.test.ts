import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { Feature } from "@foundry/data-types";
import { FEATURES } from "./feature-metadata.js";
import { readLatestWatchedSourceSnapshot } from "./watched-source-snapshots.js";
import {
  groupIntoWatchedSources,
  REGIONS_LIST_SOURCE,
  REGIONS_LIST_URL,
} from "./watched-sources.js";

const AGENTS_URL = "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents";

function feature(id: string, sectionAnchor: string, sourceUrl = AGENTS_URL): Feature {
  return { id, displayName: id, group: "hosted-agents", sourceUrl, sectionAnchor, regions: [] };
}

test("Features sharing a URL and anchor collapse into one Watched Source", () => {
  const sources = groupIntoWatchedSources([
    feature("hosted-agents", "region-availability"),
    feature("hosted-agents-responses", "region-availability"),
  ]);

  assert.equal(sources.length, 1);
  assert.deepEqual(
    sources[0]?.features.map((f) => f.id),
    ["hosted-agents", "hosted-agents-responses"],
  );
});

test("Features on the same article but different anchors stay independent sources", () => {
  const sources = groupIntoWatchedSources([
    feature("hosted-agents", "region-availability"),
    feature("hosted-agents-websocket", "protocols-invocations-websocket"),
  ]);

  assert.deepEqual(
    sources.map((s) => s.sectionAnchor),
    ["region-availability", "protocols-invocations-websocket"],
  );
});

test("the same anchor on a different article is a different source", () => {
  const sources = groupIntoWatchedSources([
    feature("hosted-agents", "region-availability"),
    feature(
      "content-safety-text",
      "region-availability",
      "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    ),
  ]);

  assert.equal(sources.length, 2);
});

test("a Watched Source key slugs the article path and anchor into a file-safe name", () => {
  const [source] = groupIntoWatchedSources([
    feature(
      "foundry-agents",
      "supported-regions",
      "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/limits-quotas-regions",
    ),
  ]);

  assert.equal(
    source?.key,
    "azure-foundry-agents-concepts-limits-quotas-regions--supported-regions",
  );
});

test("Watched Source keys distinguish the same anchor on different articles", () => {
  const sources = groupIntoWatchedSources([
    feature("hosted-agents", "region-availability"),
    feature(
      "content-safety-text",
      "region-availability",
      "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview",
    ),
  ]);

  assert.deepEqual(
    sources.map((s) => s.key),
    [
      "azure-foundry-agents-concepts-hosted-agents--region-availability",
      "azure-ai-services-content-safety-overview--region-availability",
    ],
  );
});

test("voice-based agents shares the existing Supported regions Watched Source", () => {
  const sources = groupIntoWatchedSources(FEATURES).filter(
    (source) =>
      source.sourceUrl ===
        "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/limits-quotas-regions" &&
      source.sectionAnchor === "supported-regions",
  );

  assert.equal(sources.length, 1);
  assert.equal(
    sources[0]?.key,
    "azure-foundry-agents-concepts-limits-quotas-regions--supported-regions",
  );
  assert.deepEqual(
    sources[0]?.features.map((feature) => feature.id),
    ["foundry-agents", "agents-responses-api", "agents-voice-based", "agents-private-vnet"],
  );
});

test("Agent Service region drift also requests Class A reconciliation without changing its networking provenance", () => {
  const sources = groupIntoWatchedSources(FEATURES);
  const agents = sources.find(
    (source) =>
      source.key === "azure-foundry-agents-concepts-limits-quotas-regions--supported-regions",
  );
  const classA = sources.find(
    (source) => source.key === "azure-foundry-agents-how-to-virtual-networks--limitations",
  );

  assert.ok(agents && classA);
  assert.deepEqual(
    classA.features.map((feature) => feature.id),
    ["agents-private-class-a-ip-ranges"],
  );
  assert.ok(!agents.features.some((feature) => feature.id === "agents-private-class-a-ip-ranges"));
  assert.match(agents.triageNote ?? "", /also reconcile `agents-private-class-a-ip-ranges`/i);
  assert.match(agents.triageNote ?? "", /Agents column/);
});

test("the regions-list Watched Source carries zero Features", () => {
  assert.deepEqual(REGIONS_LIST_SOURCE.features, []);
});

test("all four Content Safety Features watch the current standalone product tables together", () => {
  const sources = groupIntoWatchedSources(
    FEATURES.filter((feature) => feature.group === "content-safety"),
  );
  assert.equal(sources.length, 1);
  assert.equal(
    sources[0]?.key,
    "azure-ai-services-content-safety-region-availability--guardrails-in-azure-ai-content-safety",
  );
  assert.equal(sources[0]?.features.length, 4);
  assert.equal(sources[0]?.sectionAnchor, "guardrails-in-azure-ai-content-safety");
  assert.ok(FEATURES.every((feature) => !feature.sourceUrl.endsWith("content-safety/overview")));
});

test("the reconciled Content Safety baseline includes all geography tables and the routing caveat", async () => {
  const [source] = groupIntoWatchedSources(
    FEATURES.filter((feature) => feature.group === "content-safety"),
  );
  assert.ok(source);
  const cache = resolve(dirname(fileURLToPath(import.meta.url)), "..", "cache", "sources");
  const snapshot = await readLatestWatchedSourceSnapshot(cache, source.key);
  assert.ok(snapshot, "An explicit baseline must exist under the new Watched Source key");
  for (const text of [
    "Guardrails in Azure AI Content Safety",
    "Americas",
    "Europe",
    "Asia Pacific",
    "Middle East & Africa",
    "Content harms",
    "Prompt shields",
    "Protected material",
    "Groundedness",
    "global or data zone routing",
    ...new Set(source.features.flatMap((feature) => feature.regions)),
  ]) {
    assert.ok(snapshot.includes(text), `The baseline must include ${text}`);
  }
  assert.ok(!snapshot.includes("Guardrails in Foundry"));
});

test("the Class A networking baseline retains explicit all-region support and its regional-list reference", async () => {
  const cache = resolve(dirname(fileURLToPath(import.meta.url)), "..", "cache", "sources");
  const snapshot = await readLatestWatchedSourceSnapshot(
    cache,
    "azure-foundry-agents-how-to-virtual-networks--limitations",
  );

  assert.ok(snapshot, "An explicit Class A baseline must exist under the new Watched Source key");
  assert.match(
    snapshot,
    /Every region where Agent Service is available supports private Class A address space/,
  );
  assert.match(snapshot, /10\.0\.0\.0\/8/);
  assert.match(snapshot, /For the current list, see Supported regions/);
});

// Guards the shortcut of "just add the regions list as a Feature": that would
// leak a non-feature into features.json and the matrix UI (ADR-0005).
test("no Feature is curated from the regions-list article", () => {
  assert.deepEqual(
    FEATURES.filter((f) => f.sourceUrl === REGIONS_LIST_URL).map((f) => f.id),
    [],
  );
});
