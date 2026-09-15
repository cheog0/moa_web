"use client";

import {
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Loader2,
  Music,
  Pause,
  Play,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DetailHeader({
  dateStr,
  meetingTitle,
  audioUrl,
  isPlaying,
  currentTimeDisplay,
  hasChanges,
  saveStatus,
  isDownloadOpen,
  onClose,
  onTogglePlay,
  onSave,
  onPreview,
  onToggleDownload,
  onDownloadAudio,
  onDownloadTranscript,
  onPrint,
  onDelete,
}: {
  dateStr: string;
  meetingTitle: string;
  audioUrl?: string;
  isPlaying: boolean;
  currentTimeDisplay: string;
  hasChanges: boolean;
  saveStatus: "idle" | "saving" | "saved";
  isDownloadOpen: boolean;
  onClose: () => void;
  onTogglePlay: () => void;
  onSave: () => void;
  onPreview: () => void;
  onToggleDownload: () => void;
  onDownloadAudio: () => void;
  onDownloadTranscript: () => void;
  onPrint: () => void;
  onDelete?: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-6 py-3 backdrop-blur print:hidden">
      <div className="flex items-center gap-3 w-0 flex-1 min-w-0">
        <button onClick={onClose} className="rounded-lg p-2 hover:bg-muted shrink-0">
          <X className="size-4" />
        </button>
        <div className="hidden sm:block w-0 flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground truncate">{dateStr}</p>
          <h2
            className="font-bold text-xs md:text-sm tracking-tight text-foreground leading-snug line-clamp-1 hover:line-clamp-none transition-all cursor-default"
            title={meetingTitle}
          >
            {meetingTitle}
          </h2>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 relative">
        {audioUrl && (
          <div className="hidden md:flex mr-1 items-center gap-2 rounded-full border border-border bg-muted/40 px-2.5 py-1 shadow-sm transition-colors hover:bg-muted/80 shrink-0">
            <button
              onClick={onTogglePlay}
              className="text-primary hover:text-sky-600 transition-colors"
            >
              {isPlaying ? (
                <Pause className="size-3.5" fill="currentColor" />
              ) : (
                <Play className="size-3.5" fill="currentColor" />
              )}
            </button>
            <span className="w-9 text-center font-mono text-[11px] font-semibold text-muted-foreground">
              {currentTimeDisplay}
            </span>
          </div>
        )}
        <Button
          variant={hasChanges ? "default" : "outline"}
          size="sm"
          onClick={onSave}
          disabled={saveStatus === "saving" || (!hasChanges && saveStatus !== "saved")}
          className={`h-8 px-3 text-xs sm:w-[110px] shrink-0 ${hasChanges ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
        >
          {saveStatus === "saving" ? (
            <>
              <Loader2 className="mr-1.5 size-3.5 animate-spin" /> 저장 중
            </>
          ) : saveStatus === "saved" && !hasChanges ? (
            <>
              <CheckCircle2 className="mr-1.5 size-3.5 text-emerald-500" /> 저장됨
            </>
          ) : (
            "변경사항 저장"
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onPreview}
          title="PDF 인쇄 미리보기"
          className="h-8 px-2.5 text-xs shrink-0 hidden sm:flex"
        >
          <Eye className="size-3.5 sm:mr-1.5 text-sky-500" />
          <span className="hidden md:inline">미리보기</span>
        </Button>
        <div className="relative shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleDownload}
            className="h-8 px-2.5 text-xs"
          >
            <Download className="size-3.5 sm:mr-1.5" />
            <span className="hidden md:inline">다운로드</span>
            <ChevronDown className="ml-1 size-3 text-muted-foreground" />
          </Button>
          {isDownloadOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDownload();
                }}
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-100">
                {audioUrl && (
                  <button
                    onClick={onDownloadAudio}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <Music className="size-3.5 text-indigo-500" /> 음성 파일
                  </button>
                )}
                <button
                  onClick={onDownloadTranscript}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                >
                  <FileText className="size-3.5 text-green-500" /> 대화 텍스트
                </button>
                <button
                  onClick={onPrint}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                >
                  <Download className="size-3.5 text-sky-500" /> 문서 (PDF)
                </button>
              </div>
            </>
          )}
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="size-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 shrink-0"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
