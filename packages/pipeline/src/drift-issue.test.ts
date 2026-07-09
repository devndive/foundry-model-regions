import assert from "node:assert/strict";
import { test } from "node:test";
import { renderDriftIssue } from "./drift-issue.js";
import { type Feature } from "./feature-metadata.js";

const FEATURE: Feature = {
  id: "hosted-agents",
  displayName: "Hosted Agents",
  sourceUrl: "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents",
  sectionAnchor: "region-availability",
  regions: ["eastus2"],
};

test("renderDriftIssue frames a changed section as a diff block", () => {
  const { title, body } = renderDriftIssue(FEATURE, "changed", " eastus2\n+westus");

  assert.equal(title, "Feature drift: Hosted Agents (changed)");
  assert.match(body, /status `changed`/);
  assert.match(body, /```diff\n eastus2\n\+westus\n```/);
  assert.match(body, /#region-availability/);
});

test("renderDriftIssue titles a vanished anchor as 'anchor missing' and quotes the error", () => {
  const { title, body } = renderDriftIssue(
    FEATURE,
    "anchor-missing",
    'Section anchor "region-availability" did not resolve in the article.',
  );

  assert.equal(title, "Feature drift: Hosted Agents (anchor missing)");
  assert.match(body, /the section anchor no longer resolves/);
  assert.match(body, /> Section anchor "region-availability" did not resolve/);
});
