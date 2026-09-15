"use client";

import { Loader2, Mic, Pause, Play, Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import Attendees from "@/components/meeting/Attendees";
import { KeyboardEvent } from "react";

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
        <span>
          잠시만 기다려주세요... 오디오 길이에 따라 시간이 소요될 수 있습니다.
        </span>
      </div>
    </div>
  );
}

export function ReadyView({
  isServerReady,
  attendees,
  customInput,
  isAddingCustom,
  onRemoveAttendee,
  onCustomInputChange,
  onCustomKeyDown,
  onStartAdd,
  onBlurAdd,
  onStartRecording,
}: {
  isServerReady: boolean;
  attendees: string[];
  customInput: string;
  isAddingCustom: boolean;
  onRemoveAttendee: (name: string) => void;
  onCustomInputChange: (value: string) => void;
  onCustomKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onStartAdd: () => void;
  onBlurAdd: () => void;
  onStartRecording: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center max-w-md mx-auto w-full">
      <div
        className={`flex size-20 items-center justify-center rounded-full transition-colors mb-6 ${isServerReady ? "bg-primary/10" : "bg-muted"}`}
      >
        <Mic
          className={`size-8 ${isServerReady ? "text-primary" : "text-muted-foreground"}`}
        />
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
      <Button
        className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
        onClick={onStartRecording}
        disabled={!isServerReady}
      >
        {!isServerReady ? (
          <>
            <Loader2 className="mr-2 size-5 animate-spin" /> 서버를 깨우는 중...
          </>
        ) : (
          <>
            <Mic className="mr-2 size-5" /> 녹음 및 노트 시작
          </>
        )}
      </Button>
      {!isServerReady && (
        <p className="mt-4 text-xs text-muted-foreground animate-pulse">
          서버와 연결을 설정하고 있습니다. 잠시만 기다려주세요
        </p>
      )}
    </div>
  );
}

export function MemoView({
  timeString,
  liveMemo,
  onMemoChange,
}: {
  timeString: string;
  liveMemo: string;
  onMemoChange: (value: string) => void;
}) {
  return (
    <div className="flex h-full flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 flex items-center text-sm font-semibold text-muted-foreground">
        <span className="font-mono text-primary mr-2">{timeString}</span>
        자유롭게 현장 메모를 작성해보세요. (줄바꿈: Enter)
      </div>
      <textarea
        value={liveMemo}
        onChange={(e) => onMemoChange(e.target.value)}
        placeholder="음성이 잘 안 들릴 때를 대비해 중요한 키워드나 결론을 메모해 두세요. AI가 회의록 작성 시 최우선으로 참고합니다."
        className="w-full flex-1 resize-none bg-transparent text-lg leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

export function Controls({
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
    <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-6 rounded-full bg-zinc-900 px-6 py-3 shadow-2xl dark:bg-zinc-100">
      <button
        onClick={onPauseOrResume}
        className="flex size-10 items-center justify-center rounded-full bg-zinc-700 text-white transition-colors hover:bg-zinc-600 dark:bg-zinc-200 dark:text-black dark:hover:bg-zinc-300"
      >
        {status === "paused" ? (
          <Play className="size-4 ml-0.5" fill="currentColor" />
        ) : (
          <Pause className="size-4" fill="currentColor" />
        )}
      </button>
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-1.5 ${status === "recording" ? "animate-pulse" : "opacity-50"}`}
        >
          <span className="h-4 w-1 rounded-full bg-sky-500" />
          <span className="h-3 w-1 rounded-full bg-sky-500" />
          <span className="h-5 w-1 rounded-full bg-sky-500" />
          <span className="h-3 w-1 rounded-full bg-sky-500" />
        </div>
        <span className="font-mono text-sm font-medium text-zinc-300 dark:text-zinc-700">
          {status === "recording" ? "녹음 중" : "일시정지"} {timeString}
        </span>
      </div>
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
  );
}
