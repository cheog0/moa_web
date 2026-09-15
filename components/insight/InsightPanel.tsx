"use client";

import { useMemo } from "react";
import { Calendar } from "lucide-react";
import { useInsightStats } from "@/lib/insight";
import Cards from "@/components/insight/Cards";
import Charts from "@/components/insight/Charts";
import Recent from "@/components/insight/Recent";
import Weekdays from "@/components/insight/Weekdays";

export default function InsightPanel({
  dbMeetings = [],
  onMeetingClick,
}: {
  dbMeetings: any[];
  onMeetingClick?: (meeting: any) => void;
}) {
  const stats = useInsightStats(dbMeetings);
  const recentMeetings = useMemo(
    () =>
      [...dbMeetings]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5),
    [dbMeetings],
  );

  return (
    <main className="mx-auto w-full max-w-7xl p-5 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">회의 인사이트</h1>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-sm">
          <Calendar className="size-4 text-muted-foreground" />
          <span>{stats.currentYear}년</span>
        </div>
      </div>
      <Cards
        totalMeetings={stats.totalMeetings}
        meetingDiff={stats.meetingDiff}
        totalHours={stats.totalHours}
        durationDiff={stats.durationDiff}
        avgDurationMinutes={stats.avgDurationMinutes}
      />
      <Charts monthlyBarData={stats.monthlyBarData} />
      <div className="grid gap-6 lg:grid-cols-12">
        <Recent meetings={recentMeetings} onMeetingClick={onMeetingClick} />
        <Weekdays dayActivityData={stats.dayActivityData} />
      </div>
    </main>
  );
}
