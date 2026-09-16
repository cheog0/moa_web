"use client";

import { Check, ChevronDown, Loader2, Pencil, Save, Trash2 } from "lucide-react";
import { Select } from "@base-ui/react/select";
import { Button } from "@/components/ui/button";
import { TimelineItem } from "@/lib/timeline";
import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "진행 중", label: "진행 중" },
  { value: "완료", label: "완료됨" },
] as const;

export default function TimelineHeader({
  isLoading,
  items,
  projectStatus,
  onStatusChange,
  isEditing,
  projectName,
  onNameChange,
  onStartEdit,
  onStopEdit,
  canDelete,
  isSaving,
  isDeleting,
  onDelete,
  onSave,
}: {
  isLoading: boolean;
  items: TimelineItem[];
  projectStatus: string;
  onStatusChange: (value: string) => void;
  isEditing: boolean;
  projectName: string;
  onNameChange: (value: string) => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
  canDelete: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onDelete: () => void;
  onSave: () => void;
}) {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 border-b border-border pb-3">
      <div>
        <div className="flex items-center gap-3 mb-2">
          {isLoading ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-400">
              불러오는 중
            </span>
          ) : items.length === 0 ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-400">
              대기 중
            </span>
          ) : (
            <Select.Root
              value={projectStatus}
              onValueChange={(next) => {
                if (next) onStatusChange(next);
              }}
              items={STATUS_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              modal={false}
            >
              <Select.Trigger
                className={cn(
                  "relative inline-flex h-[22px] items-center rounded-full border border-transparent py-0 pl-3 pr-7 text-[11px] font-bold leading-none outline-none cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-sky-500/20",
                  projectStatus === "완료"
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-sky-100 text-sky-700 hover:bg-sky-200",
                )}
              >
                <Select.Value className="text-[11px] font-bold leading-none" />
                <Select.Icon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60">
                  <ChevronDown className="size-3" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner
                  className="z-50 outline-none"
                  sideOffset={6}
                  align="start"
                  alignItemWithTrigger={false}
                >
                  <Select.Popup
                    className={cn(
                      "min-w-[7.5rem] origin-[var(--transform-origin)] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-[0_12px_32px_rgba(15,23,42,0.12)] outline-none",
                      whenDark(
                        theme,
                        "border-zinc-700 bg-zinc-900 shadow-black/40",
                      ),
                    )}
                  >
                    <Select.List>
                      {STATUS_OPTIONS.map((option) => (
                        <Select.Item
                          key={option.value}
                          value={option.value}
                          label={option.label}
                          className={cn(
                            "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none select-none data-[highlighted]:bg-slate-50 data-[selected]:bg-slate-100",
                            whenDark(
                              theme,
                              "text-zinc-100 data-[highlighted]:bg-zinc-800 data-[selected]:bg-zinc-800",
                            ),
                          )}
                        >
                          <Select.ItemText>{option.label}</Select.ItemText>
                          <Select.ItemIndicator className="flex size-3.5 items-center justify-center text-sky-600">
                            <Check className="size-3" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.List>
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          )}
          <span className="text-sm text-muted-foreground">타임라인</span>
        </div>
        <div className="flex items-center gap-2 group">
          {isLoading && !projectName ? (
            <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200" />
          ) : isEditing ? (
            <input
              autoFocus
              className="text-2xl font-extrabold tracking-tight text-foreground bg-transparent outline-none w-64 placeholder:text-muted-foreground/40 placeholder:font-semibold"
              placeholder="타임라인 이름 입력..."
              value={projectName}
              onChange={(e) => onNameChange(e.target.value)}
              onBlur={() => {
                if (projectName.trim()) onStopEdit();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && projectName.trim()) onStopEdit();
              }}
            />
          ) : (
            <>
              <h1
                className="text-2xl font-extrabold tracking-tight text-foreground cursor-pointer hover:text-sky-600 transition-colors"
                onClick={onStartEdit}
              >
                {projectName}
              </h1>
              <button
                onClick={onStartEdit}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-sky-500 transition-opacity ml-1"
              >
                <Pencil className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>
      <div
        className={`items-center gap-2 ${
          !canDelete && items.length === 0 ? "hidden" : "flex"
        }`}
      >
        {items.length > 0 && (
          <Button
            onClick={onSave}
            disabled={isSaving || isDeleting}
            className={cn(
              "group/save h-10 w-10 gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white px-0 text-slate-950 shadow-sm transition-[width,gap,color,background-color,border-color,box-shadow] duration-300 hover:w-[92px] hover:gap-1 hover:border-slate-300 hover:bg-slate-100 hover:shadow-[0_6px_18px_rgba(15,23,42,0.1)] animate-in fade-in",
              whenDark(
                theme,
                "border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800",
              ),
            )}
          >
            {isSaving ? (
              <Loader2 className="size-[18px] animate-spin" />
            ) : (
              <Save className="size-[18px] transition-transform duration-300 group-hover/save:-rotate-6 group-hover/save:scale-110" />
            )}
            <span className="max-w-0 overflow-hidden text-[11px] font-semibold opacity-0 transition-all duration-300 group-hover/save:max-w-16 group-hover/save:opacity-100">
              {isSaving ? "저장 중..." : "저장하기"}
            </span>
          </Button>
        )}
        {canDelete && (
          <Button
            variant="ghost"
            onClick={onDelete}
            disabled={isSaving || isDeleting}
            className={cn(
              "group/delete h-10 w-10 gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white px-0 text-rose-500 shadow-sm transition-[width,gap,color,background-color,border-color,box-shadow] duration-300 hover:w-[70px] hover:gap-1 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 hover:shadow-[0_6px_18px_rgba(244,63,94,0.12)] animate-in fade-in",
              whenDark(
                theme,
                "border-zinc-700 bg-zinc-900 hover:border-rose-400/40 hover:bg-rose-500/10",
              ),
            )}
            title="타임라인 삭제"
            aria-label="타임라인 삭제"
          >
            {isDeleting ? (
              <Loader2 className="size-[18px] animate-spin" />
            ) : (
              <Trash2 className="size-[18px] transition-transform duration-300 group-hover/delete:-rotate-6 group-hover/delete:scale-110" />
            )}
            <span
              className={cn(
                "max-w-0 overflow-hidden text-[11px] font-semibold opacity-0 transition-all duration-300 group-hover/delete:max-w-9 group-hover/delete:opacity-100",
                whenDark(theme, "font-bold"),
              )}
            >
              {isDeleting ? "삭제 중" : "삭제"}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
