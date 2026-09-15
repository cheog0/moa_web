"use client";

import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  History,
  Link as LinkIcon,
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
  return (
    <div className="relative ml-4 sm:ml-8 border-l-2 border-sky-100 py-4">
      {items.map((meeting) => (
        <div
          key={meeting.id}
          className="relative mb-8 pl-8 sm:pl-10 group animate-in slide-in-from-left-2 duration-300"
        >
          <span className="absolute -left-[13px] top-1 flex size-6 items-center justify-center bg-background">
            <CheckCircle2
              className="size-6 text-sky-500 drop-shadow-sm"
              fill="#e0f2fe"
            />
          </span>
          <div
            onClick={() => {
              const originalMeeting = dbMeetings.find(
                (m) => m.id === meeting.id,
              );
              if (onMeetingClick && originalMeeting)
                onMeetingClick(originalMeeting);
            }}
            className="rounded-2xl border bg-white border-border p-4 transition-all hover:shadow-md cursor-pointer hover:border-sky-300 group/card"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Calendar className="size-4 ml-1 text-muted-foreground" />
                <input
                  type="date"
                  value={meeting.date}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onUpdateDate(meeting.id, e.target.value)}
                  className="bg-transparent outline-none text-slate-600 font-medium cursor-pointer px-1 py-1 rounded-md hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-sky-500/30 transition-all [&::-webkit-calendar-picker-indicator]:hidden"
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(meeting.id);
                }}
                className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                title="타임라인에서 제외"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="flex items-center justify-between pr-2">
              <h3 className="text-lg font-bold text-foreground truncate pl-1">
                {meeting.title}
              </h3>
              <ChevronRight className="size-5 text-sky-500 opacity-0 group-hover/card:opacity-100 transition-all -translate-x-2 group-hover/card:translate-x-0" />
            </div>
          </div>
        </div>
      ))}
      <div className="relative pl-8 sm:pl-10 mt-4">
        <span className="absolute -left-[11px] top-2 flex size-5 items-center justify-center bg-background rounded-full border-2 border-slate-200" />
        <Button
          variant="ghost"
          onClick={onOpenModal}
          className="text-muted-foreground hover:text-sky-600 border border-dashed border-border hover:border-sky-300 w-full justify-start py-6 rounded-xl"
        >
          <Plus className="mr-2 size-4" /> 다음 회의 연결하기
        </Button>
      </div>
      <div className="absolute -bottom-4 -left-[1px] h-10 w-0.5 bg-gradient-to-b from-sky-100 to-transparent" />
    </div>
  );
}
