"use client";

import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PreviewBar({
  includeDecisions,
  onToggleDecisions,
  onBack,
  onPrint,
}: {
  includeDecisions: boolean;
  onToggleDecisions: (checked: boolean) => void;
  onBack: () => void;
  onPrint: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between bg-zinc-800 px-6 py-4 text-white shadow-md print:hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
        <div className="flex items-center gap-2 font-semibold">
          <Eye className="size-5 text-sky-400" />
          <span className="hidden sm:inline">PDF 미리보기</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-zinc-600" />
        <label className="flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={includeDecisions}
            onChange={(e) => onToggleDecisions(e.target.checked)}
            className="size-4 rounded border-zinc-500 bg-zinc-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-zinc-800 cursor-pointer"
          />
          결정된 사항 포함
        </label>
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onBack}
          className="text-black"
        >
          돌아가기
        </Button>
        <Button
          size="sm"
          onClick={onPrint}
          className="bg-sky-500 text-white hover:bg-sky-600"
        >
          <Download className="mr-2 size-4" /> 이대로 PDF 저장
        </Button>
      </div>
    </div>
  );
}
