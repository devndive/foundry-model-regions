// Extracts the stable, region-relevant text slice of a Microsoft Learn article:
// everything from the heading carrying `sectionAnchor` (its `id`) up to the next
// heading of the same or higher level. The drift check compares this slice as
// opaque text (ADR-0002) — it deliberately does not parse a region set.

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// A sentinel for intended line breaks (block boundaries), kept distinct from
// raw source newlines so the latter collapse to spaces like any other run of
// HTML whitespace.
const LINE_BREAK = "\u0000";

function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|tr|table|ul|ol|section|article)>/gi, LINE_BREAK)
    .replace(/<br\s*\/?>/gi, LINE_BREAK)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .split(LINE_BREAK)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

export function extractSection(html: string, anchor: string): string {
  const headingOpen = new RegExp(
    `<h([1-6])\\b[^>]*\\bid=["']${escapeRegExp(anchor)}["'][^>]*>`,
    "i",
  );
  const match = headingOpen.exec(html);
  if (!match) {
    throw new Error(`Section anchor "${anchor}" did not resolve in the article.`);
  }

  const level = Number(match[1]);
  const bodyStart = match.index + match[0].length;
  const rest = html.slice(bodyStart);
  const nextHeading = new RegExp(`<h[1-${level}]\\b`, "i").exec(rest);

  const sectionHtml = nextHeading
    ? html.slice(match.index, bodyStart + nextHeading.index)
    : html.slice(match.index);

  return htmlToText(sectionHtml);
}

export async function fetchArticleSection(
  sourceUrl: string,
  sectionAnchor: string,
): Promise<string> {
  const response = await fetch(sourceUrl, {
    headers: { "User-Agent": "foundry-model-regions-drift-check" },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${sourceUrl}: HTTP ${response.status}`);
  }
  const html = await response.text();
  return extractSection(html, sectionAnchor);
}
