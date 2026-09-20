"use client";

import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import {
  formatUsageClock,
  FREE_MONTHLY_MINUTES,
  isUsageExhausted,
  usageProgress,
  type UsageSnapshot,
} from "@/lib/usage";
import { cn } from "@/lib/utils";

function usageTone(usage: UsageSnapshot) {
  if (usage.remainingSeconds <= 0) return "danger";
  const left = usage.remainingSeconds / Math.max(usage.limitSeconds, 1);
  if (left <= 0.2 || usage.remainingSeconds <= 60) return "warn";
  if (left <= 0.5) return "caution";
  return "ok";
}

export default function UsageCard({ usage }: { usage?: UsageSnapshot | null }) {
  const { theme } = useTheme();
  if (!usage) return null;

  const exhausted = isUsageExhausted(usage);
  const tone = usageTone(usage);

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
            whenDark(theme, "text-zinc-100"),
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
            tone === "ok" && "bg-[#4C9AFF]",
            tone === "caution" && "bg-amber-400",
            tone === "warn" && "bg-orange-500",
            tone === "danger" && "bg-rose-500",
          )}
          style={{ width: `${Math.round(usageProgress(usage) * 100)}%` }}
        />
      </div>
      <p
        className={cn(
          "mt-1.5 text-[10px] leading-4",
          tone === "ok" && "text-[#9AA1AA]",
          tone === "caution" && "text-amber-600",
          tone === "warn" && "text-orange-600",
          tone === "danger" && "text-rose-500",
          whenDark(
            theme,
            tone === "ok"
              ? "text-zinc-400"
              : tone === "caution"
                ? "text-amber-300"
                : tone === "warn"
                  ? "text-orange-300"
                  : "text-rose-300",
          ),
        )}
      >
        {exhausted
          ? `이번 달 ${FREE_MONTHLY_MINUTES}분을 모두 사용했습니다`
          : `남은 시간 ${formatUsageClock(usage.remainingSeconds)}`}
      </p>
    </section>
  );
}
