"use client";

import { MeetingMinutes } from "@/lib/constants";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PreviewBar from "@/components/meeting/PreviewBar";
import DetailHeader from "@/components/meeting/DetailHeader";
import MinutesDoc from "@/components/meeting/MinutesDoc";
import TranscriptList from "@/components/meeting/TranscriptList";
import { useDetail } from "@/hooks/useDetail";

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
  const detail = useDetail({
    minutes,
    meeting,
    onClose,
    onUpdateTitle,
    onUpdateMinutes,
  });

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
        className={`flex h-full w-full max-w-4xl flex-col overflow-y-auto border-l border-border shadow-2xl print:block print:h-auto print:min-h-0 print:max-h-none print:w-full print:max-w-none print:overflow-visible print:border-none print:shadow-none print:bg-white ${detail.isPreviewMode ? "bg-zinc-100" : "bg-background"}`}
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
            onToggleDecisions={(checked) =>
              detail.setPrintOptions({ decisions: checked })
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
            onToggleDownload={() =>
              detail.setIsDownloadOpen((open) => !open)
            }
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
              meeting?.id ? () => detail.setIsDeleteModalOpen(true) : undefined
            }
          />
        )}
        <div
          className={`flex border-b border-border px-6 pt-4 ${detail.hideUI}`}
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
          className={`mx-auto w-full max-w-3xl ${detail.isPreviewMode ? "p-8" : "p-6 sm:p-12"} print:block print:max-w-none print:h-auto print:min-h-0 print:max-h-none print:overflow-visible print:py-[15mm] print:px-[20mm] print:m-0`}
        >
          {detail.tab === "minutes" ? (
            <MinutesDoc
              meetingTitle={detail.meetingTitle}
              onTitleChange={detail.setMeetingTitle}
              dateStr={detail.dateStr}
              minutes={minutes}
              summaryText={detail.summaryText}
              decisionsText={detail.decisionsText}
              onSummaryChange={detail.setSummaryText}
              onDecisionsChange={detail.setDecisionsText}
              hideUI={detail.hideUI}
              showPrintBlock={detail.showPrintBlock}
              isPreviewMode={detail.isPreviewMode}
              includeDecisions={detail.printOptions.decisions}
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
              삭제된 데이터는 복구할 수 없습니다.
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
