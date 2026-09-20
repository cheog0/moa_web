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
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Keywords from "@/components/settings/Keywords";
import EngineSelect from "@/components/settings/EngineSelect";
import ThemeSwitch from "@/components/settings/ThemeSwitch";
import { useSettings } from "@/hooks/useSettings";
import { useTheme } from "@/hooks/useTheme";
import { deleteOwnAccount } from "@/lib/account";
import { isDefaultEngine } from "@/lib/engines";
import { whenDark } from "@/lib/theme";
import {
  userAvatarInitial,
  userDisplayLabel,
} from "@/lib/userDisplay";
import { cn } from "@/lib/utils";

export default function SettingsPanel({ session }: { session: any }) {
  const settings = useSettings(session.user.id);
  const { theme } = useTheme();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const label = userDisplayLabel(session.user);
  const initial = userAvatarInitial(session.user);
  const usingDefaultEngine = isDefaultEngine(settings.aiEngine);

  if (settings.loading) {
    return (
      <div
        className={cn(
          "flex min-h-full items-center justify-center bg-[#F5F6F8] text-sm text-[#9AA1AA]",
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
        "min-h-full w-full bg-[#F5F6F8] px-5 py-6 text-[#1C1F24] sm:px-8 sm:py-8 print:hidden animate-in fade-in duration-500",
        whenDark(theme, "bg-zinc-950 text-zinc-100"),
      )}
    >
      <div className="mx-auto w-full max-w-xl">
        <h1
          className={cn(
            "text-[18px] font-extrabold tracking-tight text-[#1C1F24]",
            whenDark(theme, "text-zinc-50"),
          )}
        >
          설정
        </h1>

        <section
          className={cn(
            "mt-4 rounded-[24px] border border-[#E8EAEE] bg-white p-[18px]",
            whenDark(theme, "border-zinc-800 bg-zinc-900"),
          )}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={cn(
                "flex size-[52px] shrink-0 items-center justify-center rounded-full bg-[#E8F3FF] text-[20px] font-extrabold text-[#2F7DE0]",
                whenDark(theme, "bg-zinc-800 text-sky-300"),
              )}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold">{label}</p>
              <p
                className={cn(
                  "mt-1 text-xs text-[#9AA1AA]",
                  whenDark(theme, "text-zinc-400"),
                )}
              >
                계정과 설정을 관리합니다
              </p>
            </div>
          </div>
        </section>

        <section
          className={cn(
            "mt-3 overflow-hidden rounded-[22px] border border-[#E8EAEE] bg-white",
            whenDark(theme, "border-zinc-800 bg-zinc-900"),
          )}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-[15px]">
            <div>
              <p className="text-[15px] font-semibold">화면 모드</p>
              <p
                className={cn(
                  "mt-0.5 text-xs text-[#9AA1AA]",
                  whenDark(theme, "text-zinc-400"),
                )}
              >
                밝은 화면과 어두운 화면을 전환합니다
              </p>
            </div>
            <ThemeSwitch />
          </div>
        </section>

        <p
          className={cn(
            "mt-5 text-[13px] leading-5 text-[#9AA1AA]",
            whenDark(theme, "text-zinc-400"),
          )}
        >
          받아쓰기 엔진과 키워드를 이 계정에 맞게 조정하세요.
        </p>

        <section
          className={cn(
            "mt-3 overflow-hidden rounded-[24px] border border-[#E8EAEE] bg-white",
            whenDark(theme, "border-zinc-800 bg-zinc-900"),
          )}
        >
          <div className="px-[18px] py-[18px]">
            <p className="text-sm font-bold">받아쓰기 엔진</p>
            <p
              className={cn(
                "mt-1 text-xs leading-[1.45] text-[#9AA1AA]",
                whenDark(theme, "text-zinc-400"),
              )}
            >
              회의 받아쓰기와 요약에 사용할 모델을 고릅니다.
            </p>
            <div className="mt-2.5">
              <EngineSelect
                value={settings.aiEngine}
                onChange={settings.setAiEngine}
              />
            </div>

            {usingDefaultEngine ? (
              <p
                className={cn(
                  "mt-[18px] text-xs leading-[1.45] text-[#9AA1AA]",
                  whenDark(theme, "text-zinc-400"),
                )}
              >
                기본 엔진은 랩플 API로 받아씁니다. 무료 회원은 한 달에 30분까지 사용할 수 있습니다.
              </p>
            ) : (
              <>
                <p className="mt-[18px] text-sm font-bold">API 키</p>
                <p
                  className={cn(
                    "mt-1 text-xs leading-[1.45] text-[#9AA1AA]",
                    whenDark(theme, "text-zinc-400"),
                  )}
                >
                  선택한 엔진의 키는 이 계정에만 저장됩니다.
                </p>
                <div
                  className={cn(
                    "mt-2.5 flex h-12 items-center rounded-2xl bg-[#F7F8FA] px-3.5 transition-colors focus-within:ring-2 focus-within:ring-[#4C9AFF]/35",
                    whenDark(theme, "bg-zinc-950 focus-within:ring-sky-500/30"),
                  )}
                >
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={settings.apiKey}
                    onChange={(e) => settings.setApiKey(e.target.value)}
                    placeholder="키를 붙여넣으세요"
                    className={cn(
                      "h-full min-w-0 flex-1 bg-transparent text-[13px] text-[#1C1F24] outline-none placeholder:text-[#9AA1AA]/85",
                      whenDark(theme, "text-zinc-100 placeholder:text-zinc-500"),
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey((open) => !open)}
                    className={cn(
                      "rounded-lg p-1.5 text-[#9AA1AA] transition-colors hover:bg-white hover:text-[#1C1F24]",
                      whenDark(theme, "hover:bg-zinc-800 hover:text-zinc-100"),
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
              </>
            )}
          </div>

          <div
            className={cn(
              "border-t border-[#E8EAEE] px-[18px] py-[18px]",
              whenDark(theme, "border-zinc-800"),
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold">자동 적용 키워드</p>
              {settings.keywords.length > 0 && (
                <p
                  className={cn(
                    "text-xs font-semibold tabular-nums text-[#9AA1AA]",
                    whenDark(theme, "text-zinc-500"),
                  )}
                >
                  {settings.keywords.length}개
                </p>
              )}
            </div>
            <p
              className={cn(
                "mt-1 text-xs leading-[1.45] text-[#9AA1AA]",
                whenDark(theme, "text-zinc-400"),
              )}
            >
              고유명사나 자주 쓰는 용어를 미리 등록해 두면 받아쓰기에 반영됩니다.
            </p>
            <div className="mt-2.5">
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
        </section>

        <button
          type="button"
          onClick={settings.handleSave}
          disabled={settings.saving}
          className={cn(
            "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#3A3D42] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50",
            whenDark(theme, "bg-zinc-100 text-zinc-950"),
          )}
        >
          {settings.saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {settings.saving ? "저장 중..." : "설정 저장"}
        </button>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className={cn(
              "px-3 py-2 text-[13px] text-[#9AA1AA] underline decoration-[#9AA1AA] underline-offset-4 transition-colors hover:text-[#1C1F24]",
              whenDark(theme, "hover:text-zinc-200"),
            )}
          >
            회원 탈퇴
          </button>
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
              : cn("bg-[#3A3D42]", whenDark(theme, "bg-zinc-100 text-zinc-950"))
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
