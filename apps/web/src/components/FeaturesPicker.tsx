import { useEffect, useId, useRef, useState } from "react";
import type { WithdrawnFeature } from "@foundry/data-types";
import type { FeatureOption, FeatureOptionGroup } from "../filters/options";

interface Props {
  groups: FeatureOptionGroup[];
  features: FeatureOption[];
  withdrawnFeatures?: readonly WithdrawnFeature[];
  selected: string[];
  onChange: (next: string[]) => void;
}

// Features are AND'd: every one picked is another thing the Region must support.
// So this picker is not a Models-style dropdown with group toggles — there is no
// "select this whole group", and the conjunction is spelled out in a standing
// strip that survives collapsing the panel. See docs/adr/0007-*.md.
export function FeaturesPicker({
  groups,
  features,
  withdrawnFeatures = [],
  selected,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  // The panel is in-flow content, not an overlay, so a click elsewhere leaves it
  // standing. Escape is the one way out, and it is bound at the document because
  // the trigger sits outside the panel it opens.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const fullName = (value: string) =>
    features.find((f) => f.value === value)?.label ??
    withdrawnFeatures.find((f) => f.id === value)?.displayName ??
    value;
  const unlisted = selected.filter((value) => !features.some((f) => f.value === value));
  const notes = new Map<string, string>();
  for (const feature of features) {
    if (selected.includes(feature.value) && feature.availabilityNote) {
      notes.set(feature.availabilityNote, feature.sourceUrl);
    }
  }
  const summary = selected.length === 0 ? "Features" : `Features (${selected.length})`;

  return (
    <>
      <button
        type="button"
        className="control"
        ref={triggerRef}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {summary} <span className="caret">{open ? "▴" : "▾"}</span>
      </button>

      {selected.length > 0 && (
        <div className="features-requirements" role="group" aria-label="Feature requirements">
          <span className="features-requirements-lead">Region must support</span>
          {selected.map((value, i) => (
            <span key={value} className="features-chip">
              {i > 0 && <span className="features-conjunction">AND</span>}
              <button
                type="button"
                className="features-chip-remove"
                aria-label={`Remove requirement ${fullName(value)}`}
                onClick={() => toggle(value)}
              >
                {fullName(value)}
                {unlisted.includes(value) && (
                  <span className="features-chip-status">
                    {withdrawnFeatures.some((feature) => feature.id === value)
                      ? "no longer tracked"
                      : "not in catalog"}
                  </span>
                )}
                <span aria-hidden="true">×</span>
              </button>
            </span>
          ))}
        </div>
      )}

      {unlisted.length > 0 && (
        <div className="features-warning" role="alert">
          <strong>Some required Features are not in the current catalog.</strong>
          <p>
            These requirements have not been removed or replaced. No matching regions can be
            recommended until you explicitly remove them or choose current replacements.
          </p>
          <ul>
            {unlisted.map((value) => (
              <li key={value}>
                <strong>{fullName(value)}:</strong>{" "}
                {withdrawnFeatures.find((f) => f.id === value)?.reason ??
                  "This Feature is not in the current catalog."}
              </li>
            ))}
          </ul>
        </div>
      )}

      {[...notes].map(([note, sourceUrl]) => (
        <p className="features-note" key={note}>
          {note}{" "}
          <a href={sourceUrl} target="_blank" rel="noreferrer">
            Regional availability source
          </a>
        </p>
      ))}

      {open && (
        <div className="features-panel" id={panelId}>
          {groups.map((group) => (
            <fieldset key={group.id} className="features-group">
              <legend className="features-group-legend">
                {group.label} ({group.options.length})
              </legend>
              {group.options.map((option) => (
                <label key={option.value} className="features-option">
                  <input
                    type="checkbox"
                    checked={selected.includes(option.value)}
                    onChange={() => toggle(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>
          ))}
        </div>
      )}
    </>
  );
}
