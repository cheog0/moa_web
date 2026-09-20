"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, ChevronRight, Menu } from "lucide-react";
import NotificationInbox from "@/components/dashboard/NotificationInbox";
import { useTheme } from "@/hooks/useTheme";
import type { AppNotice } from "@/lib/notifications";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function Header({
  sectionLabel,
  pageLabel,
  initial,
  onMenuOpen,
  unreadCount = 0,
  notices = [],
  onOpenInbox,
  onOpenMeeting,
}: {
  sectionLabel: string;
  pageLabel: string;
  initial?: string;
  onMenuOpen: () => void;
  unreadCount?: number;
  notices?: AppNotice[];
  onOpenInbox?: () => void;
  onOpenMeeting?: (meetingId: string, title: string) => void;
}) {
  const { theme } = useTheme();
  const [inboxOpen, setInboxOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 56, right: 24 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!inboxOpen) return;
    const update = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPanelPos({
        top: Math.round(rect.bottom + 8),
        right: Math.round(window.innerWidth - rect.right),
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [inboxOpen]);

  useEffect(() => {
    if (!inboxOpen) return;
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setInboxOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setInboxOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [inboxOpen]);

  return (
    <header
      className={cn(
        "relative flex h-16 shrink-0 items-center justify-between bg-white pl-5 pr-6 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-slate-200/70 after:blur-[0.3px] sm:pl-8 sm:pr-10",
        whenDark(theme, "bg-zinc-950 after:bg-zinc-800"),
      )}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="rounded-lg p-2 hover:bg-muted lg:hidden"
          aria-label="메뉴 열기"
          aria-controls="mobile-sidebar"
        >
          <Menu className="size-5" />
        </button>
        <nav
          className="flex min-w-0 items-center gap-1.5 text-xs"
          aria-label="현재 위치"
        >
          <span className="truncate text-muted-foreground">{sectionLabel}</span>
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
          <span className="truncate font-semibold text-foreground">
            {pageLabel}
          </span>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => {
              const next = !inboxOpen;
              setInboxOpen(next);
              if (next) onOpenInbox?.();
            }}
            className={cn(
              "relative cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              inboxOpen && "bg-muted text-foreground",
            )}
            title="알림"
            aria-label="알림"
            aria-expanded={inboxOpen}
            aria-haspopup="menu"
          >
            <Bell className="size-5" />
            {unreadCount > 0 ? (
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-rose-500" />
            ) : null}
          </button>
          {inboxOpen
            ? createPortal(
                <div
                  ref={panelRef}
                  className="fixed z-[80]"
                  style={{ top: panelPos.top, right: panelPos.right }}
                >
                  <NotificationInbox
                    items={notices}
                    onOpenMeeting={(meetingId, title) => {
                      setInboxOpen(false);
                      onOpenMeeting?.(meetingId, title);
                    }}
                  />
                </div>,
                document.body,
              )
            : null}
        </div>
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-[11px] shadow-sm">
          {initial || "R"}
        </div>
      </div>
    </header>
  );
}
