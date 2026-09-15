import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MeetingMinutes } from "@/lib/constants";
import { getApiUrl } from "@/lib/api";

export function useWorkspace(userId?: string, recording?: boolean) {
  const [dbMeetings, setDbMeetings] = useState<any[]>([]);
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [generatedMinutes, setGeneratedMinutes] =
    useState<MeetingMinutes | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [detail, setDetail] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setDbProjects(data);
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
        if (data.success) setDbMeetings(data.meetings);
      } catch (error) {
        console.error("회의 목록 로드 실패", error);
      }
    };

    fetchMeetings();
    fetchProjects();
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
    const { error } = await supabase
      .from("meeting_minutes")
      .update({
        summary: updatedMinutes.summary,
        decisions: updatedMinutes.decisions,
      })
      .eq("meeting_id", meetingId);
    if (!error) {
      setGeneratedMinutes((prev) =>
        prev ? { ...prev, ...updatedMinutes } : null,
      );
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    const { error } = await supabase.from("meetings").delete().eq("id", id);
    if (!error) {
      setDbMeetings((prev) => prev.filter((m) => m.id !== id));
      setDetail(false);
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
      if (data.success) setGeneratedMinutes(data.minutes);
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
    handleOpenDetail,
  };
}
