import { TEMPLATE_BASIC, TEMPLATE_SALES, TEMPLATE_SCRUM } from "@/lib/constants";

export type PresetTemplate = {
  id: string;
  name: string;
  body: string;
  builtin: true;
};

export type PersonalTemplate = {
  id: string;
  name: string;
  body: string;
};

export const PRESET_TEMPLATES: PresetTemplate[] = [
  { id: "sales", name: "미팅", body: TEMPLATE_SALES, builtin: true },
  { id: "scrum", name: "데일리 스크럼", body: TEMPLATE_SCRUM, builtin: true },
  { id: "basic", name: "기본 회의", body: TEMPLATE_BASIC, builtin: true },
];

export function isPresetId(id: string) {
  return PRESET_TEMPLATES.some((item) => item.id === id);
}

export function normalizePersonalTemplates(raw: unknown): PersonalTemplate[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    try {
      return normalizePersonalTemplates(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const name = String((item as { name?: string }).name || "").trim();
    const body = String((item as { body?: string }).body || "");
    if (!name && !body.trim()) return [];
    return [
      {
        id: String((item as { id?: string }).id || `template-${index}`),
        name: name || "내 템플릿",
        body,
      },
    ];
  });
}

export function createPersonalTemplate(
  body = "",
  name = "내 템플릿",
): PersonalTemplate {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `template-${Date.now()}`,
    name,
    body,
  };
}

export function nextPersonalName(existing: PersonalTemplate[], base = "내 템플릿") {
  const names = new Set(existing.map((item) => item.name));
  if (!names.has(base)) return base;
  let index = 2;
  while (names.has(`${base} ${index}`)) index += 1;
  return `${base} ${index}`;
}

export function matchTemplateId(
  body: string,
  personal: PersonalTemplate[],
) {
  const preset = PRESET_TEMPLATES.find((item) => item.body === body);
  if (preset) return preset.id;
  const mine = personal.find((item) => item.body === body);
  if (mine) return mine.id;
  return "";
}
