import { useTimelineData } from "@/hooks/useTimelineData";
import { deleteTimeline, saveTimeline } from "@/lib/projects";

export function useTimeline(
  dbMeetings: any[],
  projectId?: string,
  onSaveSuccess?: () => void,
  onDeleteSuccess?: () => void,
  initialName?: string,
  initialStatus?: string,
) {
  const data = useTimelineData(
    dbMeetings,
    projectId,
    initialName,
    initialStatus,
  );

  const handleOpenModal = () => {
    if (!data.projectName.trim()) {
      data.showToast("타임라인 이름을 먼저 입력해 주세요", "warning");
      data.setIsEditing(true);
      return;
    }
    data.setIsModalOpen(true);
    data.setSearchQuery("");
  };

  const handleSelectMeeting = (meeting: any) => {
    if (data.timelineItems.some((item) => item.id === meeting.id)) {
      data.showToast("이미 타임라인에 연결된 회의입니다.", "warning");
      return;
    }
    const dateObj = new Date(meeting.created_at);
    const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
    data.setTimelineItems([
      ...data.timelineItems,
      {
        id: meeting.id,
        date: formattedDate,
        title: meeting.title || "새 회의",
      },
    ]);
    data.setIsModalOpen(false);
  };

  const handleRemoveMeeting = (idToRemove: string) => {
    if (
      (projectId || data.createdProjectId) &&
      data.timelineItems.length === 1
    ) {
      data.showToast(
        "최소 1개의 회의가 필요합니다. 전체 삭제는 상단의 [삭제] 버튼을 이용해주세요.",
        "warning",
      );
      return;
    }
    data.setTimelineItems((prev) =>
      prev.filter((item) => item.id !== idToRemove),
    );
    data.showToast(
      "타임라인에서 제외되었습니다. 변경사항을 저장하여 완료해 주세요.",
      "warning",
    );
  };

  const handleSave = async () => {
    if (!data.projectName.trim()) {
      data.showToast("타임라인 이름을 먼저 입력해주세요!", "warning");
      data.setIsEditing(true);
      return;
    }
    if (data.timelineItems.length === 0) return;
    data.setIsSaving(true);
    try {
      const savedId = await saveTimeline({
        projectId,
        createdProjectId: data.createdProjectId,
        projectName: data.projectName,
        projectStatus: data.projectStatus,
        timelineItems: data.timelineItems,
      });
      data.setCreatedProjectId(savedId);
      data.showToast(`'${data.projectName}' 타임라인이 저장되었습니다.`);
      onSaveSuccess?.();
    } catch (error: any) {
      console.error("❌ 저장 에러:", error);
      data.showToast(
        error.message === "로그인 정보가 만료되었습니다."
          ? error.message
          : "저장 중 서버 오류가 발생했습니다.",
        "error",
      );
    } finally {
      data.setIsSaving(false);
    }
  };

  const executeDeleteProject = async () => {
    const targetId = projectId || data.createdProjectId;
    if (!targetId) return;
    data.setIsDeleting(true);
    data.setIsDeleteModalOpen(false);
    try {
      await deleteTimeline(targetId);
      data.showToast(`'${data.projectName}' 타임라인이 삭제되었습니다.`);
      setTimeout(() => {
        if (onDeleteSuccess) onDeleteSuccess();
        else window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error("❌ 삭제 에러:", error);
      data.showToast("삭제 중 서버 오류가 발생했습니다.", "error");
      data.setIsDeleting(false);
    }
  };

  return {
    ...data,
    handleOpenModal,
    handleSelectMeeting,
    handleRemoveMeeting,
    handleSave,
    executeDeleteProject,
  };
}
