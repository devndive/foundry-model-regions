import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  compareBundles,
  type ModelDriftStatus,
  readSnapshotBundle,
  twoLatestSnapshotDirs,
} from "./model-drift.js";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = resolve(ROOT_DIR, "cache");

// The machine-verifiable counterpart to the feature-drift check (ADR-0002):
// decide whether a freshly-fetched model snapshot differs *semantically* from
// the latest committed one, comparing the canonical Model Availability Facts
// bundle order-insensitively. Touches no network and writes no commits — it
// reads snapshot directories already on disk and signals via the exit code:
//   0 = unchanged   1 = changed (incl. a new baseline)   2 = usage/no snapshot
//
// Usage: check-model-drift [candidateDir] [previousDir]
//   Defaults: candidate = newest cache snapshot, previous = next-newest.

function rel(path: string): string {
  return relative(ROOT_DIR, path) || path;
}

async function main(): Promise<void> {
  const [candidateArg, previousArg] = process.argv.slice(2);

  let candidateDir: string | null = candidateArg ? resolve(candidateArg) : null;
  let previousDir: string | null = previousArg ? resolve(previousArg) : null;

  const pair = await twoLatestSnapshotDirs(CACHE_DIR);

  candidateDir ??= pair.candidate;

  // When the previous snapshot isn't given explicitly, resolve it from the
  // cache independently of how the candidate was chosen. The previous is the
  // latest committed snapshot that isn't the candidate itself — so an explicit
  // candidate still gets compared against its real predecessor instead of
  // defaulting to a spurious "new" baseline.
  if (!previousArg) {
    previousDir = pair.candidate === candidateDir ? pair.previous : pair.candidate;
  }

  if (!candidateDir) {
    console.error("No candidate snapshot found. Run fetch-models first.");
    process.exit(2);
  }

  const candidate = await readSnapshotBundle(candidateDir);
  const previous = previousDir ? await readSnapshotBundle(previousDir) : null;
  const status: ModelDriftStatus = compareBundles(candidate, previous);

  console.log(`Candidate: ${rel(candidateDir)}`);
  console.log(`Previous:  ${previousDir ? rel(previousDir) : "(none)"}`);

  switch (status) {
    case "unchanged":
      console.log("● unchanged: model availability facts are identical (order-insensitive).");
      process.exit(0);
      break;
    case "new":
      console.log("● new: no prior snapshot — recording the first baseline.");
      process.exit(1);
      break;
    case "changed":
      console.log("● changed: model availability facts differ from the latest committed snapshot.");
      process.exit(1);
      break;
  }
}

main();
