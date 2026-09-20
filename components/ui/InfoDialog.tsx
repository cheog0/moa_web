"use client";

import { AlertCircle } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function InfoDialog({
  title,
  description,
  confirmLabel = "확인",
  onClose,
}: {
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  onClose: () => void;
}) {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
      <div
        className={cn(
          "flex w-full max-w-sm flex-col overflow-hidden rounded-[28px] border border-[#E8EAEE] bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200",
          whenDark(theme, "border-zinc-700 bg-zinc-900"),
        )}
      >
        <div
          className={cn(
            "mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-[#E8F3FF] text-[#2F7DE0]",
            whenDark(theme, "bg-zinc-800 text-sky-300"),
          )}
        >
          <AlertCircle className="size-7" />
        </div>
        <h2
          className={cn(
            "mb-2 text-xl font-bold text-[#1C1F24]",
            whenDark(theme, "text-zinc-50"),
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            "mb-8 whitespace-pre-line text-sm leading-relaxed text-[#9AA1AA]",
            whenDark(theme, "text-zinc-400"),
          )}
        >
          {description}
        </p>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-[#3A3D42] text-sm font-semibold text-white transition-opacity hover:opacity-90",
            whenDark(theme, "bg-zinc-100 text-zinc-950"),
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
