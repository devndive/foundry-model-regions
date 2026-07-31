import { writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchArticleSection } from "./article-section.js";
import { FEATURES } from "./feature-metadata.js";
import { detectDrift, type DriftIO } from "./watched-source-drift.js";
import { formatSnapshotKey } from "./snapshots.js";
import {
  readLatestWatchedSourceSnapshot,
  writeWatchedSourceSnapshot,
} from "./watched-source-snapshots.js";
import { groupIntoWatchedSources, REGIONS_LIST_SOURCE } from "./watched-sources.js";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES_CACHE_DIR = resolve(ROOT_DIR, "cache", "sources");
const REPORT_PATH = resolve(ROOT_DIR, "drift-report.json");

// Wires the detection loop to its real boundaries: the live article and the
// committed snapshot cache.
function realIO(snapshotKey: string): DriftIO {
  return {
    fetchSection: fetchArticleSection,
    readLatestSnapshot: (source) =>
      readLatestWatchedSourceSnapshot(
        SOURCES_CACHE_DIR,
        source.key,
        source.features.map((feature) => feature.id),
      ),
    writeSnapshot: async (source, text) => {
      await writeWatchedSourceSnapshot(SOURCES_CACHE_DIR, snapshotKey, source.key, text);
      return relative(ROOT_DIR, resolve(SOURCES_CACHE_DIR, snapshotKey, `${source.key}.txt`));
    },
  };
}

async function main(): Promise<void> {
  // Feature sections are derived by grouping; the regions list is a Watched
  // Source with no Features, so it is declared independently and appended here.
  const featureSources = groupIntoWatchedSources(FEATURES);
  const sources = [...featureSources, REGIONS_LIST_SOURCE];
  const drift = await detectDrift(sources, realIO(formatSnapshotKey(new Date())));

  const drifted = new Set(drift.map((entry) => entry.sourceKey));
  for (const source of sources) {
    if (!drifted.has(source.key)) {
      console.log(`  ✓ ${source.key}: unchanged`);
    }
  }
  for (const entry of drift) {
    if (entry.status === "anchor-missing") {
      console.error(`  ✗ ${entry.sourceKey}: anchor missing`);
    } else {
      console.log(`  ● ${entry.sourceKey}: ${entry.status} → wrote ${entry.snapshotPath}`);
    }
  }

  await writeFile(REPORT_PATH, JSON.stringify(drift, null, 2), "utf-8");

  const unchanged = sources.length - drift.length;
  const opened = drift.filter((d) => d.opensIssue).length;
  const baselines = drift.filter((d) => d.status === "new").length;
  console.log(
    `\nDone. ${sources.length} Watched Source(s) checked ` +
      `(${FEATURES.length} feature(s) across ${featureSources.length} section(s)): ` +
      `${unchanged} unchanged, ${baselines} new baseline(s), ${opened} drift event(s) to triage.`,
  );
}

main();
