"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Check,
  Clock3,
  Download,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeetingMinutes } from "@/lib/constants";

export default function DetailPanel({
  onClose,
  minutes,
  meeting,
  onUpdateTitle,
  onUpdateMinutes,
  onDelete,
}: {
  onClose: () => void;
  minutes?: MeetingMinutes;
  meeting: any;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onUpdateMinutes: (
    id: string,
    updatedMinutes: Partial<MeetingMinutes>,
  ) => void;
  onDelete: (id: string) => void;
}) {
  const [tab, setTab] = useState<"minutes" | "transcript">("minutes");
  const [meetingTitle, setMeetingTitle] = useState(meeting?.title || "새 회의");
  const [summaryText, setSummaryText] = useState(minutes?.summary || "");
  const [decisionsText, setDecisionsText] = useState(minutes?.decisions || "");

  useEffect(() => {
    if (minutes) {
      setSummaryText(minutes.summary || "");
      setDecisionsText(minutes.decisions || "");
    }
  }, [minutes]);

  const dateStr = meeting?.created_at
    ? new Date(meeting.created_at).toLocaleDateString("ko-KR")
    : new Date().toLocaleDateString("ko-KR");
  const handlePrintPDF = () => window.print();

  const handleTitleBlur = () => {
    if (
      meeting?.id &&
      meetingTitle.trim() !== "" &&
      meetingTitle !== meeting.title
    )
      onUpdateTitle(meeting.id, meetingTitle);
  };
  const handleSummaryBlur = () => {
    if (meeting?.id && summaryText !== minutes?.summary)
      onUpdateMinutes(meeting.id, { summary: summaryText });
  };
  const handleDecisionsBlur = () => {
    if (meeting?.id && decisionsText !== minutes?.decisions)
      onUpdateMinutes(meeting.id, { decisions: decisionsText });
  };
  const handleDelete = () => {
    if (
      confirm(
        "정말로 이 회의록을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.",
      )
    ) {
      if (meeting?.id) onDelete(meeting.id);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-foreground/20 backdrop-blur-sm print:static print:inset-auto print:bg-transparent print:backdrop-blur-none">
      <div className="flex h-full w-full max-w-4xl flex-col overflow-y-auto border-l border-border bg-background shadow-2xl print:w-full print:max-w-none print:shadow-none print:bg-white">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-6 py-4 backdrop-blur print:hidden">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="rounded-lg p-2 hover:bg-muted">
              <X className="size-4" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground">{dateStr}</p>
              <h2 className="font-bold truncate max-w-[200px]">
                {meetingTitle}
              </h2>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" onClick={handlePrintPDF}>
              <Download className="mr-2 size-4" /> PDF
            </Button>
            {meeting?.id && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </header>

        <div className="flex border-b border-border px-6 pt-4 print:hidden">
          <button
            onClick={() => setTab("minutes")}
            className={`border-b-2 px-1 pb-3 text-sm font-semibold ${tab === "minutes" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            문서 뷰 (노션 스타일)
          </button>
          <button
            onClick={() => setTab("transcript")}
            className={`ml-6 border-b-2 px-1 pb-3 text-sm font-semibold ${tab === "transcript" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            전체 대화
          </button>
        </div>

        <main className="mx-auto w-full max-w-3xl p-6 sm:p-12 print:p-0">
          {tab === "minutes" ? (
            <div className="min-h-[800px] rounded-xl bg-white p-8 shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
              <input
                className="w-full bg-transparent text-4xl font-extrabold tracking-tight text-gray-900 outline-none placeholder:text-gray-300 transition-colors hover:bg-gray-50 focus:bg-white rounded-md p-1 -ml-1"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="제목 없는 문서"
              />

              <div className="mt-8 text-gray-800">
                {minutes ? (
                  <div className="flex flex-col gap-8 text-base leading-relaxed">
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles className="size-5 text-blue-500" /> 회의 요약
                        및 내용
                      </h3>
                      <textarea
                        value={summaryText}
                        onChange={(e) => setSummaryText(e.target.value)}
                        onBlur={handleSummaryBlur}
                        className="w-full min-h-[220px] resize-y rounded-lg border border-transparent p-3 text-base leading-relaxed text-gray-800 transition-colors hover:border-gray-200 focus:border-primary focus:outline-none print:p-0"
                      />
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Check className="size-5 text-green-500" /> 결정된 사항
                      </h3>
                      <textarea
                        value={decisionsText}
                        onChange={(e) => setDecisionsText(e.target.value)}
                        onBlur={handleDecisionsBlur}
                        className="w-full min-h-[120px] resize-y rounded-lg border border-transparent p-3 text-base leading-relaxed text-gray-800 transition-colors hover:border-gray-200 focus:border-primary focus:outline-none print:p-0"
                      />
                    </div>
                    {minutes.action_items && (
                      <div>
                        <h3 className="mb-3 text-lg font-bold text-gray-900 flex items-center gap-2">
                          <BookOpen className="size-5 text-orange-500" /> 액션
                          아이템
                        </h3>
                        {typeof minutes.action_items === "string" ? (
                          <div className="whitespace-pre-wrap p-3 text-gray-700">
                            {minutes.action_items}
                          </div>
                        ) : Array.isArray(minutes.action_items) &&
                          minutes.action_items.length > 0 ? (
                          <ul className="flex flex-col gap-3">
                            {minutes.action_items.map((item, idx) => {
                              const hasAssignee =
                                item.assignee &&
                                item.assignee.trim() !== "" &&
                                item.assignee !== "미정";
                              const hasTask =
                                item.task && item.task.trim() !== "";
                              if (!hasAssignee && !hasTask) return null;
                              return (
                                <li
                                  key={idx}
                                  className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 print:bg-transparent print:p-0"
                                >
                                  <input
                                    type="checkbox"
                                    className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <span className="leading-relaxed">
                                    {hasAssignee && (
                                      <span className="font-semibold text-gray-900 mr-2">
                                        @{item.assignee}
                                      </span>
                                    )}
                                    {hasTask ? item.task : "내용 없음"}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-400 p-3">
                            등록된 액션 아이템이 없습니다.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-20 text-center text-gray-400">
                    문서를 불러오는 중입니다...
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 py-7">
              {minutes ? (
                typeof minutes.transcript === "string" ? (
                  <div className="rounded-xl border border-border bg-card p-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                    {minutes.transcript}
                  </div>
                ) : Array.isArray(minutes.transcript) &&
                  minutes.transcript.length > 0 ? (
                  minutes.transcript.map((t, idx) => (
                    <div key={idx} className="flex gap-4">
                      <span className="w-12 shrink-0 pt-0.5 font-mono text-xs text-muted-foreground">
                        {t.time || ""}
                      </span>
                      <div>
                        <div className="text-sm font-semibold">
                          {t.speaker || "알 수 없음"}
                        </div>
                        <p className="mt-1 text-sm leading-7 text-muted-foreground">
                          {t.text || ""}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-muted-foreground">
                    대화 내용이 없습니다.
                  </div>
                )
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  불러오는 중...
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
