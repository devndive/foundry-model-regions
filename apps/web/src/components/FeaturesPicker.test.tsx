import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeaturesPicker } from "./FeaturesPicker";
import type { FeatureOptionGroup, Option } from "../filters/options";

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
      { value: "content-safety-image", label: "Image moderation" },
      { value: "content-safety-text", label: "Text moderation" },
    ],
  },
];

const features: Option[] = [
  { value: "hosted-agents", label: "Hosted Agents" },
  { value: "hosted-agents-invocations-websocket", label: "Hosted Agents — WebSocket invocations" },
  { value: "content-safety-image", label: "Content Safety — Image moderation" },
  { value: "content-safety-text", label: "Content Safety — Text moderation" },
];

function setup(selected: string[] = []) {
  const onChange = vi.fn();
  render(
    <FeaturesPicker
      groups={groups}
      features={features}
      selected={selected}
      onChange={onChange}
    />,
  );
  return { onChange, user: userEvent.setup() };
}

const trigger = () => screen.getByRole("button", { name: /^Features/ });

describe("FeaturesPicker trigger", () => {
  it("counts the requirements a reader has already stated", async () => {
    const { user } = setup(["content-safety-image"]);

    expect(trigger()).toHaveTextContent("Features (1)");

    await user.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });
});

describe("FeaturesPicker groups", () => {
  it("names every feature by its group, so a short label is never ambiguous", async () => {
    const { user } = setup();
    await user.click(trigger());

    expect(
      screen.getByRole("group", { name: /Content Safety/ }),
    ).toContainElement(screen.getByRole("checkbox", { name: "Image moderation" }));
  });

  it("says how many features a group holds, not how many are selected", async () => {
    const { user } = setup(["content-safety-image"]);
    await user.click(trigger());

    expect(screen.getByRole("group", { name: "Content Safety (2)" })).toBeInTheDocument();
  });

  it("adds a requirement when a feature is ticked", async () => {
    const { user, onChange } = setup(["content-safety-image"]);
    await user.click(trigger());
    await user.click(screen.getByRole("checkbox", { name: "Text moderation" }));

    expect(onChange).toHaveBeenCalledWith(["content-safety-image", "content-safety-text"]);
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
    setup(["content-safety-image", "hosted-agents"]);

    const strip = screen.getByRole("group", { name: /requirement/i });
    expect(strip).toHaveTextContent(/Region must support/i);
    expect(strip).toHaveTextContent("AND");
  });

  it("keeps standing requirements visible after the panel is collapsed", async () => {
    const { user } = setup(["content-safety-image"]);
    await user.click(trigger());
    await user.click(trigger());

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByRole("group", { name: /requirement/i }),
    ).toHaveTextContent("Content Safety — Image moderation");
  });

  it("names a requirement in full, since no group column is there to qualify it", () => {
    setup(["content-safety-image"]);

    expect(screen.getByRole("group", { name: /requirement/i })).toHaveTextContent(
      "Content Safety — Image moderation",
    );
  });

  it("drops a requirement when its chip is dismissed", async () => {
    const { user, onChange } = setup(["content-safety-image", "hosted-agents"]);

    await user.click(screen.getByRole("button", { name: /Remove.*Image moderation/i }));

    expect(onChange).toHaveBeenCalledWith(["hosted-agents"]);
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
