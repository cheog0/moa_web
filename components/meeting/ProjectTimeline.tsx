"use client";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import TimelineHeader from "@/components/meeting/TimelineHeader";
import ItemList, {
  EmptyState,
  LoadingState,
} from "@/components/meeting/ItemList";
import LinkModal from "@/components/meeting/LinkModal";
import StatusToast from "@/components/meeting/StatusToast";
import { useTimeline } from "@/hooks/useTimeline";

export default function ProjectTimeline({
  dbMeetings = [],
  projectId,
  onSaveSuccess,
  onDeleteSuccess,
  onMeetingClick,
}: {
  dbMeetings?: any[];
  projectId?: string;
  onSaveSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onMeetingClick?: (meeting: any) => void;
}) {
  const timeline = useTimeline(
    dbMeetings,
    projectId,
    onSaveSuccess,
    onDeleteSuccess,
  );
  const filteredMeetings = dbMeetings.filter((m) =>
    (m.title || "새 회의")
      .toLowerCase()
      .includes(timeline.searchQuery.toLowerCase()),
  );

  return (
    <div className="relative mx-auto w-full max-w-4xl p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen">
      <TimelineHeader
        isLoading={timeline.isLoadingProject}
        items={timeline.timelineItems}
        projectStatus={timeline.projectStatus}
        onStatusChange={timeline.setProjectStatus}
        isEditing={timeline.isEditing}
        projectName={timeline.projectName}
        onNameChange={timeline.setProjectName}
        onStartEdit={() => timeline.setIsEditing(true)}
        onStopEdit={() => timeline.setIsEditing(false)}
        canDelete={Boolean(projectId || timeline.createdProjectId)}
        isSaving={timeline.isSaving}
        isDeleting={timeline.isDeleting}
        onDelete={() => {
          if (projectId || timeline.createdProjectId)
            timeline.setIsDeleteModalOpen(true);
        }}
        onSave={timeline.handleSave}
      />
      {timeline.isLoadingProject ? (
        <LoadingState />
      ) : timeline.timelineItems.length === 0 ? (
        <EmptyState onOpenModal={timeline.handleOpenModal} />
      ) : (
        <ItemList
          items={timeline.timelineItems}
          dbMeetings={dbMeetings}
          onMeetingClick={onMeetingClick}
          onUpdateDate={(id, date) =>
            timeline.setTimelineItems((prev) =>
              prev.map((item) => (item.id === id ? { ...item, date } : item)),
            )
          }
          onRemove={timeline.handleRemoveMeeting}
          onOpenModal={timeline.handleOpenModal}
        />
      )}
      {timeline.isModalOpen && (
        <LinkModal
          meetings={filteredMeetings}
          timelineItems={timeline.timelineItems}
          searchQuery={timeline.searchQuery}
          onSearchChange={timeline.setSearchQuery}
          onClose={() => timeline.setIsModalOpen(false)}
          onSelect={timeline.handleSelectMeeting}
        />
      )}
      {timeline.isDeleteModalOpen && (
        <ConfirmDialog
          title="타임라인 삭제"
          description={
            <>
              <span className="font-bold text-foreground">
                '{timeline.projectName}'
              </span>{" "}
              타임라인을 정말 삭제하시겠습니까?
              <br />
              (연동된 회의 자체는 지워지지 않습니다)
            </>
          }
          loading={timeline.isDeleting}
          onCancel={() => timeline.setIsDeleteModalOpen(false)}
          onConfirm={timeline.executeDeleteProject}
        />
      )}
      {timeline.toastConfig && <StatusToast toast={timeline.toastConfig} />}
    </div>
  );
}
