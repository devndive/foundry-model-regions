import assert from "node:assert/strict";
import { test } from "node:test";
import type { Feature } from "@foundry/data-types";
import { renderDriftIssue } from "./drift-issue.js";
import { groupIntoWatchedSources, REGIONS_LIST_SOURCE } from "./watched-sources.js";

const CONTENT_SAFETY_URL =
  "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview";

function feature(
  id: string,
  displayName: string,
  sourceUrl: string,
  anchor: string,
  group: Feature["group"] = "hosted-agents",
): Feature {
  return { id, displayName, group, sourceUrl, sectionAnchor: anchor, regions: ["eastus2"] };
}

const HOSTED_AGENTS = groupIntoWatchedSources([
  feature(
    "hosted-agents",
    "Hosted Agents",
    "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents",
    "region-availability",
  ),
])[0]!;

const CONTENT_SAFETY = groupIntoWatchedSources([
  feature(
    "content-safety-text",
    "Content Safety — Analyze Text",
    CONTENT_SAFETY_URL,
    "region-availability",
    "content-safety",
  ),
  feature(
    "content-safety-image",
    "Content Safety — Analyze Image",
    CONTENT_SAFETY_URL,
    "region-availability",
    "content-safety",
  ),
])[0]!;

test("renderDriftIssue frames a changed section as a diff block", () => {
  const { title, body } = renderDriftIssue(HOSTED_AGENTS, "changed", " eastus2\n+westus");

  assert.equal(title, "Source drift: hosted-agents#region-availability (changed)");
  assert.match(body, /status `changed`/);
  assert.match(body, /```diff\n eastus2\n\+westus\n```/);
  assert.match(body, /#region-availability/);
});

test("renderDriftIssue titles a vanished anchor as 'anchor missing' and quotes the error", () => {
  const { title, body } = renderDriftIssue(
    HOSTED_AGENTS,
    "anchor-missing",
    'Section anchor "region-availability" did not resolve in the article.',
  );

  assert.equal(title, "Source drift: hosted-agents#region-availability (anchor missing)");
  assert.match(body, /the section anchor no longer resolves/);
  assert.match(body, /> Section anchor "region-availability" did not resolve/);
});

test("one issue names every Feature curated from the changed section", () => {
  const { title, body } = renderDriftIssue(CONTENT_SAFETY, "changed", "+westus");

  assert.equal(title, "Source drift: overview#region-availability (changed)");
  assert.match(body, /- \*\*Content Safety — Analyze Text\*\* \(`content-safety-text`\)/);
  assert.match(body, /- \*\*Content Safety — Analyze Image\*\* \(`content-safety-image`\)/);
});

test("a vanished anchor is likewise reported once, listing every affected Feature", () => {
  const { body } = renderDriftIssue(CONTENT_SAFETY, "anchor-missing", "did not resolve");

  assert.match(body, /`content-safety-text`/);
  assert.match(body, /`content-safety-image`/);
});

test("a source's triage note replaces the Feature reconcile instruction", () => {
  const { body } = renderDriftIssue(REGIONS_LIST_SOURCE, "changed", "+Switzerland West");

  assert.match(body, /Tracked Region criterion in ADR-0005/);
  assert.doesNotMatch(body, /Reconcile `src\/feature-metadata\.ts`/);
});

test("a Feature-less source's issue omits the affected-Features block", () => {
  const changed = renderDriftIssue(REGIONS_LIST_SOURCE, "changed", "+Switzerland West");
  const missing = renderDriftIssue(REGIONS_LIST_SOURCE, "anchor-missing", "did not resolve");

  assert.doesNotMatch(changed.body, /Features curated from this section/);
  assert.doesNotMatch(missing.body, /Features curated from this section/);
});
