"use client";

import { useTheme } from "@/hooks/useTheme";
import { showInfoNotice } from "@/lib/notice";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
  disabled = false,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const { theme } = useTheme();
  const handleClick = () => {
    if (disabled) {
      showInfoNotice(
        "준비 중인 기능이에요",
        "곧 추가될 업데이트입니다. 조금만 기다려 주세요.",
      );
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-all ${
        active
          ? "bg-primary/10 font-semibold text-primary shadow-2xs"
          : cn(
              "text-muted-foreground hover:bg-slate-200/50 hover:text-foreground",
              whenDark(theme, "hover:bg-zinc-800 hover:text-zinc-100"),
            )
      }`}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate text-sm">{label}</span>
    </button>
  );
}
