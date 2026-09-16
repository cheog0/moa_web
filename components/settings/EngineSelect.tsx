"use client";

import { Check, ChevronDown } from "lucide-react";
import { Select } from "@base-ui/react/select";
import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const ENGINES = [
  {
    id: "gemini",
    name: "Google Gemini 3.6 Flash",
    hint: "기본 추천 엔진",
  },
  {
    id: "deepgram",
    name: "Deepgram",
    hint: "실시간 음성 인식",
  },
  {
    id: "soniox",
    name: "Soniox",
    hint: "고정밀 받아쓰기",
  },
  {
    id: "clova",
    name: "ClovaNote",
    hint: "한국어 특화",
  },
] as const;

export default function EngineSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { theme } = useTheme();

  return (
    <Select.Root
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next);
      }}
      items={ENGINES.map((engine) => ({
        value: engine.id,
        label: engine.name,
      }))}
      modal={false}
    >
      <Select.Trigger className={cn(
        "flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 text-left text-sm text-slate-900 outline-none transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:border-slate-400 data-[popup-open]:border-slate-400 data-[popup-open]:bg-slate-50",
        whenDark(
          theme,
          "border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-900 data-[popup-open]:border-zinc-500 data-[popup-open]:bg-zinc-900",
        ),
      )}>
        <Select.Value className="min-w-0 truncate font-medium" />
        <Select.Icon className={cn(
          "flex shrink-0 text-slate-400 transition-transform duration-200 data-[open]:rotate-180",
          whenDark(theme, "text-zinc-400"),
        )}>
          <ChevronDown className="size-4" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          className="z-50 outline-none"
          sideOffset={6}
          alignItemWithTrigger={false}
        >
          <Select.Popup className={cn(
            "w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-[0_12px_32px_rgba(15,23,42,0.12)] outline-none transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            whenDark(theme, "border-zinc-700 bg-zinc-900 shadow-black/40"),
          )}>
            <Select.List>
              {ENGINES.map((engine) => (
                <Select.Item
                  key={engine.id}
                  value={engine.id}
                  label={engine.name}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-slate-900 outline-none select-none data-[highlighted]:bg-slate-50 data-[selected]:bg-slate-100",
                    whenDark(
                      theme,
                      "text-zinc-100 data-[highlighted]:bg-zinc-800 data-[selected]:bg-zinc-800",
                    ),
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <Select.ItemText className="block text-sm font-medium">
                      {engine.name}
                    </Select.ItemText>
                    <p
                      className={cn(
                        "mt-0.5 text-[11px] text-slate-500",
                        whenDark(theme, "text-zinc-400"),
                      )}
                    >
                      {engine.hint}
                    </p>
                  </div>
                  <Select.ItemIndicator className={cn(
                    "flex size-4 shrink-0 items-center justify-center text-slate-900",
                    whenDark(theme, "text-zinc-100"),
                  )}>
                    <Check className="size-3.5" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
