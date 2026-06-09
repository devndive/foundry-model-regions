import { type Feature } from "./feature-metadata.js";

// Rendering layer for the drift check: turns a detected drift event into the
// GitHub-issue title/body the workflow opens. Kept separate from the detection
// orchestrator (check-feature-drift.ts) so deciding "did it drift?" never mixes
// with "how do we describe it to a human?".

export type DriftStatus = "new" | "changed" | "anchor-missing";

export interface DriftIssue {
  title: string;
  body: string;
}

function buildIssueBody(feature: Feature, status: DriftStatus, detail: string): string {
  const articleLink = `${feature.sourceUrl}#${feature.sectionAnchor}`;
  const reconcile =
    "Reconcile `src/feature-metadata.ts` with the article. The drift workflow never " +
    "edits the curated table — humans own correctness.";

  if (status === "anchor-missing") {
    return [
      `Drift detected for **${feature.displayName}** (\`${feature.id}\`): the section anchor no longer resolves.`,
      "",
      `Article: ${articleLink}`,
      "",
      `A vanished section is itself a valid drift signal. ${reconcile}`,
      "",
      "> " + detail,
      "",
    ].join("\n");
  }

  return [
    `Drift detected for **${feature.displayName}** (\`${feature.id}\`), status \`${status}\`.`,
    "",
    `Article: ${articleLink}`,
    "",
    reconcile,
    "",
    "```diff",
    detail,
    "```",
    "",
  ].join("\n");
}

// `detail` is the error message for an anchor-missing event, otherwise the
// unified diff of the section text.
export function renderDriftIssue(
  feature: Feature,
  status: DriftStatus,
  detail: string,
): DriftIssue {
  const suffix = status === "anchor-missing" ? "anchor missing" : status;
  return {
    title: `Feature drift: ${feature.displayName} (${suffix})`,
    body: buildIssueBody(feature, status, detail),
  };
}
