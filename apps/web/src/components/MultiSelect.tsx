import { useEffect, useId, useRef, useState } from "react";
import type { Option, OptionGroup } from "../filters/options";

interface Props {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
  groups?: OptionGroup[];
  searchable?: boolean;
}

export function MultiSelect({ label, options, selected, onChange, groups, searchable }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuId = useId();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
    else if (searchable) searchRef.current?.focus();
  }, [open, searchable]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const toggleGroup = (group: OptionGroup) => {
    const allSelected = group.values.every((v) => selected.includes(v));
    if (allSelected) {
      onChange(selected.filter((v) => !group.values.includes(v)));
    } else {
      const groupSet = new Set(group.values);
      onChange([...selected.filter((v) => !groupSet.has(v)), ...group.values]);
    }
  };

  const summary = selected.length === 0 ? label : `${label} (${selected.length})`;

  const term = query.trim().toLowerCase();
  const visibleOptions =
    searchable && term ? options.filter((o) => o.label.toLowerCase().includes(term)) : options;

  return (
    <div
      className="multiselect"
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          close();
        }
      }}
    >
      <button
        type="button"
        className="control"
        ref={triggerRef}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {summary} <span className="caret">▾</span>
      </button>
      {open && (
        <div className="multiselect-menu" id={menuId} role="group" aria-label={label}>
          {searchable && (
            <input
              ref={searchRef}
              type="text"
              role="searchbox"
              className="multiselect-search"
              placeholder={`Search ${label.toLowerCase()}…`}
              aria-label={`Search ${label}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          )}
          {groups && groups.length > 0 && (
            <div className="multiselect-groups">
              {groups.map((group) => {
                const active = group.values.every((v) => selected.includes(v));
                return (
                  <button
                    key={group.value}
                    type="button"
                    className={active ? "multiselect-group is-active" : "multiselect-group"}
                    aria-pressed={active}
                    onClick={() => toggleGroup(group)}
                  >
                    {group.label}
                  </button>
                );
              })}
            </div>
          )}
          {selected.length > 0 && (
            <button type="button" className="multiselect-clear" onClick={() => onChange([])}>
              Clear
            </button>
          )}
          {visibleOptions.map((opt) => (
            <label key={opt.value} className="multiselect-option">
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
              />
              {opt.label}
            </label>
          ))}
          {searchable && term && visibleOptions.length === 0 && (
            <div className="multiselect-empty">No matching {label.toLowerCase()}</div>
          )}
        </div>
      )}
    </div>
  );
}
