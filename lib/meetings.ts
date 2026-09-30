import { getApiUrl } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export async function deleteMeetingAudio(id: string, _audioUrl?: string | null) {
  // Soft-delete only. Recordings in Storage are never removed.
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const headers: HeadersInit = {};
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
    await fetch(`${getApiUrl()}/api/meetings/${id}`, {
      method: "DELETE",
      headers,
    });
  } catch (error) {
    console.error("회의 휴지통 이동 실패", error);
  }
}
