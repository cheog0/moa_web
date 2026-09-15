"use client";

import { Cpu, Key, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Keywords from "@/components/settings/Keywords";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsPanel({ session }: { session: any }) {
  const settings = useSettings(session.user.id);

  if (settings.loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        설정 불러오는 중...
      </div>
    );
  }

  return (
    <main className="relative mx-auto w-full max-w-3xl p-5 sm:p-8 print:hidden animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">시스템 설정</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          AI 모델을 선택하고 자동 적용 키워드를 커스텀하세요.
        </p>
      </div>
      <div className="flex flex-col gap-10">
        <section>
          <div className="mb-4 flex items-center gap-2 font-bold">
            <Cpu className="size-5" /> STT / AI 엔진 선택
          </div>
          <select
            value={settings.aiEngine}
            onChange={(e) => settings.setAiEngine(e.target.value)}
            className="w-full h-11 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:border-primary"
          >
            <option value="gemini">Google Gemini 3.6 Flash</option>
            <option value="deepgram">Deepgram</option>
            <option value="soniox">Soniox</option>
            <option value="clova">ClovaNote</option>
          </select>
        </section>
        <section>
          <div className="mb-2 flex items-center gap-2 font-bold">
            <Key className="size-5" /> API 키
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            안전하게 클라우드 내 개인 계정에만 보관됩니다.
          </p>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => settings.setApiKey(e.target.value)}
            placeholder="API 키를 붙여넣으세요"
            className="w-full h-11 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:border-primary"
          />
        </section>
        <Keywords
          keywords={settings.keywords}
          newKeyword={settings.newKeyword}
          errorMsg={settings.errorMsg}
          onNewKeywordChange={settings.setNewKeyword}
          onAdd={settings.addKeyword}
          onRemove={settings.removeKeyword}
        />
        <Button
          onClick={settings.handleSave}
          disabled={settings.saving}
          size="lg"
          className="w-full h-12 text-base relative overflow-hidden transition-all bg-slate-900 hover:bg-slate-800 text-white"
        >
          {settings.saving ? "저장 중..." : "모든 설정 저장하기"}
        </Button>
      </div>
      {settings.toast && (
        <div
          className="fixed top-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-2xl animate-in fade-in slide-in-from-top-5 duration-300"
          style={{
            backgroundColor:
              settings.toast.type === "success" ? "#10b981" : "#ef4444",
          }}
        >
          {settings.toast.type === "success" ? (
            <CheckCircle2 className="size-5" />
          ) : (
            <AlertCircle className="size-5" />
          )}
          {settings.toast.msg}
        </div>
      )}
    </main>
  );
}
