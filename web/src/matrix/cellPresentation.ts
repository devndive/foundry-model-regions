export interface CellPresentation {
  className: string;
  glyph: string;
  title: string;
}

const EMPTY: CellPresentation = { className: "cell", glyph: "", title: "" };

export function cellPresentation(available: boolean, status: string | null): CellPresentation {
  if (!available) return EMPTY;

  switch (status) {
    case "Preview":
      return { className: "cell available preview", glyph: "◐", title: "Preview" };
    case "Deprecating":
    case "Deprecated":
      return { className: "cell available deprecating", glyph: "⚠", title: status };
    default:
      return { className: "cell available", glyph: "✓", title: "Generally available" };
  }
}
