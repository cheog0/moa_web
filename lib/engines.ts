export const DEFAULT_ENGINE_ID = "default";

export const ENGINES = [
  {
    id: DEFAULT_ENGINE_ID,
    name: "기본",
  },
  {
    id: "gemini",
    name: "Google Gemini",
  },
  {
    id: "deepgram",
    name: "Deepgram",
  },
  {
    id: "soniox",
    name: "Soniox",
  },
  {
    id: "clova",
    name: "ClovaNote",
  },
] as const;

export function isDefaultEngine(engine?: string | null) {
  return !engine || engine === DEFAULT_ENGINE_ID;
}

export function engineRequiresOwnKey(engine?: string | null) {
  return !isDefaultEngine(engine);
}

export function engineLabel(engine?: string | null) {
  return ENGINES.find((item) => item.id === engine)?.name || engine || "엔진";
}

export function missingApiKeyMessage(engine?: string | null) {
  return `${engineLabel(engine)} API 키를 설정에서 입력해 주세요.`;
}

export function normalizeEngine(engine?: string | null) {
  if (!engine || engine === DEFAULT_ENGINE_ID) return DEFAULT_ENGINE_ID;
  if (ENGINES.some((item) => item.id === engine)) return engine;
  return DEFAULT_ENGINE_ID;
}

export function toTranscribeEngine(engine?: string | null) {
  return isDefaultEngine(engine) ? DEFAULT_ENGINE_ID : engine || DEFAULT_ENGINE_ID;
}

export function toTranscribeApiKey(engine?: string | null, apiKey?: string | null) {
  return isDefaultEngine(engine) ? "" : apiKey?.trim() || "";
}
