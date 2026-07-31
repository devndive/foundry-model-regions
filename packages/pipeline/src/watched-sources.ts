import type { Feature } from "@foundry/data-types";

// A Watched Source (CONTEXT.md) is one published article section — a URL plus a
// section anchor — that the drift check snapshots and diffs. Several Features
// are routinely curated from the same section, so drift is detected per source,
// never per Feature: one article edit is one fetch, one snapshot, one issue.

export interface WatchedSource {
  // Stable, file-safe identity for the section: the article's path (minus host
  // and locale) plus the anchor. Used as the snapshot filename, so it must not
  // collide across articles that happen to share an anchor name.
  key: string;
  sourceUrl: string;
  sectionAnchor: string;
  features: readonly Feature[];
  // What a human should do with this diff, authored where the source is
  // declared. Absent means the default Feature reconcile instruction, which is
  // wrong for a source that curates no Features.
  triageNote?: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Drops the host and the `en-us` locale segment — neither varies across the
// tracked articles, so both are noise in a filename.
export function watchedSourceKey(sourceUrl: string, sectionAnchor: string): string {
  const path = new URL(sourceUrl).pathname
    .split("/")
    .filter((segment) => segment.length > 0 && !/^[a-z]{2}-[a-z]{2}$/i.test(segment))
    .join("-");
  return `${slugify(path)}--${slugify(sectionAnchor)}`;
}

export function groupIntoWatchedSources(features: readonly Feature[]): readonly WatchedSource[] {
  const sources = new Map<string, WatchedSource & { features: Feature[] }>();

  for (const feature of features) {
    const key = watchedSourceKey(feature.sourceUrl, feature.sectionAnchor);
    const existing = sources.get(key);
    if (existing) {
      existing.features.push(feature);
      continue;
    }
    sources.set(key, {
      key,
      sourceUrl: feature.sourceUrl,
      sectionAnchor: feature.sectionAnchor,
      features: [feature],
    });
  }

  return [...sources.values()];
}

// Exported so a guard test can assert no Feature is ever curated from this
// article — the "just add it as a Feature" shortcut must fail loudly.
export const REGIONS_LIST_URL = "https://learn.microsoft.com/en-us/azure/reliability/regions-list";
const REGIONS_LIST_ANCHOR = "azure-regions-list-1";

// The Microsoft regions list: a Watched Source that is not a Feature (CONTEXT.md).
// REGIONS is the *input* to the model fetch rather than a filter over its output,
// so nothing in the pipeline can ever observe an Untracked Region; this diff is
// the only signal that Azure's region set moved (ADR-0005).
//
// Watched at the all-geos table's h2 rather than the page h1, which drags in page
// chrome ("Summarize this article for me", Related content) that churns without
// any region change. Declared here, never in FEATURES: it emits no Feature
// Availability Fact, so it must not reach features.json or the matrix UI.

export const REGIONS_LIST_SOURCE: WatchedSource = {
  key: watchedSourceKey(REGIONS_LIST_URL, REGIONS_LIST_ANCHOR),
  sourceUrl: REGIONS_LIST_URL,
  sectionAnchor: REGIONS_LIST_ANCHOR,
  features: [],
  triageNote:
    "Check this diff against the Tracked Region criterion in ADR-0005: is a region new to " +
    "this list, and can any customer deploy into it without requesting access — i.e. no " +
    "restricted-access icon on its row? Only then does it belong in `REGIONS` " +
    "(`src/region-metadata.ts`). Most diffs here will not affect region coverage; closing " +
    "with no change is the expected outcome.",
};
