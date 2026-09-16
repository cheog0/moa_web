"use client";

import { useState } from "react";
import { MeetingMinutes } from "@/lib/constants";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PreviewBar from "@/components/meeting/PreviewBar";
import DetailHeader from "@/components/meeting/DetailHeader";
import MinutesDoc from "@/components/meeting/MinutesDoc";
import TranscriptList from "@/components/meeting/TranscriptList";
import StatusToast from "@/components/meeting/StatusToast";
import { useDetail } from "@/hooks/useDetail";
import { ToastConfig } from "@/lib/timeline";

export default function DetailPanel({
  onClose,
  minutes,
  meeting,
  onUpdateTitle,
  onUpdateMinutes,
  onDelete,
  linkedTimelineNames = [],
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
  linkedTimelineNames?: string[];
}) {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const detail = useDetail({
    minutes,
    meeting,
    onClose,
    onUpdateTitle,
    onUpdateMinutes,
  });

  const showWarning = (message: string) => {
    setToast({ message, type: "warning" });
    window.setTimeout(() => setToast(null), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-30 flex justify-end bg-foreground/25 backdrop-blur-sm print:static print:block print:h-auto print:min-h-0 print:overflow-visible print:bg-white print:backdrop-blur-none"
      onClick={detail.handleSmartClose}
    >
      <style>{`
        @media print {
          @page { margin: 0; }
          html, body {
            height: auto !important;
            overflow: visible !important;
            background-color: white !important;
          }
        }
      `}</style>
      <div
        className={`flex h-full w-full max-w-4xl flex-col overflow-hidden border-l border-border shadow-2xl print:block print:h-auto print:min-h-0 print:max-h-none print:w-full print:max-w-none print:overflow-visible print:border-none print:shadow-none print:bg-white ${detail.isPreviewMode ? "bg-zinc-100" : "bg-background"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {meeting?.audio_url && (
          <audio
            ref={detail.audioRef}
            src={meeting.audio_url}
            preload="metadata"
          />
        )}
        {detail.isPreviewMode ? (
          <PreviewBar
            includeDecisions={detail.printOptions.decisions}
            includeActionItems={detail.printOptions.actionItems}
            onToggleDecisions={(checked) =>
              detail.setPrintOptions((prev) => ({
                ...prev,
                decisions: checked,
              }))
            }
            onToggleActionItems={(checked) =>
              detail.setPrintOptions((prev) => ({
                ...prev,
                actionItems: checked,
              }))
            }
            onBack={() => detail.setIsPreviewMode(false)}
            onPrint={detail.handlePrintPDF}
          />
        ) : (
          <DetailHeader
            dateStr={detail.dateStr}
            meetingTitle={detail.meetingTitle}
            audioUrl={meeting?.audio_url}
            isPlaying={detail.isPlaying}
            currentTimeDisplay={detail.currentTimeDisplay}
            hasChanges={detail.hasChanges}
            saveStatus={detail.saveStatus}
            isDownloadOpen={detail.isDownloadOpen}
            onClose={detail.handleSmartClose}
            onTogglePlay={detail.togglePlay}
            onSave={detail.handleManualSave}
            onPreview={() => {
              detail.setTab("minutes");
              detail.setIsPreviewMode(true);
              detail.setIsDownloadOpen(false);
            }}
            onToggleDownload={() => detail.setIsDownloadOpen((open) => !open)}
            onDownloadAudio={() => {
              detail.handleDownloadAudio();
              detail.setIsDownloadOpen(false);
            }}
            onDownloadTranscript={() => {
              detail.handleDownloadTranscript();
              detail.setIsDownloadOpen(false);
            }}
            onPrint={() => {
              detail.setIsDownloadOpen(false);
              detail.handlePrintPDF();
            }}
            onDelete={
              meeting?.id
                ? () => {
                    if (linkedTimelineNames.length > 0) {
                      const [firstName] = linkedTimelineNames;
                      showWarning(
                        linkedTimelineNames.length === 1
                          ? `'${firstName}' 타임라인에서 먼저 제외해주세요.`
                          : "연결된 타임라인에서 먼저 제외해주세요.",
                      );
                      return;
                    }
                    detail.setIsDeleteModalOpen(true);
                  }
                : undefined
            }
          />
        )}
        <div
          className={`flex shrink-0 border-b border-border bg-background px-6 pt-4 ${detail.hideUI}`}
        >
          <button
            onClick={() => detail.setTab("minutes")}
            className={`border-b-2 px-1 pb-3 text-sm font-semibold ${detail.tab === "minutes" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            문서 뷰
          </button>
          <button
            onClick={() => detail.setTab("transcript")}
            className={`ml-6 border-b-2 px-1 pb-3 text-sm font-semibold ${detail.tab === "transcript" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            전체 대화
          </button>
        </div>
        <main
          className={`mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto ${detail.isPreviewMode ? "p-8" : "p-6 sm:p-12"} print:block print:max-w-none print:h-auto print:min-h-0 print:max-h-none print:overflow-visible print:py-[15mm] print:px-[20mm] print:m-0`}
        >
          {detail.tab === "minutes" ? (
            <MinutesDoc
              meetingTitle={detail.meetingTitle}
              onTitleChange={detail.setMeetingTitle}
              dateStr={detail.dateStr}
              minutes={minutes}
              summaryText={detail.summaryText}
              decisionsText={detail.decisionsText}
              actionItems={detail.actionItems}
              replyDraft={detail.replyDraft}
              onSummaryChange={detail.setSummaryText}
              onDecisionsChange={detail.setDecisionsText}
              onToggleActionItem={detail.toggleActionItem}
              onReplyDraftChange={detail.setReplyDraft}
              onSeek={detail.handleSeek}
              hideUI={detail.hideUI}
              showPrintBlock={detail.showPrintBlock}
              isPreviewMode={detail.isPreviewMode}
              includeDecisions={detail.printOptions.decisions}
              includeActionItems={detail.printOptions.actionItems}
            />
          ) : (
            <div className="flex flex-col gap-2 py-7 print:py-[15mm] print:px-[20mm]">
              <TranscriptList
                transcript={detail.normalizedTranscript}
                isPreviewMode={detail.isPreviewMode}
                onSeek={detail.handleSeek}
              />
            </div>
          )}
        </main>
      </div>
      {toast && <StatusToast toast={toast} />}
      {detail.isDeleteModalOpen && (
        <ConfirmDialog
          title="회의록 삭제"
          description={
            <>
              <span className="font-bold text-foreground">
                '{detail.meetingTitle}'
              </span>
              을(를) 정말 삭제하시겠습니까?
              <br />
              삭제된 회의록은 휴지통에서 복원할 수 있습니다.
            </>
          }
          onCancel={() => detail.setIsDeleteModalOpen(false)}
          onConfirm={() => {
            if (meeting?.id) {
              detail.setIsDeleteModalOpen(false);
              onDelete(meeting.id);
            }
          }}
        />
      )}
    </div>
  );
}
