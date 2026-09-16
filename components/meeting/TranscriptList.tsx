"use client";

import { Play } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function TranscriptList({
  transcript,
  isPreviewMode,
  onSeek,
}: {
  transcript: any;
  isPreviewMode: boolean;
  onSeek: (time: string) => void;
}) {
  const { theme } = useTheme();

  if (!transcript) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  if (typeof transcript === "string") {
    return (
      <div
        className={`rounded-xl border border-border bg-card p-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground ${isPreviewMode ? "border-none bg-transparent p-0 text-black" : "print:border-none print:bg-transparent print:p-0 print:text-black"}`}
      >
        {transcript}
      </div>
    );
  }

  if (!Array.isArray(transcript) || transcript.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        대화 내용이 없습니다.
      </div>
    );
  }

  return (
    <>
      {transcript.map((t: any, idx: number) => (
        <div
          key={idx}
          onClick={() => onSeek(t.time || "00:00")}
          className={cn(
            "group flex gap-4 cursor-pointer rounded-xl p-3 transition-colors hover:bg-sky-50 print:break-inside-avoid print:py-2 print:hover:bg-transparent",
            whenDark(theme, "hover:bg-sky-500/10"),
          )}
        >
          <span className="w-[60px] shrink-0 pt-0.5 font-mono text-xs font-semibold text-sky-500 transition-colors group-hover:text-sky-600 print:text-gray-500">
            <Play className="inline-block size-3 mr-1 opacity-0 transition-opacity group-hover:opacity-100 print:hidden" />
            {t.time || ""}
          </span>
          <div>
            <div className="text-sm font-semibold print:text-black">
              {t.speaker || "알 수 없음"}
            </div>
            <p className={cn(
              "mt-1 text-sm leading-7 text-muted-foreground group-hover:text-gray-900 print:text-gray-800",
              whenDark(theme, "group-hover:text-zinc-100"),
            )}>
              {t.text || ""}
            </p>
          </div>
        </div>
      ))}
    </>
  );
}
