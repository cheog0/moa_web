"use client";

import { KeyboardEvent } from "react";
import { X } from "lucide-react";
import {
  Controls,
  MemoView,
  ProcessingView,
  ReadyView,
} from "@/components/meeting/RecordingViews";
import { useRecording } from "@/hooks/useRecording";

export default function RecordingPanel({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (meetingId: string) => void;
}) {
  const recording = useRecording(onSaved);

  const handleCustomKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && recording.customInput.trim()) {
      e.preventDefault();
      const name = recording.customInput.trim();
      if (name && !recording.selectedAttendees.includes(name)) {
        recording.setSelectedAttendees([...recording.selectedAttendees, name]);
      }
      recording.setCustomInput("");
      recording.setIsAddingCustom(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm sm:p-10 print:hidden">
      <div className="relative flex h-full max-h-[900px] min-h-[500px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-8 py-5">
          <div className="flex items-center gap-3">
            <span
              className={`size-2.5 rounded-full ${recording.status === "processing" ? "bg-primary" : recording.status === "ready" ? "bg-muted-foreground/40" : recording.status === "paused" ? "bg-amber-500" : "animate-pulse bg-red-500"}`}
            />
            <h2 className="text-xl font-bold tracking-tight">
              {recording.status === "processing"
                ? "회의 내용을 정리하고 있어요"
                : "새로운 노트"}
            </h2>
          </div>
          {recording.status !== "processing" && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          {recording.status === "processing" ? (
            <ProcessingView />
          ) : recording.status === "ready" ? (
            <ReadyView
              attendees={recording.selectedAttendees}
              customInput={recording.customInput}
              isAddingCustom={recording.isAddingCustom}
              onRemoveAttendee={(name) =>
                recording.setSelectedAttendees(
                  recording.selectedAttendees.filter((item) => item !== name),
                )
              }
              onCustomInputChange={recording.setCustomInput}
              onCustomKeyDown={handleCustomKeyDown}
              onStartAdd={() => recording.setIsAddingCustom(true)}
              onBlurAdd={() => recording.setIsAddingCustom(false)}
              onStartRecording={recording.handleStartRecording}
              exhausted={recording.exhausted}
              remainingLabel={recording.remainingLabel}
            />
          ) : (
            <MemoView
              timeString={recording.timeString}
              liveMemo={recording.liveMemo}
              onMemoChange={recording.setLiveMemo}
            />
          )}
        </div>
        {(recording.status === "recording" ||
          recording.status === "paused") && (
          <Controls
            status={recording.status}
            timeString={recording.timeString}
            onPauseOrResume={recording.togglePause}
            onCancel={onClose}
            onFinish={recording.handleFinish}
          />
        )}
      </div>
    </div>
  );
}
