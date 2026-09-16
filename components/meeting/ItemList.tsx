"use client";

import { Fragment } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  History,
  Link as LinkIcon,
  ListChecks,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimelineItem } from "@/lib/timeline";

export function EmptyState({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-24 text-center transition-all hover:bg-slate-50">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-sky-100 text-sky-500 shadow-sm">
        <History className="size-10" />
      </div>
      <h2 className="mb-3 text-xl font-bold text-slate-900">
        첫 번째 회의를 연동해주세요
      </h2>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-slate-500">
        제목을 클릭해 이름을 변경하고, 기존에 기록해둔 회의록을 하나씩 불러와서
        타임라인을 만들어보세요.
      </p>
      <Button
        onClick={onOpenModal}
        className="h-12 rounded-xl bg-sky-500 px-8 text-base font-semibold hover:bg-sky-600 shadow-sm transition-all hover:-translate-y-0.5 text-white"
      >
        <LinkIcon className="mr-2 size-5" /> 첫 회의 연결하기
      </Button>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-border bg-card px-6 py-24 text-center">
      <Loader2 className="mb-4 size-8 animate-spin text-sky-500" />
      <p className="text-sm text-muted-foreground">
        타임라인을 불러오는 중입니다...
      </p>
    </div>
  );
}

export default function ItemList({
  items,
  dbMeetings,
  onMeetingClick,
  onUpdateDate,
  onRemove,
  onOpenModal,
}: {
  items: TimelineItem[];
  dbMeetings: any[];
  onMeetingClick?: (meeting: any) => void;
  onUpdateDate: (id: string, date: string) => void;
  onRemove: (id: string) => void;
  onOpenModal: () => void;
}) {
  const latestMeetingId = items.reduce(
    (latest, item) =>
      !latest || new Date(item.date) > new Date(latest.date) ? item : latest,
    null as TimelineItem | null,
  )?.id;

  const getMonthLabel = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
    });

  const getDayGap = (previousDate: string, currentDate: string) => {
    const gap = Math.round(
      (new Date(currentDate).getTime() - new Date(previousDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return gap > 0 ? `${gap}일 후` : null;
  };

  const getDecisionCount = (decisions?: string) => {
    if (!decisions?.trim()) return 0;
    return Math.max(
      decisions
        .split("\n")
        .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
        .filter(Boolean).length,
      1,
    );
  };

  return (
    <div className="relative ml-3 border-l border-slate-200 py-2 sm:ml-7">
      {items.map((meeting, index) => {
        const previousMeeting = items[index - 1];
        const showMonth =
          index === 0 ||
          getMonthLabel(previousMeeting.date) !== getMonthLabel(meeting.date);
        const dayGap = previousMeeting
          ? getDayGap(previousMeeting.date, meeting.date)
          : null;
        const decisionCount = getDecisionCount(meeting.decisions);

        return (
          <Fragment key={meeting.id}>
            {showMonth && (
              <div className="relative mb-2 pl-8 pt-2 sm:pl-10">
                <span className="absolute -left-1.5 top-2.5 size-3 rounded-full border-[3px] border-white bg-slate-900" />
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {getMonthLabel(meeting.date)}
                </p>
              </div>
            )}
            <article className="group relative mb-2 pl-8 sm:pl-10 animate-in slide-in-from-left-2 duration-300">
              <span className="absolute -left-[9px] top-7 flex size-[17px] items-center justify-center rounded-full bg-white">
                <CheckCircle2
                  className="size-[17px] text-sky-500"
                  fill="#e0f2fe"
                />
              </span>

              {dayGap && (
                <span className="absolute -left-3.5 -top-1 bg-white px-1 font-mono text-[9px] text-slate-400">
                  +{dayGap}
                </span>
              )}

              <div
                onClick={() => {
                  const originalMeeting = dbMeetings.find(
                    (m) => m.id === meeting.id,
                  );
                  if (onMeetingClick && originalMeeting)
                    onMeetingClick(originalMeeting);
                }}
                className="cursor-pointer border-b border-slate-200 px-1 py-3.5 transition-colors hover:border-sky-300 sm:px-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Calendar className="size-3 text-slate-400" />
                      <input
                        type="date"
                        value={meeting.date}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          onUpdateDate(meeting.id, e.target.value)
                        }
                        className="cursor-pointer bg-transparent font-mono text-[10px] leading-none text-slate-500 outline-none transition-colors hover:text-sky-600 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-edit]:text-[10px]"
                      />
                      {meeting.id === latestMeetingId && (
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-sky-600">
                          LATEST
                        </span>
                      )}
                    </div>
                    <h3 className="truncate text-base font-bold tracking-tight text-slate-900 transition-colors group-hover:text-sky-700">
                      {meeting.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-3">
                      <span
                        className={`flex items-center gap-1.5 text-[11px] ${
                          decisionCount > 0
                            ? "font-semibold text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        <ListChecks className="size-3.5" />
                        결정 사항 {decisionCount}건
                      </span>
                    </div>
                  </div>
                  <div className="flex self-stretch flex-col items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(meeting.id);
                      }}
                      className="rounded-md p-2 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                      title="타임라인에서 제외"
                    >
                      <Trash2 className="size-4" />
                    </button>
                    <ChevronRight className="mb-1 size-4 -translate-x-1 text-slate-300 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-sky-500 group-hover:opacity-100" />
                  </div>
                </div>
              </div>
            </article>
          </Fragment>
        );
      })}
      <div className="relative mt-5 pl-8 sm:pl-10">
        <span className="absolute -left-[7px] top-4 size-3.5 rounded-full border-2 border-slate-300 bg-white" />
        <Button
          variant="ghost"
          onClick={onOpenModal}
          className="h-12 w-full justify-start rounded-xl border border-dashed border-slate-300 px-4 text-slate-500 hover:border-sky-400 hover:bg-sky-50/50 hover:text-sky-600"
        >
          <Plus className="mr-2 size-4" /> 다음 회의 연결하기
        </Button>
      </div>
      <div className="absolute -bottom-4 -left-px h-10 w-px bg-gradient-to-b from-slate-200 to-transparent" />
    </div>
  );
}
