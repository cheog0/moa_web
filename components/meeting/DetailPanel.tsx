"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Clock3,
  Download,
  Eye,
  Play,
  Pause,
  Sparkles,
  Trash2,
  X,
  Music,
  FileText,
  ChevronDown,
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
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const [printOptions, setPrintOptions] = useState({
    decisions: true,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState("00:00");

  useEffect(() => {
    if (minutes) {
      setSummaryText(minutes.summary || "");
      setDecisionsText(minutes.decisions || "");
    }
  }, [minutes]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      const current = audio.currentTime;
      const m = Math.floor(current / 60);
      const s = Math.floor(current % 60);
      setCurrentTimeDisplay(
        `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [meeting?.audio_url]);

  const dateStr = meeting?.created_at
    ? new Date(meeting.created_at).toLocaleDateString("ko-KR")
    : new Date().toLocaleDateString("ko-KR");

  const handlePrintPDF = () => {
    setTab("minutes");
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleEnterPreview = () => {
    setTab("minutes");
    setIsPreviewMode(true);
    setIsDownloadOpen(false);
  };

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

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
  };

  const handleSeek = (timeStr: string) => {
    if (!audioRef.current) return;
    const parts = timeStr.split(":").map(Number);
    let seconds = 0;
    if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
    if (parts.length === 3)
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];

    audioRef.current.currentTime = seconds;
    audioRef.current.play();
  };

  const handleDownloadAudio = async () => {
    if (!meeting?.audio_url) return alert("다운로드할 음성 파일이 없습니다.");
    try {
      window.open(meeting.audio_url, "_blank");
    } catch (e) {
      alert("음성 다운로드에 실패했습니다.");
    }
  };

  const handleDownloadTranscript = () => {
    if (!minutes?.transcript) return alert("다운로드할 대화 내용이 없습니다.");
    let content = "";
    if (typeof minutes.transcript === "string") {
      content = minutes.transcript;
    } else if (Array.isArray(minutes.transcript)) {
      content = minutes.transcript
        .map(
          (t) =>
            `[${t.time || "00:00"}] ${t.speaker || "알 수 없음"}: ${t.text || ""}`,
        )
        .join("\n\n");
    }
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meetingTitle || "회의록"}_전체대화.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hideUI = isPreviewMode ? "hidden" : "print:hidden";
  const showPrintBlock = isPreviewMode ? "block" : "hidden print:block";

  return (
    <div
      className="fixed inset-0 z-30 flex justify-end bg-foreground/20 backdrop-blur-sm print:static print:block print:h-auto print:min-h-0 print:bg-white print:backdrop-blur-none"
      onClick={onClose}
    >
      <style>{`
        @media print {
          @page { margin: 0; }
          html, body, #__next, .min-h-screen {
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            background-color: white !important;
          }
        }
      `}</style>

      <div
        className={`flex h-full w-full max-w-4xl flex-col overflow-y-auto border-l border-border shadow-2xl print:block print:h-auto print:min-h-0 print:w-full print:max-w-none print:overflow-visible print:border-none print:shadow-none print:bg-white ${isPreviewMode ? "bg-zinc-100" : "bg-background"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {meeting?.audio_url && (
          <audio ref={audioRef} src={meeting.audio_url} preload="metadata" />
        )}

        {isPreviewMode ? (
          <div className="sticky top-0 z-20 flex items-center justify-between bg-zinc-800 px-6 py-4 text-white shadow-md print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <div className="flex items-center gap-2 font-semibold">
                <Eye className="size-5 text-sky-400" />{" "}
                <span className="hidden sm:inline">PDF 미리보기</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-zinc-600"></div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={printOptions.decisions}
                    onChange={(e) =>
                      setPrintOptions((prev) => ({
                        ...prev,
                        decisions: e.target.checked,
                      }))
                    }
                    className="size-4 rounded border-zinc-500 bg-zinc-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-zinc-800 cursor-pointer"
                  />
                  결정된 사항 포함
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPreviewMode(false)}
                className="text-black"
              >
                돌아가기
              </Button>
              <Button
                size="sm"
                onClick={handlePrintPDF}
                className="bg-sky-500 text-white hover:bg-sky-600"
              >
                <Download className="mr-2 size-4" /> 이대로 PDF 저장
              </Button>
            </div>
          </div>
        ) : (
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-6 py-4 backdrop-blur print:hidden">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-muted"
              >
                <X className="size-4" />
              </button>
              <div className="hidden sm:block">
                <p className="text-xs text-muted-foreground">{dateStr}</p>
                <h2 className="font-bold truncate max-w-[150px]">
                  {meetingTitle}
                </h2>
              </div>
            </div>

            <div className="flex gap-2 items-center relative">
              {meeting?.audio_url && (
                <div className="hidden sm:flex mr-2 items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 shadow-sm transition-colors hover:bg-muted/80">
                  <button
                    onClick={togglePlay}
                    className="text-primary hover:text-sky-600 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="size-4" fill="currentColor" />
                    ) : (
                      <Play className="size-4" fill="currentColor" />
                    )}
                  </button>
                  <span className="w-10 text-center font-mono text-xs font-semibold text-muted-foreground">
                    {currentTimeDisplay}
                  </span>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleEnterPreview}
                title="PDF 인쇄 미리보기"
              >
                <Eye className="size-4 sm:mr-2 text-sky-500" />{" "}
                <span className="hidden sm:inline">미리보기</span>
              </Button>

              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                >
                  <Download className="size-4 sm:mr-2" />
                  <span className="hidden sm:inline">다운로드</span>
                  <ChevronDown className="ml-1 size-3 text-muted-foreground" />
                </Button>

                {isDownloadOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDownloadOpen(false);
                      }}
                    />

                    <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-100">
                      {meeting?.audio_url && (
                        <button
                          onClick={() => {
                            handleDownloadAudio();
                            setIsDownloadOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                        >
                          <Music className="size-4 text-indigo-500" /> 음성 파일
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleDownloadTranscript();
                          setIsDownloadOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                      >
                        <FileText className="size-4 text-green-500" /> 대화
                        텍스트
                      </button>
                      <button
                        onClick={() => {
                          handleEnterPreview();
                          setIsDownloadOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                      >
                        <Download className="size-4 text-sky-500" /> 문서 (PDF)
                      </button>
                    </div>
                  </>
                )}
              </div>

              {meeting?.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="ml-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </header>
        )}

        <div className={`flex border-b border-border px-6 pt-4 ${hideUI}`}>
          <button
            onClick={() => setTab("minutes")}
            className={`border-b-2 px-1 pb-3 text-sm font-semibold ${tab === "minutes" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            문서 뷰
          </button>
          <button
            onClick={() => setTab("transcript")}
            className={`ml-6 border-b-2 px-1 pb-3 text-sm font-semibold ${tab === "transcript" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            전체 대화
          </button>
        </div>

        <main
          className={`mx-auto w-full max-w-3xl ${isPreviewMode ? "p-8" : "p-6 sm:p-12"} print:block print:max-w-none print:h-auto print:min-h-0 print:py-[15mm] print:px-[20mm] print:m-0`}
        >
          {tab === "minutes" ? (
            <div
              className={`min-h-[300px] rounded-xl bg-white p-8 border border-gray-100 print:block print:min-h-0 print:h-auto print:border-none print:bg-transparent print:p-0 print:m-0 print:shadow-none print:ring-0 print:rounded-none ${isPreviewMode ? "shadow-lg border-none my-4 ring-1 ring-black/5" : "shadow-sm"}`}
            >
              <input
                className={`w-full rounded-md bg-transparent p-1 -ml-1 text-4xl font-extrabold tracking-tight text-gray-900 outline-none placeholder:text-gray-300 transition-colors hover:bg-gray-50 focus:bg-white ${hideUI}`}
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="제목 없는 문서"
              />
              <h1
                className={`${showPrintBlock} mb-2 text-4xl font-extrabold tracking-tight text-black`}
              >
                {meetingTitle || "제목 없는 문서"}
              </h1>

              <div
                className={`mt-4 flex items-center gap-4 border-b border-gray-100 pb-6 text-sm text-gray-500 ${isPreviewMode ? "pb-4 mt-2" : "print:pb-4 print:mt-2 print:border-gray-300"}`}
              >
                <span className="flex items-center gap-1.5">
                  <Clock3 className="size-4" /> {dateStr}
                </span>
              </div>

              <div className="mt-8 text-gray-800">
                {minutes ? (
                  <div className="flex flex-col gap-8 text-base leading-relaxed">
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-gray-900">
                        <Sparkles className="size-5 text-blue-500" /> 회의 요약
                        및 내용
                      </h3>
                      {/* 💡 min-h-[220px]에서 min-h-[400px]로 대폭 확장하여 기본 입력창 크기를 키웠습니다. */}
                      <textarea
                        value={summaryText}
                        onChange={(e) => setSummaryText(e.target.value)}
                        onBlur={handleSummaryBlur}
                        className={`w-full min-h-[400px] resize-y rounded-lg border border-transparent p-3 text-base leading-relaxed text-gray-800 transition-colors hover:border-gray-200 focus:border-primary focus:outline-none ${hideUI}`}
                      />
                      <div
                        className={`${showPrintBlock} whitespace-pre-wrap pb-4 pt-2 text-base leading-relaxed text-black`}
                      >
                        {summaryText || "내용이 없습니다."}
                      </div>
                    </div>

                    <div
                      className={`print:break-inside-avoid ${!printOptions.decisions ? "print:hidden" : ""} ${!printOptions.decisions && isPreviewMode ? "hidden" : ""}`}
                    >
                      <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-gray-900">
                        <Check className="size-5 text-green-500" /> 결정된 사항
                      </h3>
                      <textarea
                        value={decisionsText}
                        onChange={(e) => setDecisionsText(e.target.value)}
                        onBlur={handleDecisionsBlur}
                        className={`w-full min-h-[80px] resize-y rounded-lg border border-transparent p-3 text-base leading-relaxed text-gray-800 transition-colors hover:border-gray-200 focus:border-primary focus:outline-none ${hideUI}`}
                      />
                      <div
                        className={`${showPrintBlock} whitespace-pre-wrap pt-2 text-base leading-relaxed text-black`}
                      >
                        {decisionsText || "결정된 사항이 없습니다."}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center text-gray-400">
                    문서를 불러오는 중입니다...
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 py-7 print:py-[15mm] print:px-[20mm]">
              {minutes ? (
                typeof minutes.transcript === "string" ? (
                  <div
                    className={`rounded-xl border border-border bg-card p-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground ${isPreviewMode ? "border-none bg-transparent p-0 text-black" : "print:border-none print:bg-transparent print:p-0 print:text-black"}`}
                  >
                    {minutes.transcript}
                  </div>
                ) : Array.isArray(minutes.transcript) &&
                  minutes.transcript.length > 0 ? (
                  minutes.transcript.map((t, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSeek(t.time || "00:00")}
                      className={`group flex gap-4 cursor-pointer rounded-xl p-3 transition-colors hover:bg-sky-50 print:break-inside-avoid print:py-2 print:hover:bg-transparent`}
                    >
                      <span
                        className={`w-[60px] shrink-0 pt-0.5 font-mono text-xs font-semibold text-sky-500 transition-colors group-hover:text-sky-600 print:text-gray-500`}
                      >
                        <Play className="inline-block size-3 mr-1 opacity-0 transition-opacity group-hover:opacity-100 print:hidden" />
                        {t.time || ""}
                      </span>
                      <div>
                        <div
                          className={`text-sm font-semibold print:text-black`}
                        >
                          {t.speaker || "알 수 없음"}
                        </div>
                        <p
                          className={`mt-1 text-sm leading-7 text-muted-foreground group-hover:text-gray-900 print:text-gray-800`}
                        >
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
