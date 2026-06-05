import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultiSelect } from "./MultiSelect";
import type { Option } from "../filters/options";

const options: Option[] = [
  { value: "OpenAI:gpt-4o:1", label: "gpt-4o (1)" },
  { value: "OpenAI:gpt-35:0613", label: "gpt-35 (0613)" },
  { value: "Anthropic:claude:1", label: "claude (1)" },
];

const groups = [
  { value: "OpenAI", label: "OpenAI", values: ["OpenAI:gpt-4o:1", "OpenAI:gpt-35:0613"] },
  { value: "Anthropic", label: "Anthropic", values: ["Anthropic:claude:1"] },
];

describe("MultiSelect groups", () => {
  it("selects all models of a provider when its group button is clicked", async () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        label="Models"
        options={options}
        groups={groups}
        selected={[]}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /^Models/ }));
    await userEvent.click(screen.getByRole("button", { name: "OpenAI" }));

    expect(onChange).toHaveBeenCalledWith(["OpenAI:gpt-4o:1", "OpenAI:gpt-35:0613"]);
  });

  it("deselects a provider's models when all are already selected", async () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        label="Models"
        options={options}
        groups={groups}
        selected={["OpenAI:gpt-4o:1", "OpenAI:gpt-35:0613", "Anthropic:claude:1"]}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /^Models/ }));
    await userEvent.click(screen.getByRole("button", { name: "OpenAI" }));

    expect(onChange).toHaveBeenCalledWith(["Anthropic:claude:1"]);
  });

  it("preserves existing selections when adding a provider group", async () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        label="Models"
        options={options}
        groups={groups}
        selected={["Anthropic:claude:1"]}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /^Models/ }));
    await userEvent.click(screen.getByRole("button", { name: "OpenAI" }));

    expect(onChange).toHaveBeenCalledWith([
      "Anthropic:claude:1",
      "OpenAI:gpt-4o:1",
      "OpenAI:gpt-35:0613",
    ]);
  });
});
