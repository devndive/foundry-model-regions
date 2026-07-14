# Context Glossary

The shared language of this project. Implementation lives in code; this file only
defines terms and the distinctions that matter.

## Model Availability Fact

A statement that a given **Model** can be deployed in a given **Region** under a given
**SKU**. The unit of the existing models pipeline: `(modelId, region, sku)`. Sourced from
the Azure ARM API and therefore machine-verifiable.

## Foundry Feature

A capability of Microsoft Foundry that is **not** a model — e.g. AI Red Teaming Agent,
Foundry Agents, Hosted Agents. Whether a feature works depends on the region.

A **sub-feature** (e.g. a Hosted Agents *protocol* like Invocations (WebSocket), whose
availability is documented independently of its parent) is modelled as its own first-class
Feature with its own region list — there is no nested feature hierarchy.

> Deliberately called a **Feature**, never a "capability", because `capabilities` already
> names the boolean flags on a Model in the models pipeline. The two must not be conflated.

## Feature Availability Fact

A statement that a **Foundry Feature** is available in a **Region**: a closed-world
`(feature, region)` pair. There is **no** model dimension — none of the source articles
key availability on a specific model; the only extra axis observed (Hosted Agents
protocols) is handled by promoting sub-features to first-class Features.

Closed-world: a tracked Region not listed by the feature's article is treated as
**unavailable** for that feature, not "unknown".

Unlike a Model Availability Fact, it is **not** API-derivable — its truth lives in
Microsoft Learn articles, not in an Azure endpoint.

## Deployment Fit

The question the unified view exists to answer: *"Given the set of Models and Foundry
Features my application needs, which Region(s) give me all of them?"* Model Availability
Facts and Feature Availability Facts are kept as **separate artifacts** (`models.json`,
`features.json`) but are presented in **one** view so a developer can pick a single
Foundry deployment region that satisfies their whole requirement basket.

A Region survives the basket when it has **every** selected Feature (AND — each is a hard
requirement) and **at least one** of the selected Models (OR). Models are OR rather than AND
because a Model selection is usually a *menu of acceptable options* (e.g. picking the whole
"OpenAI" group means "any OpenAI model is fine"), not a demand that every chosen Model
coexist in one Region — which almost no Region satisfies. Surviving Region columns then keep
only the Model rows actually present in at least one of them.
