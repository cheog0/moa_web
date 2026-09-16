import { joinDecisions, splitDecisions } from "@/lib/decisions";

export type ActionItem = {
  id: string;
  task: string;
  assignee?: string;
  done: boolean;
  question?: string;
  commitment?: string;
  timestamp?: string;
  speaker?: string;
};

type RawActionItem = {
  id?: string;
  task?: string;
  text?: string;
  assignee?: string;
  done?: boolean;
  question?: string;
  commitment?: string;
  timestamp?: string;
  time?: string;
  speaker?: string;
};

function cleanTimestamp(value?: string) {
  if (!value) return undefined;
  const match = String(value).match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
  return match?.[1];
}

function optionalText(value?: string) {
  const text = String(value || "").trim();
  return text || undefined;
}

function toActionItem(
  item: string | RawActionItem,
  index: number,
): ActionItem | null {
  if (typeof item === "string") {
    const task = item.replace(/^[-*•\d.)\s]+/, "").trim();
    if (!task) return null;
    return { id: `item-${index}`, task, done: false };
  }
  if (!item || typeof item !== "object") return null;
  const task = String(item.task || item.text || item.commitment || "")
    .replace(/^[-*•\d.)\s]+/, "")
    .trim();
  if (!task) return null;
  return {
    id: String(item.id || `item-${index}`),
    task,
    assignee: optionalText(item.assignee),
    done: Boolean(item.done),
    question: optionalText(item.question),
    commitment: optionalText(item.commitment),
    timestamp: cleanTimestamp(item.timestamp || item.time),
    speaker: optionalText(item.speaker),
  };
}

export function normalizeActionItems(raw: unknown): ActionItem[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    try {
      return normalizeActionItems(JSON.parse(raw));
    } catch {
      return raw
        .split("\n")
        .map((line, index) => toActionItem(line, index))
        .filter((item): item is ActionItem => Boolean(item));
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => toActionItem(item, index))
    .filter((item): item is ActionItem => Boolean(item));
}

export function parseMinutesPayload(raw: unknown) {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown> & {
    minutes?: Record<string, unknown>;
  };
  const minutes =
    source.minutes && typeof source.minutes === "object"
      ? source.minutes
      : source;
  const replyDraft = minutes.reply_draft ?? minutes.replyDraft;
  return {
    summary: String(minutes.summary || ""),
    decisions: joinDecisions(splitDecisions(String(minutes.decisions || ""))),
    action_items: normalizeActionItems(
      minutes.action_items ?? minutes.actionItems,
    ),
    reply_draft:
      typeof replyDraft === "string"
        ? replyDraft
        : replyDraft == null
          ? ""
          : String(replyDraft),
    transcript: minutes.transcript,
  };
}
