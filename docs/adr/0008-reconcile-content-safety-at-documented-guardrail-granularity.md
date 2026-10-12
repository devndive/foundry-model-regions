# Reconcile Content Safety at documented guardrail granularity without weakening shared requirements

Microsoft moved the Content Safety regional matrix out of the overview and now documents
broader guardrail rows separately for Foundry and standalone Azure AI Content Safety.
We keep the existing standalone-product scope and use the questions the current
documentation can actually answer, rather than infer independent API-variant support.

## Status

accepted

## Decision

Replace Analyze Text/Image with a new **Content harms** Feature and Protected Material
Text/Code with a new **Protected material** Feature. Retain Groundedness Detection and
Prompt Shields. All four are curated from
[Guardrails in Azure AI Content Safety](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/region-availability#guardrails-in-azure-ai-content-safety),
never the neighboring Foundry tables. They remain flat, closed-world `(feature, region)`
facts, intersected with Tracked Regions under ADR-0005.

Withdraw Multimodal and both Custom Categories variants from publication because the
inspected current documentation does not independently enumerate their regions. Standard
Custom Categories also has a September 1, 2026 retirement notice. Withdrawal does not
assert global unavailability; no empty region sets are published as a substitute for
missing evidence. Historical snapshots remain intact.

New guardrail-level Features receive new IDs. Old shared URLs keep their obsolete
requirements, historical labels, and an explicit warning. No region recommendation or
export is offered until the reader explicitly removes or replaces those requirements.
Automatically aliasing a narrower requirement or dropping an undocumented one would
silently weaken the original Deployment Fit question.

For Content Safety, a Region names the resource location where a guardrail can be enabled,
not a guarantee of processing location or data residency. The source warns about global
and data-zone routing; that limitation stays visible beside selected requirements and
in the data-source explanation. Routing modes and new guardrails are outside this change.

## Considered Options

- Preserve all API variants by copying the broader rows: rejected because this would
  invent independent regional guarantees.
- Add unknown-evidence states: rejected for this reconciliation to retain the flat
  availability contract and avoid a larger matrix/filter redesign.
- Substitute Foundry-integrated guardrails: rejected because the product and region
  coverage differ.
- Automatically migrate shared URLs: rejected because the requirements are not equivalent.

## Consequences

Catalog-history metadata contains labels and withdrawal reasons, but emits no availability
facts and does not create Watched Sources. The selected source receives an explicit new
baseline after reconciliation, rather than treating legacy snapshots as current evidence.
Tests guard exact current region sets, active/withdrawn separation, and the preservation
of obsolete requirements. See the [issue research](../research/0048-content-safety-source-drift.md)
for the dated primary-source evidence.
