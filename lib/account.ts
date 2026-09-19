import { supabase } from "@/lib/supabase";
import { deleteMeetingAudio } from "@/lib/meetings";

export async function deleteOwnAccount() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인 정보가 만료되었습니다.");

  const { data: meetings } = await supabase
    .from("meetings")
    .select("id, audio_url")
    .eq("user_id", user.id);

  for (const meeting of meetings ?? []) {
    await deleteMeetingAudio(meeting.id, meeting.audio_url);
  }

  const { error } = await supabase.rpc("delete_own_account");
  if (error) throw error;

  await supabase.auth.signOut();
}
