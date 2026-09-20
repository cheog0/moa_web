"use client";

import { Check, ChevronDown } from "lucide-react";
import { Select } from "@base-ui/react/select";
import { ENGINES } from "@/lib/engines";
import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

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
      <Select.Trigger
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-2xl bg-[#F7F8FA] px-4 py-3.5 text-left text-[#1C1F24] outline-none transition-colors hover:bg-[#EEEEF0]",
          whenDark(theme, "bg-zinc-950 text-zinc-100 hover:bg-zinc-800"),
        )}
      >
        <div className="min-w-0">
          <Select.Value className="block truncate text-sm font-bold" />
          <p
            className={cn(
              "mt-0.5 text-xs text-[#9AA1AA]",
              whenDark(theme, "text-zinc-400"),
            )}
          >
            탭해서 엔진 변경
          </p>
        </div>
        <Select.Icon
          className={cn(
            "flex shrink-0 text-[#9AA1AA] transition-transform duration-200 data-[open]:rotate-180",
            whenDark(theme, "text-zinc-400"),
          )}
        >
          <ChevronDown className="size-[18px]" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          className="z-50 outline-none"
          sideOffset={8}
          alignItemWithTrigger={false}
        >
          <Select.Popup
            className={cn(
              "w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-hidden rounded-[28px] border border-[#E8EAEE] bg-white p-[18px] shadow-[0_12px_32px_rgba(28,31,36,0.12)] outline-none transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
              whenDark(theme, "border-zinc-700 bg-zinc-900 shadow-black/40"),
            )}
          >
            <p className="text-center text-[17px] font-extrabold tracking-tight">
              받아쓰기 엔진 선택
            </p>
            <p
              className={cn(
                "mt-1.5 text-center text-xs text-[#9AA1AA]",
                whenDark(theme, "text-zinc-400"),
              )}
            >
              회의 기록에 사용할 AI 엔진을 고르세요.
            </p>
            <Select.List className="mt-4 flex flex-col gap-2">
              {ENGINES.map((engine) => (
                <Select.Item
                  key={engine.id}
                  value={engine.id}
                  label={engine.name}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-[18px] bg-[#F7F8FA] px-3.5 py-3.5 text-[#1C1F24] outline-none select-none data-[highlighted]:bg-[#EEEEF0] data-[selected]:bg-[#E8F3FF] data-[selected]:text-[#2F7DE0]",
                    whenDark(
                      theme,
                      "bg-zinc-950 text-zinc-100 data-[highlighted]:bg-zinc-800 data-[selected]:bg-sky-950/60 data-[selected]:text-sky-300",
                    ),
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <Select.ItemText className="block truncate text-sm font-bold">
                      {engine.name}
                    </Select.ItemText>
                  </div>
                  <Select.ItemIndicator className="flex size-[18px] shrink-0 items-center justify-center text-[#2F7DE0]">
                    <Check className="size-4" />
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
