"use client";

import { KeyboardEvent } from "react";
import { Plus, Users, X } from "lucide-react";

export default function Attendees({
  names,
  customInput,
  isAdding,
  onRemove,
  onCustomInputChange,
  onKeyDown,
  onStartAdd,
  onBlur,
}: {
  names: string[];
  customInput: string;
  isAdding: boolean;
  onRemove: (name: string) => void;
  onCustomInputChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onStartAdd: () => void;
  onBlur: () => void;
}) {
  return (
    <div className="w-full mb-8 text-center">
      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground mb-3">
        <Users className="size-3.5" /> 참석자 추가 (선택 사항)
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 min-h-[36px]">
        {names.map((name) => (
          <span
            key={name}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-sm animate-in fade-in zoom-in-95 duration-150"
          >
            {name}
            <button
              type="button"
              onClick={() => onRemove(name)}
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        {isAdding ? (
          <input
            type="text"
            autoFocus
            value={customInput}
            onChange={(e) => onCustomInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            placeholder=""
            className="px-3 py-1 rounded-full text-xs bg-background border border-primary text-foreground outline-none w-32 text-center animate-in fade-in"
          />
        ) : (
          <button
            type="button"
            onClick={onStartAdd}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="size-3" /> 참석자 추가
          </button>
        )}
      </div>
    </div>
  );
}
