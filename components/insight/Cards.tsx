"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

function Diff({ value }: { value: number }) {
  return (
    <div
      className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${value >= 0 ? "text-emerald-500" : "text-rose-500"}`}
    >
      {value >= 0 ? (
        <TrendingUp className="size-3.5" />
      ) : (
        <TrendingDown className="size-3.5" />
      )}
      <span>
        {value >= 0 ? `+${value}%` : `${value}%`} 지난달 대비
      </span>
    </div>
  );
}

export default function Cards({
  totalMeetings,
  meetingDiff,
  totalHours,
  durationDiff,
  avgDurationMinutes,
}: {
  totalMeetings: number;
  meetingDiff: number;
  totalHours: string;
  durationDiff: number;
  avgDurationMinutes: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="text-sm text-muted-foreground font-medium">총 회의 수</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight">
            {totalMeetings}
          </span>
          <span className="text-xs text-muted-foreground">건</span>
        </div>
        <Diff value={meetingDiff} />
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="text-sm text-muted-foreground font-medium">
          총 녹음 시간
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight">
            {totalHours}
          </span>
          <span className="text-xs text-muted-foreground">시간</span>
        </div>
        <Diff value={durationDiff} />
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="text-sm text-muted-foreground font-medium">
          평균 회의 길이
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight">
            {avgDurationMinutes}
          </span>
          <span className="text-xs text-muted-foreground">분</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <span>기록된 데이터 기준</span>
        </div>
      </div>
    </div>
  );
}
