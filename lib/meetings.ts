import { getApiUrl } from "@/lib/api";
import { supabase } from "@/lib/supabase";

function parseSupabaseStoragePath(audioUrl?: string | null) {
  if (!audioUrl) return null;
  try {
    const { pathname } = new URL(audioUrl);
    const match = pathname.match(
      /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)/,
    );
    if (!match) return null;
    return {
      bucket: decodeURIComponent(match[1]),
      path: decodeURIComponent(match[2]),
    };
  } catch {
    return null;
  }
}

export async function deleteMeetingAudio(id: string, audioUrl?: string | null) {
  try {
    await fetch(`${getApiUrl()}/api/meetings/${id}`, { method: "DELETE" });
  } catch (error) {
    console.error("녹음 파일 서버 삭제 실패", error);
  }

  const stored = parseSupabaseStoragePath(audioUrl);
  if (!stored) return;
  const { error } = await supabase.storage
    .from(stored.bucket)
    .remove([stored.path]);
  if (error) console.error("녹음 파일 스토리지 삭제 실패", error);
}
