# Deliver the matrix web app as a static client-side SPA

The matrix web app (issue #4) loads the normalized JSON artifacts (`models.json`,
`regions.json`) into the browser and indexes them in memory rather than standing up an
API, because the dataset is small (~300–500 KB gzip even at full 38-region coverage,
with a single SKU view rendering ~4,000 cells) and a static SPA on GitHub Pages keeps the
data pipeline and the UI fully decoupled — refreshing data is just republishing JSON, no
app rebuild. Filter state lives in the URL via typed search params (TanStack Router) so
views are shareable and reproducible; the app is deployed to GitHub Pages using hash
history.

## Status

accepted

## Considered Options

- **Build-time static generation (bake JSON into the bundle on each pipeline run)** —
  rejected: the data regenerates frequently, so baking it in would force a full frontend
  rebuild and redeploy on every run, tightly coupling the pipeline and the UI.
- **Thin API in front of the data** — rejected: there is no scale, auth, aggregation, or
  write need today (data is well under the ~5 MB threshold where client-side parsing/
  filtering becomes a concern). Revisit only if the dataset grows by an order of
  magnitude or personalized/auth-gated subsets are required.

## Consequences

- The decision holds for the whole product vision, not just the non-temporal slice: the
  later temporal features (event log #5, changelog panel and KPIs #6) consume an
  additional small static JSON artifact and compute KPIs/highlighting in-browser, so they
  do not force a server.
- The frontend lives in an isolated `web/` directory with its own `tsconfig`, Vite
  config, and test runner (Vitest/jsdom) to avoid conflicting with the root `Node16`
  ESM/`tsc`-only pipeline and its `dist/` output.
- A GitHub Actions workflow must be authored (none exists yet): one job regenerates the
  JSON artifacts and copies them into the web app's served directory, a second builds the
  SPA and deploys it to GitHub Pages.
