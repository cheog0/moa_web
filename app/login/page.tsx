"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthBoot from "@/components/auth/AuthBoot";
import AuthScreen from "@/components/auth/AuthScreen";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function LoginPage() {
  const router = useRouter();
  const { session, loadingSession } = useAuthSession();

  useEffect(() => {
    if (!loadingSession && session) {
      router.replace("/");
    }
  }, [loadingSession, session, router]);

  if (loadingSession || session) {
    return <AuthBoot />;
  }

  return <AuthScreen />;
}
