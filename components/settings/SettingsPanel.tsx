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
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Keywords from "@/components/settings/Keywords";
import EngineSelect from "@/components/settings/EngineSelect";
import ThemeSwitch from "@/components/settings/ThemeSwitch";
import { useSettings } from "@/hooks/useSettings";
import { useTheme } from "@/hooks/useTheme";
import { deleteOwnAccount } from "@/lib/account";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function SettingsPanel({ session }: { session: any }) {
  const settings = useSettings(session.user.id);
  const { theme } = useTheme();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (settings.loading) {
    return (
      <div
        className={cn(
          "flex min-h-full items-center justify-center bg-slate-50 text-sm text-slate-500",
          whenDark(theme, "bg-zinc-950 text-zinc-400"),
        )}
      >
        <Loader2 className="mr-2 size-4 animate-spin" />
        설정 불러오는 중...
      </div>
    );
  }

  return (
    <main
      className={cn(
        "min-h-full w-full bg-slate-50 px-5 py-8 text-slate-900 sm:px-8 sm:py-10 print:hidden animate-in fade-in duration-500",
        whenDark(theme, "bg-zinc-950 text-zinc-100"),
      )}
    >
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <h1
            className={cn(
              "text-2xl font-semibold tracking-tight text-slate-950",
              whenDark(theme, "text-zinc-50"),
            )}
          >
            설정
          </h1>
          <p
            className={cn(
              "mt-2 text-sm leading-6 text-slate-500",
              whenDark(theme, "text-zinc-400"),
            )}
          >
            받아쓰기 엔진과 키워드를 이 계정에 맞게 조정하세요.
          </p>
        </header>

        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
            whenDark(theme, "border-zinc-800 bg-zinc-900 shadow-none"),
          )}
        >
          <div
            className={cn(
              "grid gap-4 border-b border-slate-100 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center",
              whenDark(theme, "border-zinc-800"),
            )}
          >
            <div>
              <p
                className={cn(
                  "text-sm font-semibold text-slate-900",
                  whenDark(theme, "text-zinc-100"),
                )}
              >
                화면 모드
              </p>
              <p
                className={cn(
                  "mt-1 text-xs leading-5 text-slate-500",
                  whenDark(theme, "text-zinc-400"),
                )}
              >
                밝은 화면과 어두운 화면을 전환합니다.
              </p>
            </div>
            <ThemeSwitch />
          </div>

          <div
            className={cn(
              "grid gap-4 border-b border-slate-100 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(220px,260px)] sm:items-center",
              whenDark(theme, "border-zinc-800"),
            )}
          >
            <div>
              <p
                className={cn(
                  "text-sm font-semibold text-slate-900",
                  whenDark(theme, "text-zinc-100"),
                )}
              >
                STT / AI 엔진
              </p>
              <p
                className={cn(
                  "mt-1 text-xs leading-5 text-slate-500",
                  whenDark(theme, "text-zinc-400"),
                )}
              >
                회의 받아쓰기와 요약에 사용할 모델을 고릅니다.
              </p>
            </div>
            <EngineSelect
              value={settings.aiEngine}
              onChange={settings.setAiEngine}
            />
          </div>

          <div
            className={cn(
              "grid gap-4 border-b border-slate-100 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(220px,260px)] sm:items-center",
              whenDark(theme, "border-zinc-800"),
            )}
          >
            <div>
              <p
                className={cn(
                  "text-sm font-semibold text-slate-900",
                  whenDark(theme, "text-zinc-100"),
                )}
              >
                API 키
              </p>
              <p
                className={cn(
                  "mt-1 text-xs leading-5 text-slate-500",
                  whenDark(theme, "text-zinc-400"),
                )}
              >
                선택한 엔진의 키는 이 계정에만 저장됩니다.
              </p>
            </div>
            <div
              className={cn(
                "flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 transition-colors focus-within:border-slate-400",
                whenDark(
                  theme,
                  "border-zinc-700 bg-zinc-950 focus-within:border-zinc-500",
                ),
              )}
            >
              <input
                type={showApiKey ? "text" : "password"}
                value={settings.apiKey}
                onChange={(e) => settings.setApiKey(e.target.value)}
                placeholder="키를 붙여넣으세요"
                className={cn(
                  "h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400",
                  whenDark(theme, "text-zinc-100 placeholder:text-zinc-500"),
                )}
              />
              <button
                type="button"
                onClick={() => setShowApiKey((open) => !open)}
                className={cn(
                  "rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700",
                  whenDark(theme, "hover:bg-zinc-800 hover:text-zinc-200"),
                )}
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
            <div className="flex items-center justify-between gap-3">
              <p
                className={cn(
                  "text-sm font-semibold text-slate-900",
                  whenDark(theme, "text-zinc-100"),
                )}
              >
                자동 적용 키워드
              </p>
              <p
                className={cn(
                  "text-xs tabular-nums text-slate-400",
                  whenDark(theme, "text-zinc-500"),
                )}
              >
                {settings.keywords.length}/100
              </p>
            </div>
            <p
              className={cn(
                "mt-1 text-xs leading-5 text-slate-500",
                whenDark(theme, "text-zinc-400"),
              )}
            >
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
            className={cn(
              "h-10 min-w-28 border-0 bg-slate-950 px-4 font-semibold text-white shadow-none hover:bg-slate-800",
              whenDark(theme, "bg-zinc-100 text-zinc-950 hover:bg-white"),
            )}
          >
            {settings.saving ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 size-4" />
            )}
            {settings.saving ? "저장 중..." : "저장"}
          </Button>
        </div>

        <div
          className={cn(
            "mt-10 rounded-2xl border border-rose-200 bg-white px-5 py-5",
            whenDark(theme, "border-rose-900/50 bg-zinc-900"),
          )}
        >
          <p className="text-sm font-semibold text-rose-600">회원 탈퇴</p>
          <p
            className={cn(
              "mt-1 text-xs leading-5 text-slate-500",
              whenDark(theme, "text-zinc-400"),
            )}
          >
            계정과 회의 기록이 삭제되며, 되돌릴 수 없습니다.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDeleteOpen(true)}
            className="mt-4 h-9 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            회원 탈퇴
          </Button>
        </div>
      </div>

      {isDeleteOpen && (
        <ConfirmDialog
          title="회원 탈퇴"
          description={
            <>
              계정과 저장된 회의록이 모두 삭제됩니다.
              <br />
              이 작업은 되돌릴 수 없습니다.
            </>
          }
          confirmLabel="탈퇴하기"
          loading={isDeleting}
          onCancel={() => {
            if (!isDeleting) setIsDeleteOpen(false);
          }}
          onConfirm={async () => {
            setIsDeleting(true);
            try {
              await deleteOwnAccount();
            } catch (error) {
              console.error(error);
              setIsDeleting(false);
              setIsDeleteOpen(false);
              setDeleteError("탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.");
              window.setTimeout(() => setDeleteError(null), 3000);
            }
          }}
        />
      )}

      {(settings.toast || deleteError) && (
        <div
          className={`fixed top-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg animate-in fade-in slide-in-from-top-5 duration-300 ${
            deleteError || settings.toast?.type === "error"
              ? "bg-rose-500"
              : cn("bg-slate-950", whenDark(theme, "bg-zinc-100 text-zinc-950"))
          }`}
        >
          {deleteError || settings.toast?.type === "error" ? (
            <AlertCircle className="size-4" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          {deleteError || settings.toast?.msg}
        </div>
      )}
    </main>
  );
}
