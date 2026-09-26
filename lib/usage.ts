import { supabase } from "@/lib/supabase";

export const FREE_MONTHLY_SECONDS = 30 * 60;
export const FREE_MONTHLY_MINUTES = Math.round(FREE_MONTHLY_SECONDS / 60);

export type UsageSnapshot = {
  plan: string;
  limitSeconds: number;
  usedSeconds: number;
  remainingSeconds: number;
};

export function isUsageExhausted(usage?: UsageSnapshot | null) {
  if (!usage) return false;
  return usage.remainingSeconds <= 0;
}

export function usageProgress(usage?: UsageSnapshot | null) {
  const limit = usage?.limitSeconds ?? FREE_MONTHLY_SECONDS;
  if (limit <= 0) return 1;
  return Math.min(1, Math.max(0, (usage?.usedSeconds ?? 0) / limit));
}

export function formatUsageClock(seconds: number) {
  const safe = Math.max(0, Math.min(seconds, 24 * 60 * 60));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  if (minutes <= 0) return `${rest}초`;
  if (rest === 0) return `${minutes}분`;
  return `${minutes}분 ${rest}초`;
}

function snapshotFromPayload(data: Record<string, unknown> | null): UsageSnapshot | null {
  if (!data) return null;
  const limitSeconds = Math.max(
    0,
    Number(data.limit_seconds ?? data.limitSeconds) || FREE_MONTHLY_SECONDS,
  );
  const usedSeconds = Math.max(0, Number(data.used_seconds ?? data.usedSeconds) || 0);
  const remainingSeconds = Math.max(
    0,
    Number(data.remaining_seconds ?? data.remainingSeconds) || limitSeconds - usedSeconds,
  );
  return {
    plan: String(data.plan || "free"),
    limitSeconds,
    usedSeconds,
    remainingSeconds,
  };
}

export async function fetchUsage(): Promise<UsageSnapshot | null> {
  const { data, error } = await supabase.rpc("get_free_usage");
  if (error) {
    console.error("사용량 조회 실패:", error);
    return null;
  }
  return snapshotFromPayload(data as Record<string, unknown>);
}

export async function consumeUsage(seconds: number): Promise<UsageSnapshot | null> {
  const amount = Math.max(0, Math.round(seconds));
  if (amount <= 0) return fetchUsage();
  const { data, error } = await supabase.rpc("consume_free_usage", {
    p_seconds: amount,
  });
  if (error) {
    console.error("사용량 반영 실패:", error);
    return null;
  }
  return snapshotFromPayload(data as Record<string, unknown>);
}
