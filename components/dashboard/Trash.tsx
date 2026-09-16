"use client";

import { useState } from "react";
import { Noto_Sans_KR } from "next/font/google";
import {
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatMeetingDate } from "@/lib/dates";
import { useTheme } from "@/hooks/useTheme";
import { whenDark, whenDarkValue } from "@/lib/theme";
import { cn } from "@/lib/utils";

const uiFont = Noto_Sans_KR({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function Trash({
  meetings,
  onRestore,
  onPermanentlyDelete,
}: {
  meetings: any[];
  onRestore: (id: string) => void;
  onPermanentlyDelete: (id: string) => void;
}) {
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { theme } = useTheme();
  const sortedMeetings = [...meetings].sort(
    (a, b) =>
      new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime(),
  );

  return (
    <main
      className={cn(
        `${uiFont.className} min-h-full w-full px-5 py-10 sm:px-10 lg:px-14 lg:py-14`,
        whenDarkValue(
          theme,
          "bg-zinc-950",
          "bg-[linear-gradient(180deg,#fafbff_0px,#ffffff_240px)]",
        ),
      )}
    >
      <div className="mx-auto w-full max-w-6xl">
        <header
          className={cn(
            "relative overflow-hidden border-b border-slate-200 pb-10",
            whenDark(theme, "border-zinc-800"),
          )}
        >
          <div
            className={cn(
              "absolute right-0 top-5 font-mono text-3xl font-bold leading-none tracking-[-0.04em] text-slate-100 sm:text-5xl",
              whenDark(theme, "text-zinc-800"),
            )}
          >
            {String(meetings.length).padStart(2, "0")}
          </div>
          <div className="relative">
            <div className="mb-6 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
              <span className="size-1.5 rounded-full bg-primary shadow-[0_0_0_4px_rgba(59,130,246,0.1)]" />
              Archive / Trash
            </div>
            <h1
              className={cn(
                "text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-3xl",
                whenDark(theme, "text-zinc-50"),
              )}
            >
              삭제된 회의록
            </h1>
            <p
              className={cn(
                "mt-4 max-w-lg text-sm leading-6 text-slate-500",
                whenDark(theme, "text-zinc-400"),
              )}
            >
              더 이상 필요하지 않은 기록입니다. 복원하거나 완전히 삭제할
              수 있습니다.
            </p>
          </div>
        </header>

        <section className="pt-10">
          <div
            className={cn(
              "grid grid-cols-[1fr_auto] items-end border-b-2 border-slate-950 pb-3 sm:grid-cols-[minmax(0,1fr)_210px_160px]",
              whenDark(theme, "border-zinc-100"),
            )}
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Records
              </p>
              <p
                className={cn(
                  "mt-1 text-sm font-semibold text-slate-900",
                  whenDark(theme, "text-zinc-100"),
                )}
              >
                총 {meetings.length}개의 기록
              </p>
            </div>
            <p className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400 sm:block">
              Deleted at
            </p>
            <p className="text-right font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
              최근 삭제순
            </p>
          </div>

          {sortedMeetings.map((meeting, index) => (
            <div
              key={meeting.id}
              className={cn(
                "group relative grid gap-3 border-b border-slate-200 py-3.5 transition-colors duration-300 hover:bg-slate-50/70 sm:grid-cols-[minmax(0,1fr)_210px_160px] sm:items-center sm:gap-0 sm:py-4",
                whenDark(theme, "border-zinc-800 hover:bg-zinc-900"),
              )}
            >
              <span className="absolute inset-y-0 left-0 w-0.5 origin-center scale-y-0 bg-primary transition-transform duration-300 group-hover:scale-y-100" />

              <div className="flex min-w-0 items-center gap-4 px-2 sm:px-4">
                <span className="w-6 shrink-0 font-mono text-[10px] text-slate-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3
                    className={cn(
                      "truncate text-sm font-semibold text-slate-900",
                      whenDark(theme, "text-zinc-100"),
                    )}
                  >
                    {meeting.title || "새 회의"}
                  </h3>
                  <p className="mt-1 font-mono text-[10px] text-slate-400">
                    CREATED · {formatMeetingDate(meeting.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-2 sm:px-0">
                <span className="size-1.5 rounded-full bg-rose-400" />
                <p className="text-xs text-slate-500">
                  {formatMeetingDate(meeting.deleted_at)}
                </p>
              </div>

              <div className="flex items-center justify-end gap-1 px-2 sm:px-0 sm:pr-2">
                <button
                  type="button"
                  className={cn(
                    "group/restore flex h-9 items-center gap-2 px-3 text-xs font-semibold text-slate-600 transition-colors hover:text-primary",
                    whenDark(theme, "text-zinc-300"),
                  )}
                  onClick={() => onRestore(meeting.id)}
                >
                  <RotateCcw className="size-3.5 transition-transform duration-300 group-hover/restore:-rotate-45" />
                  복원
                </button>
                <div className="relative">
                  <button
                    type="button"
                    className={cn(
                      "flex size-9 items-center justify-center text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900",
                      whenDark(theme, "hover:bg-zinc-800 hover:text-zinc-100"),
                    )}
                    onClick={() =>
                      setOpenMenuId((current) =>
                        current === meeting.id ? null : meeting.id,
                      )
                    }
                    aria-label="회의록 메뉴"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                  {openMenuId === meeting.id && (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-10 cursor-default"
                        onClick={() => setOpenMenuId(null)}
                        aria-label="메뉴 닫기"
                      />
                      <button
                        type="button"
                        className={cn(
                          "absolute right-0 top-10 z-20 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-rose-600 shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition-colors hover:bg-rose-50",
                          whenDark(
                            theme,
                            "border-zinc-700 bg-zinc-900 hover:bg-rose-500/10",
                          ),
                        )}
                        onClick={() => {
                          setDeleteTarget(meeting);
                          setOpenMenuId(null);
                        }}
                      >
                        영구 삭제
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {meetings.length === 0 && (
            <div
              className={cn(
                "flex min-h-72 flex-col items-center justify-center border-b border-slate-200 text-center",
                whenDark(theme, "border-zinc-800"),
              )}
            >
              <Trash2 className="mb-5 size-7 stroke-1 text-slate-300" />
              <p
                className={cn(
                  "text-sm font-semibold text-slate-700",
                  whenDark(theme, "text-zinc-200"),
                )}
              >
                삭제된 회의록이 없습니다
              </p>
              <p className="mt-2 text-xs text-slate-400">
                삭제한 기록이 이곳에 표시됩니다.
              </p>
            </div>
          )}
        </section>

        {deleteTarget && (
          <ConfirmDialog
            title="회의록 영구 삭제"
            description={
              <>
                <span className="font-bold text-foreground">
                  &apos;{deleteTarget.title || "새 회의"}&apos;
                </span>
                을(를) 영구 삭제하시겠습니까?
                <br />
                이 작업은 되돌릴 수 없습니다.
              </>
            }
            confirmLabel="영구 삭제"
            onCancel={() => setDeleteTarget(null)}
            onConfirm={() => {
              onPermanentlyDelete(deleteTarget.id);
              setDeleteTarget(null);
            }}
          />
        )}
      </div>
    </main>
  );
}
