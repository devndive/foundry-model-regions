import assert from "node:assert/strict";
import { test } from "node:test";
import type { Feature } from "@foundry/data-types";
import { detectDrift } from "./watched-source-drift.js";
import { groupIntoWatchedSources, type WatchedSource } from "./watched-sources.js";

const CONTENT_SAFETY_URL =
  "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview";

function feature(id: string, anchor: string, sourceUrl = CONTENT_SAFETY_URL): Feature {
  return { id, displayName: id, sourceUrl, sectionAnchor: anchor, regions: ["eastus2"] };
}

// A recording stand-in for the two system boundaries the detection loop touches:
// the Microsoft Learn article and the snapshot cache on disk.
function fakeIO(sections: Record<string, string | Error>, stored: Record<string, string> = {}) {
  const fetched: string[] = [];
  const written: Record<string, string> = {};
  return {
    fetched,
    written,
    io: {
      async fetchSection(sourceUrl: string, sectionAnchor: string): Promise<string> {
        fetched.push(`${sourceUrl}#${sectionAnchor}`);
        const section = sections[sectionAnchor];
        if (section instanceof Error) throw section;
        return section ?? "";
      },
      async readLatestSnapshot(source: WatchedSource): Promise<string | null> {
        return stored[source.key] ?? null;
      },
      async writeSnapshot(source: WatchedSource, text: string): Promise<string> {
        written[source.key] = text;
        return `cache/sources/2026-07-30T00-00-00Z/${source.key}.txt`;
      },
    },
  };
}

test("Features sharing a section are fetched, snapshotted and reported once", async () => {
  const sources = groupIntoWatchedSources([
    feature("content-safety-text", "region-availability"),
    feature("content-safety-image", "region-availability"),
  ]);
  const { io, fetched, written } = fakeIO(
    { "region-availability": "westus\neastus" },
    { "azure-ai-services-content-safety-overview--region-availability": "westus" },
  );

  const entries = await detectDrift(sources, io);

  assert.deepEqual(fetched, [`${CONTENT_SAFETY_URL}#region-availability`]);
  assert.deepEqual(Object.keys(written), [
    "azure-ai-services-content-safety-overview--region-availability",
  ]);
  assert.equal(entries.length, 1);
  assert.deepEqual(entries[0]?.featureIds, ["content-safety-text", "content-safety-image"]);
  assert.equal(entries[0]?.status, "changed");
  assert.equal(entries[0]?.opensIssue, true);
  assert.match(entries[0]?.issueBody ?? "", /content-safety-image/);
});

test("two anchors on the same article drift independently", async () => {
  const sources = groupIntoWatchedSources([
    feature("content-safety-text", "region-availability"),
    feature("content-safety-limits", "input-requirements"),
  ]);
  const { io, written } = fakeIO(
    { "region-availability": "changed", "input-requirements": "same" },
    {
      "azure-ai-services-content-safety-overview--region-availability": "original",
      "azure-ai-services-content-safety-overview--input-requirements": "same",
    },
  );

  const entries = await detectDrift(sources, io);

  assert.deepEqual(
    entries.map((e) => e.sectionAnchor),
    ["region-availability"],
  );
  assert.deepEqual(Object.keys(written), [
    "azure-ai-services-content-safety-overview--region-availability",
  ]);
});

test("a fresh baseline is snapshotted but not triaged", async () => {
  const sources = groupIntoWatchedSources([feature("content-safety-text", "region-availability")]);
  const { io, written } = fakeIO({ "region-availability": "first ever" });

  const entries = await detectDrift(sources, io);

  assert.equal(entries[0]?.status, "new");
  assert.equal(entries[0]?.opensIssue, false);
  assert.equal(entries[0]?.issueTitle, undefined);
  assert.equal(
    written["azure-ai-services-content-safety-overview--region-availability"],
    "first ever",
  );
});

test("a vanished anchor is reported once, naming every Feature on that section", async () => {
  const sources = groupIntoWatchedSources([
    feature("content-safety-text", "region-availability"),
    feature("content-safety-image", "region-availability"),
  ]);
  const { io, fetched, written } = fakeIO({
    "region-availability": new Error('Section anchor "region-availability" did not resolve.'),
  });

  const entries = await detectDrift(sources, io);

  assert.equal(fetched.length, 1);
  assert.deepEqual(written, {});
  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.status, "anchor-missing");
  assert.deepEqual(entries[0]?.featureIds, ["content-safety-text", "content-safety-image"]);
  assert.match(entries[0]?.issueBody ?? "", /`content-safety-text`/);
  assert.match(entries[0]?.issueBody ?? "", /`content-safety-image`/);
});
