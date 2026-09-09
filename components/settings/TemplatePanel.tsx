"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileEdit,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  TEMPLATE_BASIC,
  TEMPLATE_SALES,
  TEMPLATE_SCRUM,
} from "@/lib/constants";

export default function TemplatePanel({ session }: { session: any }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customTemplate, setCustomTemplate] = useState("");

  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("custom_template")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data) {
        setCustomTemplate(data.custom_template || "");
      }
      setLoading(false);
    };
    fetchTemplate();
  }, [session.user.id]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const { data: existing } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      const payload = existing
        ? { ...existing, custom_template: customTemplate }
        : {
            user_id: session.user.id,
            custom_template: customTemplate,
            ai_engine: "gemini",
          };

      const { error } = await supabase.from("user_settings").upsert(payload);

      if (error) throw error;

      setToast({
        type: "success",
        msg: "맞춤 템플릿이 안전하게 저장되었습니다.",
      });
    } catch (error) {
      console.error("템플릿 저장 에러:", error);
      setToast({ type: "error", msg: "템플릿 저장에 실패했습니다." });
    } finally {
      setSaving(false);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading)
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        템플릿 불러오는 중...
      </div>
    );

  return (
    <main className="mx-auto w-full max-w-4xl p-5 sm:p-8 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">맞춤 템플릿</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            반복되는 회의의 포맷을 고정해두고, AI가 이 양식에 맞춰 회의록을 자동
            생성하도록 설정하세요.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white shadow-sm h-10 px-6 rounded-lg font-semibold"
        >
          {saving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {saving ? "저장 중..." : "템플릿 적용하기"}
        </Button>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 font-bold text-foreground">
          <FileEdit className="size-5 text-sky-500" /> AI 회의록 기본 양식 작성
        </div>

        {/* 💡 눈이 편안한 파스텔톤 + 테두리로 활성화 상태를 표현했습니다 */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setCustomTemplate(TEMPLATE_SALES)}
            className={`rounded-full border px-4 py-1.5 text-xs transition-all ${
              customTemplate === TEMPLATE_SALES
                ? "bg-blue-100 border-blue-200 text-blue-700 font-bold shadow-sm"
                : "bg-blue-50/50 border-transparent text-blue-600/70 hover:bg-blue-50 hover:text-blue-600 font-semibold"
            }`}
          >
            영업 미팅
          </button>
          <button
            onClick={() => setCustomTemplate(TEMPLATE_SCRUM)}
            className={`rounded-full border px-4 py-1.5 text-xs transition-all ${
              customTemplate === TEMPLATE_SCRUM
                ? "bg-emerald-100 border-emerald-200 text-emerald-700 font-bold shadow-sm"
                : "bg-emerald-50/50 border-transparent text-emerald-600/70 hover:bg-emerald-50 hover:text-emerald-600 font-semibold"
            }`}
          >
            데일리 스크럼
          </button>
          <button
            onClick={() => setCustomTemplate(TEMPLATE_BASIC)}
            className={`rounded-full border px-4 py-1.5 text-xs transition-all ${
              customTemplate === TEMPLATE_BASIC
                ? "bg-slate-200 border-slate-300 text-slate-800 font-bold shadow-sm"
                : "bg-slate-100 border-transparent text-slate-600/70 hover:bg-slate-200/50 hover:text-slate-700 font-semibold"
            }`}
          >
            기본 회의
          </button>
          <button
            onClick={() => setCustomTemplate("")}
            className={`rounded-full border px-4 py-1.5 text-xs transition-all ml-auto ${
              customTemplate === ""
                ? "bg-slate-100 border-slate-300 text-slate-700 font-bold shadow-sm"
                : "bg-white border-border text-muted-foreground hover:bg-slate-50 font-semibold"
            }`}
          >
            비우기
          </button>
        </div>

        <textarea
          value={customTemplate}
          onChange={(e) => setCustomTemplate(e.target.value)}
          placeholder="여기에 원하는 회의록 양식을 자유롭게 작성하세요..."
          className="h-[400px] w-full resize-y rounded-xl border border-input bg-background p-5 text-sm outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all custom-scrollbar leading-relaxed"
        />
      </section>

      {toast && (
        <div
          className="fixed top-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-2xl animate-in fade-in slide-in-from-top-5 duration-300"
          style={{
            backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="size-5" />
          ) : (
            <AlertCircle className="size-5" />
          )}
          {toast.msg}
        </div>
      )}
    </main>
  );
}
