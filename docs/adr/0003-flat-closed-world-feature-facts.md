# Model Foundry features as flat, closed-world (feature, region) facts

A **Feature Availability Fact** is a plain `(feature, region)` pair — no model dimension —
and is **closed-world**: a tracked region the article doesn't list is treated as
*unavailable*, not *unknown*. Features are emitted as a separate `dist/features.json`
artifact (kept apart from the API-derived `models.json`) but surfaced in **one** matrix
view, where selecting features and models filters region columns by pure AND, so a
developer can find a single deployment region that has everything their app needs.

## Status

accepted

## Considered Options

- **A `(feature, region, model)` fact** — rejected: the original assumption that Hosted
  Agents keys availability on a model was wrong. Reading the article, the only extra axis is
  a **sub-feature** (protocols like Invocations (WebSocket), available in fewer regions than
  the parent). We model a sub-feature as its **own first-class Feature** with its own region
  list rather than nesting, keeping every fact a clean `(feature, region)` pair.
- **Open-world ("unknown" for unlisted regions)** — rejected for v1: more truthful but
  forces a tri-state into the matrix and complicates the filter. Revisit if false
  "unavailable" misleads.
- **Merge features into the model availability stream** — rejected: the datasets have
  different provenance (API vs hand-curated) and lifecycles; keep them as separate artifacts,
  joined only in the view.

## Consequences

- Adding a region-narrowed protocol/sub-feature means adding a Feature row, not changing the
  fact shape.
- The closed-world reading lets the UI cleanly drop non-matching region columns; if it ever
  hides a region that's actually fine, that's the signal to reconsider open-world.
