"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="다크 모드"
      onClick={() => {
        switch (theme) {
          case "dark":
            setTheme("light");
            break;
          default:
            setTheme("dark");
        }
      }}
      className={
        isDark
          ? "relative flex h-7 w-12 items-center rounded-full border border-zinc-600 bg-zinc-700 px-0.5 transition-colors"
          : "relative flex h-7 w-12 items-center rounded-full border border-slate-200 bg-slate-200 px-0.5 transition-colors"
      }
    >
      <span
        className={
          isDark
            ? "flex size-5 translate-x-5 items-center justify-center rounded-full bg-zinc-950 text-zinc-100 shadow-sm transition-transform duration-200"
            : "flex size-5 translate-x-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition-transform duration-200"
        }
      >
        {isDark ? <Moon className="size-3" /> : <Sun className="size-3" />}
      </span>
    </button>
  );
}
