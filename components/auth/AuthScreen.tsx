"use client";

import { useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert("로그인 실패: " + error.message);
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert("회원가입 실패: " + error.message);
    else alert("가입 완료! 이제 로그인할 수 있습니다.");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-4">
            <Mic className="size-6" />
          </div>
          <h1 className="text-2xl font-bold">모아 로그인</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            AI 회의록 서비스에 오신 것을 환영합니다.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary focus:ring-2"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary focus:ring-2"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" disabled={loading} className="mt-2 w-full h-11">
            {loading ? "처리 중..." : "로그인"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleSignUp}
            className="w-full h-11"
          >
            이메일로 회원가입
          </Button>
        </form>
      </div>
    </div>
  );
}
