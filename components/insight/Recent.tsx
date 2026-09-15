"use client";

import { ChevronRight, Clock, FileText } from "lucide-react";
import { formatTimeAgo } from "@/lib/dates";

export default function Recent({
  meetings,
  onMeetingClick,
}: {
  meetings: any[];
  onMeetingClick?: (meeting: any) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-5 flex flex-col justify-start">
      <div className="mb-4">
        <h3 className="text-base font-bold">최근 회의</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          가장 최근에 녹음된 회의
        </p>
      </div>
      <div className="space-y-3 flex-1">
        {meetings.map((m) => {
          const durationMin = Math.round((Number(m.duration) || 0) / 60);
          return (
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
                    {durationMin > 0 && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" /> {durationMin}분
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
            </div>
          );
        })}
        {meetings.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
            아직 녹음된 회의가 없습니다.
          </div>
        )}
      </div>
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>목록을 클릭하면 상세 내용을 볼 수 있습니다.</span>
      </div>
    </div>
  );
}
