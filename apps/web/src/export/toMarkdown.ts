import type { Matrix } from "../matrix/buildMatrix";

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|");
}

export function toMarkdown(matrix: Matrix): string {
  const corner = matrix.swapped ? "Model" : "Region";
  const headerLabels = [corner, ...matrix.columns.map((c) => c.label)].map(escapeCell);
  const header = `| ${headerLabels.join(" | ")} |`;
  const separator = `| ${headerLabels.map(() => "---").join(" | ")} |`;
  const rows = matrix.rows.map((row, ri) => {
    const cells = matrix.cells[ri].map((available) => (available ? "yes" : "no"));
    return `| ${[escapeCell(row.label), ...cells].join(" | ")} |`;
  });
  return [header, separator, ...rows].join("\n") + "\n";
}
