"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finish = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error")) {
        router.replace("/login?authError=google");
        return;
      }

      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace("/login?authError=google");
          return;
        }
      }

      router.replace("/");
    };

    void finish();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      로그인 처리 중...
    </div>
  );
}
