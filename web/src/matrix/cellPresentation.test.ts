import { describe, it, expect } from "vitest";
import { cellPresentation } from "./cellPresentation";

describe("cellPresentation", () => {
  it("renders nothing for unavailable cells", () => {
    expect(cellPresentation(false, "Preview")).toEqual({
      className: "cell",
      glyph: "",
      label: "Not available",
    });
  });

  it("renders a green check for generally available models", () => {
    const cell = cellPresentation(true, "GenerallyAvailable");
    expect(cell.className).toBe("cell available");
    expect(cell.glyph).toBe("✓");
    expect(cell.label).toBe("Generally available");
  });

  it("treats unknown-but-available status as generally available", () => {
    expect(cellPresentation(true, null).className).toBe("cell available");
  });

  it("marks preview models with a distinct glyph and class, not color alone", () => {
    const cell = cellPresentation(true, "Preview");
    expect(cell.className).toBe("cell available preview");
    expect(cell.glyph).toBe("◐");
    expect(cell.label).toBe("Preview");
  });

  it("marks deprecating and deprecated models with a warning glyph", () => {
    expect(cellPresentation(true, "Deprecating").className).toBe("cell available deprecating");
    expect(cellPresentation(true, "Deprecating").glyph).toBe("⚠");
    expect(cellPresentation(true, "Deprecated").className).toBe("cell available deprecating");
  });
});
