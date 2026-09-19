"use client";

import { AlertCircle, Plus, X } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function Keywords({
  keywords,
  newKeyword,
  errorMsg,
  onNewKeywordChange,
  onAdd,
  onRemove,
}: {
  keywords: string[];
  newKeyword: string;
  errorMsg: string;
  onNewKeywordChange: (value: string) => void;
  onAdd: (e: React.KeyboardEvent | React.MouseEvent) => void;
  onRemove: (keyword: string) => void;
}) {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col gap-2.5">
      {keywords.length === 0 ? (
        <p
          className={cn(
            "text-xs text-[#9AA1AA]",
            whenDark(theme, "text-zinc-500"),
          )}
        >
          등록된 키워드가 없습니다.
        </p>
      ) : (
        <div className="flex flex-wrap content-start gap-1.5">
          {keywords.map((kw) => (
            <span
              key={kw}
              className={cn(
                "inline-flex items-center gap-1 rounded-full bg-[#EEEEF0] px-2.5 py-1 text-xs font-medium text-[#1C1F24]",
                whenDark(theme, "bg-zinc-800 text-zinc-200"),
              )}
            >
              {kw}
              <button
                type="button"
                onClick={() => onRemove(kw)}
                className={cn(
                  "rounded-full p-0.5 text-[#9AA1AA] transition-colors hover:text-[#1C1F24]",
                  whenDark(theme, "hover:text-zinc-100"),
                )}
                aria-label={`${kw} 삭제`}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-stretch gap-2">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => onNewKeywordChange(e.target.value)}
          onKeyDown={onAdd}
          placeholder="예: 업무, 계약"
          disabled={keywords.length >= 100}
          className={cn(
            "h-12 flex-1 rounded-2xl bg-[#F7F8FA] px-3.5 text-[13px] text-[#1C1F24] outline-none transition-shadow placeholder:text-[#9AA1AA]/85 focus:ring-2 focus:ring-[#4C9AFF]/35",
            whenDark(
              theme,
              "bg-zinc-950 text-zinc-100 placeholder:text-zinc-500 focus:ring-sky-500/30",
            ),
          )}
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={keywords.length >= 100}
          className={cn(
            "inline-flex h-12 shrink-0 items-center gap-1 rounded-2xl border border-[#E8EAEE] bg-white px-3.5 text-sm font-semibold text-[#1C1F24] transition-colors hover:bg-[#F7F8FA] disabled:opacity-50",
            whenDark(
              theme,
              "border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
            ),
          )}
        >
          <Plus className="size-4" />
          추가
        </button>
      </div>
      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-rose-500 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="size-3.5" />
          {errorMsg}
        </div>
      )}
    </div>
  );
}
