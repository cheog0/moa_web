"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileEdit,
  AlertCircle,
  Check,
  CheckCircle2,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MarkdownBody from "@/components/meeting/MarkdownBody";
import { supabase } from "@/lib/supabase";
import { TEMPLATE_SALES } from "@/lib/constants";
import { DEFAULT_ENGINE_ID } from "@/lib/engines";
import {
  createPersonalTemplate,
  matchTemplateId,
  nextPersonalName,
  normalizePersonalTemplates,
  PRESET_TEMPLATES,
  type PersonalTemplate,
} from "@/lib/templates";
import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

function errorText(error: unknown) {
  if (!error || typeof error !== "object") return String(error || "");
  const item = error as { message?: string; code?: string; details?: string };
  return [item.code, item.message, item.details].filter(Boolean).join(" ");
}

function isPersonalTemplatesColumnMissing(error: unknown) {
  const text = errorText(error).toLowerCase();
  return (
    text.includes("personal_templates") ||
    text.includes("42703") ||
    text.includes("pgrst204")
  );
}

export default function TemplatePanel({ session }: { session: any }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(PRESET_TEMPLATES[0].id);
  const [personalTemplates, setPersonalTemplates] = useState<PersonalTemplate[]>(
    [],
  );
  const [appliedBody, setAppliedBody] = useState(TEMPLATE_SALES);
  const { theme } = useTheme();
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedPreset = PRESET_TEMPLATES.find((item) => item.id === selectedId);
  const selectedPersonal = personalTemplates.find((item) => item.id === selectedId);
  const builtin = Boolean(selectedPreset);
  const selectedBody = selectedPreset?.body ?? selectedPersonal?.body ?? "";
  const selectedName = selectedPreset?.name ?? selectedPersonal?.name ?? "";

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  const persistSettings = async ({
    customTemplate,
    templates,
  }: {
    customTemplate?: string;
    templates?: PersonalTemplate[];
  }) => {
    const { data: existing } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();
    const nextTemplates = templates ?? personalTemplates;
    const nextTemplate = customTemplate ?? appliedBody;
    const payload = existing
      ? {
          ...existing,
          custom_template: nextTemplate,
          personal_templates: nextTemplates,
        }
      : {
          user_id: session.user.id,
          custom_template: nextTemplate,
          personal_templates: nextTemplates,
          ai_engine: DEFAULT_ENGINE_ID,
        };
    let { error } = await supabase.from("user_settings").upsert(payload);
    if (error && isPersonalTemplatesColumnMissing(error)) {
      const { personal_templates: _ignored, ...withoutPersonal } = payload as {
        personal_templates?: PersonalTemplate[];
        [key: string]: unknown;
      };
      const retry = await supabase.from("user_settings").upsert(withoutPersonal);
      error = retry.error;
    }
    if (error) throw error;
    setAppliedBody(nextTemplate);
    setPersonalTemplates(nextTemplates);
  };

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        let { data, error } = await supabase
          .from("user_settings")
          .select("custom_template, personal_templates")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error) {
          const fallback = await supabase
            .from("user_settings")
            .select("custom_template")
            .eq("user_id", session.user.id)
            .maybeSingle();
          data = fallback.data;
          error = fallback.error;
        }
        if (error) throw error;

        let personal = normalizePersonalTemplates(
          data && "personal_templates" in data
            ? data.personal_templates
            : [],
        );
        const applied = (data?.custom_template || "").trim() || TEMPLATE_SALES;
        let selected = matchTemplateId(applied, personal);

        if (!data) {
          await supabase.from("user_settings").insert({
            user_id: session.user.id,
            custom_template: TEMPLATE_SALES,
            ai_engine: DEFAULT_ENGINE_ID,
          });
        } else if (!selected) {
          const imported = createPersonalTemplate(
            applied,
            nextPersonalName(personal),
          );
          personal = [...personal, imported];
          selected = imported.id;
          const { error: updateError } = await supabase
            .from("user_settings")
            .update({ personal_templates: personal })
            .eq("user_id", session.user.id);
          if (updateError && !isPersonalTemplatesColumnMissing(updateError)) {
            throw updateError;
          }
        }

        setPersonalTemplates(personal);
        setAppliedBody(applied);
        setSelectedId(selected || PRESET_TEMPLATES[0].id);
      } catch (error) {
        console.error("템플릿 불러오기 실패:", errorText(error) || error);
        setPersonalTemplates([]);
        setAppliedBody(TEMPLATE_SALES);
        setSelectedId(PRESET_TEMPLATES[0].id);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [session.user.id]);

  const handleApply = async () => {
    if (!builtin && !selectedName.trim()) {
      showToast("error", "템플릿 이름을 입력해 주세요.");
      return;
    }
    if (!selectedBody.trim()) {
      showToast("error", "템플릿 내용을 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      const templates = builtin
        ? personalTemplates
        : personalTemplates.map((item) =>
            item.id === selectedId
              ? { ...item, name: selectedName.trim(), body: selectedBody }
              : item,
          );
      await persistSettings({
        customTemplate: selectedBody,
        templates,
      });
      showToast("success", "템플릿이 저장되었습니다.");
    } catch (error) {
      console.error("템플릿 저장 에러:", error);
      showToast("error", "템플릿 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    const item = createPersonalTemplate(
      selectedBody,
      nextPersonalName(personalTemplates),
    );
    const templates = [...personalTemplates, item];
    setPersonalTemplates(templates);
    setSelectedId(item.id);
    try {
      await persistSettings({ templates });
    } catch (error) {
      console.error("템플릿 추가 에러:", error);
      showToast("error", "내 템플릿을 추가하지 못했습니다.");
    }
  };

  const handleDelete = async () => {
    if (builtin || !selectedPersonal) return;
    const templates = personalTemplates.filter((item) => item.id !== selectedId);
    const nextSelected = PRESET_TEMPLATES[0];
    setPersonalTemplates(templates);
    setSelectedId(nextSelected.id);
    try {
      await persistSettings({
        templates,
        customTemplate:
          selectedBody === appliedBody ? nextSelected.body : undefined,
      });
    } catch (error) {
      console.error("템플릿 삭제 에러:", error);
      showToast("error", "템플릿을 삭제하지 못했습니다.");
    }
  };

  const updateSelectedPersonal = (patch: Partial<PersonalTemplate>) => {
    setPersonalTemplates((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, ...patch } : item,
      ),
    );
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
            기본 양식은 그대로 두고, 필요한 포맷은 내 템플릿으로 추가해 사용하세요.
          </p>
        </div>
        <Button
          onClick={handleApply}
          disabled={saving}
          className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white shadow-sm h-10 px-6 rounded-lg font-semibold"
        >
          {saving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {saving ? "저장 중..." : "템플릿 저장하기"}
        </Button>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 font-bold text-foreground">
          <FileEdit className="size-5 text-sky-500" /> AI 회의록 기본 양식
        </div>

        <div className="mb-2 flex flex-wrap gap-2">
          {PRESET_TEMPLATES.map((item) => {
            const active = selectedId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs transition-all",
                  item.id === "sales" &&
                    (active
                      ? "border-blue-200 bg-blue-100 font-bold text-blue-700 shadow-sm"
                      : "border-transparent bg-blue-50/50 font-semibold text-blue-600/70 hover:bg-blue-50 hover:text-blue-600"),
                  item.id === "scrum" &&
                    (active
                      ? "border-emerald-200 bg-emerald-100 font-bold text-emerald-700 shadow-sm"
                      : "border-transparent bg-emerald-50/50 font-semibold text-emerald-600/70 hover:bg-emerald-50 hover:text-emerald-600"),
                  item.id === "basic" &&
                    (active
                      ? "border-slate-300 bg-slate-200 font-bold text-slate-800 shadow-sm"
                      : "border-transparent bg-slate-100 font-semibold text-slate-600/70 hover:bg-slate-200/50 hover:text-slate-700"),
                  whenDark(
                    theme,
                    item.id === "sales"
                      ? active
                        ? "border-blue-400/30 bg-blue-500/20 text-blue-200 shadow-none"
                        : "border-transparent bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200"
                      : item.id === "scrum"
                        ? active
                          ? "border-emerald-400/30 bg-emerald-500/20 text-emerald-200 shadow-none"
                          : "border-transparent bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
                        : active
                          ? "border-zinc-600 bg-zinc-700 text-zinc-100 shadow-none"
                          : "border-transparent bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100",
                  ),
                )}
              >
                {item.name}
                {appliedBody === item.body ? (
                  <Check className="size-3.5" strokeWidth={2.5} />
                ) : null}
              </button>
            );
          })}
          {personalTemplates.map((item) => {
            const active = selectedId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
                  active
                    ? "border-violet-200 bg-violet-100 font-bold text-violet-700 shadow-sm"
                    : "border-transparent bg-violet-50/70 text-violet-600/80 hover:bg-violet-50 hover:text-violet-700",
                  whenDark(
                    theme,
                    active
                      ? "border-violet-400/30 bg-violet-500/20 text-violet-200 shadow-none"
                      : "border-transparent bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:text-violet-200",
                  ),
                )}
              >
                {item.name || "내 템플릿"}
                {appliedBody === item.body ? (
                  <Check className="size-3.5" strokeWidth={2.5} />
                ) : null}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleAdd}
            className={cn(
              "ml-auto inline-flex cursor-pointer items-center gap-1 rounded-full border border-border bg-white px-4 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-slate-50 hover:text-foreground",
              whenDark(
                theme,
                "border-zinc-700 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
              ),
            )}
          >
            <Plus className="size-3.5" />
            추가
          </button>
        </div>
        <p className="mb-4 text-xs leading-5 text-muted-foreground">
          미팅·스크럼·기본 회의는 수정할 수 없습니다. 내 양식이 필요하면 추가를 눌러
          복사본을 만든 뒤 고치세요.
        </p>

        {!builtin ? (
          <div className="mb-3 flex items-center gap-2">
            <input
              value={selectedName}
              onChange={(event) =>
                updateSelectedPersonal({ name: event.target.value })
              }
              placeholder="템플릿 이름"
              className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-rose-50 hover:text-rose-600"
              aria-label="내 템플릿 삭제"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ) : null}

        {builtin ? (
          <div
            className={cn(
              "min-h-[400px] overflow-y-auto rounded-xl border border-input bg-white p-5",
              whenDark(theme, "border-zinc-700 bg-zinc-950"),
            )}
          >
            <MarkdownBody
              markdown={selectedBody}
              darkDoc={theme === "dark"}
            />
          </div>
        ) : (
          <textarea
            value={selectedBody}
            onChange={(event) =>
              updateSelectedPersonal({ body: event.target.value })
            }
            placeholder="여기에 원하는 회의록 양식을 자유롭게 작성하세요..."
            className={cn(
              "h-[400px] w-full resize-y rounded-xl border border-input bg-white p-5 text-sm leading-relaxed outline-none transition-all custom-scrollbar focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
              whenDark(theme, "border-zinc-700 bg-zinc-950 text-zinc-100"),
            )}
          />
        )}
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
