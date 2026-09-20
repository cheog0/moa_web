import { TEMPLATE_SALES } from "@/lib/constants";
import { DEFAULT_ENGINE_ID } from "@/lib/engines";
import { supabase } from "@/lib/supabase";

function isBlankTemplate(value: unknown) {
  return typeof value !== "string" || value.trim() === "";
}

export async function ensureUserSettings(userId: string) {
  const { data } = await supabase
    .from("user_settings")
    .select("user_id, custom_template")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    const { error } = await supabase.from("user_settings").insert({
      user_id: userId,
      ai_engine: DEFAULT_ENGINE_ID,
      custom_template: TEMPLATE_SALES,
    });
    if (error && error.code !== "23505") {
      console.error("기본 설정 생성 실패:", error);
    }
    return;
  }

  if (isBlankTemplate(data.custom_template)) {
    const { error } = await supabase
      .from("user_settings")
      .update({ custom_template: TEMPLATE_SALES })
      .eq("user_id", userId);
    if (error) {
      console.error("기본 템플릿 저장 실패:", error);
    }
  }
}
