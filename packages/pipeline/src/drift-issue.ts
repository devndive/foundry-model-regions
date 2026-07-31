import type { WatchedSource } from "./watched-sources.js";

// Rendering layer for the drift check: turns a detected drift event into the
// GitHub-issue title/body the workflow opens. Kept separate from the detection
// orchestrator (check-source-drift.ts) so deciding "did it drift?" never mixes
// with "how do we describe it to a human?".
//
// The unit is a Watched Source, not a Feature: one article edit produces one
// issue that names every Feature curated from that section.

export type DriftStatus = "new" | "changed" | "anchor-missing";

export interface DriftIssue {
  title: string;
  body: string;
}

// Human-facing shorthand for the section — the article's last path segment plus
// the anchor. Short enough for an issue title, and the full link is in the body.
function sectionLabel(source: WatchedSource): string {
  const article = new URL(source.sourceUrl).pathname.split("/").filter(Boolean).at(-1) ?? "article";
  return `${article}#${source.sectionAnchor}`;
}

function featureList(source: WatchedSource): string {
  return source.features
    .map((feature) => `- **${feature.displayName}** (\`${feature.id}\`)`)
    .join("\n");
}

function buildIssueBody(source: WatchedSource, status: DriftStatus, detail: string): string {
  const articleLink = `${source.sourceUrl}#${source.sectionAnchor}`;
  const reconcile =
    source.triageNote ??
    "Reconcile `src/feature-metadata.ts` with the article for each Feature below. The " +
      "drift workflow never edits the curated table — humans own correctness.";
  // A Watched Source curating no Features has nothing to list; the heading alone
  // would read as "affected: none" rather than "not applicable".
  const affected =
    source.features.length > 0
      ? ["Features curated from this section:", "", featureList(source), ""]
      : [];

  const headline =
    status === "anchor-missing"
      ? `Drift detected for **${sectionLabel(source)}**: the section anchor no longer resolves.`
      : `Drift detected for **${sectionLabel(source)}**, status \`${status}\`.`;
  const guidance =
    status === "anchor-missing"
      ? `A vanished section is itself a valid drift signal. ${reconcile}`
      : reconcile;
  const evidence = status === "anchor-missing" ? ["> " + detail] : ["```diff", detail, "```"];

  return [
    headline,
    "",
    `Article: ${articleLink}`,
    "",
    ...affected,
    guidance,
    "",
    ...evidence,
    "",
  ].join("\n");
}

// `detail` is the error message for an anchor-missing event, otherwise the
// unified diff of the section text.
export function renderDriftIssue(
  source: WatchedSource,
  status: DriftStatus,
  detail: string,
): DriftIssue {
  const suffix = status === "anchor-missing" ? "anchor missing" : status;
  return {
    title: `Source drift: ${sectionLabel(source)} (${suffix})`,
    body: buildIssueBody(source, status, detail),
  };
}
