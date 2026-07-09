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

describe("MultiSelect search", () => {
  it("narrows visible options by case-insensitive substring of the label when searchable", async () => {
    render(
      <MultiSelect label="Models" options={options} searchable selected={[]} onChange={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole("button", { name: /^Models/ }));
    await userEvent.type(screen.getByRole("searchbox"), "CLAUDE");

    expect(screen.getByLabelText("claude (1)")).toBeInTheDocument();
    expect(screen.queryByLabelText("gpt-4o (1)")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("gpt-35 (0613)")).not.toBeInTheDocument();
  });

  it("keeps checked-but-hidden options selected when toggling a visible option", async () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        label="Models"
        options={options}
        searchable
        selected={["OpenAI:gpt-4o:1"]}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /^Models/ }));
    await userEvent.type(screen.getByRole("searchbox"), "claude");
    await userEvent.click(screen.getByLabelText("claude (1)"));

    expect(onChange).toHaveBeenCalledWith(["OpenAI:gpt-4o:1", "Anthropic:claude:1"]);
  });

  it("shows a no-match message when the search term matches nothing", async () => {
    render(
      <MultiSelect label="Models" options={options} searchable selected={[]} onChange={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole("button", { name: /^Models/ }));
    await userEvent.type(screen.getByRole("searchbox"), "zzz");

    expect(screen.getByText("No matching models")).toBeInTheDocument();
    expect(screen.queryByLabelText("claude (1)")).not.toBeInTheDocument();
  });

  it("keeps group and clear buttons acting on the full set while a search term is active", async () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        label="Models"
        options={options}
        groups={groups}
        searchable
        selected={[]}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /^Models/ }));
    await userEvent.type(screen.getByRole("searchbox"), "claude");

    const openAiButton = screen.getByRole("button", { name: "OpenAI" });
    expect(openAiButton).toBeInTheDocument();
    await userEvent.click(openAiButton);

    expect(onChange).toHaveBeenCalledWith(["OpenAI:gpt-4o:1", "OpenAI:gpt-35:0613"]);
  });

  it("auto-focuses the search input when the dropdown opens", async () => {
    render(
      <MultiSelect label="Models" options={options} searchable selected={[]} onChange={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole("button", { name: /^Models/ }));

    expect(screen.getByRole("searchbox")).toHaveFocus();
  });

  it("resets the search term when the dropdown closes and reopens", async () => {
    render(
      <MultiSelect label="Models" options={options} searchable selected={[]} onChange={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole("button", { name: /^Models/ }));
    await userEvent.type(screen.getByRole("searchbox"), "claude");
    expect(screen.getByRole("searchbox")).toHaveValue("claude");

    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: /^Models/ }));

    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getByLabelText("gpt-4o (1)")).toBeInTheDocument();
  });

  it("renders no search input for non-searchable dropdowns", async () => {
    render(<MultiSelect label="Regions" options={options} selected={[]} onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /^Regions/ }));

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });
});
