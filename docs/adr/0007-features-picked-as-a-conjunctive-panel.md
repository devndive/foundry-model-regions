# Pick Foundry Features in a conjunctive panel over a curated Group taxonomy

The Features control is an **inline expanding panel** — a standing "Region must support A AND
B" strip plus one fieldset column per **Feature Group**, all 38 Features visible at once —
rather than a grouped dropdown. Group membership is a **curated, required `group` field** on
`Feature`, not derived from the source article. Both choices exist for the same reason:
Features are AND'd (every one is a hard requirement), so no affordance may imply "select this
whole group", and the taxonomy must survive Microsoft editing their headings.

## Status

accepted

## Considered Options

- **Pass `groups` to the Features `MultiSelect`** — rejected: `toggleGroup` selects every value
  in the group. That reads correctly for Models (OR'd — "any OpenAI model is fine") and
  inverts for Features (AND'd — "require all 15 Agent Tools at once"), collapsing the region
  set to an intersection nobody asked for.
- **A header-only `OptionGroup` variant of `MultiSelect`** — rejected: it removes the wrong
  affordance while keeping the wrong container. 38 entries in a 300px scrolling menu are still
  a scroll, and `MultiSelect` grows a second layout whose `searchable` × `groups` × header-only
  prop matrix serves exactly one caller. `MultiSelect` is left untouched instead, which makes
  "Models grouping is unchanged" true by construction rather than by test.
- **Deriving the taxonomy from `sourceUrl` + `sectionAnchor`** — rejected: it routes the 15
  Agent Tools off `sectionAnchor.startsWith("tool-support")`, a heading slug Microsoft owns.
  A drift fix that correctly updates that anchor would silently refile all 15 tools under
  Foundry Agents with every test still green. It also cannot express the judgement calls: that
  `ai-red-teaming-agent` belongs beside `evaluations-ai-red-teaming`, or that
  `agents-grounding-bing-search-private-network` is an Agents concern rather than a Networking
  one.
- **A curated `shortName` per Feature** for the in-column labels — rejected as a field too far.
  Columns strip everything before the first `" — "` instead, reusing the separator
  `DataInfo.collapseLabels` already parses.
- **Making Features `searchable`, as Models became in #16** — rejected: search earns its place
  against ~120 models in a scrolling menu. With all 38 Features on screen in six labelled
  columns it filters a list the reader can already see, and empties columns out from under
  them. Revisit if Features pass ~60–70, or any single Group passes ~20.

## Consequences

- A **Feature Group is a subject area, not an article.** Evaluation deliberately spans two
  Watched Sources so both red-teaming Features sit together. Article provenance is carried
  per-Feature by `sourceUrl` and surfaced by `DataInfo`, never by the Group.
- `group` is **required**, so adding Feature #39 without filing it is a type error at the
  moment the curator has the article open. The one failure the compiler can't catch — a union
  member left behind after its last Feature moves — is covered by a whole-set invariant test in
  `feature-metadata.test.ts`, alongside the existing closed-world region guard.
- The requirement strip stands whether the panel is open or closed, because the panel is tall
  enough that the working loop is open → tick → close → read the matrix. Collapsing must not
  take the requirement off screen with it.
- The Features control no longer looks like its five dropdown siblings. That asymmetry is the
  price of the AND/OR distinction being visible instead of implied.
- Uniform `" — "` stripping leaves `AI Red Teaming Agent` next to `AI Red Teaming` in the
  Evaluation column. Accepted: they are adjacent, so the distinction is at least visible, and
  chips in the strip always render the full `displayName`.
