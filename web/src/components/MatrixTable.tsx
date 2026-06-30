import { capabilityBadge, badgeTone } from "../models/badge";
import type { Matrix } from "../matrix/buildMatrix";
import { cellPresentation } from "../matrix/cellPresentation";

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function MatrixTable({ matrix }: { matrix: Matrix }) {
  const cornerLabel = matrix.swapped ? "MODEL" : "REGION";

  if (matrix.columns.length === 0 || matrix.rows.length === 0) {
    return <p className="empty">No data matches the current filters.</p>;
  }

  const rowsAre = matrix.swapped ? "models" : "regions";
  const colsAre = matrix.swapped ? "regions" : "models";
  const caption =
    `Azure AI Foundry model availability. Rows are ${rowsAre}, columns are ${colsAre}. ` +
    `Each cell shows whether the model is generally available, in preview, ` +
    `deprecating, or not available in that region.`;

  return (
    <div
      className="matrix-scroll"
      tabIndex={0}
      role="region"
      aria-label="Model availability matrix"
    >
      <table className="matrix">
        <caption className="matrix-caption">{caption}</caption>
        <thead>
          <tr>
            <th className="corner sticky-col">{cornerLabel}</th>
            {matrix.columns.map((col) => {
              const badge =
                col.kind === "model" && col.model ? capabilityBadge(col.model.capabilities) : "";
              return (
                <th key={col.id} scope="col" className="col-head" title={col.label}>
                  <div className="col-name">{col.label}</div>
                  {col.kind === "model" && col.model && (
                    <>
                      <div className="col-date">{formatDate(col.model.createdAt)}</div>
                      {badge && <span className={`badge ${badgeTone(badge)}`}>{badge}</span>}
                    </>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row, ri) => (
            <tr key={row.id}>
              <th
                scope="row"
                className={`row-head sticky-col${row.region ? ` geo-${row.region.geoGroup}` : ""}`}
                title={row.label}
              >
                {row.label}
              </th>
              {matrix.cells[ri].map((available, ci) => {
                const cell = cellPresentation(available, matrix.cellStatus[ri][ci]);
                return (
                  <td
                    key={matrix.columns[ci].id}
                    className={cell.className}
                    aria-label={cell.label}
                    title={available ? cell.label : undefined}
                  >
                    <span aria-hidden="true">{cell.glyph}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
