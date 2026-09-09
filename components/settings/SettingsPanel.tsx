"use client";

import { useEffect, useRef, useState } from "react";
import { Cpu, Key, Tags, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function SettingsPanel({ session }: { session: any }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiEngine, setAiEngine] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (data) {
        setAiEngine(data.ai_engine || "gemini");
        setApiKey(data.api_key || "");
        setKeywords(
          Array.isArray(data.keywords)
            ? data.keywords
            : data.keywords
              ? data.keywords.split(",")
              : [],
        );
      }
      setLoading(false);
    };
    fetchSettings();
  }, [session.user.id]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const { data: existing } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      // 💡 템플릿(custom_template)이 날아가지 않도록 기존 데이터를 합칩니다.
      const payload = existing
        ? {
            ...existing,
            ai_engine: aiEngine,
            api_key: apiKey,
            keywords: keywords,
          }
        : {
            user_id: session.user.id,
            ai_engine: aiEngine,
            api_key: apiKey,
            keywords: keywords,
          };

      const { error } = await supabase.from("user_settings").upsert(payload);

      if (error) throw error;

      setToast({ type: "success", msg: "설정이 안전하게 저장되었습니다." });
    } catch (error) {
      console.error("설정 저장 에러:", error);
      setToast({ type: "error", msg: "설정 저장에 실패했습니다." });
    } finally {
      setSaving(false);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
    }
  };

  const addKeyword = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === "keydown" && (e as React.KeyboardEvent).key !== "Enter")
      return;
    e.preventDefault();

    if (!newKeyword.trim()) return;

    const inputKeywords = newKeyword
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k !== "");

    const uniqueNewKeywords: string[] = [];
    const duplicateKeywords: string[] = [];

    inputKeywords.forEach((kw) => {
      if (keywords.includes(kw) || uniqueNewKeywords.includes(kw)) {
        duplicateKeywords.push(kw);
      } else {
        uniqueNewKeywords.push(kw);
      }
    });

    if (duplicateKeywords.length > 0) {
      setErrorMsg(
        `'${duplicateKeywords.join(", ")}' 은(는) 이미 등록된 키워드입니다.`,
      );
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setErrorMsg(""), 3000);
    } else {
      setErrorMsg("");
    }

    if (uniqueNewKeywords.length > 0) {
      setKeywords([...keywords, ...uniqueNewKeywords]);
    }

    setNewKeyword("");
  };

  const removeKeyword = (target: string) =>
    setKeywords(keywords.filter((k) => k !== target));

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        설정 불러오는 중...
      </div>
    );

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
            value={aiEngine}
            onChange={(e) => setAiEngine(e.target.value)}
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
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="API 키를 붙여넣으세요"
            className="w-full h-11 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:border-primary"
          />
        </section>

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
                  onClick={() => removeKeyword(kw)}
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
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={addKeyword}
                placeholder="예: 업무, 계약 (쉼표로 구분 가능)"
                className="flex-1 h-11 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:border-primary"
              />
              <Button
                onClick={addKeyword}
                variant="outline"
                className="h-11 px-6"
              >
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

        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="w-full h-12 text-base relative overflow-hidden transition-all bg-slate-900 hover:bg-slate-800 text-white"
        >
          {saving ? "저장 중..." : "모든 설정 저장하기"}
        </Button>
      </div>

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
