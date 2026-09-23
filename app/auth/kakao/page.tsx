"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function KakaoOidcCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finish = async () => {
      const res = await fetch("/api/auth/kakao/complete", { method: "POST" });
      if (!res.ok) {
        router.replace("/login?authError=1");
        return;
      }

      const tokens = (await res.json()) as {
        id_token?: string;
        access_token?: string;
        email?: string;
        nickname?: string;
      };
      if (!tokens.id_token) {
        router.replace("/login?authError=1");
        return;
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "kakao",
        token: tokens.id_token,
        access_token: tokens.access_token,
      });

      if (error) {
        router.replace("/login?authError=1");
        return;
      }

      const displayName = tokens.nickname || tokens.email || "";
      if (displayName || tokens.email) {
        await supabase.auth.updateUser({
          data: {
            name: displayName,
            nickname: tokens.nickname || "",
            email: tokens.email || "",
          },
        });
      }

      router.replace("/");
    };

    void finish();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      카카오 로그인 처리 중...
    </div>
  );
}
