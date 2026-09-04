"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CalendarView({
  meetings,
  onMeetingClick,
}: {
  meetings: any[];
  onMeetingClick: (meeting: any) => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 달력 계산 로직
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0(일) ~ 6(토)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // 특정 날짜의 회의 찾기
  const getMeetingsForDay = (day: number) => {
    return meetings.filter((m) => {
      if (!m.created_at) return false;
      const d = new Date(m.created_at);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });
  };

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold">
          {year}년 {month + 1}월
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px rounded-lg bg-border">
        {weekDays.map((day, idx) => (
          <div
            key={day}
            className={`bg-muted/50 py-3 text-center text-sm font-semibold ${idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : "text-foreground"}`}
          >
            {day}
          </div>
        ))}

        {blanks.map((b) => (
          <div key={`blank-${b}`} className="min-h-[120px] bg-card p-2" />
        ))}

        {days.map((day) => {
          const dayMeetings = getMeetingsForDay(day);
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          return (
            <div
              key={day}
              className="min-h-[120px] bg-card p-2 transition-colors hover:bg-muted/30"
            >
              <div className="mb-2 flex justify-between">
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-sm font-medium ${
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {day}
                </span>
                {dayMeetings.length > 0 && (
                  <span className="text-xs font-semibold text-primary">
                    {dayMeetings.length}건
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {dayMeetings.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onMeetingClick(m)}
                    // 💡 글자 크기를 12px로 살짝 키우고, 여백을 조금 더 넉넉하게 주어 가독성을 높였습니다.
                    style={{ fontSize: "12px", padding: "3px 6px" }}
                    className="flex w-full items-center gap-1 overflow-hidden rounded bg-primary/10 text-left font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    {/* 💡 아이콘 크기도 글씨 크기에 맞춰 12px로 살짝 키웠습니다. */}
                    <FileText
                      style={{ width: "12px", height: "12px" }}
                      className="shrink-0 opacity-70"
                    />
                    <span className="truncate leading-none pt-px">
                      {m.title || "새 회의"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
