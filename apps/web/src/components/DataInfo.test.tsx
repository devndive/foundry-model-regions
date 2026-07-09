import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataInfo } from "./DataInfo";
import type { Feature } from "@foundry/data-types";

const features: Feature[] = [
  {
    id: "hosted-agents",
    displayName: "Hosted Agents",
    sourceUrl: "https://learn.microsoft.com/hosted-agents",
    sectionAnchor: "region-availability",
    regions: ["eastus"],
  },
  {
    id: "foundry-agents",
    displayName: "Foundry Agents",
    sourceUrl: "https://learn.microsoft.com/hosted-agents",
    sectionAnchor: "supported-regions",
    regions: ["eastus"],
  },
];

describe("DataInfo", () => {
  it("explains both data sources", () => {
    render(<DataInfo features={features} />);

    expect(screen.getByText(/Where does this data come from/)).toBeInTheDocument();
    expect(screen.getByText(/Azure Resource/)).toBeInTheDocument();
    expect(screen.getByText(/Microsoft\s+Learn/)).toBeInTheDocument();
  });

  it("deduplicates feature source URLs and links to them", () => {
    render(<DataInfo features={features} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "https://learn.microsoft.com/hosted-agents");
    expect(links[0]).toHaveTextContent("Foundry Agents, Hosted Agents");
  });

  it("omits the sources list when there are no features", () => {
    render(<DataInfo features={[]} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("collapses a shared prefix family into a single starred label", () => {
    const url = "https://learn.microsoft.com/content-safety";
    const contentSafety: Feature[] = [
      "Content Safety — Analyze Text",
      "Content Safety — Analyze Image",
      "Content Safety — Prompt Shields",
    ].map((displayName, i) => ({
      id: `cs-${i}`,
      displayName,
      sourceUrl: url,
      sectionAnchor: "regions",
      regions: ["eastus"],
    }));

    render(<DataInfo features={contentSafety} />);

    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Content Safety - *");
    expect(link).not.toHaveTextContent("Analyze Text");
  });
});
