import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ensureUserSettings } from "@/lib/userSettings";

export function useAuthSession() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const applySession = async (next: any) => {
      if (next?.user?.id) {
        await ensureUserSettings(next.user.id);
      }
      setSession(next);
      setLoadingSession(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      void applySession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { session, loadingSession };
}
