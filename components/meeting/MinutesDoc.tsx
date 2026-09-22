"use client";

import { useState } from "react";
import { Clock3, Pencil, Sparkles } from "lucide-react";
import { MeetingMinutes } from "@/lib/constants";
import { ActionItem } from "@/lib/actionItems";
import FollowUpSection from "@/components/meeting/FollowUpSection";
import MarkdownBody from "@/components/meeting/MarkdownBody";
import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function MinutesDoc({
  meetingTitle,
  onTitleChange,
  dateStr,
  minutes,
  summaryText,
  actionItems,
  onSummaryChange,
  onToggleActionItem,
  onChangeActionItem,
  onAddActionItem,
  onRemoveActionItem,
  onSeek,
  hideUI,
  showPrintBlock,
  isPreviewMode,
  includeActionItems,
}: {
  meetingTitle: string;
  onTitleChange: (value: string) => void;
  dateStr: string;
  minutes?: MeetingMinutes;
  summaryText: string;
  actionItems: ActionItem[];
  onSummaryChange: (value: string) => void;
  onToggleActionItem: (id: string) => void;
  onChangeActionItem: (id: string, task: string) => void;
  onAddActionItem: () => void;
  onRemoveActionItem: (id: string) => void;
  onSeek?: (timeStr: string) => void;
  hideUI: string;
  showPrintBlock: string;
  isPreviewMode: boolean;
  includeActionItems: boolean;
}) {
  const { theme } = useTheme();
  const darkDoc = !isPreviewMode;
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  return (
    <div
      className={cn(
        `relative min-h-[300px] rounded-xl bg-white p-8 border border-gray-100 print:block print:min-h-0 print:h-auto print:border-none print:bg-transparent print:p-0 print:m-0 print:shadow-none print:ring-0 print:rounded-none ${isPreviewMode ? "shadow-lg border-none my-4 ring-1 ring-black/5" : "shadow-sm"}`,
        darkDoc &&
          whenDark(
            theme,
            "border-transparent bg-transparent shadow-none",
          ),
      )}
    >
      <button
        type="button"
        onClick={() => setIsEditingSummary((open) => !open)}
        className={cn(
          `absolute top-3 right-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 ${hideUI}`,
          darkDoc &&
            whenDark(theme, "hover:bg-zinc-800 hover:text-zinc-100"),
        )}
      >
        <Pencil className="size-3.5" />
        {isEditingSummary ? "미리보기" : "원문 편집"}
      </button>
      <input
        className={cn(
          `w-full rounded-md bg-transparent p-1 -ml-1 pr-24 text-4xl font-extrabold tracking-tight text-gray-900 outline-none placeholder:text-gray-300 transition-colors hover:bg-gray-50 focus:bg-white ${hideUI}`,
          darkDoc &&
            whenDark(
              theme,
              "text-zinc-50 placeholder:text-zinc-600 hover:bg-zinc-800/60 focus:bg-zinc-900",
            ),
        )}
        value={meetingTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="제목 없는 문서"
      />
      <h1
        className={`${showPrintBlock} mb-2 text-4xl font-extrabold tracking-tight text-black`}
      >
        {meetingTitle || "제목 없는 문서"}
      </h1>
      <div
        className={cn(
          `mt-4 flex items-center gap-4 border-b border-gray-100 pb-6 text-sm text-gray-500 ${isPreviewMode ? "pb-4 mt-2" : "print:pb-4 print:mt-2 print:border-gray-300"}`,
          darkDoc && whenDark(theme, "border-zinc-800 text-zinc-400"),
        )}
      >
        <span className="flex items-center gap-1.5">
          <Clock3 className="size-4" /> {dateStr}
        </span>
      </div>
      <div
        className={cn(
          "mt-8 text-gray-800",
          darkDoc && whenDark(theme, "text-zinc-200"),
        )}
      >
        {minutes ? (
          <div className="flex flex-col gap-8 text-base leading-relaxed">
            <div>
              <h3
                className={cn(
                  "mb-4 flex items-center gap-2 text-lg font-bold text-gray-900",
                  darkDoc && whenDark(theme, "text-zinc-50"),
                )}
              >
                <Sparkles className="size-5 text-blue-500" /> 회의 요약 및 내용
              </h3>
              <div className={hideUI}>
                {isEditingSummary ? (
                  <textarea
                    value={summaryText}
                    onChange={(e) => onSummaryChange(e.target.value)}
                    className={cn(
                      "w-full min-h-[400px] resize-y rounded-lg border border-slate-200 p-3 font-mono text-sm leading-relaxed text-gray-800 outline-none focus:border-primary",
                      darkDoc &&
                        whenDark(
                          theme,
                          "border-zinc-700 bg-zinc-950 text-zinc-200",
                        ),
                    )}
                  />
                ) : (
                  <MarkdownBody markdown={summaryText} darkDoc={darkDoc} />
                )}
              </div>
              <div className={`${showPrintBlock} pb-4 pt-2`}>
                <MarkdownBody markdown={summaryText} darkDoc={false} />
              </div>
            </div>
            <FollowUpSection
              actionItems={actionItems}
              onToggleItem={onToggleActionItem}
              onChangeItem={onChangeActionItem}
              onAddItem={onAddActionItem}
              onRemoveItem={onRemoveActionItem}
              onSeek={onSeek}
              hideUI={hideUI}
              showPrintBlock={showPrintBlock}
              isPreviewMode={isPreviewMode}
              includeActionItems={includeActionItems}
            />
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400">
            문서를 불러오는 중입니다...
          </div>
        )}
      </div>
    </div>
  );
}
