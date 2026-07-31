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

test("extractSection keeps an image's alt text, the only mark of a restricted region", () => {
  const html =
    `<h2 id="regions">Regions</h2>` +
    `<table><tr><td><img alt="Icon that shows that access to this region is restricted to support specific customer scenarios, such as disaster recovery within a specific geographic area."> Switzerland West</td></tr></table>` +
    `<h2 id="next">Next</h2>`;

  const text = extractSection(html, "regions");

  assert.equal(
    text,
    "Regions\nIcon that shows that access to this region is restricted to support specific customer scenarios, such as disaster recovery within a specific geographic area. Switzerland West",
  );
});

test("extractSection drops an image with no alt text rather than leaving a stray token", () => {
  const html =
    `<h2 id="regions">Regions</h2>` +
    `<p><img src="/media/spacer.png" data-alt="not alt"> East US 2</p>` +
    `<h2 id="next">Next</h2>`;

  assert.equal(extractSection(html, "regions"), "Regions\nEast US 2");
});

test("extractSection distinguishes a restricted region row from a self-serve one", () => {
  const RESTRICTED_ICON = `<img src="media/icon-region-restricted.svg" alt="Icon that shows that access to this region is restricted to support specific customer scenarios, such as disaster recovery within a specific geographic area." data-linktype="relative-path">`;
  const CHECKMARK = `<img src="media/icon-checkmark.svg" alt="Yes" data-linktype="relative-path">`;
  const row = (zoneCell: string, nameCell: string) =>
    `<tr><td>Switzerland North</td><td>${zoneCell}</td><td>${nameCell} Switzerland West</td></tr>`;

  const restricted = extractSection(
    `<h2 id="regions">Regions</h2><table>${row(CHECKMARK, RESTRICTED_ICON)}</table><h2 id="next">Next</h2>`,
    "regions",
  );
  const selfServe = extractSection(
    `<h2 id="regions">Regions</h2><table>${row(CHECKMARK, "")}</table><h2 id="next">Next</h2>`,
    "regions",
  );

  assert.match(restricted, /Switzerland North Yes Icon that shows that access .* Switzerland West/);
  assert.equal(selfServe, "Regions\nSwitzerland North Yes Switzerland West");
  assert.notEqual(restricted, selfServe);
});

test("extractSection collapses whitespace into clean, comparable lines", () => {
  const messy = `<h2 id="a">Heading</h2><p>line   with\n\textra   space</p><h2 id="b">Next</h2>`;
  const text = extractSection(messy, "a");
  assert.equal(text, "Heading\nline with extra space");
});
