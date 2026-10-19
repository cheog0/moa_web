"use client";

import { useEffect, useRef, useState } from "react";
import { FileAudio, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioUpload } from "@/hooks/useAudioUpload";
import { useTheme } from "@/hooks/useTheme";
import { formatUsageClock } from "@/lib/usage";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { readAudioDurationSeconds } from "@/lib/transcribe";

function formatBytes(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AudioUploadPanel({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (meetingId: string) => void;
}) {
  const { theme } = useTheme();
  const upload = useAudioUpload(onSaved);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<File | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!selected) {
      setDurationSeconds(null);
      return;
    }
    let cancelled = false;
    void readAudioDurationSeconds(selected).then((seconds) => {
      if (!cancelled) setDurationSeconds(seconds > 0 ? seconds : 0);
    });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const pickFile = (file: File | null | undefined) => {
    if (!file || upload.status === "uploading") return;
    setSelected(file);
  };

  const busy = upload.status === "uploading";
  const durationLabel =
    durationSeconds != null && durationSeconds > 0
      ? formatUsageClock(durationSeconds)
      : null;
  const overQuota =
    !!selected &&
    !upload.exhausted &&
    upload.remainingSeconds != null &&
    durationSeconds != null &&
    durationSeconds > upload.remainingSeconds;
  const durationUnknown =
    !!selected && durationSeconds != null && durationSeconds <= 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1220]/45 p-4 backdrop-blur-[2px] sm:p-8 print:hidden"
      onClick={busy ? undefined : onClose}
    >
      <div
        className={cn(
          "relative flex w-full max-w-xl flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]",
          whenDark(theme, "border-white/10 bg-zinc-950"),
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_10%_0%,rgba(47,125,224,0.18),transparent_55%),radial-gradient(90%_70%_at_100%_100%,rgba(14,165,233,0.12),transparent_50%)]",
            whenDark(
              theme,
              "bg-[radial-gradient(120%_80%_at_10%_0%,rgba(56,189,248,0.16),transparent_55%),radial-gradient(90%_70%_at_100%_100%,rgba(37,99,235,0.14),transparent_50%)]",
            ),
          )}
        />

        <div className="relative px-7 pb-2 pt-6 sm:px-8">
          {!busy && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 rounded-xl p-2 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground sm:right-6"
              aria-label="닫기"
            >
              <X className="size-5" />
            </button>
          )}
          <div className="pr-10">
            <p className="text-[11px] font-bold tracking-[0.18em] text-[#2F7DE0]">
              RAPLE
            </p>
            <h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.04em] text-foreground sm:text-[32px]">
              음성으로
              <br />
              회의록 만들기
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
              이미 있는 녹음 파일을 올리면 받아쓰기와 회의록 정리를 이어서
              진행합니다.
            </p>
          </div>
        </div>

        <div className="relative px-7 pb-7 pt-4 sm:px-8">
          <input
            ref={inputRef}
            type="file"
            accept="audio/*,video/webm,video/mp4,.mp3,.m4a,.wav,.webm,.mp4,.aac,.ogg"
            className="hidden"
            disabled={busy}
            onChange={(event) => {
              pickFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              pickFile(event.dataTransfer.files?.[0]);
            }}
            className={cn(
              "group flex w-full flex-col items-center justify-center rounded-[24px] border border-dashed px-6 py-14 text-center transition-all duration-300",
              dragging
                ? "border-[#2F7DE0] bg-[#2F7DE0]/10"
                : "border-slate-300/80 bg-white/55 hover:border-[#2F7DE0]/70 hover:bg-[#2F7DE0]/[0.04]",
              whenDark(
                theme,
                dragging
                  ? "border-sky-400 bg-sky-500/10"
                  : "border-white/15 bg-white/[0.03] hover:border-sky-400/60 hover:bg-sky-500/[0.06]",
              ),
              busy && "cursor-wait opacity-80",
            )}
          >
            <span
              className={cn(
                "mb-4 flex size-16 items-center justify-center rounded-full bg-[#EAF2FF] text-[#2F7DE0] transition-transform duration-300 group-hover:scale-105",
                whenDark(theme, "bg-sky-500/15 text-sky-300"),
              )}
            >
              {busy ? (
                <Loader2 className="size-7 animate-spin" />
              ) : selected ? (
                <FileAudio className="size-7" />
              ) : (
                <Upload className="size-7" />
              )}
            </span>
            {busy ? (
              <>
                <p className="text-[17px] font-bold tracking-tight text-foreground">
                  파일을 올리고 있어요
                </p>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  저장이 끝나면 홈으로 이동하고, 회의록 분석을 이어갑니다.
                </p>
              </>
            ) : selected ? (
              <>
                <p className="max-w-full truncate px-2 text-[17px] font-bold tracking-tight text-foreground">
                  {selected.name}
                </p>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  {formatBytes(selected.size)}
                  {durationLabel ? ` · ${durationLabel}` : ""}
                </p>
                <p className="mt-3 text-[12px] font-medium text-[#2F7DE0]">
                  다른 파일로 바꾸려면 다시 선택하세요
                </p>
              </>
            ) : (
              <>
                <p className="text-[17px] font-bold tracking-tight text-foreground">
                  파일을 끌어다 놓거나 선택하세요
                </p>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  mp3, m4a, wav, webm, aac
                </p>
              </>
            )}
          </button>

          {upload.exhausted ? (
            <p className="mt-4 text-center text-[13px] leading-5 text-rose-500">
              이번 달 무료 사용량을 모두 사용했습니다.
              <br />
              설정에서 API 키를 연결하거나 다음 달에 다시 이용해 주세요.
            </p>
          ) : overQuota &&
            durationSeconds != null &&
            upload.remainingSeconds != null ? (
            <p className="mt-4 text-center text-[13px] leading-5 text-rose-500">
              파일 길이 {formatUsageClock(durationSeconds)} · 남은 시간{" "}
              {formatUsageClock(upload.remainingSeconds)}
              <br />
              더 짧은 파일로 나누거나 설정에서 API 키를 연결해 주세요.
            </p>
          ) : durationUnknown && upload.remainingSeconds != null ? (
            <p className="mt-4 text-center text-[13px] leading-5 text-rose-500">
              파일 길이를 확인하지 못했어요.
              <br />
              mp3·m4a·wav로 다시 선택해 주세요.
            </p>
          ) : upload.remainingLabel ? (
            <p className="mt-4 text-center text-[13px] text-muted-foreground">
              기본 엔진 남은 시간 {upload.remainingLabel}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1 rounded-2xl text-[15px] font-semibold"
              onClick={onClose}
              disabled={busy}
            >
              닫기
            </Button>
            <Button
              type="button"
              className="h-12 flex-1 rounded-2xl bg-[#2F7DE0] text-[15px] font-semibold text-white hover:bg-[#2569C2]"
              disabled={
                !selected ||
                busy ||
                upload.exhausted ||
                overQuota ||
                (durationUnknown && upload.remainingSeconds != null)
              }
              onClick={() => {
                if (selected) void upload.uploadFile(selected);
              }}
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  올리는 중
                </>
              ) : (
                "회의록 만들기"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
