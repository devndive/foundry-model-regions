import { describe, it, expect } from "vitest";
import { resolveSku } from "./resolveSku";
import type { Option } from "./options";

const opt = (value: string): Option => ({ value, label: value });

describe("resolveSku", () => {
  it("keeps the preferred SKU when it is available", () => {
    const available = [opt("Standard"), opt("GlobalStandard")];

    expect(resolveSku("GlobalStandard", available)).toBe("GlobalStandard");
  });

  it("falls back to the first available SKU when the preferred one is absent", () => {
    const available = [opt("DataZoneStandard"), opt("Standard")];

    expect(resolveSku("GlobalStandard", available)).toBe("DataZoneStandard");
  });

  it("yields an empty SKU when no options are available", () => {
    expect(resolveSku("GlobalStandard", [])).toBe("");
  });
});
