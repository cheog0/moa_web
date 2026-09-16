"use client";

import { Check, Clock3, Sparkles } from "lucide-react";
import { MeetingMinutes } from "@/lib/constants";
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
  onSummaryChange,
  onDecisionsChange,
  hideUI,
  showPrintBlock,
  isPreviewMode,
  includeDecisions,
}: {
  meetingTitle: string;
  onTitleChange: (value: string) => void;
  dateStr: string;
  minutes?: MeetingMinutes;
  summaryText: string;
  decisionsText: string;
  onSummaryChange: (value: string) => void;
  onDecisionsChange: (value: string) => void;
  hideUI: string;
  showPrintBlock: string;
  isPreviewMode: boolean;
  includeDecisions: boolean;
}) {
  const { theme } = useTheme();
  const darkDoc = !isPreviewMode;

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
              <h3
                className={cn(
                  "mb-2 flex items-center gap-2 text-lg font-bold text-gray-900",
                  darkDoc && whenDark(theme, "text-zinc-50"),
                )}
              >
                <Sparkles className="size-5 text-blue-500" /> 회의 요약 및 내용
              </h3>
              <textarea
                value={summaryText}
                onChange={(e) => onSummaryChange(e.target.value)}
                className={cn(
                  `w-full min-h-[400px] resize-y rounded-lg border border-transparent p-3 text-base leading-relaxed text-gray-800 transition-colors hover:border-gray-200 focus:border-primary focus:outline-none ${hideUI}`,
                  darkDoc &&
                    whenDark(
                      theme,
                      "text-zinc-200 hover:border-zinc-700",
                    ),
                )}
              />
              <div
                className={`${showPrintBlock} whitespace-pre-wrap pb-4 pt-2 text-base leading-relaxed text-black`}
              >
                {summaryText || "내용이 없습니다."}
              </div>
            </div>
            <div
              className={`${!includeDecisions ? "print:hidden" : ""} ${!includeDecisions && isPreviewMode ? "hidden" : ""}`}
            >
              <h3
                className={cn(
                  "mb-2 flex items-center gap-2 text-lg font-bold text-gray-900",
                  darkDoc && whenDark(theme, "text-zinc-50"),
                )}
              >
                <Check className="size-5 text-green-500" /> 결정된 사항
              </h3>
              <textarea
                value={decisionsText}
                onChange={(e) => onDecisionsChange(e.target.value)}
                className={cn(
                  `w-full min-h-[80px] resize-y rounded-lg border border-transparent p-3 text-base leading-relaxed text-gray-800 transition-colors hover:border-gray-200 focus:border-primary focus:outline-none ${hideUI}`,
                  darkDoc &&
                    whenDark(
                      theme,
                      "text-zinc-200 hover:border-zinc-700",
                    ),
                )}
              />
              <div
                className={`${showPrintBlock} whitespace-pre-wrap pt-2 text-base leading-relaxed text-black`}
              >
                {decisionsText || "결정된 사항이 없습니다."}
              </div>
            </div>
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
