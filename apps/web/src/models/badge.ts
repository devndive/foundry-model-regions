const RULES: Array<{ badge: string; caps: string[] }> = [
  {
    badge: "AUDIO",
    caps: [
      "audio",
      "audioTranscriptions",
      "audioTranslations",
      "audioSpeech",
      "realtimeTranscription",
      "realtimeTranslation",
    ],
  },
  { badge: "VISION", caps: ["imageGenerations", "imageEdits", "videoGenerations", "convo2im"] },
  { badge: "SEARCH", caps: ["search"] },
  { badge: "EMBEDDINGS", caps: ["embeddings"] },
  { badge: "CHAT", caps: ["chatCompletion", "responses", "completion", "agentsV2", "assistants"] },
];

export function capabilityBadge(capabilities: string[]): string {
  for (const rule of RULES) {
    if (rule.caps.some((c) => capabilities.includes(c))) return rule.badge;
  }
  return capabilities.length > 0 ? capabilities[0].toUpperCase() : "";
}

const TONES: Record<string, string> = {
  AUDIO: "badge--audio",
  VISION: "badge--vision",
  SEARCH: "badge--search",
  CHAT: "badge--chat",
  EMBEDDINGS: "badge--embed",
};

export function badgeTone(badge: string): string {
  return TONES[badge] ?? "";
}
