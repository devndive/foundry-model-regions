import type { AvailabilityIndex } from "../data/index";
import type { FeatureGroup } from "@foundry/data-types";

export interface Option {
  value: string;
  label: string;
}

export interface OptionGroup {
  value: string;
  label: string;
  values: string[];
}

// A Feature Group ready to render: its reading label and its member Features in
// curated order, each labelled with the qualifier the group already states
// stripped off. Unlike OptionGroup it carries no `values` roll-up — Features are
// AND'd, so there is nothing sensible to select a whole group with (ADR-0007).
export interface FeatureOptionGroup {
  id: FeatureGroup;
  label: string;
  options: Option[];
}

export interface FilterOptions {
  skus: Option[];
  geoGroups: Option[];
  lifecycles: Option[];
  capabilities: Option[];
  models: Option[];
  modelGroups: OptionGroup[];
  regions: Option[];
  features: Option[];
  featureGroups: FeatureOptionGroup[];
}

const PROVIDER_GROUPS = ["OpenAI", "Anthropic"];

// Reading labels for the Feature Groups. Ordered: the array position is the
// order the columns appear in, running from what a Foundry Agent is built from
// down to what surrounds it.
const FEATURE_GROUPS: { id: FeatureGroup; label: string }[] = [
  { id: "foundry-agents", label: "Foundry Agents" },
  { id: "agent-tools", label: "Agent Tools" },
  { id: "hosted-agents", label: "Hosted Agents" },
  { id: "content-safety", label: "Content Safety" },
  { id: "evaluation", label: "Evaluation" },
  { id: "networking", label: "Networking" },
];

// Display names read "Qualifier — Specific". Inside a group column the qualifier
// is already in the legend, so the column shows the specific half. Split on the
// first separator only, so a specific carrying its own dash survives whole.
const FEATURE_LABEL_SEPARATOR = " — ";

function shortFeatureLabel(displayName: string): string {
  const separatorIndex = displayName.indexOf(FEATURE_LABEL_SEPARATOR);
  return separatorIndex === -1
    ? displayName
    : displayName.slice(separatorIndex + FEATURE_LABEL_SEPARATOR.length);
}

// Human-readable labels for the geography groups, mirroring the tab names in the
// Microsoft reliability regions list.
const GEO_GROUP_LABELS: Record<string, string> = {
  americas: "Americas",
  europe: "Europe",
  "middle-east": "Middle East",
  africa: "Africa",
  "asia-pacific": "Asia Pacific",
};

function distinct(values: string[]): string[] {
  return [...new Set(values)].filter((v) => v.length > 0).sort();
}

function buildModelGroups(index: AvailabilityIndex): OptionGroup[] {
  return PROVIDER_GROUPS.map((provider) => ({
    value: provider,
    label: provider,
    values: index.models.filter((m) => m.format === provider).map((m) => m.id),
  })).filter((group) => group.values.length > 0);
}

function buildFeatureGroups(index: AvailabilityIndex): FeatureOptionGroup[] {
  return FEATURE_GROUPS.map(({ id, label }) => ({
    id,
    label,
    options: index.features
      .filter((f) => f.group === id)
      .map((f) => ({ value: f.id, label: shortFeatureLabel(f.displayName) })),
  })).filter((group) => group.options.length > 0);
}

export function buildOptions(index: AvailabilityIndex): FilterOptions {
  const lifecycles = distinct(
    index.models.map((m) => m.lifecycleStatus ?? "").filter((s) => s.length > 0),
  );
  const capabilities = distinct(index.models.flatMap((m) => m.capabilities));
  const geoGroups = distinct(index.regions.map((r) => r.geoGroup));

  return {
    skus: index.skus.map((s) => ({ value: s, label: s })),
    geoGroups: geoGroups.map((g) => ({ value: g, label: GEO_GROUP_LABELS[g] ?? g })),
    lifecycles: lifecycles.map((l) => ({ value: l, label: l })),
    capabilities: capabilities.map((c) => ({ value: c, label: c })),
    models: index.models.map((m) => ({ value: m.id, label: `${m.name} (${m.version})` })),
    modelGroups: buildModelGroups(index),
    regions: index.regions.map((r) => ({ value: r.id, label: r.displayName })),
    features: index.features.map((f) => ({ value: f.id, label: f.displayName })),
    featureGroups: buildFeatureGroups(index),
  };
}
