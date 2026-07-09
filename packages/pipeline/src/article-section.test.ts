import assert from "node:assert/strict";
import { test } from "node:test";
import { extractSection } from "./article-section.js";

// A trimmed-down shape of a Microsoft Learn article: headings carry stable
// `id`s, content is a mix of prose and a region table.
const ARTICLE = `
<main>
  <h1 id="title">Some Feature</h1>
  <p>Intro paragraph that should not appear in a subsection slice.</p>
  <h2 id="region-availability">Region availability</h2>
  <p>This feature is available in the following regions:</p>
  <ul>
    <li>East US 2</li>
    <li>Sweden Central</li>
  </ul>
  <h3 id="notes">Notes</h3>
  <p>A nested subsection that belongs to region availability.</p>
  <h2 id="pricing">Pricing</h2>
  <p>Pricing details that must be excluded from the region slice.</p>
</main>
`;

test("extractSection slices from the anchored heading to the next same-or-higher heading", () => {
  const text = extractSection(ARTICLE, "region-availability");

  assert.match(text, /Region availability/);
  assert.match(text, /East US 2/);
  assert.match(text, /Sweden Central/);
  // The nested h3 subsection is part of the slice...
  assert.match(text, /A nested subsection/);
  // ...but the following h2 (Pricing) and the preceding intro are not.
  assert.doesNotMatch(text, /Pricing details/);
  assert.doesNotMatch(text, /Intro paragraph/);
});

test("extractSection on a deeper heading stops at the next sibling heading", () => {
  const text = extractSection(ARTICLE, "notes");
  assert.match(text, /A nested subsection/);
  assert.doesNotMatch(text, /Pricing details/);
  assert.doesNotMatch(text, /East US 2/);
});

test("extractSection throws loudly when the anchor does not resolve", () => {
  assert.throws(
    () => extractSection(ARTICLE, "vanished-section"),
    /Section anchor "vanished-section" did not resolve/,
  );
});

test("extractSection collapses whitespace into clean, comparable lines", () => {
  const messy = `<h2 id="a">Heading</h2><p>line   with\n\textra   space</p><h2 id="b">Next</h2>`;
  const text = extractSection(messy, "a");
  assert.equal(text, "Heading\nline with extra space");
});
