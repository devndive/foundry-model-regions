import type { Matrix } from "../matrix/buildMatrix";

function escapeCsv(value: string): string {
  // Neutralize CSV formula injection: cells starting with =, +, -, @, or a
  // leading tab/carriage return are treated as formulas by Excel/Sheets.
  const neutralized = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  if (/[",\n]/.test(neutralized)) {
    return `"${neutralized.replace(/"/g, '""')}"`;
  }
  return neutralized;
}

export function toCsv(matrix: Matrix): string {
  const corner = matrix.swapped ? "Model" : "Region";
  const header = [corner, ...matrix.columns.map((c) => c.label)].map(escapeCsv).join(",");
  const rows = matrix.rows.map((row, ri) => {
    const cells = matrix.cells[ri].map((available) => (available ? "yes" : "no"));
    return [escapeCsv(row.label), ...cells].join(",");
  });
  return [header, ...rows].join("\n") + "\n";
}
