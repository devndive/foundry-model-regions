# Foundry Model Regions — Web App

Static client-side SPA (per [ADR-0001](../docs/adr/0001-static-client-side-spa-for-matrix-web-app.md))
that renders the model × region availability matrix and the non-temporal controls.

## Stack

- Vite + React + TypeScript
- TanStack Router (hash history, typed search params → shareable filter state)
- Vitest + jsdom for tests

## Data

The app fetches the normalized JSON artifacts from `public/data/`:

- `models.json` — `{ models, availability }` produced by the root pipeline (`npm run emit-models`)
- `regions.json` — region metadata (`npm run emit-region-metadata`)
- `features.json` — Foundry Feature availability (`npm run emit-features`)

These files are generated (gitignored). For local dev, regenerate and copy them in from the repo root:

```sh
npm run emit-models && npm run emit-region-metadata && npm run emit-features
mkdir -p web/public/data && cp dist/models.json dist/regions.json dist/features.json web/public/data/
```

## Scripts

```sh
npm install      # install deps
npm run dev      # local dev server
npm test         # run the test suite
npm run build    # typecheck + production build to web/dist
npm run preview  # serve the production build
```

## Architecture

The testable core is a set of pure modules, TDD'd independently of React:

- `data/index.ts` — `buildIndex` builds the SKU → (model, region) availability lookup
- `matrix/buildMatrix.ts` — applies all filters (SKU, model/region/capability, geo group,
  EU sovereign, lifecycle, GA-only), swap view (transpose) and sort, returning the grid
- `export/{toCsv,toMarkdown}.ts` — serialize the current filtered matrix
- `filters/search.ts` — map filter state ↔ URL search params

React components (`components/`, `App.tsx`) render the matrix with a sticky header row and
sticky REGION column.

## Deployment

`.github/workflows/deploy-pages.yml` regenerates the JSON artifacts from the committed
cache, copies them into `web/public/data/`, builds the SPA, and deploys it to GitHub Pages.
