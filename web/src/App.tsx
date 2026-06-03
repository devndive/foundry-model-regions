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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Foundry Model Regional Availability</h1>
      </header>

      <KpiCards
        items={[
          { label: "MODELS", value: modelCount },
          { label: "REGIONS", value: regionCount },
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
