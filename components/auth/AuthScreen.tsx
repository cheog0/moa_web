"use client";

import { useEffect, useState } from "react";
import { Mic, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("authError")) {
      setErrorMessage("카카오 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
      window.history.replaceState({}, "", "/");
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl animate-in fade-in zoom-in-95 duration-300">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-4 shadow-sm">
            <Mic className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">로그인</h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            AI 회의록 서비스에 오신 것을 환영합니다.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="size-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none ring-primary focus:ring-2 transition-all"
              placeholder="이메일을 입력해주세요"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none ring-primary focus:ring-2 transition-all"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || kakaoLoading}
            className="mt-2 w-full h-11 rounded-xl font-semibold shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> 처리 중...
              </>
            ) : (
              "로그인"
            )}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">또는</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          disabled={loading || kakaoLoading}
          onClick={handleKakao}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#FEE500] text-base font-bold tracking-tight text-[#191919] shadow-none transition-opacity hover:opacity-90 disabled:opacity-70"
        >
          {kakaoLoading ? (
            <Loader2 className="size-5 animate-spin" />
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
