# Research note: issue #48 — Content Safety `overview#region-availability` source drift

- **Issue:** [#48](https://github.com/devndive/foundry-model-regions/issues/48) — "Source drift: overview#region-availability (changed)"
- **Scope:** current Microsoft Learn evidence for the nine affected Features, plus repository metadata, snapshot mechanics, guards, and downstream impact.
- **Research date:** 2026-10-12
- **Status:** original source investigation plus the accepted reconciliation decisions in §11 and [ADR-0008](../adr/0008-reconcile-content-safety-at-documented-guardrail-granularity.md).
- **Conclusion:** this is a source migration and evidence-mapping problem, not a safe URL-only edit. Groundedness and Prompt Shields have clear current region rows. Four text/image or protected-material variants share broader rows, and three other Features have no region row in the inspected current documentation. Missing documentation is not proof of unavailability or retirement.
- **Primary sources fetched (verbatim, via `web_fetch`, same day):**
  1. `https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview` (frontmatter: `ms.date: 2025-09-16`, `updated_at: 2026-10-01T17:21:00Z`, `git_commit_id: ee80c6057c517d01eed1cc446eaee1db328e6b2e`)
  2. `https://learn.microsoft.com/en-us/azure/ai-services/content-safety/region-availability` (frontmatter: `ms.date: 2026-09-18`, `updated_at: 2026-09-18T22:15:00Z`, `git_commit_id: 215dd53ffbd9bd69b62e358605c95006802af884`)
  3. `.../concepts/harm-categories` (`ms.date: 2025-11-21`, `updated_at: 2026-09-18T22:15:00Z`)
  4. `.../concepts/protected-material` (`ms.date: 2025-09-02`, `updated_at: 2026-09-18T22:15:00Z`)
  5. `.../concepts/custom-categories` (`ms.date: 2025-09-02`, `updated_at: 2026-09-18T22:15:00Z`)
  6. `.../concepts/groundedness` (`ms.date: 2025-11-21`, `updated_at: 2026-06-05T22:11:00Z`)
  7. `.../concepts/jailbreak-detection` (`ms.date: 2026-08-28`, `updated_at: 2026-09-18T22:15:00Z`)
  8. `.../quickstart-image` (`ms.date: 2025-07-14`, `updated_at: 2026-06-05T22:11:00Z`)
  9. `.../quickstart-multimodal` (`ms.date: 2025-11-21`, `updated_at: 2026-06-05T22:11:00Z`)
  10. `.../how-to/custom-categories-rapid` (`ms.date: 2025-09-16`, `updated_at: 2026-06-05T22:11:00Z`)

The rendered Microsoft Learn pages were used as primary sources; the documentation commit history was not inspected.

### Primary-source links

- [Overview: Region availability](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview#region-availability)
- [Regional tables: Azure AI Content Safety](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/region-availability#guardrails-in-azure-ai-content-safety)
- [Regional tables: Foundry](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/region-availability#guardrails-in-foundry)
- [Harm categories](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/concepts/harm-categories)
- [Protected material](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/concepts/protected-material)
- [Custom categories](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/concepts/custom-categories)
- [Groundedness](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/concepts/groundedness)
- [Prompt Shields](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/concepts/jailbreak-detection)
- [Analyze image quickstart](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/quickstart-image)
- [Multimodal quickstart](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/quickstart-multimodal)
- [Rapid custom categories](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/how-to/custom-categories-rapid)

## 1. Verifying the issue's drift claim

**Old behavior (as described in the issue):** `overview#region-availability` used to contain a nine-column region matrix.

**Current behavior (verified 2026-10-12):** The `overview` page still has a heading `### Region availability` (anchor slug `region-availability`, confirmed present and unchanged — the anchor itself is **not** broken), but the body under it now reads only:

> "To use the Content Safety APIs, you must create your Azure AI Content Safety resource in a supported region. Follow this link to view [region availability](region-availability)"

This is an exact match for the issue's description. **Confirmed: the matrix was removed from `overview` and replaced by a one-line pointer**, source: overview page, section `### Region availability`.

**Maintainer comment's claim:** tables moved to `https://learn.microsoft.com/en-us/azure/ai-services/content-safety/region-availability`, split into "Guardrails in Foundry" and "Guardrails in Azure AI Content Safety" sections.

**Verified:** Confirmed exactly. The new page has two `##` headings:

- `## Guardrails in Foundry` → anchor `guardrails-in-foundry`
- `## Guardrails in Azure AI Content Safety` → anchor `guardrails-in-azure-ai-content-safety` (matches the maintainer's proposed anchor exactly)

Each heading is followed by a sub-heading (`#### Availability for Guardrails in Microsoft Foundry` / `#### Availability for guardrails in Azure AI Content Safety`) and a **tabbed** region table split by geography (`Americas`, `Europe`, `Asia Pacific`, `Middle East & Africa` — pivot tabs, not plain Markdown sections), each with its own small region-column table, rather than one nine-column matrix. So "nine-column matrix" became "4 geography tabs × 2 products," and the **per-column headers are now literal Azure region names, not Features** — the rows are named "Guardrail" and list only 7–8 generic guardrail names (`Content harms`, `Prompt shields`, `Protected material`, `Groundedness`, `Task Adherence`, `Content provenance detection`, `Blocklists`, plus `PII` in Foundry only). **Three of the nine existing Feature names have no corresponding row at all** (see §3).

## 2. Anchor resolution — concrete chain

Several first-party feature docs still point at `overview#region-availability` rather than the new `region-availability` page directly (not updated as part of the 2026-09-18 restructure):

| Linking doc                      | Link text found                                                                                                                                    | Target anchor cited            |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `concepts/custom-categories`     | "see [Region availability](../overview#region-availability)" (×2, in both "Language availability" and "Region availability" subsections)           | `overview#region-availability` |
| `how-to/custom-categories-rapid` | "This new feature is only available in select Azure regions. See [Region availability](.../overview#region-availability)" (×2)                     | `overview#region-availability` |
| `concepts/groundedness`          | "Groundedness detection is available in specific Azure regions. See [Region availability](../overview#region-availability) for supported regions." | `overview#region-availability` |
| `quickstart-image`               | "supported region (see [Region availability](.../overview#region-availability))"                                                                   | `overview#region-availability` |
| `quickstart-multimodal`          | "This feature is only available in certain Azure regions. See [Region availability](overview#region-availability)" (×3)                            | `overview#region-availability` |

Because the `overview` page's `### Region availability` heading still exists (anchor not broken) and now itself links onward to `region-availability`, these are **functionally two-hop links that still resolve**, not dead links. But the destination table (§1) does not contain an enumerable row for Custom categories (standard or rapid) or Multimodal at all — so readers following the full chain for those three features land on a page with no feature-specific evidence, only generic prose. This is a content/anchor-fidelity drift, not a link-breakage drift.

## 3. Nine-Feature evidence mapping

Legend: ✅ established with a current, named, enumerable region row; ⚠️ a row exists but is merged with another Feature and cannot be disambiguated; ❌ no row/table evidence exists for this Feature at all on the current page.

| #   | Feature ID                                  | Mapped "Guardrail" row (if any)                   | Status | Current primary evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | ------------------------------------------- | ------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `content-safety-text`                       | "Content harms" (ACS table)                       | ⚠️     | Row is ✅ in all 28 listed ACS regions (see §4). No page states explicitly that "Content harms" = Analyze Text API; the correspondence is inferred from `concepts/harm-categories` describing "harm categories... for both text and image content" and the overview's own "Content analysis" table listing Analyze text under the harm-categories concepts guide. Treat the row↔Feature-name mapping itself as a **terminology inference**, not a verbatim statement.                                                                                                                                                                                                                                                              |
| 2   | `content-safety-image`                      | "Content harms" (ACS table) — same row as #1      | ⚠️     | Same merged row as Analyze text; `concepts/harm-categories` confirms image has its own severity model (0/2/4/6 trimmed scale, distinct from text's 0–7 scale) so the capability is textually distinct, but the region table does **not** give image its own row or carve-out. Previously-documented narrower image-only subset cannot be confirmed or refuted from current primary evidence.                                                                                                                                                                                                                                                                                                                                       |
| 3   | `content-safety-multimodal`                 | —                                                 | ❌     | No "Multimodal" row exists in either Foundry or ACS table. `quickstart-multimodal` only says "This feature is only available in certain Azure regions" and points to the (now non-enumerating) `overview#region-availability` chain. `concepts/harm-categories` confirms a distinct "Image with text" model exists (full 0–7 scale) but gives no region information. **No enumerable region evidence currently exists for this Feature.**                                                                                                                                                                                                                                                                                          |
| 4   | `content-safety-custom-categories-standard` | —                                                 | ❌     | No "Custom categories" row in either table. `concepts/custom-categories` "Region availability" subsection only generically points to `overview#region-availability` (unchanged since the restructure — the concept page's own `ms.date` predates the 2026-09-18 table rewrite). Additional lifecycle caveat: this page carries an **Important** banner — "Custom categories (standard) is retiring on September 1, 2026. Migrate to the Custom text API in Foundry." **No enumerable region evidence currently exists for this Feature**, and the feature is independently flagged for retirement (a separate signal from region-table drift; retirement does not itself confirm or deny current regional support).                |
| 5   | `content-safety-custom-categories-rapid`    | —                                                 | ❌     | No row. `how-to/custom-categories-rapid` states "only available in select Azure regions," pointing to the same non-enumerating chain. **No enumerable region evidence currently exists for this Feature.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 6   | `content-safety-groundedness-detection`     | "Groundedness"                                    | ✅     | Identical row in both Foundry and ACS tables. Enumerated regions (✅ cells only): **Americas** `canadaeast`, `eastus`, `eastus2`, `westus`; **Europe** `swedencentral`, `uksouth`; **Asia Pacific**: none; **Middle East & Africa**: none. Total = 6 regions: `{canadaeast, eastus, eastus2, swedencentral, uksouth, westus}`. `concepts/groundedness` explicitly cross-references this via its own "Region availability" subsection.                                                                                                                                                                                                                                                                                              |
| 7   | `content-safety-prompt-shields`             | "Prompt shields"                                  | ✅     | `concepts/jailbreak-detection` literally describes the API named "Prompt Shields," matching the row name verbatim. ACS table: ✅ in all 28 listed regions (every region column across all 4 geography tabs). See §5 for the precise region list and a discrepancy versus the maintainer's comment.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 8   | `content-safety-protected-material-text`    | "Protected material" (ACS table)                  | ⚠️     | `concepts/protected-material` explicitly names a "protected material text filter" as a distinct sub-capability, but the region table gives only one "Protected material" row, ✅ in all 28 ACS regions. A superset relationship with the old curated text-variant list does not establish support for that variant in the additional regions. Its independent region mapping remains unresolved, just like the code variant.                                                                                                                                                                                                                                                                                                       |
| 9   | `content-safety-protected-material-code`    | "Protected material" (ACS table) — same row as #8 | ⚠️     | `concepts/protected-material` explicitly names a distinct "protected material code filter" (with its own caveat: "the code scanner/indexer is only current through April 6, 2023 — code added to GitHub after this date won't be detected"), but the region table gives it **no separate row or carve-out** from the text variant. The page has **no region-availability subsection at all** (confirmed by reading the full page — "Region availability" doesn't appear anywhere in `concepts/protected-material`). Previously-documented narrower code-only subset (missing 3 regions vs. text) cannot be confirmed from current primary evidence; the merged row neither proves nor disproves that the narrower subset persists. |

## 4. "Content harms" / "Protected material" merged-row full region lists (ACS table, Azure AI Content Safety product)

Both rows read ✅ for every region in every one of the 4 geography tabs. Full enumerated region set (28 total):

- Americas (11): `brazilsouth, canadacentral, canadaeast, centralus, eastus, eastus2, northcentralus, southcentralus, westus, westus2, westus3`
- Europe (10): `francecentral, germanywestcentral, italynorth, polandcentral, spaincentral, swedencentral, switzerlandnorth, switzerlandwest, uksouth, westeurope`
- Asia Pacific (5): `australiaeast, japaneast, koreacentral, southeastasia, southindia`
- Middle East & Africa (2): `southafricanorth, uaenorth`

(Foundry table's "Content harms"/"Protected material" rows are also all-✅, but list a _different_ region set — e.g. Foundry Europe includes `norwayeast` which ACS Europe omits, and Foundry Americas omits `westus2` which ACS Americas includes. This is a genuine Foundry-vs-ACS region-list divergence, consistent with the domain note that Foundry product tables are not interchangeable with standalone Azure AI Content Safety — reported here, not resolved, since the Feature IDs in scope are `content-safety-*`, i.e. the standalone-ACS product line.)

## 5. Prompt Shields region count — published versus Tracked Regions

Maintainer comment asserted: "prompt shields now 27 tracked regions instead of 22 (adds Brazil South, Canada Central, South Africa North, Southeast Asia, Spain Central)."

**The maintainer's count is correct for this repository.** The current ACS "Prompt shields" row is ✅ in **28 published regions**, of which **27 are Tracked Regions**. Switzerland West is deliberately excluded by [ADR-0005](../adr/0005-track-only-self-serve-regions.md). Comparing like-for-like curated, tracked sets:

- Old (repo baseline, 22 regions): `australiaeast, canadaeast, centralus, eastus, eastus2, francecentral, germanywestcentral, italynorth, japaneast, koreacentral, northcentralus, polandcentral, southcentralus, southindia, swedencentral, switzerlandnorth, uaenorth, uksouth, westeurope, westus, westus2, westus3`
- New (ACS table intersected with `REGIONS`, 27 regions): the list in §4 minus `switzerlandwest`.
- Added Tracked Regions (new − old, 5 total): `brazilsouth, canadacentral, southafricanorth, southeastasia, spaincentral`.
- Removed Tracked Regions (old − new): none — the old 22-region curated set is a strict subset of the new 27-region tracked set.

There is no conflict with ADR-0005: an article can document support in an Untracked Region without that region belonging in this repository's facts. Comparing the raw 28-region table against the old 22-region curated set would incorrectly treat the deliberate exclusion as a new tracked addition.

## 6. Processing-location / routing caveats found on the new page

- **ACS table intro:** "When you use Azure AI Content Safety directly, create the resource in the region where you want data processed. Features that support regional processing remain within that region. Some features require global or data zone routing. Although you can enable them in any supported Azure AI Content Safety region, customer data might be routed to and processed outside the resource's region." This is a general disclaimer. Task Adherence has an explicit global-routing footnote, but is outside this issue's nine Features. The absence of a footnote on another row is not sufficient to promise in-region processing or data residency.
- **Foundry table intro:** "Microsoft Foundry supports global, data zone, and regional deployments... Guardrails follow the model or agent deployment configuration: regional deployments keep Guardrails processing in-region, while global deployments use global processing." Foundry's Task Adherence row also carries a footnote (`*Only available in Global, US Datazone, and EU Datazone deployments.`). Again not one of the 9 in-scope Features.
- **Preview/lifecycle caveats relevant to the 9 Features**, confirmed from `overview`'s "Content moderation features" table and the concept pages:
  - Groundedness detection: "(preview)"
  - Custom categories (standard) API: "(preview)"; additionally flagged for retirement 2026-09-01 (`concepts/custom-categories`)
  - Custom categories (rapid) API: "(preview)"
  - Multimodal: "(preview)" per `region-availability`'s "Input limits for Azure AI Content Safety" section ("Analyze multimodal API (preview)")
  - Prompt Shields, Analyze text, Analyze image, Protected material (text/code): the inspected tables do not label these "(preview)". Absence of that label alone is not a verified GA lifecycle statement.

## 7. Which of the nine Feature identities can be preserved from current primary evidence, and which cannot

- **Clear, enumerable row mapping:** `content-safety-prompt-shields`, `content-safety-groundedness-detection` (2 of 9).
- **Distinct API/variant documentation exists, but the inspected current regional tables do not independently establish each variant's region set:** `content-safety-text`, `content-safety-image`, `content-safety-protected-material-text`, `content-safety-protected-material-code` (4 of 9). Their candidate mappings are the broader "Content harms" and "Protected material" rows; accepting those mappings requires an explicit decision or more specific evidence, not a subset inference.
- **No current primary-source region evidence exists at all** (no row, only a generic non-enumerating pointer): `content-safety-multimodal`, `content-safety-custom-categories-standard`, `content-safety-custom-categories-rapid` (3 of 9).

No variant's support was inferred from a broader product/guardrail name in this note; where evidence was insufficient to disambiguate a specific Feature, it is reported as unresolved (⚠️/❌ above) rather than assumed.

## 8. Gaps / follow-ups (bounded; not pursued further per research scope)

- The documentation commit history (e.g. the exact PR that replaced the overview matrix) was not inspected. Only the rendered Learn output was used.
- No Azure portal/API calls were made to cross-check actual regional resource creation availability; this note is documentation-only, per the research objective's bound.
- The terminology correspondence between table row names ("Content harms," "Protected material") and the Feature-level API names (Analyze text/image, Protected material text/code) is not stated verbatim anywhere in the fetched pages; it is the most natural reading but is flagged as an inference about _labeling_, distinct from inferring regional _support_ for an undocumented variant.

---

## 9. Repository impact before reconciliation

These findings describe the checkout before the accepted reconciliation. The line references below are historical, not the subsequently updated metadata. They were traced directly against the repository in parallel with the primary-source research. The watcher blind spot and legacy-baseline fallback were also reproduced with in-memory IO, without fetching pages or changing snapshots.

- `packages/pipeline/src/feature-metadata.ts:314-397` still maps all nine Features to `overview#region-availability`.
- `packages/pipeline/cache/sources/2026-09-21T13-53-07Z/azure-ai-services-content-safety-overview--region-availability.txt:1-3` already snapshots only the link/prose (matches this note's §1 finding).
- `packages/pipeline/src/article-section.ts:28-49` strips HTML tags, including href targets; `:91-102` fetches only the configured page, not linked pages (so the two-hop `overview#region-availability` → `region-availability` chain described in §2 is not followed by the pipeline).
- `packages/pipeline/src/watched-source-drift.ts:78-97` compares extracted text against the stored baseline and reports no drift when equal; reproduced in-memory that the cached pointer text yields no drift and that href-only changes are invisible to this comparison.
- `packages/pipeline/src/feature-metadata.test.ts:393-453` pins the old URL, counts, and shared-baseline relationships; these tests cannot certify current Microsoft support (consistent with §7's findings that several of those counts are now stale or unverifiable from current primary sources).
- `apps/web/src/matrix/buildMatrix.ts:117-121` feeds Feature facts and region filtering together, so stale regions cause false inclusion/exclusion of Deployment Fit.
- `packages/pipeline/src/watched-source-snapshots.ts:49-72` falls back to legacy per-Feature snapshots: changing the URL/anchor while keeping existing Feature IDs, with no explicit new baseline, currently retrieves the June 2026 old matrix rather than null.
- Migration should reconcile mappings/sets, rewrite relevant guards, record the chosen current Watched Source baselines, then emit/sync features as deployment does; it should not simply reset the baseline to silence the issue.
- `.github/workflows/deploy-pages.yml:39-46` regenerates metadata-derived artifacts.
- The issue's `ready-for-human` label remains appropriate due to unresolved Feature semantics (§7 above: 7 of 9 Features lack an independent current regional mapping).
- No runtime code, labels, or baselines were changed as part of this research pass.

## 10. Recommended resolution and acceptance criteria

1. Choose an explicit evidence mapping for all nine existing Feature identities. Preserve a variant only with sufficient current evidence; otherwise decide whether to redefine or retire it. Do not encode an empty region set merely because a documentation row disappeared: under ADR-0003 that would assert global unavailability.
2. For the clear mappings, use the standalone Content Safety section, not the Foundry section. Groundedness changes from France Central to Canada East, keeping the other five regions. Prompt Shields adds the five Tracked Regions in §5, yielding 27.
3. Update the chosen Features' source descriptors, exact curated region sets, and guard tests together. Do not blindly widen `ALL_CONTENT_SAFETY_REGIONS`: it also backs variants whose current mapping is unresolved.
4. Record explicit baselines for the chosen Watched Sources after reconciliation. Account for legacy per-Feature fallback; old snapshots are history, not current variant evidence. Confirm each selected section actually includes the relevant geography tables and caveats.
5. Regenerate and sync `features.json` for the web app. Confirm the revised facts produce the intended Deployment Fit and satisfy the Tracked Region invariant.

The present flat `(feature, region)` contract cannot represent processing location or deployment-routing mode. Treat those as documented limitations, not extra region facts. Adding new guardrails or changing that contract is outside this issue's demonstrated scope and requires a separate decision.

## 11. Accepted reconciliation decisions

The maintainer selected these decisions on 2026-10-12:

- Keep standalone Azure AI Content Safety only; do not substitute or add Foundry-integrated guardrails.
- Replace Analyze Text/Image with `content-safety-content-harms`, and Protected Material Text/Code with `content-safety-protected-material`. These are new guardrail-level questions with new IDs, not aliases for the old API-variant guarantees.
- Retain `content-safety-groundedness-detection` and `content-safety-prompt-shields`.
- Withdraw Multimodal and both Custom Categories variants from publication, recording the evidence/lifecycle reasons and retaining historical snapshots. No empty region sets or replacement Custom text Feature are introduced.
- Keep the meaning of availability as the resource region where a guardrail can be enabled. Disclose processing-location and data-residency limitations rather than extending the fact dimensions.
- Preserve obsolete shared-URL requirements and historical labels. Display an explicit warning and require manual removal or replacement before recommending regions or exporting results.
- Implement these changes together and record the rationale in ADR-0008. No commit or push was requested.

The three broad rows (Content harms, Prompt Shields, Protected material) each cover the
27 Tracked Regions in §5. Groundedness covers Canada East, East US, East US 2, Sweden
Central, UK South, and West US. The standalone section's extraction includes all four
geography tables and the global/data-zone routing caveat; its explicit baseline is
`packages/pipeline/cache/sources/2026-10-12T09-13-43Z/azure-ai-services-content-safety-region-availability--guardrails-in-azure-ai-content-safety.txt`.

Catalog-history metadata is separate from active Features and availability facts. It
exists to explain withdrawn selections, not to assert that a service is retired or to
keep watching a source that no longer supports the old question.
