"use client";

import { AlertCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Keywords({
  keywords,
  newKeyword,
  errorMsg,
  onNewKeywordChange,
  onAdd,
  onRemove,
}: {
  keywords: string[];
  newKeyword: string;
  errorMsg: string;
  onNewKeywordChange: (value: string) => void;
  onAdd: (e: React.KeyboardEvent | React.MouseEvent) => void;
  onRemove: (keyword: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-10 flex-wrap content-start gap-1.5">
        {keywords.map((kw) => (
          <span
            key={kw}
            className="flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 animate-in fade-in zoom-in-95 duration-200"
          >
            {kw}
            <button
              type="button"
              onClick={() => onRemove(kw)}
              className="rounded-sm p-0.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
              aria-label={`${kw} 삭제`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        {keywords.length === 0 && (
          <p className="py-1 text-xs text-slate-400">등록된 키워드가 없습니다.</p>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => onNewKeywordChange(e.target.value)}
          onKeyDown={onAdd}
          placeholder="예: 업무, 계약"
          className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400"
        />
        <Button
          onClick={onAdd}
          variant="outline"
          className="h-10 border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
        >
          <Plus className="size-4" />
          추가
        </Button>
      </div>
      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-rose-500 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="size-3.5" />
          {errorMsg}
        </div>
      )}
    </div>
  );
}
