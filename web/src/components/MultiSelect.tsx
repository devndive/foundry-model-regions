import { useEffect, useId, useRef, useState } from "react";
import type { Option } from "../filters/options";

interface Props {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export function MultiSelect({ label, options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  const summary = selected.length === 0 ? label : `${label} (${selected.length})`;

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
          {selected.length > 0 && (
            <button type="button" className="multiselect-clear" onClick={() => onChange([])}>
              Clear
            </button>
          )}
          {options.map((opt) => (
            <label key={opt.value} className="multiselect-option">
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
