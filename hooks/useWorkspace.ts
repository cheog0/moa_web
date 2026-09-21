import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MeetingMinutes } from "@/lib/constants";
import { getApiUrl } from "@/lib/api";
import { parseMinutesPayload } from "@/lib/actionItems";
import { deleteMeetingAudio } from "@/lib/meetings";

export function useWorkspace(userId?: string, recording?: boolean) {
  const [dbMeetings, setDbMeetings] = useState<any[]>([]);
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [generatedMinutes, setGeneratedMinutes] =
    useState<MeetingMinutes | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [detail, setDetail] = useState(false);
  const [timelineLinks, setTimelineLinks] = useState<Record<string, string[]>>(
    {},
  );

  const fetchProjects = async () => {
    try {
      const { data } = await supabase
        .from("timelines")
        .select("*")
        .order("created_at", { ascending: false });
      if (!data) return;
      setDbProjects(data);

      const projectIds = data.map((project) => project.id);
      if (projectIds.length === 0) {
        setTimelineLinks({});
        return;
      }

      const { data: links } = await supabase
        .from("timeline_meetings")
        .select("meeting_id, timeline_id")
        .in("timeline_id", projectIds);
      const nameById = new Map(
        data.map((project) => [project.id, project.name as string]),
      );
      const next: Record<string, string[]> = {};
      for (const row of links ?? []) {
        const name = nameById.get(row.timeline_id);
        if (!name) continue;
        const names = next[row.meeting_id] ?? [];
        if (!names.includes(name)) names.push(name);
        next[row.meeting_id] = names;
      }
      setTimelineLinks(next);
    } catch (error) {
      console.error("프로젝트 로드 실패", error);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const fetchMeetings = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/meetings?user_id=${userId}`);
        const data = await res.json();
        if (data.success) {
          const { data: deletionStates } = await supabase
            .from("meetings")
            .select("id, deleted_at");
          const deletedAtById = new Map(
            deletionStates?.map((meeting) => [
              meeting.id,
              meeting.deleted_at,
            ]) ?? [],
          );
          setDbMeetings(
            data.meetings.map((meeting: any) => ({
              ...meeting,
              deleted_at: deletedAtById.get(meeting.id) ?? null,
            })),
          );
        }
      } catch (error) {
        console.error("회의 목록 로드 실패", error);
      }
    };

    fetchMeetings();
    fetchProjects();
    window.addEventListener("raple:meetings-changed", fetchMeetings);
    return () => {
      window.removeEventListener("raple:meetings-changed", fetchMeetings);
    };
  }, [userId, recording]);

  const handleUpdateTitle = async (id: string, newTitle: string) => {
    const { error } = await supabase
      .from("meetings")
      .update({ title: newTitle })
      .eq("id", id);
    if (!error) {
      setDbMeetings((prev) =>
        prev.map((m) => (m.id === id ? { ...m, title: newTitle } : m)),
      );
    }
  };

  const handleToggleStar = async (
    e: React.MouseEvent,
    id: string,
    currentStatus: boolean,
  ) => {
    e.stopPropagation();
    const nextStatus = !currentStatus;
    const { error } = await supabase
      .from("meetings")
      .update({ is_starred: nextStatus })
      .eq("id", id);

    if (!error) {
      setDbMeetings((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_starred: nextStatus } : m)),
      );
    }
  };

  const handleUpdateMinutes = async (
    meetingId: string,
    updatedMinutes: Partial<MeetingMinutes>,
  ) => {
    const payload: Record<string, unknown> = {};
    if (updatedMinutes.summary !== undefined)
      payload.summary = updatedMinutes.summary;
    if (updatedMinutes.decisions !== undefined)
      payload.decisions = updatedMinutes.decisions;
    if (updatedMinutes.action_items !== undefined)
      payload.action_items = updatedMinutes.action_items;
    if (updatedMinutes.reply_draft !== undefined)
      payload.reply_draft = updatedMinutes.reply_draft;
    if (Object.keys(payload).length === 0) return;

    const { error } = await supabase
      .from("meeting_minutes")
      .update(payload)
      .eq("meeting_id", meetingId);
    if (!error) {
      setGeneratedMinutes((prev) =>
        prev ? { ...prev, ...updatedMinutes } : null,
      );
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (timelineLinks[id]?.length) return;

    const deletedAt = new Date().toISOString();
    const { error } = await supabase
      .from("meetings")
      .update({ deleted_at: deletedAt })
      .eq("id", id);
    if (!error) {
      setDbMeetings((prev) =>
        prev.map((meeting) =>
          meeting.id === id ? { ...meeting, deleted_at: deletedAt } : meeting,
        ),
      );
      setDetail(false);
    }
  };

  const handleRestoreMeeting = async (id: string) => {
    const { error } = await supabase
      .from("meetings")
      .update({ deleted_at: null })
      .eq("id", id);
    if (!error) {
      setDbMeetings((prev) =>
        prev.map((meeting) =>
          meeting.id === id ? { ...meeting, deleted_at: null } : meeting,
        ),
      );
    }
  };

  const handlePermanentlyDeleteMeeting = async (id: string) => {
    const meeting = dbMeetings.find((item) => item.id === id);
    await deleteMeetingAudio(id, meeting?.audio_url);
    await supabase.from("timeline_meetings").delete().eq("meeting_id", id);
    const { error } = await supabase.from("meetings").delete().eq("id", id);
    if (!error) {
      setDbMeetings((prev) => prev.filter((meeting) => meeting.id !== id));
      setTimelineLinks((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleOpenDetail = async (meeting: any) => {
    setSelectedMeeting(meeting);
    setDetail(true);
    try {
      const res = await fetch(
        `${getApiUrl()}/api/meetings/${meeting.id}/minutes`,
      );
      const data = await res.json();
      if (data.success) {
        setGeneratedMinutes(
          parseMinutesPayload(data.minutes) ?? data.minutes,
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    dbMeetings,
    dbProjects,
    generatedMinutes,
    setGeneratedMinutes,
    selectedMeeting,
    setSelectedMeeting,
    detail,
    setDetail,
    fetchProjects,
    handleUpdateTitle,
    handleToggleStar,
    handleUpdateMinutes,
    handleDeleteMeeting,
    handleRestoreMeeting,
    handlePermanentlyDeleteMeeting,
    handleOpenDetail,
    timelineLinks,
  };
}
