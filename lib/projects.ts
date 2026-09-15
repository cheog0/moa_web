import { supabase } from "@/lib/supabase";
import { TimelineItem } from "@/lib/timeline";

export async function saveTimeline({
  projectId,
  createdProjectId,
  projectName,
  projectStatus,
  timelineItems,
}: {
  projectId?: string;
  createdProjectId: string | null;
  projectName: string;
  projectStatus: string;
  timelineItems: TimelineItem[];
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인 정보가 만료되었습니다.");

  let currentProjectId = projectId || createdProjectId;
  if (currentProjectId) {
    await supabase
      .from("projects")
      .update({ name: projectName, status: projectStatus })
      .eq("id", currentProjectId);
    await supabase
      .from("project_meetings")
      .delete()
      .eq("project_id", currentProjectId);
  } else {
    const { data: pData, error: pError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: projectName,
        status: projectStatus,
      })
      .select()
      .single();
    if (pError) throw pError;
    currentProjectId = pData.id;
  }

  const meetingsToInsert = timelineItems.map((item) => ({
    project_id: currentProjectId,
    meeting_id: item.id,
    timeline_date: item.date,
  }));
  const { error: mappingError } = await supabase
    .from("project_meetings")
    .insert(meetingsToInsert);
  if (mappingError) throw mappingError;
  return currentProjectId as string;
}

export async function deleteTimeline(projectId: string) {
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw error;
}
