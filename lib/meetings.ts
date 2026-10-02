import { getApiUrl } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export async function deleteMeetingAudio(id: string, _audioUrl?: string | null) {
  // Permanent UI delete via API: removes meetings + minutes rows, keeps Storage audio.
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const headers: HeadersInit = {};
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
    const response = await fetch(`${getApiUrl()}/api/meetings/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      throw new Error(`서버 오류 (${response.status})`);
    }
  } catch (error) {
    console.error("회의 영구 삭제 실패", error);
    throw error;
  }
}
