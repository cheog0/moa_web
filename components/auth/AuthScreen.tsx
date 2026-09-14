"use client";

import { useState } from "react";
import { Mic, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

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

  const handleSignUp = async () => {
    if (!email || !password) {
      setErrorMessage("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("가입이 완료되었습니다! 이제 로그인해 주세요.");
    }
    setLoading(false);
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

        {/* 💡 에러 메시지 알림 박스 */}
        {errorMessage && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="size-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 💡 성공 메시지 알림 박스 */}
        {successMessage && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="size-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
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
            disabled={loading}
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
      </div>
    </div>
  );
}
