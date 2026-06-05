import { useMemo } from "react";
import type { AvailabilityIndex } from "./data/index";
import type { FilterState } from "./matrix/buildMatrix";
import { buildMatrix } from "./matrix/buildMatrix";
import { buildOptions } from "./filters/options";
import { resolveSku } from "./filters/resolveSku";
import { ControlsBar } from "./components/ControlsBar";
import { MatrixTable } from "./components/MatrixTable";
import { Legend } from "./components/Legend";
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
  const matrix = useMemo(() => buildMatrix(index, effectiveFilters), [index, effectiveFilters]);

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

      <ControlsBar
        filters={effectiveFilters}
        options={options}
        onChange={onFiltersChange}
        onExportCsv={() => download("foundry-availability.csv", toCsv(matrix), "text/csv")}
        onExportMarkdown={() =>
          download("foundry-availability.md", toMarkdown(matrix), "text/markdown")
        }
      />

      <Legend />
      <MatrixTable matrix={matrix} />
    </div>
  );
}
