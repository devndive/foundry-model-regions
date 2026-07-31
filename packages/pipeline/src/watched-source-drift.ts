import type { DriftStatus } from "./drift-issue.js";
import { renderDriftIssue } from "./drift-issue.js";
import { diffLines } from "./text-diff.js";
import type { WatchedSource } from "./watched-sources.js";

// The detection loop. Its unit is a Watched Source, so an article edit is
// fetched, snapshotted and reported exactly once no matter how many Features
// are curated from that section.
//
// The two system boundaries — the article and the snapshot cache — are injected
// so the loop can be exercised without the network or the file system.
export interface DriftIO {
  fetchSection(sourceUrl: string, sectionAnchor: string): Promise<string>;
  readLatestSnapshot(source: WatchedSource): Promise<string | null>;
  // Returns the repo-relative path of the snapshot it wrote.
  writeSnapshot(source: WatchedSource, text: string): Promise<string>;
}

export interface DriftEntry {
  sourceKey: string;
  sourceUrl: string;
  sectionAnchor: string;
  // Every Feature curated from this section — all of them may need reconciling.
  featureIds: readonly string[];
  status: DriftStatus;
  // Whether the workflow should open a needs-triage issue for this entry. A
  // brand-new baseline (no prior snapshot) is recorded but isn't reconcilable
  // drift, so it doesn't open an issue.
  opensIssue: boolean;
  snapshotPath?: string;
  issueTitle?: string;
  issueBody?: string;
}

// The single rule for "is this reconcilable drift?": a fresh baseline is
// recorded but never triaged; everything else opens an issue.
function opensIssue(status: DriftStatus): boolean {
  return status !== "new";
}

function toEntry(
  source: WatchedSource,
  status: DriftStatus,
  detail: string,
  snapshotPath?: string,
): DriftEntry {
  const entry: DriftEntry = {
    sourceKey: source.key,
    sourceUrl: source.sourceUrl,
    sectionAnchor: source.sectionAnchor,
    featureIds: source.features.map((feature) => feature.id),
    status,
    opensIssue: opensIssue(status),
    snapshotPath,
  };

  if (entry.opensIssue) {
    const issue = renderDriftIssue(source, status, detail);
    entry.issueTitle = issue.title;
    entry.issueBody = issue.body;
  }

  return entry;
}

async function detectSection(source: WatchedSource, io: DriftIO): Promise<DriftEntry | null> {
  let newText: string;
  try {
    newText = await io.fetchSection(source.sourceUrl, source.sectionAnchor);
  } catch (err) {
    return toEntry(source, "anchor-missing", (err as Error).message);
  }

  const previous = await io.readLatestSnapshot(source);
  if (previous === newText) {
    return null;
  }

  const snapshotPath = await io.writeSnapshot(source, newText);
  const status: DriftStatus = previous === null ? "new" : "changed";
  return toEntry(source, status, diffLines(previous ?? "", newText), snapshotPath);
}

// Returns one entry per drifted section; unchanged sections are omitted.
export async function detectDrift(
  sources: readonly WatchedSource[],
  io: DriftIO,
): Promise<DriftEntry[]> {
  const entries: DriftEntry[] = [];
  for (const source of sources) {
    const entry = await detectSection(source, io);
    if (entry !== null) {
      entries.push(entry);
    }
  }
  return entries;
}
