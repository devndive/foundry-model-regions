# Curate Foundry feature availability by hand, guarded by a snapshot-diff drift check

Foundry **Feature Availability** (Red Teaming Agent, Foundry Agents, Hosted Agents, …) is
not exposed by any Azure API — it only exists as prose in Microsoft Learn articles. So the
source of truth is a **hand-curated table** (`feature-metadata.ts`, mirroring how
`region-metadata.ts` is hand-maintained), and a scheduled **drift check** keeps it honest:
each feature carries a source descriptor (article URL + section anchor), a GitHub Actions
workflow snapshots only that section's text into `cache/features/<timestamp>/<id>.txt`,
diffs it against the previous snapshot, and on any change opens a `needs-triage` issue so a
human reconciles the table.

## Status

accepted

## Considered Options

- **Fully automated scrape into the dataset** — rejected: the articles reformat often and
  mix prose with tables, so a parser that turns them into a region set is brittle and
  would silently publish wrong data. Humans own correctness; the robot only detects change.
- **Pure manual, no automation** — rejected: nothing tells you when an article moved, so
  the table silently rots.
- **Semantic extraction in the drift check** (parse into a region set and compare) —
  rejected in favour of a dumb snapshot-to-snapshot text diff. The diff cries wolf less and
  needs no per-article parser; if Microsoft restructures a page and the anchor vanishes, the
  fetch fails loudly, which is itself a valid drift signal.
- **Fail CI instead of opening an issue** — rejected: a red X is ignored and not
  actionable; an issue feeds the existing triage workflow.

## Consequences

- A new scheduled workflow must commit snapshots back to the repo (the model cache is
  already committed), but only **when the section changed** — a new snapshot dir literally
  means "drift happened," keeping churn near zero.
- A feature's curated regions must be a subset of `REGIONS`; a unit test fails on a stray
  region, forcing new regions into `region-metadata.ts` first (which also starts fetching
  their models).
