"use client";

import { memo, KeyboardEvent } from "react";
import { Loader2, Mic, Pause, Play, Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import Attendees from "@/components/meeting/Attendees";
export function ProcessingView() {
  return (
    <div className="flex h-full flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="relative flex size-24 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <Sparkles className="size-10 animate-pulse text-primary" />
      </div>
      <p className="mt-8 text-xl font-bold text-foreground tracking-tight">
        AI가 회의록을 작성하고 있습니다
      </p>
      <div className="mt-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>오디오 길이에 따라 시간이 소요될 수 있습니다.</span>
      </div>
    </div>
  );
}

export function ReadyView({
  attendees,
  customInput,
  isAddingCustom,
  onRemoveAttendee,
  onCustomInputChange,
  onCustomKeyDown,
  onStartAdd,
  onBlurAdd,
  onStartRecording,
  exhausted = false,
  remainingLabel,
}: {
  attendees: string[];
  customInput: string;
  isAddingCustom: boolean;
  onRemoveAttendee: (name: string) => void;
  onCustomInputChange: (value: string) => void;
  onCustomKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onStartAdd: () => void;
  onBlurAdd: () => void;
  onStartRecording: () => void;
  exhausted?: boolean;
  remainingLabel?: string | null;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center max-w-md mx-auto w-full">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10 transition-colors">
        <Mic className="size-8 text-primary" />
      </div>
      <Attendees
        names={attendees}
        customInput={customInput}
        isAdding={isAddingCustom}
        onRemove={onRemoveAttendee}
        onCustomInputChange={onCustomInputChange}
        onKeyDown={onCustomKeyDown}
        onStartAdd={onStartAdd}
        onBlur={onBlurAdd}
      />
      {exhausted ? (
        <p className="mb-4 text-center text-sm leading-5 text-rose-500">
          이번 달 무료 사용량을 모두 썼어요.
          <br />
          설정에서 API 키를 연결하거나 다음 달에 다시 이용해 주세요.
        </p>
      ) : remainingLabel ? (
        <p className="mb-4 text-center text-sm text-muted-foreground">
          기본 엔진 남은 시간 {remainingLabel}
        </p>
      ) : null}
      <Button
        className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        onClick={onStartRecording}
        disabled={exhausted}
      >
        <Mic className="mr-2 size-5" /> 녹음 및 노트 시작
      </Button>
    </div>
  );
}

export const MemoView = memo(function MemoView({
  liveMemo,
  onMemoChange,
}: {
  liveMemo: string;
  onMemoChange: (value: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center text-sm font-semibold text-muted-foreground">
        자유롭게 현장 메모를 작성해보세요. (줄바꿈: Enter)
      </div>
      <textarea
        value={liveMemo}
        onChange={(e) => onMemoChange(e.target.value)}
        placeholder="음성이 잘 안 들릴 때를 대비해 중요한 키워드나 결론을 메모해 두세요. AI가 회의록 작성 시 최우선으로 참고합니다."
        className="w-full flex-1 resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
});

export const Controls = memo(function Controls({
  status,
  timeString,
  onPauseOrResume,
  onCancel,
  onFinish,
}: {
  status: "recording" | "paused";
  timeString: string;
  onPauseOrResume: () => void;
  onCancel: () => void;
  onFinish: () => void;
}) {
  return (
    <div className="absolute bottom-8 left-1/2 flex w-[min(100%-2rem,28rem)] -translate-x-1/2 items-center justify-between gap-4 rounded-full bg-zinc-900 px-6 py-3 shadow-2xl dark:bg-zinc-100">
      <button
        onClick={onPauseOrResume}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-white transition-colors hover:bg-zinc-600 dark:bg-zinc-200 dark:text-black dark:hover:bg-zinc-300"
      >
        {status === "paused" ? (
          <Play className="size-4 ml-0.5" fill="currentColor" />
        ) : (
          <Pause className="size-4" fill="currentColor" />
        )}
      </button>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-3">
        <div
          className={`flex shrink-0 items-center gap-1.5 ${status === "recording" ? "animate-pulse" : "opacity-50"}`}
        >
          <span className="h-4 w-1 rounded-full bg-sky-500" />
          <span className="h-3 w-1 rounded-full bg-sky-500" />
          <span className="h-5 w-1 rounded-full bg-sky-500" />
          <span className="h-3 w-1 rounded-full bg-sky-500" />
        </div>
        <span className="min-w-[7.5rem] font-mono text-sm font-medium tabular-nums text-zinc-300 dark:text-zinc-700">
          {status === "recording" ? "녹음 중" : "일시정지"} {timeString}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="h-5 w-px bg-zinc-700 dark:bg-zinc-300" />
        <button
          onClick={onCancel}
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-white dark:text-zinc-500 dark:hover:text-black"
        >
          취소
        </button>
        <button
          onClick={onFinish}
          className="flex items-center gap-1.5 rounded-full bg-sky-500/10 px-4 py-1.5 text-sm font-bold text-sky-400 transition-colors hover:bg-sky-500/20 hover:text-sky-300 dark:text-sky-600 dark:hover:bg-sky-50 dark:hover:text-sky-700"
        >
          <Square className="size-3.5" fill="currentColor" /> 종료
        </button>
      </div>
    </div>
  );
});
