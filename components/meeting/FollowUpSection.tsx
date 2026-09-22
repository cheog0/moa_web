"use client";

import { ListChecks, Plus, X } from "lucide-react";
import { ActionItem } from "@/lib/actionItems";
import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function FollowUpSection({
  actionItems,
  onToggleItem,
  onChangeItem,
  onAddItem,
  onRemoveItem,
  onSeek,
  hideUI,
  showPrintBlock,
  isPreviewMode,
  includeActionItems,
}: {
  actionItems: ActionItem[];
  onToggleItem: (id: string) => void;
  onChangeItem: (id: string, task: string) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onSeek?: (timeStr: string) => void;
  hideUI: string;
  showPrintBlock: string;
  isPreviewMode: boolean;
  includeActionItems: boolean;
}) {
  const { theme } = useTheme();
  const darkDoc = !isPreviewMode;

  if (actionItems.length === 0 && isPreviewMode) return null;

  return (
    <div
      className={`${!includeActionItems || actionItems.length === 0 ? "print:hidden" : ""} ${!includeActionItems && isPreviewMode ? "hidden" : ""}`}
    >
      <h3
        className={cn(
          "mb-3 flex items-center gap-2 text-lg font-bold text-gray-900",
          darkDoc && whenDark(theme, "text-zinc-50"),
        )}
      >
        <ListChecks className="size-5 text-amber-500" /> 후속 조치
        <button
          type="button"
          onClick={onAddItem}
          className={cn(
            `ml-auto inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 ${hideUI}`,
            darkDoc && whenDark(theme, "hover:bg-zinc-800 hover:text-zinc-100"),
          )}
        >
          <Plus className="size-3.5" />
          추가
        </button>
      </h3>
      {actionItems.length === 0 ? (
        <p
          className={cn(
            `text-sm text-slate-400 ${hideUI}`,
            darkDoc && whenDark(theme, "text-zinc-500"),
          )}
        >
          아직 후속 조치가 없습니다. 추가를 눌러 적어 주세요.
        </p>
      ) : (
        <ul className={`flex flex-col gap-2 ${hideUI}`}>
          {actionItems.map((item) => (
            <li
              key={item.id}
              className={cn(
                "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5",
                darkDoc && whenDark(theme, "border-zinc-800 bg-zinc-900/60"),
              )}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => onToggleItem(item.id)}
                  className="mt-1 size-4 shrink-0 cursor-pointer rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <div className="min-w-0 flex-1">
                  <input
                    value={item.task}
                    onChange={(event) =>
                      onChangeItem(item.id, event.target.value)
                    }
                    placeholder="후속 조치를 입력하세요"
                    className={cn(
                      "w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400",
                      item.done && "text-slate-400 line-through",
                      darkDoc &&
                        whenDark(
                          theme,
                          item.done ? "text-zinc-500" : "text-zinc-100",
                        ),
                    )}
                  />
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
                          className="cursor-pointer font-mono text-sky-600 hover:underline"
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
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className={cn(
                    "mt-0.5 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-slate-700",
                    darkDoc &&
                      whenDark(theme, "hover:bg-zinc-800 hover:text-zinc-200"),
                  )}
                  aria-label="후속 조치 삭제"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
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
  );
}
