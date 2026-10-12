import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeaturesPicker } from "./FeaturesPicker";
import type { WithdrawnFeature } from "@foundry/data-types";
import type { FeatureOption, FeatureOptionGroup } from "../filters/options";

const groups: FeatureOptionGroup[] = [
  {
    id: "hosted-agents",
    label: "Hosted Agents",
    options: [
      { value: "hosted-agents", label: "Hosted Agents" },
      { value: "hosted-agents-invocations-websocket", label: "WebSocket invocations" },
    ],
  },
  {
    id: "content-safety",
    label: "Content Safety",
    options: [
      { value: "content-safety-content-harms", label: "Content harms" },
      { value: "content-safety-protected-material", label: "Protected material" },
    ],
  },
];

const features: FeatureOption[] = [
  { value: "hosted-agents", label: "Hosted Agents" },
  { value: "hosted-agents-invocations-websocket", label: "Hosted Agents — WebSocket invocations" },
  { value: "content-safety-content-harms", label: "Content Safety — Content harms" },
  { value: "content-safety-protected-material", label: "Content Safety — Protected material" },
].map((feature) => ({ ...feature, sourceUrl: "https://example.com#regions" }));

function setup(
  selected: string[] = [],
  withdrawnFeatures: WithdrawnFeature[] = [],
  currentFeatures: FeatureOption[] = features,
) {
  const onChange = vi.fn();
  render(
    <FeaturesPicker
      groups={groups}
      features={currentFeatures}
      withdrawnFeatures={withdrawnFeatures}
      selected={selected}
      onChange={onChange}
    />,
  );
  return { onChange, user: userEvent.setup() };
}

const trigger = () => screen.getByRole("button", { name: /^Features/ });

describe("FeaturesPicker trigger", () => {
  it("counts the requirements a reader has already stated", async () => {
    const { user } = setup(["content-safety-content-harms"]);

    expect(trigger()).toHaveTextContent("Features (1)");

    await user.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });
});

describe("FeaturesPicker groups", () => {
  it("names every feature by its group, so a short label is never ambiguous", async () => {
    const { user } = setup();
    await user.click(trigger());

    expect(screen.getByRole("group", { name: /Content Safety/ })).toContainElement(
      screen.getByRole("checkbox", { name: "Content harms" }),
    );
  });

  it("says how many features a group holds, not how many are selected", async () => {
    const { user } = setup(["content-safety-content-harms"]);
    await user.click(trigger());

    expect(screen.getByRole("group", { name: "Content Safety (2)" })).toBeInTheDocument();
  });

  it("adds a requirement when a feature is ticked", async () => {
    const { user, onChange } = setup(["content-safety-content-harms"]);
    await user.click(trigger());
    await user.click(screen.getByRole("checkbox", { name: "Protected material" }));

    expect(onChange).toHaveBeenCalledWith([
      "content-safety-content-harms",
      "content-safety-protected-material",
    ]);
  });

  it("offers no control that selects a whole group, because features are AND'd", async () => {
    const { user } = setup();
    await user.click(trigger());

    for (const label of ["Hosted Agents", "Content Safety"]) {
      expect(screen.queryByRole("button", { name: label })).not.toBeInTheDocument();
      expect(screen.queryByRole("checkbox", { name: label + " (2)" })).not.toBeInTheDocument();
    }
  });

  it("shows no search box, because every feature is visible at once", async () => {
    const { user } = setup();
    await user.click(trigger());

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });
});

describe("FeaturesPicker requirement strip", () => {
  it("spells out the conjunction it is filtering by", async () => {
    setup(["content-safety-content-harms", "hosted-agents"]);

    const strip = screen.getByRole("group", { name: /requirement/i });
    expect(strip).toHaveTextContent(/Region must support/i);
    expect(strip).toHaveTextContent("AND");
  });

  it("keeps standing requirements visible after the panel is collapsed", async () => {
    const { user } = setup(["content-safety-content-harms"]);
    await user.click(trigger());
    await user.click(trigger());

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("group", { name: /requirement/i })).toHaveTextContent(
      "Content Safety — Content harms",
    );
  });

  it("names a requirement in full, since no group column is there to qualify it", () => {
    setup(["content-safety-content-harms"]);

    expect(screen.getByRole("group", { name: /requirement/i })).toHaveTextContent(
      "Content Safety — Content harms",
    );
  });

  it("drops a requirement when its chip is dismissed", async () => {
    const { user, onChange } = setup(["content-safety-content-harms", "hosted-agents"]);

    await user.click(screen.getByRole("button", { name: /Remove.*Content harms/i }));

    expect(onChange).toHaveBeenCalledWith(["hosted-agents"]);
  });

  describe("FeaturesPicker source scope and withdrawn requirements", () => {
    const withdrawn: WithdrawnFeature = {
      id: "content-safety-image",
      displayName: "Content Safety — Analyze Image",
      reason: "The table now documents Content harms rather than an independent image region set.",
    };

    it("keeps an obsolete requirement labelled and warns without automatically changing it", () => {
      const { onChange } = setup(["content-safety-image", "hosted-agents"], [withdrawn]);

      expect(screen.getByRole("group", { name: /requirement/i })).toHaveTextContent(
        "Content Safety — Analyze Image",
      );
      expect(screen.getByRole("group", { name: /requirement/i })).toHaveTextContent(
        "no longer tracked",
      );
      expect(screen.getByRole("alert")).toHaveTextContent(withdrawn.reason);
      expect(screen.getByRole("alert")).toHaveTextContent("No matching regions can be recommended");
      expect(onChange).not.toHaveBeenCalled();
    });

    it("requires explicit removal and never aliases a broader replacement", async () => {
      const { onChange, user } = setup(["content-safety-image", "hosted-agents"], [withdrawn]);
      await user.click(screen.getByRole("button", { name: /Remove.*Analyze Image/ }));
      expect(onChange).toHaveBeenCalledWith(["hosted-agents"]);
    });

    it("also warns for an unknown ID that has no catalog-history entry", () => {
      setup(["unknown-feature"]);
      expect(screen.getByRole("alert")).toHaveTextContent("unknown-feature");
      expect(screen.getByRole("alert")).toHaveTextContent("not in the current catalog");
    });

    it("discloses resource-region semantics once for multiple selected guardrails", () => {
      const note =
        "Resource-region availability does not guarantee in-region processing or data residency.";
      const currentFeatures = features.map((feature) => ({
        ...feature,
        availabilityNote: feature.value.startsWith("content-safety-") ? note : undefined,
      }));
      setup(
        ["content-safety-content-harms", "content-safety-protected-material"],
        [],
        currentFeatures,
      );

      expect(screen.getAllByText(note, { exact: false })).toHaveLength(1);
      expect(screen.getByRole("link", { name: "Regional availability source" })).toHaveAttribute(
        "href",
        "https://example.com#regions",
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("stays out of the way when nothing is required", () => {
    setup();

    expect(screen.queryByRole("group", { name: /requirement/i })).not.toBeInTheDocument();
  });
});

describe("FeaturesPicker dismissal", () => {
  it("collapses on Escape", async () => {
    const { user } = setup();
    await user.click(trigger());
    await user.keyboard("{Escape}");

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("stays open when a click lands elsewhere, since it is not an overlay", async () => {
    const { user } = setup();
    await user.click(trigger());
    await user.click(document.body);

    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });
});
