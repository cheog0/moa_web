"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Keywords from "@/components/settings/Keywords";
import EngineSelect from "@/components/settings/EngineSelect";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsPanel({ session }: { session: any }) {
  const settings = useSettings(session.user.id);
  const [showApiKey, setShowApiKey] = useState(false);

  if (settings.loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-50 text-sm text-slate-500">
        <Loader2 className="mr-2 size-4 animate-spin" />
        설정 불러오는 중...
      </div>
    );
  }

  return (
    <main className="min-h-full w-full bg-slate-50 px-5 py-8 text-slate-900 sm:px-8 sm:py-10 print:hidden animate-in fade-in duration-500">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            설정
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            받아쓰기 엔진과 키워드를 이 계정에 맞게 조정하세요.
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="grid gap-4 border-b border-slate-100 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(220px,260px)] sm:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-900">STT / AI 엔진</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                회의 받아쓰기와 요약에 사용할 모델을 고릅니다.
              </p>
            </div>
            <EngineSelect
              value={settings.aiEngine}
              onChange={settings.setAiEngine}
            />
          </div>

          <div className="grid gap-4 border-b border-slate-100 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(220px,260px)] sm:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-900">API 키</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                선택한 엔진의 키는 이 계정에만 저장됩니다.
              </p>
            </div>
            <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 transition-colors focus-within:border-slate-400">
              <input
                type={showApiKey ? "text" : "password"}
                value={settings.apiKey}
                onChange={(e) => settings.setApiKey(e.target.value)}
                placeholder="키를 붙여넣으세요"
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowApiKey((open) => !open)}
                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label={showApiKey ? "API 키 숨기기" : "API 키 보기"}
              >
                {showApiKey ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="px-5 py-5">
            <p className="text-sm font-semibold text-slate-900">자동 적용 키워드</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              고유명사나 자주 쓰는 용어를 미리 등록해 두면 받아쓰기에 반영됩니다.
            </p>
            <div className="mt-4">
              <Keywords
                keywords={settings.keywords}
                newKeyword={settings.newKeyword}
                errorMsg={settings.errorMsg}
                onNewKeywordChange={settings.setNewKeyword}
                onAdd={settings.addKeyword}
                onRemove={settings.removeKeyword}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={settings.handleSave}
            disabled={settings.saving}
            className="h-10 min-w-28 border-0 bg-slate-950 px-4 font-semibold text-white shadow-none hover:bg-slate-800"
          >
            {settings.saving ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 size-4" />
            )}
            {settings.saving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>

      {settings.toast && (
        <div
          className={`fixed top-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg animate-in fade-in slide-in-from-top-5 duration-300 ${
            settings.toast.type === "success" ? "bg-slate-950" : "bg-rose-500"
          }`}
        >
          {settings.toast.type === "success" ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          {settings.toast.msg}
        </div>
      )}
    </main>
  );
}
