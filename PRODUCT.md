# Product

## Register

product

## Users

Anyone trying to find the region they need to deploy their models with the needed features.
People use the tool to answer the question: *"Given the models
and Foundry features this app needs, which region(s) deliver all of them?"*. This can be during a meeting or to prepare a meeting.
They are technically fluent, time-pressured, and need an answer they can defend, not a pitch. Output can be shared as a filtered URL.

## Product Purpose

A single, trustworthy view that unifies two separately-sourced facts — machine-
verifiable **Model Availability** (from the Azure ARM API) and article-sourced
**Foundry Feature Availability** (from Microsoft Learn) — into one **Deployment Fit**
decision. The matrix lets an advisor build a requirement basket (Features as hard
ANDs, Models as an OR menu of acceptable options) and instantly see the surviving
regions. Success is when an advisor trusts a region recommendation enough to give it
to a customer without re-checking the source portals.

## Brand Personality

Clean, dense, trustworthy. Voice is that of a competent colleague, not a marketer:
precise, plainspoken, never overselling. Three words: **honest, exact, calm.** The
interface should feel like a well-built reference instrument — the data is the hero,
the chrome stays out of the way. Evolving the current look is welcome as long as it
stays clean and trustworthy.

## Anti-references

- **Flashy SaaS landing pages.** No hero gloss, gradient drama, or marketing
  choreography. This is a working tool, not a product page.
- **Spreadsheet dishonesty.** Don't prettify the data into something less scannable
  than a spreadsheet. Density and at-a-glance comparison win over decoration.
- **Color as the only signal.** Geo tints and availability states must never be the
  sole carrier of meaning.

## Design Principles

- **The data is the hero.** Every chrome decision earns its place by making the
  matrix faster to read, or it goes.
- **Trust through provenance.** Make the source and freshness of each fact legible;
  an advisor should be able to see where a claim comes from.
- **Honest density.** Match a spreadsheet's scannability; never trade legibility for
  polish.
- **Answer, don't decorate.** The filtered, surviving-regions result is the product;
  controls exist to reach it fast.
- **Defensible at a glance.** A recommendation should be readable and shareable
  (URL, CSV, Markdown) without losing its meaning.

## Accessibility & Inclusion

Target **WCAG 2.1 AA**. Body and data text must meet 4.5:1 contrast; the muted-gray-
on-tinted-near-white pattern is a known risk in the current palette and should be
audited. **Never rely on color alone** — availability states and geo groups must also
carry a non-color signal (glyph, label, pattern, or text). Region geo tints should be
checked for color-blind safety. Honor `prefers-reduced-motion`; motion here only ever
conveys state, never decorates.
