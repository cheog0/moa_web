"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { TOAST_NOTICE_EVENT, type InfoNotice } from "@/lib/notice";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

const TOAST_MS = 8000;

export default function ToastNoticeHost() {
  const { theme } = useTheme();
  const [notice, setNotice] = useState<InfoNotice | null>(null);

  useEffect(() => {
    let hide: number | undefined;
    const onNotice = (event: Event) => {
      const detail = (event as CustomEvent<InfoNotice>).detail;
      if (!detail?.title || !detail.description) return;
      setNotice(detail);
      window.clearTimeout(hide);
      hide = window.setTimeout(() => setNotice(null), TOAST_MS);
    };
    window.addEventListener(TOAST_NOTICE_EVENT, onNotice);
    return () => {
      window.clearTimeout(hide);
      window.removeEventListener(TOAST_NOTICE_EVENT, onNotice);
    };
  }, []);

  if (!notice) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex justify-center px-4">
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-[#E8EAEE] bg-white px-4 py-3 shadow-xl animate-in fade-in slide-in-from-top-3 duration-300",
          whenDark(theme, "border-zinc-700 bg-zinc-900"),
        )}
        role="status"
      >
        <div
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E8F3FF] text-[#2F7DE0]",
            whenDark(theme, "bg-zinc-800 text-sky-300"),
          )}
        >
          <Clock className="size-4" />
        </div>
        <div className="min-w-0 pt-0.5">
          <p
            className={cn(
              "text-sm font-bold text-[#1C1F24]",
              whenDark(theme, "text-zinc-50"),
            )}
          >
            {notice.title}
          </p>
          <p
            className={cn(
              "mt-0.5 text-xs leading-5 text-[#9AA1AA]",
              whenDark(theme, "text-zinc-400"),
            )}
          >
            {notice.description}
          </p>
        </div>
      </div>
    </div>
  );
}
