"use client";

import { Loader2, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "삭제하기",
  loading = false,
  loadingLabel,
  variant = "danger",
  onCancel,
  onConfirm,
}: {
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  loading?: boolean;
  loadingLabel?: string;
  variant?: "danger" | "default";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-background rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col border border-border p-6 text-center animate-in zoom-in-95 duration-200">
        <div
          className={cn(
            "mx-auto mb-5 flex size-14 items-center justify-center rounded-full",
            isDanger ? "bg-rose-100 text-rose-500" : "bg-[#F5F6F8] text-[#3A3D42]",
          )}
        >
          {isDanger ? <Trash2 className="size-7" /> : <LogOut className="size-7" />}
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
            className={cn(
              "flex-1 h-11 font-semibold text-white flex items-center justify-center",
              isDanger
                ? "bg-rose-500 hover:bg-rose-600"
                : "bg-[#3A3D42] hover:bg-[#2c2f33]",
            )}
          >
            {loading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            {loading
              ? loadingLabel || (isDanger ? "삭제 중..." : "처리 중...")
              : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
