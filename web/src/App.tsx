import { useMemo } from "react";
import type { AvailabilityIndex } from "./data/index";
import type { FilterState } from "./matrix/buildMatrix";
import { buildMatrix } from "./matrix/buildMatrix";
import { buildOptions } from "./filters/options";
import { resolveSku } from "./filters/resolveSku";
import { ControlsBar } from "./components/ControlsBar";
import { MatrixTable } from "./components/MatrixTable";
import { KpiCards } from "./components/KpiCards";
import { toCsv } from "./export/toCsv";
import { toMarkdown } from "./export/toMarkdown";
import { download } from "./export/download";

interface Props {
  index: AvailabilityIndex;
  filters: FilterState;
  onFiltersChange: (patch: Partial<FilterState>) => void;
}

export function App({ index, filters, onFiltersChange }: Props) {
  const options = useMemo(() => buildOptions(index), [index]);
  const effectiveFilters = useMemo(
    () => ({ ...filters, sku: resolveSku(filters.sku, options.skus) }),
    [filters, options.skus],
  );
  const matrix = useMemo(
    () => buildMatrix(index, effectiveFilters),
    [index, effectiveFilters],
  );

  const modelCount = matrix.swapped ? matrix.rows.length : matrix.columns.length;
  const regionCount = matrix.swapped ? matrix.columns.length : matrix.rows.length;

  const modelItems = matrix.swapped ? matrix.rows : matrix.columns;
  const now = Date.now();
  const DAY = 86_400_000;
  let newCount = 0;
  let retiringCount = 0;
  for (const item of modelItems) {
    const m = item.model;
    if (!m) continue;
    if (m.createdAt) {
      const created = new Date(m.createdAt).getTime();
      if (!Number.isNaN(created) && now - created <= 7 * DAY && created <= now) newCount += 1;
    }
    if (m.deprecation.inference) {
      const retire = new Date(m.deprecation.inference).getTime();
      if (!Number.isNaN(retire) && retire >= now && retire - now <= 90 * DAY) retiringCount += 1;
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
        <h1>Foundry Model Regional Availability</h1>
      </header>

      <KpiCards
        items={[
          { label: "MODELS", value: modelCount, tone: "blue" },
          { label: "REGIONS", value: regionCount, tone: "green" },
          { label: "NEW (7D)", value: newCount, tone: "blue" },
          { label: "RETIRING ≤90D", value: retiringCount, tone: "amber" },
        ]}
      />

      <ControlsBar
        filters={effectiveFilters}
        options={options}
        onChange={onFiltersChange}
        onExportCsv={() => download("foundry-availability.csv", toCsv(matrix), "text/csv")}
        onExportMarkdown={() =>
          download("foundry-availability.md", toMarkdown(matrix), "text/markdown")
        }
      />

      <MatrixTable matrix={matrix} />
    </div>
  );
}
