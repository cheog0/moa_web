export type ReplyManual = {
  id: string;
  title: string;
  content: string;
};

export function normalizeManuals(raw: unknown): ReplyManual[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    try {
      return normalizeManuals(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const title = String(item.title || "").trim();
    const content = String(item.content || "").trim();
    if (!title || !content) return [];
    return [
      {
        id: String(item.id || `manual-${index}`),
        title,
        content,
      },
    ];
  });
}

export function formatManualsForPrompt(manuals: ReplyManual[]) {
  if (manuals.length === 0) return "";
  const body = manuals
    .map((manual) => `## ${manual.title}\n${manual.content}`)
    .join("\n\n");
  return `[업무 매뉴얼]\n회신 초안(reply_draft) 작성 시 아래 매뉴얼을 최우선 근거로 사용하세요. 매뉴얼에 없는 내용은 추측하지 말고 확인이 필요하다고 적으세요.\n\n${body}\n`;
}

export function createEmptyManual(): ReplyManual {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `manual-${Date.now()}`,
    title: "",
    content: "",
  };
}
