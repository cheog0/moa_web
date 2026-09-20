import { useCallback, useEffect, useState } from "react";
import { isDefaultEngine, normalizeEngine } from "@/lib/engines";
import { supabase } from "@/lib/supabase";
import { fetchUsage, type UsageSnapshot } from "@/lib/usage";

async function isUsingDefaultEngine(userId: string) {
  const { data } = await supabase
    .from("user_settings")
    .select("ai_engine, api_key")
    .eq("user_id", userId)
    .maybeSingle();
  return isDefaultEngine(normalizeEngine(data?.ai_engine));
}

export function useUsage(userId?: string, refreshToken?: unknown) {
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setUsage(null);
      return;
    }
    const metered = await isUsingDefaultEngine(userId);
    if (!metered) {
      setUsage(null);
      return;
    }
    setUsage(await fetchUsage());
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh, refreshToken]);

  return { usage, refresh };
}
