import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { buildIndex } from "./data/index";
import { defaultFilters } from "./matrix/buildMatrix";
import type { FeaturesArtifact, NormalizedBundle, Region } from "./data/types";

const bundle: NormalizedBundle = {
  models: [
    {
      id: "m1",
      name: "gpt-4o",
      version: "1",
      format: "OpenAI",
      lifecycleStatus: "GenerallyAvailable",
      isDefaultVersion: true,
      capabilities: ["chatCompletion"],
      createdAt: "2024-05-13T00:00:00.000Z",
      deprecation: { inference: null, fineTune: null },
    },
  ],
  availability: [
    {
      modelId: "m1",
      region: "eastus",
      sku: "GlobalStandard",
      deprecationDate: null,
      lifecycleStatus: "GenerallyAvailable",
    },
  ],
};
const regions: Region[] = [{ id: "eastus", displayName: "East US", geoGroup: "americas" }];

const features: FeaturesArtifact = {
  features: [
    {
      id: "hosted-agents",
      displayName: "Hosted Agents",
      sourceUrl: "https://example.com",
      sectionAnchor: "region-availability",
      regions: ["eastus"],
    },
  ],
  availability: [{ featureId: "hosted-agents", region: "eastus" }],
};

describe("App", () => {
  it("renders the matrix with a model header", () => {
    const index = buildIndex(bundle, regions);
    render(<App index={index} filters={defaultFilters} onFiltersChange={() => {}} />);

    expect(screen.getByText("Foundry Model Regional Availability")).toBeInTheDocument();
    expect(screen.getByText("gpt-4o")).toBeInTheDocument();
    expect(screen.getByText("East US")).toBeInTheDocument();
    expect(screen.getByText("CHAT")).toBeInTheDocument();
  });

  it("requests a swap when Swap View is clicked", async () => {
    const index = buildIndex(bundle, regions);
    const onFiltersChange = vi.fn();
    render(<App index={index} filters={defaultFilters} onFiltersChange={onFiltersChange} />);

    await userEvent.click(screen.getByText("Swap View"));

    expect(onFiltersChange).toHaveBeenCalledWith({ swapView: true });
  });

  it("renders Hide deprecated checked by default and unchecks it on click", async () => {
    const index = buildIndex(bundle, regions);
    const onFiltersChange = vi.fn();
    render(<App index={index} filters={defaultFilters} onFiltersChange={onFiltersChange} />);

    const toggle = screen.getByLabelText("Hide deprecated") as HTMLInputElement;
    expect(toggle.checked).toBe(true);

    await userEvent.click(toggle);

    expect(onFiltersChange).toHaveBeenCalledWith({ hideDeprecated: false });
  });

  it("requests a feature selection when a Feature is picked", async () => {
    const index = buildIndex(bundle, regions, features);
    const onFiltersChange = vi.fn();
    render(<App index={index} filters={defaultFilters} onFiltersChange={onFiltersChange} />);

    await userEvent.click(screen.getByRole("button", { name: /^Features/ }));
    await userEvent.click(screen.getByLabelText("Hosted Agents"));

    expect(onFiltersChange).toHaveBeenCalledWith({ features: ["hosted-agents"] });
  });

  it("shows an available SKU when the default GlobalStandard is absent from the data", () => {
    const standardOnly: NormalizedBundle = {
      ...bundle,
      availability: [
        {
          modelId: "m1",
          region: "eastus",
          sku: "Standard",
          deprecationDate: null,
          lifecycleStatus: "GenerallyAvailable",
        },
      ],
    };
    const index = buildIndex(standardOnly, regions);
    render(<App index={index} filters={defaultFilters} onFiltersChange={() => {}} />);

    const skuSelect = screen.getByLabelText("SKU type") as HTMLSelectElement;
    expect(skuSelect.value).toBe("Standard");
    // The matrix must reflect the resolved SKU, marking the eastus/m1 cell available.
    expect(screen.getByRole("cell", { name: "✓" })).toBeInTheDocument();
  });
});
