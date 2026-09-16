"use client";

import { useState } from "react";
import { Check, Clock3, Pencil, Sparkles } from "lucide-react";
import { MeetingMinutes } from "@/lib/constants";
import { ActionItem } from "@/lib/actionItems";
import { joinDecisions, splitDecisions } from "@/lib/decisions";
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
  decisionsText,
  actionItems,
  replyDraft,
  onSummaryChange,
  onDecisionsChange,
  onToggleActionItem,
  onReplyDraftChange,
  onSeek,
  hideUI,
  showPrintBlock,
  isPreviewMode,
  includeDecisions,
  includeActionItems,
}: {
  meetingTitle: string;
  onTitleChange: (value: string) => void;
  dateStr: string;
  minutes?: MeetingMinutes;
  summaryText: string;
  decisionsText: string;
  actionItems: ActionItem[];
  replyDraft: string;
  onSummaryChange: (value: string) => void;
  onDecisionsChange: (value: string) => void;
  onToggleActionItem: (id: string) => void;
  onReplyDraftChange: (value: string) => void;
  onSeek?: (timeStr: string) => void;
  hideUI: string;
  showPrintBlock: string;
  isPreviewMode: boolean;
  includeDecisions: boolean;
  includeActionItems: boolean;
}) {
  const { theme } = useTheme();
  const darkDoc = !isPreviewMode;
  const decisionItems = splitDecisions(decisionsText);
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  return (
    <div
      className={cn(
        `min-h-[300px] rounded-xl bg-white p-8 border border-gray-100 print:block print:min-h-0 print:h-auto print:border-none print:bg-transparent print:p-0 print:m-0 print:shadow-none print:ring-0 print:rounded-none ${isPreviewMode ? "shadow-lg border-none my-4 ring-1 ring-black/5" : "shadow-sm"}`,
        darkDoc &&
          whenDark(
            theme,
            "border-transparent bg-transparent shadow-none",
          ),
      )}
    >
      <input
        className={cn(
          `w-full rounded-md bg-transparent p-1 -ml-1 text-4xl font-extrabold tracking-tight text-gray-900 outline-none placeholder:text-gray-300 transition-colors hover:bg-gray-50 focus:bg-white ${hideUI}`,
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
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3
                  className={cn(
                    "flex items-center gap-2 text-lg font-bold text-gray-900",
                    darkDoc && whenDark(theme, "text-zinc-50"),
                  )}
                >
                  <Sparkles className="size-5 text-blue-500" /> 회의 요약 및 내용
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingSummary((open) => !open)}
                  className={cn(
                    `inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 ${hideUI}`,
                    darkDoc &&
                      whenDark(theme, "hover:bg-zinc-800 hover:text-zinc-100"),
                  )}
                >
                  <Pencil className="size-3.5" />
                  {isEditingSummary ? "미리보기" : "원문 편집"}
                </button>
              </div>
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
            {decisionItems.length > 0 && (
              <div
                className={`${!includeDecisions ? "print:hidden" : ""} ${!includeDecisions && isPreviewMode ? "hidden" : ""}`}
              >
              <h3
                className={cn(
                  "mb-3 flex items-center gap-2 text-lg font-bold text-gray-900",
                  darkDoc && whenDark(theme, "text-zinc-50"),
                )}
              >
                <Check className="size-5 text-green-500" /> 결정된 사항
              </h3>
              <ol className={`flex flex-col gap-2 ${hideUI}`}>
                {decisionItems.map((item, index) => (
                  <li
                    key={`${index}-${item.slice(0, 12)}`}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5",
                      darkDoc &&
                        whenDark(
                          theme,
                          "border-emerald-900/40 bg-emerald-950/20",
                        ),
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white",
                        darkDoc &&
                          whenDark(theme, "bg-emerald-500 text-emerald-950"),
                      )}
                    >
                      {index + 1}
                    </span>
                    <textarea
                      value={item}
                      rows={Math.min(6, Math.max(2, Math.ceil(item.length / 48)))}
                      onChange={(e) => {
                        const next = [...decisionItems];
                        next[index] = e.target.value;
                        onDecisionsChange(joinDecisions(next));
                      }}
                      className={cn(
                        "min-h-[44px] w-full resize-y bg-transparent text-sm font-medium leading-relaxed text-slate-800 outline-none",
                        darkDoc && whenDark(theme, "text-zinc-100"),
                      )}
                    />
                  </li>
                ))}
              </ol>
              <ol
                className={`${showPrintBlock} list-decimal space-y-2 pl-5 text-base leading-relaxed text-black`}
              >
                {decisionItems.map((item, index) => (
                  <li key={`print-${index}`}>{item}</li>
                ))}
              </ol>
              </div>
            )}
            <FollowUpSection
              actionItems={actionItems}
              replyDraft={replyDraft}
              onToggleItem={onToggleActionItem}
              onReplyDraftChange={onReplyDraftChange}
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
