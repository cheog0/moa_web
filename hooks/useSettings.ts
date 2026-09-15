import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useSettings(userId: string) {
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
        .eq("user_id", userId)
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
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      const payload = existing
        ? { ...existing, ai_engine: aiEngine, api_key: apiKey, keywords }
        : { user_id: userId, ai_engine: aiEngine, api_key: apiKey, keywords };
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

  return {
    loading,
    saving,
    aiEngine,
    setAiEngine,
    apiKey,
    setApiKey,
    keywords,
    newKeyword,
    setNewKeyword,
    errorMsg,
    toast,
    handleSave,
    addKeyword,
    removeKeyword: (target: string) =>
      setKeywords(keywords.filter((k) => k !== target)),
  };
}
