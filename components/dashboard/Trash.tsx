"use client";

import { useState } from "react";
import { FileText, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatMeetingDate } from "@/lib/dates";

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

  return (
    <main className="mx-auto min-h-full w-full max-w-6xl bg-white p-5 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">휴지통</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          삭제한 회의록을 복원하거나 영구 삭제할 수 있어요.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold">
                  {meeting.title || "새 회의"}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  삭제일 {formatMeetingDate(meeting.deleted_at)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2 sm:flex-none"
                onClick={() => onRestore(meeting.id)}
              >
                <RotateCcw className="size-4" />
                복원
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 sm:flex-none"
                onClick={() => setDeleteTarget(meeting)}
              >
                <Trash2 className="size-4" />
                영구 삭제
              </Button>
            </div>
          </div>
        ))}

        {meetings.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
            <Trash2 className="mx-auto mb-3 size-10 text-muted-foreground/30" />
            휴지통이 비어 있습니다.
          </div>
        )}
      </div>

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
    </main>
  );
}
