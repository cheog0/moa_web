"use client";

import { useEffect, useState } from "react";
import { Mic, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function AuthScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("authError")) {
      setErrorMessage("카카오 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(
        "로그인에 실패했습니다. 이메일과 비밀번호를 다시 확인해주세요.",
      );
    }
    setLoading(false);
  };

  const handleKakao = () => {
    setKakaoLoading(true);
    setErrorMessage(null);
    window.location.assign("/api/auth/kakao/start");
  };

  const fieldClass = cn(
    "w-full rounded-2xl bg-[#F7F8FA] px-3.5 py-3.5 text-sm text-[#1C1F24] outline-none transition-shadow placeholder:text-[#9AA1AA]/80 focus:ring-2 focus:ring-[#4C9AFF]/35",
    whenDark(
      theme,
      "bg-zinc-950 text-zinc-100 placeholder:text-zinc-500 focus:ring-sky-500/30",
    ),
  );

  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-[#F5F6F8] px-5 py-6",
        whenDark(theme, "bg-zinc-950"),
      )}
    >
      <div
        className={cn(
          "w-full max-w-[400px] rounded-[28px] bg-white px-6 py-7 shadow-[0_6px_18px_rgba(28,31,36,0.05),0_1px_4px_rgba(28,31,36,0.02)] animate-in fade-in slide-in-from-bottom-2 duration-300",
          whenDark(theme, "bg-zinc-900 shadow-none"),
        )}
      >
        <div className="mb-6 flex flex-col items-center">
          <div
            className={cn(
              "mb-3.5 flex size-14 items-center justify-center rounded-full bg-[#E8F3FF]",
              whenDark(theme, "bg-zinc-800"),
            )}
          >
            <Mic className="size-[26px] text-[#4C9AFF]" />
          </div>
          <h1
            className={cn(
              "text-[22px] font-extrabold tracking-tight text-[#1C1F24]",
              whenDark(theme, "text-zinc-50"),
            )}
          >
            Raple
          </h1>
          <p
            className={cn(
              "mt-1.5 text-center text-[13px] leading-[1.45] text-[#9AA1AA]",
              whenDark(theme, "text-zinc-400"),
            )}
          >
            AI 회의록을 더 편하게 기록하세요.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-3.5 flex items-center gap-2 rounded-2xl bg-[#FFF1F2] px-3.5 py-3 text-xs font-semibold text-[#E11D48] animate-in fade-in">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col">
          <label
            className={cn(
              "mb-1.5 block text-xs font-bold text-[#9AA1AA]",
              whenDark(theme, "text-zinc-400"),
            )}
          >
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={fieldClass}
            placeholder="이메일을 입력해주세요"
          />
          <label
            className={cn(
              "mt-3 mb-1.5 block text-xs font-bold text-[#9AA1AA]",
              whenDark(theme, "text-zinc-400"),
            )}
          >
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={fieldClass}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading || kakaoLoading}
            className={cn(
              "mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-[#3A3D42] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50",
              whenDark(theme, "bg-zinc-100 text-zinc-950"),
            )}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> 처리 중...
              </>
            ) : (
              "로그인"
            )}
          </button>
        </form>

        <div className="my-4 flex items-center gap-2.5">
          <div
            className={cn("h-px flex-1 bg-[#E8EAEE]", whenDark(theme, "bg-zinc-800"))}
          />
          <span
            className={cn(
              "text-xs text-[#9AA1AA]",
              whenDark(theme, "text-zinc-500"),
            )}
          >
            또는
          </span>
          <div
            className={cn("h-px flex-1 bg-[#E8EAEE]", whenDark(theme, "bg-zinc-800"))}
          />
        </div>

        <button
          type="button"
          disabled={loading || kakaoLoading}
          onClick={handleKakao}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#FEE500] text-base font-bold tracking-tight text-[#191919] shadow-none transition-opacity hover:opacity-90 disabled:opacity-70"
        >
          {kakaoLoading ? (
            <Loader2 className="size-[18px] animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
              <circle cx="13" cy="11" r="7.2" fill="currentColor" />
              <path
                fill="currentColor"
                d="M6.2 14.6c-.7 2.2-1.8 4.1-2.6 5.2 2-.6 4.4-2 5.6-2.8A7.4 7.4 0 0 1 6.2 14.6Z"
              />
            </svg>
          )}
          {kakaoLoading ? "카카오 연결 중..." : "카카오 로그인"}
        </button>
      </div>
    </div>
  );
}
