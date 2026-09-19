"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "삭제하기",
  loading = false,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-background rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col border border-border p-6 text-center animate-in zoom-in-95 duration-200">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-rose-100 text-rose-500">
          <Trash2 className="size-7" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          {description}
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-11"
          >
            취소
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 h-11 bg-rose-500 hover:bg-rose-600 text-white font-semibold flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            {loading ? "삭제 중..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
