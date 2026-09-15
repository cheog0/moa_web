"use client";

import { ChevronDown, Loader2, Pencil, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimelineItem } from "@/lib/timeline";

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
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 border-b border-border pb-6">
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
            <div className="relative inline-flex items-center group">
              <select
                value={projectStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className={`appearance-none rounded-full pl-3 pr-7 py-0.5 text-xs font-bold outline-none cursor-pointer transition-colors border border-transparent focus:ring-2 focus:ring-sky-500/20 ${
                  projectStatus === "완료"
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                }`}
              >
                <option value="진행 중">진행 중</option>
                <option value="완료">완료됨</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-current opacity-60" />
            </div>
          )}
          <span className="text-sm text-muted-foreground">타임라인</span>
        </div>
        <div className="flex items-center gap-2 group">
          {isLoading ? (
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
      <div className="flex items-center gap-3">
        {canDelete && (
          <Button
            variant="outline"
            onClick={onDelete}
            disabled={isSaving || isDeleting}
            className="text-rose-500 border-rose-200 hover:bg-rose-50 hover:text-rose-600 shadow-sm h-10 animate-in fade-in"
          >
            {isDeleting ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4 mr-1.5" />
            )}
            {isDeleting ? "삭제 중..." : "삭제"}
          </Button>
        )}
        {items.length > 0 && (
          <Button
            onClick={onSave}
            disabled={isSaving || isDeleting}
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm h-10 px-6 rounded-lg font-semibold animate-in fade-in"
          >
            {isSaving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {isSaving ? "저장 중..." : "저장하기"}
          </Button>
        )}
      </div>
    </div>
  );
}
