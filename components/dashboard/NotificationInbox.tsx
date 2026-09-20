"use client";

import { FileText } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import {
  completedNoticeLabel,
  relativeNoticeLabel,
  type AppNotice,
} from "@/lib/notifications";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function NotificationInbox({
  items,
  onOpenMeeting,
}: {
  items: AppNotice[];
  onOpenMeeting: (meetingId: string, title: string) => void;
}) {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "w-[min(calc(100vw-2rem),360px)] overflow-hidden rounded-2xl border border-[#E8EAEE] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.12)] animate-in fade-in slide-in-from-top-2 duration-150",
        whenDark(theme, "border-zinc-700 bg-zinc-900"),
      )}
      role="menu"
    >
      <div
        className={cn(
          "flex items-center justify-between border-b border-[#E8EAEE] px-4 py-3",
          whenDark(theme, "border-zinc-800"),
        )}
      >
        <p
          className={cn(
            "text-sm font-bold text-[#1C1F24]",
            whenDark(theme, "text-zinc-50"),
          )}
        >
          알림
        </p>
      </div>
      {items.length === 0 ? (
        <p
          className={cn(
            "px-4 py-8 text-center text-[13px] leading-relaxed text-[#9AA1AA]",
            whenDark(theme, "text-zinc-400"),
          )}
        >
          아직 도착한 알림이 없어요.
          <br />
          회의록이 준비되면 여기서 알려드릴게요.
        </p>
      ) : (
        <div className="max-h-[min(360px,60vh)] overflow-y-auto">
          {items.map((item) => (
            <button
              key={`${item.meetingId}-${item.createdAt}`}
              type="button"
              role="menuitem"
              onClick={() => onOpenMeeting(item.meetingId, item.title)}
              className={cn(
                "flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F7F8FA]",
                whenDark(theme, "hover:bg-zinc-800"),
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E8F3FF] text-[#2F7DE0]",
                  whenDark(theme, "bg-zinc-800 text-sky-300"),
                )}
              >
                <FileText className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "min-w-0 flex-1 truncate text-[13px] font-bold text-[#1C1F24]",
                      whenDark(theme, "text-zinc-50"),
                    )}
                  >
                    {item.title || "새 회의"}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 text-[11px] font-medium text-[#9AA1AA]",
                      whenDark(theme, "text-zinc-500"),
                    )}
                  >
                    {relativeNoticeLabel(item.createdAt)}
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-0.5 text-xs text-[#4B5563]",
                    whenDark(theme, "text-zinc-300"),
                  )}
                >
                  회의록이 준비됐어요
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-[11px] text-[#9AA1AA]",
                    whenDark(theme, "text-zinc-500"),
                  )}
                >
                  {completedNoticeLabel(item.createdAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
