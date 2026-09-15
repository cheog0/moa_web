import { useMemo } from "react";

export function buildInsightStats(dbMeetings: any[]) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

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

  const totalDurationSeconds = dbMeetings.reduce(
    (acc, m) => acc + (Number(m.duration) || 0),
    0,
  );
  const thisMonthDuration = thisMonthMeetings.reduce(
    (acc, m) => acc + (Number(m.duration) || 0),
    0,
  );
  const lastMonthDuration = lastMonthMeetings.reduce(
    (acc, m) => acc + (Number(m.duration) || 0),
    0,
  );
  const durationDiff =
    lastMonthDuration > 0
      ? Math.round(
          ((thisMonthDuration - lastMonthDuration) / lastMonthDuration) * 100,
        )
      : thisMonthDuration > 0
        ? 100
        : 0;

  const validMeetings = dbMeetings.filter((m) => Number(m.duration) > 0);
  const avgDurationMinutes =
    validMeetings.length === 0
      ? 0
      : Math.round(
          validMeetings.reduce((acc, m) => acc + Number(m.duration) / 60, 0) /
            validMeetings.length,
        );

  const monthlyBarData = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const monthMeetings = dbMeetings.filter((meeting) => {
      if (!meeting.created_at) return false;
      const md = new Date(meeting.created_at);
      return md.getFullYear() === y && md.getMonth() === m;
    });
    monthlyBarData.push({
      name: `${m + 1}월`,
      회의수: monthMeetings.length,
      녹음시간: Number(
        (
          monthMeetings.reduce(
            (acc, curr) => acc + (Number(curr.duration) || 0),
            0,
          ) / 3600
        ).toFixed(1),
      ),
    });
  }

  const counts: Record<string, number> = {
    월: 0,
    화: 0,
    수: 0,
    목: 0,
    금: 0,
    토: 0,
    일: 0,
  };
  dbMeetings.forEach((meeting) => {
    if (!meeting.created_at) return;
    const koreanDays = ["일", "월", "화", "수", "목", "금", "토"];
    const dName = koreanDays[new Date(meeting.created_at).getDay()];
    counts[dName] = (counts[dName] || 0) + 1;
  });

  return {
    currentYear,
    totalMeetings: dbMeetings.length,
    meetingDiff,
    totalHours: (totalDurationSeconds / 3600).toFixed(1),
    durationDiff,
    avgDurationMinutes,
    monthlyBarData,
    dayActivityData: ["월", "화", "수", "목", "금", "토", "일"].map((d) => ({
      day: d,
      count: counts[d] || 0,
    })),
  };
}

export function useInsightStats(dbMeetings: any[]) {
  return useMemo(() => buildInsightStats(dbMeetings), [dbMeetings]);
}
