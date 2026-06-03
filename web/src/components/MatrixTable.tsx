import { capabilityBadge, badgeTone } from "../models/badge";
import type { Matrix } from "../matrix/buildMatrix";

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

  return (
    <div className="matrix-scroll">
      <table className="matrix">
        <thead>
          <tr>
            <th className="corner sticky-col">{cornerLabel}</th>
            {matrix.columns.map((col) => {
              const badge =
                col.kind === "model" && col.model
                  ? capabilityBadge(col.model.capabilities)
                  : "";
              return (
                <th key={col.id} className="col-head" title={col.label}>
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
                className={`row-head sticky-col${row.region ? ` geo-${row.region.geoGroup}` : ""}`}
                title={row.label}
              >
                {row.label}
              </th>
              {matrix.cells[ri].map((available, ci) => (
                <td
                  key={matrix.columns[ci].id}
                  className={available ? "cell available" : "cell"}
                >
                  {available ? "✓" : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
