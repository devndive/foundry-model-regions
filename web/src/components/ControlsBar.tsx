import type { FilterState, SortKey } from "../matrix/buildMatrix";
import type { FilterOptions } from "../filters/options";
import { MultiSelect } from "./MultiSelect";

interface Props {
  filters: FilterState;
  options: FilterOptions;
  onChange: (patch: Partial<FilterState>) => void;
  onExportCsv: () => void;
  onExportMarkdown: () => void;
}

export function ControlsBar({ filters, options, onChange, onExportCsv, onExportMarkdown }: Props) {
  return (
    <div className="controls">
      <select
        className="control"
        value={filters.sku}
        onChange={(e) => onChange({ sku: e.target.value })}
        aria-label="SKU type"
      >
        {options.skus.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <MultiSelect
        label="Models"
        options={options.models}
        groups={options.modelGroups}
        selected={filters.models}
        onChange={(models) => onChange({ models })}
      />
      <MultiSelect
        label="Regions"
        options={options.regions}
        selected={filters.regions}
        onChange={(regions) => onChange({ regions })}
      />
      <MultiSelect
        label="Capabilities"
        options={options.capabilities}
        selected={filters.capabilities}
        onChange={(capabilities) => onChange({ capabilities })}
      />
      <MultiSelect
        label="Geo Group"
        options={options.geoGroups}
        selected={filters.geoGroups}
        onChange={(geoGroups) => onChange({ geoGroups })}
      />
      <MultiSelect
        label="Lifecycle"
        options={options.lifecycles}
        selected={filters.lifecycle}
        onChange={(lifecycle) => onChange({ lifecycle })}
      />

      <button
        type="button"
        className="control"
        onClick={() => onChange({ swapView: !filters.swapView })}
      >
        Swap View
      </button>

      <select
        className="control"
        value={filters.sort}
        onChange={(e) => onChange({ sort: e.target.value as SortKey })}
        aria-label="Sort"
      >
        <option value="default">Sort: Default</option>
        <option value="name">Sort: Name</option>
        <option value="availability">Sort: Availability</option>
      </select>

      <div className="controls-divider" />

      <label className="toggle">
        <input
          type="checkbox"
          checked={filters.gaOnly}
          onChange={(e) => onChange({ gaOnly: e.target.checked })}
        />
        GA only
      </label>
      <label className="toggle">
        <input
          type="checkbox"
          checked={filters.hideDeprecated}
          onChange={(e) => onChange({ hideDeprecated: e.target.checked })}
        />
        Hide deprecated
      </label>
      <label className="toggle">
        <input
          type="checkbox"
          checked={filters.euSovereignOnly}
          onChange={(e) => onChange({ euSovereignOnly: e.target.checked })}
        />
        EU sovereign
      </label>

      <span className="spacer" />

      <button type="button" className="control" onClick={onExportMarkdown}>
        Export to Markdown
      </button>
      <button type="button" className="control control--primary" onClick={onExportCsv}>
        Export to CSV
      </button>
    </div>
  );
}
