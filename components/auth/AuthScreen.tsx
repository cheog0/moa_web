"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const busy = loading || kakaoLoading || googleLoading;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("authError");
    if (authError === "google") {
      setErrorMessage("구글 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
      window.history.replaceState({}, "", "/login");
    } else if (authError) {
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

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setErrorMessage("구글 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setGoogleLoading(false);
    }
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
          <a href="/" aria-label="Raple 홈">
            <img
              src={
                theme === "dark"
                  ? "/raple-wordmark-dark.png"
                  : "/raple-wordmark.png"
              }
              alt="Raple"
              className="h-7 w-auto select-none"
            />
          </a>
          <p
            className={cn(
              "mt-3 text-center text-[13px] leading-[1.45] text-[#9AA1AA]",
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
            disabled={busy}
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
          disabled={busy}
          onClick={handleGoogle}
          className={cn(
            "flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#F7F8FA] text-base font-bold tracking-tight text-[#1C1F24] transition-opacity hover:opacity-90 disabled:opacity-70",
            whenDark(theme, "bg-zinc-800 text-zinc-100"),
          )}
        >
          {googleLoading ? (
            <Loader2 className="size-[18px] animate-spin" />
          ) : (
            <svg viewBox="0 0 48 48" className="size-[18px]" aria-hidden="true">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.7 7.1l6.3 5.3C37.4 38.3 44 33 44 24c0-1.2-.1-2.3-.4-3.5z"
              />
            </svg>
          )}
          {googleLoading ? "구글 연결 중..." : "구글 로그인"}
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={handleKakao}
          className="mt-2.5 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#FEE500] text-base font-bold tracking-tight text-[#191919] shadow-none transition-opacity hover:opacity-90 disabled:opacity-70"
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
