"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, RotateCw, X } from "lucide-react";
import { formatClock } from "@/lib/audioSegments";
import { cn } from "@/lib/utils";

export default function AudioPlayerModal({
  open,
  title,
  isPlaying,
  currentSeconds,
  totalSeconds,
  currentTimeDisplay,
  totalTimeDisplay,
  onClose,
  onTogglePlay,
  onSeek,
  onSkip,
}: {
  open: boolean;
  title: string;
  isPlaying: boolean;
  currentSeconds: number;
  totalSeconds: number;
  currentTimeDisplay: string;
  totalTimeDisplay?: string;
  onClose: () => void;
  onTogglePlay: () => void;
  onSeek: (seconds: number, autoPlay?: boolean) => void;
  onSkip: (delta: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === " ") {
        event.preventDefault();
        onTogglePlay();
      }
      if (event.key === "ArrowLeft") onSkip(-10);
      if (event.key === "ArrowRight") onSkip(10);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onTogglePlay, onSkip]);

  if (!open) return null;

  const max = Math.max(totalSeconds, 0);
  const value = dragging ? dragValue : Math.min(currentSeconds, max || currentSeconds);
  const progress = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const endLabel = totalTimeDisplay || (max > 0 ? formatClock(max) : "--:--");

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm sm:items-center sm:p-6 print:hidden"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#2F7DE0]">
              RECORDING
            </p>
            <h3 className="mt-1 truncate text-[17px] font-bold tracking-tight text-[#1C1F24]">
              {title || "회의 녹음"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#6B7280] transition-colors hover:bg-[#F3F4F6]"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 pb-6 pt-4">
          <div className="relative h-2 rounded-full bg-[#EEF2F7]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#2F7DE0]"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min={0}
              max={max > 0 ? max : 1}
              step={0.1}
              value={max > 0 ? value : 0}
              disabled={max <= 0}
              onPointerDown={() => {
                setDragging(true);
                setDragValue(currentSeconds);
              }}
              onPointerUp={(event) => {
                const next = Number((event.target as HTMLInputElement).value);
                setDragging(false);
                setDragValue(next);
                onSeek(next, true);
              }}
              onChange={(event) => {
                const next = Number(event.target.value);
                setDragValue(next);
                if (!dragging) setDragging(true);
              }}
              className={cn(
                "absolute inset-0 w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed",
                "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2F7DE0]",
                "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#2F7DE0]",
              )}
            />
          </div>

          <div className="mt-2 flex items-center justify-between font-mono text-[12px] tabular-nums text-[#6B7280]">
            <span>{dragging ? formatClock(dragValue) : currentTimeDisplay}</span>
            <span>{endLabel}</span>
          </div>

          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onSkip(-10)}
              className="inline-flex h-12 w-12 flex-col items-center justify-center rounded-full bg-[#F3F5F8] text-[#1C1F24] transition-colors hover:bg-[#E8EDF5]"
              aria-label="10초 뒤로"
            >
              <RotateCcw className="size-4" />
              <span className="mt-0.5 text-[10px] font-bold">10</span>
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              className="inline-flex size-16 items-center justify-center rounded-full bg-[#2F7DE0] text-white shadow-[0_12px_28px_rgba(47,125,224,0.35)] transition-transform hover:scale-[1.03]"
              aria-label={isPlaying ? "일시정지" : "재생"}
            >
              {isPlaying ? (
                <Pause className="size-7" fill="currentColor" />
              ) : (
                <Play className="ml-1 size-7" fill="currentColor" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onSkip(10)}
              className="inline-flex h-12 w-12 flex-col items-center justify-center rounded-full bg-[#F3F5F8] text-[#1C1F24] transition-colors hover:bg-[#E8EDF5]"
              aria-label="10초 앞으로"
            >
              <RotateCw className="size-4" />
              <span className="mt-0.5 text-[10px] font-bold">10</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
