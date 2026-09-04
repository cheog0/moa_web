"use client";

import { useEffect, useState } from "react";
import { Cpu, FileEdit, Key, Tags, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  TEMPLATE_BASIC,
  TEMPLATE_SALES,
  TEMPLATE_SCRUM,
} from "@/lib/constants";

export default function SettingsPanel({ session }: { session: any }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiEngine, setAiEngine] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [customTemplate, setCustomTemplate] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      if (data) {
        setAiEngine(data.ai_engine || "gemini");
        setApiKey(data.api_key || "");
        setCustomTemplate(data.custom_template || "");
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
    const { error } = await supabase.from("user_settings").upsert({
      user_id: session.user.id,
      ai_engine: aiEngine,
      api_key: apiKey,
      custom_template: customTemplate,
      keywords: keywords,
    });
    setSaving(false);
    if (error) alert("설정 저장에 실패했습니다.");
    else alert("설정이 안전하게 저장되었습니다.");
  };

  const addKeyword = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === "keydown" && (e as React.KeyboardEvent).key !== "Enter")
      return;
    e.preventDefault();
    const trimmed = newKeyword.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setNewKeyword("");
    }
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
    <main className="mx-auto w-full max-w-3xl p-5 sm:p-8 print:hidden">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">AI 및 앱 설정</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          회의록 요약 방식과 AI 모델을 커스텀하세요.
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
            <FileEdit className="size-5" /> 맞춤형 AI 회의록 템플릿
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              onClick={() => setCustomTemplate(TEMPLATE_SALES)}
              className="rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100"
            >
              📋 영업 미팅
            </button>
            <button
              onClick={() => setCustomTemplate(TEMPLATE_SCRUM)}
              className="rounded-full bg-green-50 px-4 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-100"
            >
              🏃‍♂️ 데일리 스크럼
            </button>
            <button
              onClick={() => setCustomTemplate(TEMPLATE_BASIC)}
              className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
            >
              📝 기본 회의
            </button>
            <button
              onClick={() => setCustomTemplate("")}
              className="rounded-full border border-border bg-white px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-gray-50"
            >
              🔄 비우기
            </button>
          </div>
          <textarea
            value={customTemplate}
            onChange={(e) => setCustomTemplate(e.target.value)}
            placeholder="템플릿 양식을 작성하세요..."
            className="h-64 w-full resize-y rounded-lg border border-input bg-background p-4 text-sm outline-none focus:border-primary"
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
          {/* 💡 높이를 h-11로 똑같이 맞췄습니다 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={addKeyword}
              placeholder="예: 디자인, 클라이언트"
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
        </section>

        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="w-full h-12 text-base"
        >
          {saving ? "저장 중..." : "모든 설정 저장하기"}
        </Button>
      </div>
    </main>
  );
}
