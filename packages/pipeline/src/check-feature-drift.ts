import { writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchArticleSection } from "./article-section.js";
import type { Feature } from "@foundry/data-types";
import { type DriftStatus, renderDriftIssue } from "./drift-issue.js";
import { FEATURES } from "./feature-metadata.js";
import { readLatestFeatureSnapshot, writeFeatureSnapshot } from "./feature-snapshots.js";
import { formatSnapshotKey } from "./snapshots.js";
import { diffLines } from "./text-diff.js";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FEATURES_CACHE_DIR = resolve(ROOT_DIR, "cache", "features");
const REPORT_PATH = resolve(ROOT_DIR, "drift-report.json");

// What the detection loop decides about one feature. `detail` is the diff (or
// the fetch error for anchor-missing) the renderer turns into issue prose.
interface DriftDetection {
  feature: Feature;
  status: DriftStatus;
  detail: string;
  snapshotPath?: string;
}

interface DriftEntry {
  featureId: string;
  displayName: string;
  sourceUrl: string;
  sectionAnchor: string;
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

// Pure projection from a detection to a report entry. Issue prose is rendered
// only when the entry actually opens one, so the report carries no dead text.
function toReportEntry(detection: DriftDetection): DriftEntry {
  const { feature, status, detail, snapshotPath } = detection;
  const entry: DriftEntry = {
    featureId: feature.id,
    displayName: feature.displayName,
    sourceUrl: feature.sourceUrl,
    sectionAnchor: feature.sectionAnchor,
    status,
    opensIssue: opensIssue(status),
    snapshotPath,
  };

  if (entry.opensIssue) {
    const issue = renderDriftIssue(feature, status, detail);
    entry.issueTitle = issue.title;
    entry.issueBody = issue.body;
  }

  return entry;
}

async function detectDrift(feature: Feature, snapshotKey: string): Promise<DriftDetection | null> {
  let newText: string;
  try {
    newText = await fetchArticleSection(feature.sourceUrl, feature.sectionAnchor);
  } catch (err) {
    const detail = (err as Error).message;
    console.error(`  ✗ ${feature.id}: ${detail}`);
    return { feature, status: "anchor-missing", detail };
  }

  const previous = await readLatestFeatureSnapshot(FEATURES_CACHE_DIR, feature.id);
  if (previous === newText) {
    console.log(`  ✓ ${feature.id}: unchanged`);
    return null;
  }

  await writeFeatureSnapshot(FEATURES_CACHE_DIR, snapshotKey, feature.id, newText);
  const snapshotPath = relative(
    ROOT_DIR,
    resolve(FEATURES_CACHE_DIR, snapshotKey, `${feature.id}.txt`),
  );

  const status: DriftStatus = previous === null ? "new" : "changed";
  console.log(`  ● ${feature.id}: ${status} → wrote ${snapshotPath}`);
  return { feature, status, detail: diffLines(previous ?? "", newText), snapshotPath };
}

async function main(): Promise<void> {
  const snapshotKey = formatSnapshotKey(new Date());
  const drift: DriftEntry[] = [];

  for (const feature of FEATURES) {
    const detection = await detectDrift(feature, snapshotKey);
    if (detection !== null) {
      drift.push(toReportEntry(detection));
    }
  }

  await writeFile(REPORT_PATH, JSON.stringify(drift, null, 2), "utf-8");

  const unchanged = FEATURES.length - drift.length;
  const opened = drift.filter((d) => d.opensIssue).length;
  const baselines = drift.filter((d) => d.status === "new").length;
  console.log(
    `\nDone. ${FEATURES.length} features checked: ${unchanged} unchanged, ` +
      `${baselines} new baseline(s), ${opened} drift event(s) to triage.`,
  );
}

main();
