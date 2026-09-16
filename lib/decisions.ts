const SENTENCE_SPLIT = /(?<=(?:함|음|됨|임|다))\.\s+/;

export function splitDecisions(raw?: string): string[] {
  if (!raw?.trim()) return [];

  const lines = raw
    .split(/\n+/)
    .map((line) =>
      line.replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, "").trim(),
    )
    .filter(Boolean);

  if (lines.length > 1) return lines;

  const parts = lines[0]
    .split(SENTENCE_SPLIT)
    .map((part) => part.replace(/\.$/, "").trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : lines;
}

export function joinDecisions(items: string[]): string {
  return items
    .map((item) => item.replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, "").trim())
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join("\n");
}
