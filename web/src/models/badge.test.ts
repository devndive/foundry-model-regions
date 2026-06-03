import { describe, it, expect } from "vitest";
import { capabilityBadge } from "./badge";

describe("capabilityBadge", () => {
  it("labels audio models AUDIO", () => {
    expect(capabilityBadge(["audio", "audioTranscriptions"])).toBe("AUDIO");
  });

  it("labels image/video models VISION", () => {
    expect(capabilityBadge(["imageGenerations"])).toBe("VISION");
    expect(capabilityBadge(["videoGenerations"])).toBe("VISION");
  });

  it("labels search models SEARCH", () => {
    expect(capabilityBadge(["search"])).toBe("SEARCH");
  });

  it("labels embeddings models EMBEDDINGS", () => {
    expect(capabilityBadge(["embeddings"])).toBe("EMBEDDINGS");
  });

  it("labels chat models CHAT", () => {
    expect(capabilityBadge(["chatCompletion", "assistants"])).toBe("CHAT");
  });

  it("returns empty string when no capabilities", () => {
    expect(capabilityBadge([])).toBe("");
  });
});
