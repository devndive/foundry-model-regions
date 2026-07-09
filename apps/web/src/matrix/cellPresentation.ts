export interface CellPresentation {
  className: string;
  glyph: string;
  /** Human-readable accessible name for the cell (also used as the sighted tooltip). */
  label: string;
}

const EMPTY: CellPresentation = { className: "cell", glyph: "", label: "Not available" };

export function cellPresentation(available: boolean, status: string | null): CellPresentation {
  if (!available) return EMPTY;

  switch (status) {
    case "Preview":
      return { className: "cell available preview", glyph: "◐", label: "Preview" };
    case "Deprecating":
    case "Deprecated":
      return { className: "cell available deprecating", glyph: "⚠", label: status };
    default:
      return { className: "cell available", glyph: "✓", label: "Generally available" };
  }
}
