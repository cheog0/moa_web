import { TEMPLATE_SALES } from "@/lib/constants";
import { DEFAULT_ENGINE_ID } from "@/lib/engines";
import { supabase } from "@/lib/supabase";

export async function ensureUserSettings(userId: string) {
  const { data } = await supabase
    .from("user_settings")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (data) return;

  const { error } = await supabase.from("user_settings").insert({
    user_id: userId,
    ai_engine: DEFAULT_ENGINE_ID,
    custom_template: TEMPLATE_SALES,
  });
  if (error && error.code !== "23505") {
    console.error("기본 설정 생성 실패:", error);
  }
}
