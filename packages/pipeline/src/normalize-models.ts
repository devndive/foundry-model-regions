import { type Model } from "@azure/arm-cognitiveservices";
import type {
  AvailabilityFact,
  ModelDeprecation,
  NormalizedBundle,
  NormalizedModel,
} from "@foundry/data-types";

export interface RegionSnapshot {
  region: string;
  models: Model[];
}

function modelId(format: string, name: string, version: string): string {
  return `${format}:${name}:${version}`;
}

function enabledCapabilities(capabilities: Record<string, string> | undefined): string[] {
  return Object.entries(capabilities ?? {})
    .filter(([, value]) => value === "true")
    .map(([key]) => key);
}

function modelDeprecation(
  deprecation: NonNullable<Model["model"]>["deprecation"],
): ModelDeprecation | null {
  if (!deprecation) return null;
  return {
    inference: deprecation.inference ?? null,
    fineTune: deprecation.fineTune ?? null,
  };
}

export function normalizeModels(snapshots: RegionSnapshot[]): NormalizedBundle {
  const modelsById = new Map<string, NormalizedModel>();
  const availability: AvailabilityFact[] = [];
  for (const { region, models: regionModels } of snapshots) {
    for (const entry of regionModels) {
      const m = entry.model;
      if (!m?.name) continue;
      const name = m.name;
      const version = m.version ?? "";
      const format = m.format ?? "";
      const id = modelId(format, name, version);
      const existing = modelsById.get(id);
      modelsById.set(id, {
        id,
        name,
        version,
        format,
        lifecycleStatus: m.lifecycleStatus ?? existing?.lifecycleStatus ?? null,
        isDefaultVersion: m.isDefaultVersion ?? existing?.isDefaultVersion ?? false,
        capabilities:
          existing && existing.capabilities.length > 0
            ? existing.capabilities
            : enabledCapabilities(m.capabilities),
        createdAt: m.systemData?.createdAt
          ? String(m.systemData.createdAt)
          : (existing?.createdAt ?? null),
        deprecation: modelDeprecation(m.deprecation) ?? existing?.deprecation ?? null,
      });

      for (const sku of m.skus ?? []) {
        if (!sku.name) continue;
        availability.push({
          modelId: id,
          region,
          sku: sku.name,
          deprecationDate: sku.deprecationDate ? String(sku.deprecationDate) : null,
          lifecycleStatus: m.lifecycleStatus ?? null,
        });
      }
    }
  }
  return { models: [...modelsById.values()], availability };
}
