# Adopt a pnpm workspace monorepo with a shared data-types contract

The repo becomes a **pnpm workspace monorepo** with three packages — `@foundry/web`
(`apps/web`, the SPA), `@foundry/pipeline` (`packages/pipeline`, the data-aggregation
scripts, moved out of the repo root), and `@foundry/data-types` (`packages/data-types`) —
and the repo root holds only `pnpm-workspace.yaml`, a private root manifest, and shared
config. The **wire contract** for the emitted artifacts (`models.json`, `regions.json`,
`features.json`) lives once in `@foundry/data-types` and is imported by _both_ the pipeline
(which produces it) and the web app (which consumes it), so a change to the serialized shape
breaks the web typecheck immediately instead of drifting silently.

## Status

accepted

## Considered Options

- **Keep two independent npm packages (pipeline at root + `web/`)** — rejected: the web app
  redeclared the pipeline's output types (`NormalizedBundle`, `FeaturesArtifact`, region
  types) with nothing keeping them in sync, and toolchain versions had already drifted
  (`oxfmt` 0.54.0 vs 0.53.0, `oxlint` 1.69.0 vs ^1.67.0). A workspace with a shared contract
  and a pnpm **catalog** removes both classes of drift.
- **Turborepo/Nx for task orchestration** — rejected for now: three packages with small
  builds don't justify the added dependency; plain `pnpm -r` / `--filter` suffices. Revisit
  if the build graph grows.
- **Web imports the pipeline as a workspace dep and pulls data at build time** — rejected:
  ADR-0001 mandates a static client-side SPA that fetches `data/*.json` at runtime; bundling
  a 3.6 MB JSON into the build graph fights that. The pipeline instead emits to its own
  `dist/` and a `sync-data` script copies artifacts into `apps/web/public/data`.
- **`@foundry/data-types` as a compiled package with project references** — rejected: it is
  types-only, so it ships as raw `.ts` source consumed directly by both toolchains, avoiding
  a build-ordering dependency.

## Consequences

- The pipeline **owns its data**: `cache/`, `dist/`, and `drift-report.json` move under
  `packages/pipeline/` (a one-time 696-file `git mv`; paths were already package-root
  relative, so no source path logic changes). The two data workflows update their `cache`
  and `drift-report.json` paths accordingly.
- Shared-artifact type names are aligned to the `CONTEXT.md` glossary in the shared package:
  `FeatureAvailabilityFact` (not the pipeline's former `FeatureAvailabilityRow`) and `Region`
  carrying the strict `GeoGroup` union (tightening the web, which previously typed
  `geoGroup` as `string`).
- pnpm is pinned via the root `packageManager` field (`pnpm@10`) and provisioned in CI with
  corepack; all workflows swap `npm ci` for `pnpm install --frozen-lockfile` and target
  **Node 26**.
- A root `tsconfig.base.json` uses modern compiler settings (`target: "ESNext"`,
  `verbatimModuleSyntax`, `isolatedModules`, `moduleDetection: "force"`); each package sets
  its own module system (`nodenext` for the pipeline, `bundler` for the Vite web app). The
  aggressive extra-strict flags (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  …) are intentionally left off for now to keep the migration focused.
