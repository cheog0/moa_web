"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  createEmptyManual,
  normalizeManuals,
  ReplyManual,
} from "@/lib/manuals";
import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

const MAX_MANUALS = 20;

export default function ManualPanel({ session }: { session: any }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [manuals, setManuals] = useState<ReplyManual[]>([]);
  const { theme } = useTheme();
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchManuals = async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("reply_manuals")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (data) setManuals(normalizeManuals(data.reply_manuals));
      setLoading(false);
    };
    fetchManuals();
  }, [session.user.id]);

  const updateManual = (id: string, patch: Partial<ReplyManual>) => {
    setManuals((prev) =>
      prev.map((manual) =>
        manual.id === id ? { ...manual, ...patch } : manual,
      ),
    );
  };

  const handleSave = async () => {
    const invalid = manuals.filter(
      (manual) => manual.title.trim() && !manual.content.trim(),
    );
    if (invalid.length > 0) {
      setToast({
        type: "error",
        msg: "제목과 본문을 함께 입력해주세요.",
      });
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
      return;
    }
    const cleaned = normalizeManuals(manuals);
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
      const payload = existing
        ? { ...existing, reply_manuals: cleaned }
        : {
            user_id: session.user.id,
            reply_manuals: cleaned,
            ai_engine: "gemini",
          };
      const { error } = await supabase.from("user_settings").upsert(payload);
      if (error) throw error;
      setManuals(cleaned);
      setToast({ type: "success", msg: "업무 매뉴얼이 저장되었습니다." });
    } catch (error) {
      console.error("매뉴얼 저장 에러:", error);
      setToast({ type: "error", msg: "매뉴얼 저장에 실패했습니다." });
    } finally {
      setSaving(false);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        매뉴얼 불러오는 중...
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl p-5 sm:p-8 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">업무 매뉴얼</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            회의 중 약속한 후속 회신과 메일 초안을 사내 매뉴얼에 맞춰 생성합니다.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-10 shrink-0 rounded-lg bg-slate-900 px-6 font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          {saving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {saving ? "저장 중..." : "매뉴얼 저장"}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {manuals.map((manual, index) => (
          <section
            key={manual.id}
            className={cn(
              "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
              whenDark(theme, "border-zinc-800 bg-zinc-900 shadow-none"),
            )}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <BookOpen className="size-4 text-sky-500" />
                매뉴얼 {index + 1}
              </div>
              <button
                type="button"
                onClick={() =>
                  setManuals((prev) =>
                    prev.filter((item) => item.id !== manual.id),
                  )
                }
                className={cn(
                  "rounded-md p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500",
                  whenDark(theme, "hover:bg-rose-500/10"),
                )}
                aria-label="매뉴얼 삭제"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="grid gap-3">
              <input
                value={manual.title}
                onChange={(e) =>
                  updateManual(manual.id, { title: e.target.value })
                }
                placeholder="제목 예: 환불 안내"
                className={cn(
                  "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-500",
                  whenDark(
                    theme,
                    "border-zinc-700 bg-zinc-950 text-zinc-100",
                  ),
                )}
              />
              <textarea
                value={manual.content}
                onChange={(e) =>
                  updateManual(manual.id, { content: e.target.value })
                }
                placeholder="고객에게 보내는 안내문을 적어 주세요."
                className={cn(
                  "min-h-[140px] w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm leading-relaxed outline-none focus:border-sky-500",
                  whenDark(
                    theme,
                    "border-zinc-700 bg-zinc-950 text-zinc-100",
                  ),
                )}
              />
            </div>
          </section>
        ))}

        {manuals.length === 0 && (
          <div
            className={cn(
              "rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center text-sm text-slate-500",
              whenDark(theme, "border-zinc-700 text-zinc-400"),
            )}
          >
            아직 등록된 매뉴얼이 없습니다. 추가하면 후속 회신과 메일 초안이
            이 기준에 맞춰 작성됩니다.
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          disabled={manuals.length >= MAX_MANUALS}
          onClick={() =>
            setManuals((prev) =>
              prev.length >= MAX_MANUALS ? prev : [...prev, createEmptyManual()],
            )
          }
          className={cn(
            "h-12 justify-center rounded-xl border-dashed border-slate-300 text-slate-600",
            whenDark(theme, "border-zinc-700 text-zinc-300"),
          )}
        >
          <Plus className="mr-2 size-4" /> 매뉴얼 추가
        </Button>
      </div>

      {toast && (
        <div
          className={`fixed top-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-2xl animate-in fade-in slide-in-from-top-5 duration-300 ${
            toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"
          }`}
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
