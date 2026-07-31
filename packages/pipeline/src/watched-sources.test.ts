import assert from "node:assert/strict";
import { test } from "node:test";
import type { Feature } from "@foundry/data-types";
import { groupIntoWatchedSources } from "./watched-sources.js";

const AGENTS_URL = "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents";

function feature(id: string, sectionAnchor: string, sourceUrl = AGENTS_URL): Feature {
  return { id, displayName: id, sourceUrl, sectionAnchor, regions: [] };
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
