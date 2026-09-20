"use client";

import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import {
  formatUsageClock,
  isUsageExhausted,
  usageProgress,
  type UsageSnapshot,
} from "@/lib/usage";
import { cn } from "@/lib/utils";

export default function UsageCard({ usage }: { usage?: UsageSnapshot | null }) {
  const { theme } = useTheme();
  if (!usage) return null;

  const exhausted = isUsageExhausted(usage);

  return (
    <section
      className={cn(
        "rounded-2xl border border-[#E8EAEE] bg-white px-3 py-2.5",
        whenDark(theme, "border-zinc-800 bg-zinc-900"),
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold">기본 엔진</p>
        <p
          className={cn(
            "text-[11px] font-semibold tabular-nums text-[#1C1F24]",
            exhausted && "text-rose-500",
            whenDark(theme, exhausted ? "text-rose-300" : "text-zinc-100"),
          )}
        >
          {formatUsageClock(usage.usedSeconds)} / {formatUsageClock(usage.limitSeconds)}
        </p>
      </div>
      <div
        className={cn(
          "mt-2 h-1.5 overflow-hidden rounded-full bg-[#F0F2F5]",
          whenDark(theme, "bg-zinc-800"),
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            exhausted ? "bg-rose-500" : "bg-[#4C9AFF]",
          )}
          style={{ width: `${Math.round(usageProgress(usage) * 100)}%` }}
        />
      </div>
      <p
        className={cn(
          "mt-1.5 text-[10px] leading-4 text-[#9AA1AA]",
          exhausted && "text-rose-500",
          whenDark(theme, exhausted ? "text-rose-300" : "text-zinc-400"),
        )}
      >
        {exhausted
          ? "이번 달 30분을 모두 사용했습니다"
          : `남은 시간 ${formatUsageClock(usage.remainingSeconds)}`}
      </p>
    </section>
  );
}
