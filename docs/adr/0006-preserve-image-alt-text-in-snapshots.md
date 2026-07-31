# Preserve an image's alt text when extracting a Watched Source section

The snapshot extractor (`article-section.ts`) turns a Watched Source's HTML into comparable
text, and until now it stripped every tag — including `<img>`. On the Microsoft regions list
that erases the only mark of restricted access: a region a customer must request is flagged
by an icon and nothing else, so Switzerland West's row extracted byte-identically to a
self-serve region's row. A restricted → self-serve flip — the exact event that would overturn
ADR-0005 — would produce no diff and no drift at all. `htmlToText` therefore emits an image's
`alt` text inline, as if it were the content it stands in for.

## Status

accepted

## Considered Options

- **Emit the image's `src` filename instead** — rejected: more compact and equally
  discriminating today, but it couples snapshot text to asset paths. A CDN move or an icon
  rename would read as region drift while telling a triager nothing, and the failure is
  silent in the other direction too: reusing one icon file for two meanings would erase the
  distinction again.
- **Emit a fixed marker per known icon** (e.g. `[restricted]`) — rejected: it needs a
  per-article lookup table of icons, which is the semantic extraction ADR-0002 rejected. The
  publisher already authored the meaning in `alt`; a table would go stale against it.
- **Keep stripping images and read restricted access some other way** — rejected: the
  alternatives are an ARM probe (rejected in ADR-0005 as unverified) or a human re-checking
  the list by hand, which is the rot the drift check exists to prevent.
- **Emit `alt` only for images inside tables** — rejected: a narrower rule with no upside.
  Prose images carry meaning too, and the exception would have to be explained forever.

## Consequences

- An image with no `alt` contributes nothing, not a placeholder token: an undescribed image
  is chrome, and inventing a marker for it would make decorative images churn the snapshot.
- The extracted text of every Watched Source containing an image changes, so those baselines
  must be refetched and committed with the change. Doing so silently absorbs any genuine
  drift accumulated since the last snapshot, so the pull request that lands such a change
  enumerates every hunk in the snapshot diff that is _not_ an alt-text insertion, and drift
  is ruled on at review rather than swallowed.
- Alt text is prose written for screen readers, so it is wordier than what it replaces and a
  rewording of an icon's description will open a drift issue that changes no region. That is
  the accepted cost of not parsing the page.
