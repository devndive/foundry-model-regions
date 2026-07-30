# Track only self-serve regions, and watch the regions list for coverage drift

A **Tracked Region** is one any customer can deploy into without requesting special access.
That single criterion decides `REGIONS`, so Switzerland West — access-by-request — is a
deliberate, indefinite exclusion rather than a gap to be filled, even though several curated
Foundry Feature articles list it. Because `REGIONS` is the *input* to the model fetch rather
than a filter over what the Azure API returns, nothing in the pipeline can ever observe an
untracked region; a **Watched Source** on the Microsoft regions list supplies that missing
signal.

## Status

accepted

## Considered Options

- **Track Switzerland West anyway** — rejected: the matrix would show a region most readers
  cannot actually deploy into, and the model cache would carry entries nobody can use.
- **Leave the exclusion to a code comment, re-checked by hand** — rejected: the only thing
  that ever surfaced Switzerland West was a *feature article* drift issue, which is evidence
  about a feature, not about region access. Every future article listing it would re-open a
  settled question.
- **Probe candidate regions through the ARM API** — rejected: attractive because it is
  machine-verifiable, but it is unverified whether ARM discriminates a non-allowlisted region
  from an empty result, so the check could silently assert the wrong thing.
- **Watch only the Europe section** — rejected in favour of the whole regions list. A diff
  anywhere in that list is genuinely actionable for `REGIONS` coverage, so the watcher is a
  coverage watcher, not a Switzerland West watcher.
- **Encode the region watcher as a pseudo-Feature row** — rejected: it would leak a
  non-feature into `features.json`, the matrix UI, and the closed-world guard test. Instead
  the drift check is generalised to iterate Watched Sources, of which a Feature is one kind.

## Consequences

- A Feature article listing an untracked region is reconciled by intersecting with `REGIONS`
  and recording the reason inline — not by adding the region.
- The exclusion stays invisible in the web app. A disabled or annotated column would need a
  fourth cell state and would contradict the closed-world reading where absent means
  *unavailable*; the app states its scope in copy instead.
- The regions-list Watched Source will open `needs-triage` issues for region changes
  unrelated to Switzerland West. That is the intended cost: today nothing at all tells us
  when Azure adds a region.
