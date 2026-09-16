import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TimelineItem, ToastConfig } from "@/lib/timeline";

export function useTimelineData(
  dbMeetings: any[],
  projectId?: string,
  initialName?: string,
  initialStatus?: string,
) {
  const [projectName, setProjectName] = useState(initialName || "");
  const [projectStatus, setProjectStatus] = useState(
    initialStatus || "진행 중",
  );
  const [isEditing, setIsEditing] = useState(!projectId);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [isLoadingProject, setIsLoadingProject] = useState(Boolean(projectId));
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);

  const showToast = (
    message: React.ReactNode,
    type: ToastConfig["type"] = "success",
  ) => {
    setToastConfig({ message, type });
    setTimeout(() => setToastConfig(null), 3000);
  };

  useEffect(() => {
    setCreatedProjectId(null);
  }, [projectId]);

  useEffect(() => {
    if (!projectId) {
      setProjectName("");
      setProjectStatus("진행 중");
      setTimelineItems([]);
      setIsEditing(true);
      setIsLoadingProject(false);
      return;
    }
    let isCancelled = false;
    setIsLoadingProject(true);
    const fetchProjectData = async () => {
      try {
        const { data: pData } = await supabase
          .from("projects")
          .select("name, status")
          .eq("id", projectId)
          .single();
        if (isCancelled) return;
        if (pData) {
          setProjectName(pData.name);
          setProjectStatus(pData.status || "진행 중");
        }
        const { data: pmData, error: pmError } = await supabase
          .from("project_meetings")
          .select("*")
          .eq("project_id", projectId);
        if (pmError) throw pmError;
        if (isCancelled || !pmData) return;
        const loadedItems = pmData.map((pm: any) => {
          const matchedMeeting = dbMeetings.find((m) => m.id === pm.meeting_id);
          return {
            id: pm.meeting_id,
            date: pm.timeline_date,
            title: matchedMeeting?.title || "기록된 회의 (불러오는 중...)",
          };
        });
        loadedItems.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        setTimelineItems(loadedItems);
      } catch (error) {
        console.error("❌ 타임라인 데이터를 불러오지 못했습니다.", error);
      } finally {
        if (!isCancelled) setIsLoadingProject(false);
      }
    };
    fetchProjectData();
    return () => {
      isCancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    if (dbMeetings.length === 0) return;
    setTimelineItems((previousItems: TimelineItem[]) =>
      previousItems.map((item) => {
        const matchedMeeting = dbMeetings.find(
          (meeting) => meeting.id === item.id,
        );
        if (!matchedMeeting?.title || matchedMeeting.title === item.title)
          return item;
        return { ...item, title: matchedMeeting.title };
      }),
    );
  }, [dbMeetings]);

  const timelineMeetingIds = timelineItems
    .map((item) => item.id)
    .sort()
    .join(",");

  useEffect(() => {
    if (!timelineMeetingIds) return;
    let isCancelled = false;

    const fetchMeetingHighlights = async () => {
      const { data, error } = await supabase
        .from("meeting_minutes")
        .select("meeting_id, decisions")
        .in("meeting_id", timelineMeetingIds.split(","));

      if (error) {
        console.error("회의 요약을 불러오지 못했습니다.", error);
        return;
      }
      if (isCancelled || !data) return;

      const highlightsByMeetingId = new Map(
        data.map((minutes) => [minutes.meeting_id, minutes]),
      );
      setTimelineItems((previousItems) =>
        previousItems.map((item) => {
          const highlights = highlightsByMeetingId.get(item.id);
          return highlights
            ? {
                ...item,
                decisions: highlights.decisions || "",
              }
            : item;
        }),
      );
    };

    fetchMeetingHighlights();
    return () => {
      isCancelled = true;
    };
  }, [timelineMeetingIds]);

  return {
    projectName,
    setProjectName,
    projectStatus,
    setProjectStatus,
    isEditing,
    setIsEditing,
    timelineItems,
    setTimelineItems,
    isLoadingProject,
    createdProjectId,
    setCreatedProjectId,
    isModalOpen,
    setIsModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    searchQuery,
    setSearchQuery,
    isSaving,
    setIsSaving,
    isDeleting,
    setIsDeleting,
    toastConfig,
    showToast,
  };
}
