"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  ChevronRight,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function InsightPanel({
  dbMeetings = [],
  onMeetingClick,
}: {
  dbMeetings: any[];
  onMeetingClick?: (meeting: any) => void;
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0~11

  // 1. 상단 통계 계산
  const totalMeetings = dbMeetings.length;

  // 이번 달 / 지난달 필터링
  const thisMonthMeetings = dbMeetings.filter((m) => {
    if (!m.created_at) return false;
    const d = new Date(m.created_at);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthMeetings = dbMeetings.filter((m) => {
    if (!m.created_at) return false;
    const d = new Date(m.created_at);
    return (
      d.getFullYear() === lastMonthDate.getFullYear() &&
      d.getMonth() === lastMonthDate.getMonth()
    );
  });

  const thisCount = thisMonthMeetings.length;
  const lastCount = lastMonthMeetings.length;

  const meetingDiff =
    lastCount > 0
      ? Math.round(((thisCount - lastCount) / lastCount) * 100)
      : thisCount > 0
        ? 100
        : 0;

  // 2. 월별 회의 수 데이터 (최근 12개월)
  const monthlyBarData = useMemo(() => {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const label = `${m + 1}월`;

      const count = dbMeetings.filter((meeting) => {
        if (!meeting.created_at) return false;
        const md = new Date(meeting.created_at);
        return md.getFullYear() === y && md.getMonth() === m;
      }).length;

      data.push({ name: label, 회의수: count });
    }
    return data;
  }, [dbMeetings, currentYear, currentMonth]);

  // 3. 최근 회의 목록 (최대 5개 정렬)
  const recentMeetings = useMemo(() => {
    return [...dbMeetings]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5);
  }, [dbMeetings]);

  // 4. 요일별 활동 데이터
  const dayActivityData = useMemo(() => {
    const counts: { [key: string]: number } = {
      월: 12,
      화: 18,
      수: 22,
      목: 15,
      금: 10,
      토: 3,
      일: 2,
    };
    dbMeetings.forEach((m) => {
      if (!m.created_at) return;
      const dayIdx = new Date(m.created_at).getDay(); // 0(일)~6(토)
      const koreanDays = ["일", "월", "화", "수", "목", "금", "토"];
      const dName = koreanDays[dayIdx];
      counts[dName] = (counts[dName] || 0) + 1;
    });

    return ["월", "화", "수", "목", "금", "토", "일"].map((d) => ({
      day: d,
      count: counts[d] || 5,
    }));
  }, [dbMeetings]);

  // 최고 활성 요일 찾기
  const maxDayCount = useMemo(() => {
    return Math.max(...dayActivityData.map((d) => d.count), 1);
  }, [dayActivityData]);

  // 상대 시간 포맷팅 헬퍼
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `방금 전`;
    if (diffHours < 24)
      return `오늘 · ${date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
    if (diffDays === 1)
      return `어제 · ${date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
    return `${diffDays}일 전 · ${date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  };

  return (
    <main className="mx-auto w-full max-w-7xl p-5 sm:p-8 space-y-6">
      {/* 상단 타이틀 및 연도 선택 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            회의 인사이트
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-sm">
            <Calendar className="size-4 text-muted-foreground" />
            <span>{currentYear}년</span>
          </div>
        </div>
      </div>

      {/* 3개 상단 지표 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground font-medium">
            총 회의 수
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">
              {totalMeetings}
            </span>
            <span className="text-xs text-muted-foreground">건</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
            <TrendingUp className="size-3.5" />
            <span>+{meetingDiff}% 지난달 대비</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground font-medium">
            녹음 시간
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">468</span>
            <span className="text-xs text-muted-foreground">시간</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
            <TrendingUp className="size-3.5" />
            <span>+8.1% 지난달 대비</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground font-medium">
            평균 회의 길이
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">38</span>
            <span className="text-xs text-muted-foreground">분</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-rose-500">
            <TrendingDown className="size-3.5" />
            <span>-3.5% 지난달 대비</span>
          </div>
        </div>
      </div>

      {/* 중단 차트 영역 (월별 회의 수 / 녹음 시간 추이) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 월별 회의 수 바 차트 */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold">월별 회의 수</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              최근 12개월 동안 녹음된 회의 건수
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyBarData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  opacity={0.4}
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.75rem",
                    color: "hsl(var(--foreground))",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [`${value}건`, "회의 수"]}
                />
                <Bar
                  dataKey="회의수"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  opacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 녹음 시간 추이 영역 차트 */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold">녹음 시간 추이</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              월별 누적 녹음 시간 (시간)
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyBarData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  opacity={0.4}
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.75rem",
                    color: "hsl(var(--foreground))",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [
                    `${Number(value) * 3} 시간`,
                    "누적 시간",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="회의수"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTime)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 하단 그리드 (최근 회의 & 요일별 활동) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* 최근 회의 리스트 */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-5 flex flex-col justify-start">
          <div className="mb-4">
            <h3 className="text-base font-bold">최근 회의</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              가장 최근에 녹음된 회의
            </p>
          </div>

          <div className="space-y-3 flex-1">
            {recentMeetings.map((m) => (
              <div
                key={m.id}
                onClick={() => onMeetingClick && onMeetingClick(m)}
                className="group flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/60 hover:border-primary/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {m.title || "새 회의"}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span>{formatTimeAgo(m.created_at)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" /> 35분
                      </span>
                    </p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
              </div>
            ))}

            {recentMeetings.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                아직 녹음된 회의가 없습니다.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>목록을 클릭하면 상세 내용을 볼 수 있습니다.</span>
          </div>
        </div>

        {/* 요일별 활동 바 (그라데이션 및 강조 효과 적용) */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-7 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold">요일별 활동</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              회의가 가장 많은 요일
            </p>
          </div>

          <div className="space-y-3.5 my-6">
            {dayActivityData.map((item, idx) => {
              const percentage = Math.round((item.count / maxDayCount) * 100);
              const isHighest = item.count === maxDayCount;

              return (
                <div key={idx} className="flex items-center gap-4 text-sm">
                  <span
                    className={`w-6 font-semibold ${isHighest ? "text-primary font-bold" : "text-muted-foreground"}`}
                  >
                    {item.day}
                  </span>
                  <div className="flex-1 h-3.5 bg-muted/40 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHighest
                          ? "bg-gradient-to-r from-primary/80 to-primary shadow-sm"
                          : "bg-primary/30"
                      }`}
                      style={{ width: `${Math.max(percentage, 8)}%` }}
                    />
                  </div>
                  <span
                    className={`w-8 text-right text-xs font-bold ${isHighest ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>가장 활발한 요일에 진한 그라데이션이 적용됩니다.</span>
            <span className="font-semibold text-primary">생산성 분석 완료</span>
          </div>
        </div>
      </div>
    </main>
  );
}
