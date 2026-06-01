import assert from "node:assert/strict";
import { test } from "node:test";
import { type Model } from "@azure/arm-cognitiveservices";
import { normalizeModels } from "./normalize-models.js";

// Minimal Model fixture builder. Only the fields the normalizer reads are set;
// everything else is intentionally absent to keep each test's intent legible.
// Built loosely and cast because cached snapshots are parsed JSON (dates are
// ISO strings), not the SDK's runtime Date-typed shape.
function model(overrides: Record<string, unknown> = {}): Model {
  return {
    model: {
      format: "OpenAI",
      name: "gpt-4o",
      version: "2024-11-20",
      ...overrides,
    },
  } as Model;
}

test("a single model in one region becomes one model row keyed by name, version and format", () => {
  const bundle = normalizeModels([{ region: "westus", models: [model()] }]);

  assert.equal(bundle.models.length, 1);
  const [row] = bundle.models;
  assert.equal(row.name, "gpt-4o");
  assert.equal(row.version, "2024-11-20");
  assert.equal(row.format, "OpenAI");
  assert.equal(row.id, "OpenAI:gpt-4o:2024-11-20");
});

test("every SKU type becomes an availability row, including ones the old flatten filtered away", () => {
  const bundle = normalizeModels([
    {
      region: "westus",
      models: [
        model({
          skus: [
            { name: "Standard" },
            { name: "GlobalStandard" },
            { name: "GlobalBatch" },
            { name: "GlobalProvisionedManaged" },
          ],
        }),
      ],
    },
  ]);

  const skus = bundle.availability
    .filter((a) => a.region === "westus")
    .map((a) => a.sku)
    .sort();
  assert.deepEqual(skus, ["GlobalBatch", "GlobalProvisionedManaged", "GlobalStandard", "Standard"]);
  assert.ok(bundle.availability.every((a) => a.modelId === "OpenAI:gpt-4o:2024-11-20"));
});

test("each availability row carries its own SKU deprecation date", () => {
  const bundle = normalizeModels([
    {
      region: "westus",
      models: [
        model({
          skus: [
            { name: "Standard", deprecationDate: "2025-05-01T00:00:00.000Z" },
            { name: "GlobalStandard" },
          ],
        }),
      ],
    },
  ]);

  const bySku = new Map(bundle.availability.map((a) => [a.sku, a]));
  assert.equal(bySku.get("Standard")?.deprecationDate, "2025-05-01T00:00:00.000Z");
  assert.equal(bySku.get("GlobalStandard")?.deprecationDate, null);
});

test("the same model in two regions yields one model row but region-specific availability", () => {
  const bundle = normalizeModels([
    {
      region: "westus",
      models: [
        model({ skus: [{ name: "Standard", deprecationDate: "2025-05-01T00:00:00.000Z" }] }),
      ],
    },
    {
      region: "northeurope",
      models: [
        model({ skus: [{ name: "Standard", deprecationDate: "2026-01-01T00:00:00.000Z" }] }),
      ],
    },
  ]);

  assert.equal(bundle.models.length, 1);

  const west = bundle.availability.find((a) => a.region === "westus" && a.sku === "Standard");
  const eu = bundle.availability.find((a) => a.region === "northeurope" && a.sku === "Standard");
  assert.equal(west?.deprecationDate, "2025-05-01T00:00:00.000Z");
  assert.equal(eu?.deprecationDate, "2026-01-01T00:00:00.000Z");
});

test("two versions of the same model name are kept as distinct model rows", () => {
  const bundle = normalizeModels([
    {
      region: "westus",
      models: [
        model({ name: "gpt-4", version: "1106-Preview" }),
        model({ name: "gpt-4", version: "0613" }),
      ],
    },
  ]);

  const versions = bundle.models
    .filter((m) => m.name === "gpt-4")
    .map((m) => m.version)
    .sort();
  assert.deepEqual(versions, ["0613", "1106-Preview"]);
});

test("model-level metadata is resolved onto the model row, not into availability", () => {
  const bundle = normalizeModels([
    {
      region: "westus",
      models: [
        model({
          name: "gpt-4",
          version: "1106-Preview",
          lifecycleStatus: "Deprecated",
          isDefaultVersion: false,
          createdAt: undefined,
          capabilities: {
            chatCompletion: "true",
            assistants: "true",
            maxContextToken: "128000",
          },
          systemData: { createdAt: "2023-11-15T00:00:00.000Z" },
          deprecation: { inference: "2025-05-01T00:00:00Z" },
        }),
      ],
    },
  ]);

  const [row] = bundle.models;
  assert.equal(row.lifecycleStatus, "Deprecated");
  assert.equal(row.isDefaultVersion, false);
  assert.equal(row.createdAt, "2023-11-15T00:00:00.000Z");
  assert.deepEqual(row.capabilities.sort(), ["assistants", "chatCompletion"]);
  assert.deepEqual(row.deprecation, {
    inference: "2025-05-01T00:00:00Z",
    fineTune: null,
  });
});

test("a model with no SKUs still appears as a model row with no availability", () => {
  const bundle = normalizeModels([
    { region: "westus", models: [model({ name: "embed", version: "1", skus: [] })] },
  ]);

  assert.equal(bundle.models.length, 1);
  assert.equal(bundle.models[0].name, "embed");
  assert.equal(bundle.availability.length, 0);
});

test("model metadata is filled from whichever region carries it, not the first seen", () => {
  const bundle = normalizeModels([
    // First region this model appears in is missing lifecycle, createdAt and deprecation.
    {
      region: "westus",
      models: [model({ name: "gpt-4", version: "1106-Preview" })],
    },
    // A later region carries the full metadata.
    {
      region: "northeurope",
      models: [
        model({
          name: "gpt-4",
          version: "1106-Preview",
          lifecycleStatus: "Deprecated",
          systemData: { createdAt: "2023-11-15T00:00:00.000Z" },
          deprecation: { inference: "2025-05-01T00:00:00Z" },
        }),
      ],
    },
  ]);

  const [row] = bundle.models;
  assert.equal(row.lifecycleStatus, "Deprecated");
  assert.equal(row.createdAt, "2023-11-15T00:00:00.000Z");
  assert.deepEqual(row.deprecation, { inference: "2025-05-01T00:00:00Z", fineTune: null });
});
