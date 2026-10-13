# An attempt to help to choose the right region for your app

When selecting a region to deploy your agent to, you need to make a decsion based on the model you want to use and which features you need.

This matrix is bringing together features and models to help you make that decision.

At this point in time there are multiple approaches to visualize and help you select the best region:

- https://model-availability.azurewebsites.net/
- https://foundry-models.azurewebsites.net/
- https://jubilant-memory-jzjn29p.pages.github.io/foundry-offers/areas/regional-strategy/data/foundry-regional-model-availability-matrix.html

## Keeping the data up to date

### Models / Regions

I am using the data provided by the az cli

Every day, the model chache is updated if there are any changes. Changes get pushed automatically.

### Features

Hand-curated from Microsoft Learn articles. The web app links to the sources; the
weekly watcher detects documentation changes but never automatically edits regional facts.

Every week the websites get queried and checked if they changed.

If so, an issue will be created that has to be reviewed manually.

**Voice-based agents (preview)** represents regional eligibility in 27 Tracked
Regions, excluding Poland Central and Spain Central from the base Foundry Agents
region set. The selected model and channel must also have the required Voice Live
capabilities; a regional match is not a guarantee that every combination works.

General **Managed Virtual Network** availability follows the Foundry Agents **Private
VNet** region set. The managed-network article separately documents a narrower region
list for the new Agent service, Responses API, and new Foundry portal; the Feature's
availability note distinguishes that combination from general managed-network support.
Drift in the Private VNet table also prompts manual reconciliation of Managed Virtual
Network, which retains its own article provenance.

Content Safety entries describe **standalone Azure AI Content Safety guardrail-level
availability in resource regions**, not independent API-variant region sets or a
guarantee of in-region processing or data residency. Features without defensible current
regional evidence are withdrawn from the published catalog, not marked unavailable
everywhere. Shared URLs retain withdrawn requirements with a warning until the reader
explicitly removes or replaces them. See
[ADR-0008](docs/adr/0008-reconcile-content-safety-at-documented-guardrail-granularity.md).
