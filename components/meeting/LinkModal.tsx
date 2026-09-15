"use client";

import { AlertCircle, ChevronRight, FileText, Search, X } from "lucide-react";
import { TimelineItem } from "@/lib/timeline";

export default function LinkModal({
  meetings,
  timelineItems,
  searchQuery,
  onSearchChange,
  onClose,
  onSelect,
}: {
  meetings: any[];
  timelineItems: TimelineItem[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onSelect: (meeting: any) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-background rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">기존 회의 연결하기</h2>
            <p className="text-xs text-muted-foreground mt-1">
              타임라인에 추가할 회의를 선택하세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="회의 제목으로 검색..."
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm shadow-sm"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-y-auto p-4 flex-1 custom-scrollbar flex flex-col gap-2">
          {meetings.length > 0 ? (
            meetings.map((meeting) => {
              const isAlreadyAdded = timelineItems.some(
                (item) => item.id === meeting.id,
              );
              return (
                <button
                  key={meeting.id}
                  onClick={() => !isAlreadyAdded && onSelect(meeting)}
                  disabled={isAlreadyAdded}
                  className={`flex items-center gap-4 w-full p-4 rounded-xl border text-left transition-all group ${
                    isAlreadyAdded
                      ? "border-transparent bg-slate-50 opacity-50 cursor-not-allowed"
                      : "border-transparent hover:border-sky-200 hover:bg-sky-50 hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                      isAlreadyAdded
                        ? "bg-slate-200 text-slate-400"
                        : "bg-sky-100 text-sky-600 group-hover:bg-sky-500 group-hover:text-white"
                    } transition-colors`}
                  >
                    <FileText className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-semibold text-sm truncate ${
                        isAlreadyAdded
                          ? "text-slate-500"
                          : "group-hover:text-sky-700"
                      }`}
                    >
                      {meeting.title || "새 회의"}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {new Date(meeting.created_at).toLocaleString("ko-KR")}
                      </p>
                      {isAlreadyAdded && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-sm">
                          <AlertCircle className="size-3" /> 이미 추가됨
                        </span>
                      )}
                    </div>
                  </div>
                  {!isAlreadyAdded && (
                    <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center">
              <Search className="size-8 text-muted-foreground/30 mb-3" />
              검색된 회의가 없거나 아직 기록된 회의가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
