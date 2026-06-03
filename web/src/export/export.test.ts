import { describe, it, expect } from "vitest";
import { toCsv } from "./toCsv";
import { toMarkdown } from "./toMarkdown";
import type { Matrix } from "../matrix/buildMatrix";

const matrix: Matrix = {
  swapped: false,
  columns: [
    { id: "m1", label: "gpt-4o", kind: "model" },
    { id: "m2", label: "whisper, v2", kind: "model" },
  ],
  rows: [
    { id: "eastus", label: "East US", kind: "region" },
    { id: "westus", label: "West US", kind: "region" },
  ],
  cells: [
    [true, false],
    [false, true],
  ],
  cellStatus: [
    ["GenerallyAvailable", null],
    [null, "Preview"],
  ],
};

describe("toCsv", () => {
  it("renders the filtered matrix with a Region corner, availability marks, and CSV escaping", () => {
    const csv = toCsv(matrix);
    const lines = csv.trim().split("\n");

    expect(lines[0]).toBe('Region,gpt-4o,"whisper, v2"');
    expect(lines[1]).toBe("East US,yes,no");
    expect(lines[2]).toBe("West US,no,yes");
  });

  it("uses Model as the corner label when swapped", () => {
    const csv = toCsv({ ...matrix, swapped: true });
    expect(csv.split("\n")[0].startsWith("Model,")).toBe(true);
  });
});

describe("toMarkdown", () => {
  it("renders a GitHub markdown table of the filtered matrix", () => {
    const md = toMarkdown(matrix);
    const lines = md.trim().split("\n");

    expect(lines[0]).toBe("| Region | gpt-4o | whisper, v2 |");
    expect(lines[1]).toBe("| --- | --- | --- |");
    expect(lines[2]).toBe("| East US | yes | no |");
    expect(lines[3]).toBe("| West US | no | yes |");
  });
});
