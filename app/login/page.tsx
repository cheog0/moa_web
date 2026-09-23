"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthScreen from "@/components/auth/AuthScreen";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useTheme } from "@/hooks/useTheme";
import { whenDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { session, loadingSession } = useAuthSession();
  const { theme } = useTheme();

  useEffect(() => {
    if (!loadingSession && session) {
      router.replace("/");
    }
  }, [loadingSession, session, router]);

  if (loadingSession || session) {
    return (
      <div
        className={cn(
          "flex min-h-screen items-center justify-center bg-white",
          whenDark(theme, "bg-zinc-950 text-zinc-100"),
        )}
      >
        세션 확인 중...
      </div>
    );
  }

  return <AuthScreen />;
}
