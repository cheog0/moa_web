"use client";

import { AlertCircle, Tags, X } from "lucide-react";
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
    <section>
      <div className="mb-2 flex items-center gap-2 font-bold">
        <Tags className="size-5" /> 자동 적용 키워드
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {keywords.map((kw) => (
          <span
            key={kw}
            className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-medium"
          >
            {kw}
            <button
              onClick={() => onRemove(kw)}
              className="ml-1 rounded-full p-0.5 hover:bg-gray-300"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => onNewKeywordChange(e.target.value)}
            onKeyDown={onAdd}
            placeholder="예: 업무, 계약 (쉼표로 구분 가능)"
            className="flex-1 h-11 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:border-primary"
          />
          <Button onClick={onAdd} variant="outline" className="h-11 px-6">
            추가
          </Button>
        </div>
        {errorMsg && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="size-4" />
            {errorMsg}
          </div>
        )}
      </div>
    </section>
  );
}
