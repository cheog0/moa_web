"use client";

import { Bell, ChevronRight, Menu } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function Header({
  sectionLabel,
  pageLabel,
  initial,
  onNotify,
  onMenuOpen,
}: {
  sectionLabel: string;
  pageLabel: string;
  initial?: string;
  onNotify: () => void;
  onMenuOpen: () => void;
}) {
  const { theme } = useTheme();

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
        <button
          onClick={onNotify}
          className="relative rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="알림"
        >
          <Bell className="size-5" />
        </button>
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-[11px] shadow-sm">
          {initial || "R"}
        </div>
      </div>
    </header>
  );
}
