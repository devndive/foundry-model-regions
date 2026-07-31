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
