"use client";

import { useState } from "react";
import { Check, Copy, ListChecks, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionItem } from "@/lib/actionItems";
import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function FollowUpSection({
  actionItems,
  replyDraft,
  onToggleItem,
  onReplyDraftChange,
  onSeek,
  hideUI,
  showPrintBlock,
  isPreviewMode,
  includeActionItems,
}: {
  actionItems: ActionItem[];
  replyDraft: string;
  onToggleItem: (id: string) => void;
  onReplyDraftChange: (value: string) => void;
  onSeek?: (timeStr: string) => void;
  hideUI: string;
  showPrintBlock: string;
  isPreviewMode: boolean;
  includeActionItems: boolean;
}) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const darkDoc = !isPreviewMode;

  if (actionItems.length === 0 && !replyDraft.trim()) return null;

  const copyDraft = async () => {
    if (!replyDraft.trim()) return;
    try {
      await navigator.clipboard.writeText(replyDraft);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {actionItems.length > 0 && (
        <div
          className={`${!includeActionItems ? "print:hidden" : ""} ${!includeActionItems && isPreviewMode ? "hidden" : ""}`}
        >
          <h3
            className={cn(
              "mb-3 flex items-center gap-2 text-lg font-bold text-gray-900",
              darkDoc && whenDark(theme, "text-zinc-50"),
            )}
          >
            <ListChecks className="size-5 text-amber-500" /> 후속 조치
          </h3>
          <ul className={`flex flex-col gap-2 ${hideUI}`}>
            {actionItems.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5",
                  darkDoc && whenDark(theme, "border-zinc-800 bg-zinc-900/60"),
                )}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => onToggleItem(item.id)}
                    className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-sm font-medium text-slate-800",
                        item.done && "text-slate-400 line-through",
                        darkDoc &&
                          whenDark(
                            theme,
                            item.done ? "text-zinc-500" : "text-zinc-100",
                          ),
                      )}
                    >
                      {item.task}
                    </span>
                    {(item.question ||
                      item.commitment ||
                      item.timestamp ||
                      item.assignee) && (
                      <span
                        className={cn(
                          "mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500",
                          darkDoc && whenDark(theme, "text-zinc-400"),
                        )}
                      >
                        {item.question && <span>Q. {item.question}</span>}
                        {item.commitment && <span>약속: {item.commitment}</span>}
                        {item.assignee && <span>{item.assignee}</span>}
                        {item.timestamp && (
                          <button
                            type="button"
                            className="font-mono text-sky-600 hover:underline"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              onSeek?.(item.timestamp!);
                            }}
                          >
                            [{item.timestamp}
                            {item.speaker ? ` ${item.speaker}` : ""}]
                          </button>
                        )}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <ul
            className={`${showPrintBlock} list-disc space-y-1 pl-5 text-base leading-relaxed text-black`}
          >
            {actionItems.map((item) => (
              <li key={`print-${item.id}`}>
                {item.done ? "[완료] " : "[미완료] "}
                {item.task}
              </li>
            ))}
          </ul>
        </div>
      )}

      {replyDraft.trim() && (
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3
              className={cn(
                "flex items-center gap-2 text-lg font-bold text-gray-900",
                darkDoc && whenDark(theme, "text-zinc-50"),
              )}
            >
              <Mail className="size-5 text-sky-500" /> AI 회신 메일 초안
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyDraft}
              className={`h-8 text-xs ${hideUI}`}
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? "복사됨" : "초안 복사하기"}
            </Button>
          </div>
          <textarea
            value={replyDraft}
            onChange={(e) => onReplyDraftChange(e.target.value)}
            className={cn(
              `min-h-[180px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 outline-none transition-colors focus:border-primary ${hideUI}`,
              darkDoc &&
                whenDark(
                  theme,
                  "border-zinc-800 bg-zinc-900/60 text-zinc-200",
                ),
            )}
          />
          <div
            className={`${showPrintBlock} whitespace-pre-wrap pt-2 text-base leading-relaxed text-black`}
          >
            {replyDraft}
          </div>
        </div>
      )}
    </div>
  );
}
