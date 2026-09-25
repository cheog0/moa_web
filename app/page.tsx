"use client";

import { useState } from "react";
import LandingPage from "@/components/landing/LandingPage";
import Sidebar from "@/components/layout/Sidebar";
import SettingsPanel from "@/components/settings/SettingsPanel";
import TemplatePanel from "@/components/settings/TemplatePanel";
import RecordingPanel from "@/components/meeting/RecordingPanel";
import DetailPanel from "@/components/meeting/DetailPanel";
import ProjectTimeline from "@/components/meeting/ProjectTimeline";
import InsightPanel from "@/components/insight/InsightPanel";
import Home from "@/components/dashboard/Home";
import Starred from "@/components/dashboard/Starred";
import Trash from "@/components/dashboard/Trash";
import Header from "@/components/dashboard/Header";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useNotifications } from "@/hooks/useNotifications";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useTheme } from "@/hooks/useTheme";
import { useUsage } from "@/hooks/useUsage";
import { whenDark } from "@/lib/theme";
import { userAvatarInitial } from "@/lib/userDisplay";
import { cn } from "@/lib/utils";

export default function Page() {
  const { session, loadingSession } = useAuthSession();
  const { theme } = useTheme();
  const [currentView, setCurrentView] = useState("dashboard");
  const [dashboardMode, setDashboardMode] = useState<"list" | "calendar">(
    "list",
  );
  const [recording, setRecording] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const workspace = useWorkspace(session?.user?.id, recording);
  const notices = useNotifications(session?.user?.id);
  const { usage } = useUsage(session?.user?.id, `${recording}:${currentView}`);

  if (loadingSession) return <LandingPage />;
  if (!session) return <LandingPage />;

  const activeMeetings = workspace.dbMeetings.filter(
    (meeting) => !meeting.deleted_at,
  );
  const deletedMeetings = workspace.dbMeetings.filter(
    (meeting) => meeting.deleted_at,
  );
  const filtered = activeMeetings.filter(
    (m) => m.title && m.title.includes(query),
  );
  const starredMeetings = filtered.filter((m) => m.is_starred);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthMeetings = activeMeetings.filter((m) => {
    if (!m.created_at) return false;
    const d = new Date(m.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  let lastMeetingDateStr = "기록 없음";
  if (activeMeetings.length > 0) {
    const latest = [...activeMeetings].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];
    if (latest?.created_at) {
      lastMeetingDateStr = `${new Date(latest.created_at).getMonth() + 1}월 ${new Date(latest.created_at).getDate()}일`;
    }
  }

  const currentProjectId = currentView.startsWith("project_")
    ? currentView.replace("project_", "")
    : undefined;
  const currentProject = currentProjectId
    ? workspace.dbProjects.find((project) => project.id === currentProjectId)
    : undefined;

  const breadcrumb =
    currentView === "dashboard"
      ? ["워크스페이스", "대시보드"]
      : currentView === "insight"
        ? ["워크스페이스", "인사이트"]
        : currentView === "starred_meetings"
          ? ["회의 관리", "즐겨찾기"]
          : currentView === "templates"
            ? ["회의 관리", "맞춤 템플릿"]
            : currentView === "settings"
              ? ["시스템", "설정"]
              : currentView === "trash"
                ? ["시스템", "휴지통"]
                : currentView === "new_project"
                  ? ["타임라인", "새 타임라인"]
                  : currentProjectId
                    ? ["타임라인", currentProject?.name || "프로젝트"]
                    : ["워크스페이스", "대시보드"];

  return (
    <div
      className={cn(
        "flex h-screen w-full overflow-hidden bg-white text-foreground print:block print:h-auto print:max-h-none print:overflow-visible print:bg-white",
        whenDark(theme, "bg-zinc-950"),
      )}
    >
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onNew={() => setRecording(true)}
        projects={workspace.dbProjects}
        session={session}
        usage={usage}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div
        className={cn(
          "min-w-0 flex-1 flex flex-col h-full overflow-hidden print:hidden bg-white",
          whenDark(theme, "bg-zinc-950"),
        )}
      >
        <Header
          sectionLabel={breadcrumb[0]}
          pageLabel={breadcrumb[1]}
          initial={userAvatarInitial(session.user)}
          unreadCount={notices.unread}
          notices={notices.items}
          onOpenInbox={notices.markAllRead}
          onOpenMeeting={(meetingId, title) => {
            const meeting =
              workspace.dbMeetings.find((item) => item.id === meetingId) ?? {
                id: meetingId,
                title,
              };
            void workspace.handleOpenDetail(meeting);
          }}
          onMenuOpen={() => setMobileMenuOpen(true)}
        />
        <div className="min-h-0 flex-1 overflow-y-auto">
        {currentView === "settings" ? (
          <SettingsPanel session={session} />
        ) : currentView === "templates" ? (
          <TemplatePanel session={session} />
        ) : currentView === "insight" ? (
          <InsightPanel
            dbMeetings={activeMeetings}
            onMeetingClick={workspace.handleOpenDetail}
          />
        ) : currentView === "starred_meetings" ? (
          <Starred
            meetings={starredMeetings}
            onOpenDetail={workspace.handleOpenDetail}
            onToggleStar={workspace.handleToggleStar}
            query={query}
            onQueryChange={setQuery}
          />
        ) : currentView === "trash" ? (
          <Trash
            meetings={deletedMeetings}
            onRestore={workspace.handleRestoreMeeting}
            onPermanentlyDelete={workspace.handlePermanentlyDeleteMeeting}
          />
        ) : currentView === "new_project" ? (
          <main
            className={cn(
              "mx-auto w-full max-w-6xl py-8 bg-white min-h-full",
              whenDark(theme, "bg-zinc-950"),
            )}
          >
            <ProjectTimeline
              key="new_project"
              dbMeetings={activeMeetings}
              onSaveSuccess={workspace.fetchProjects}
              onMeetingClick={workspace.handleOpenDetail}
            />
          </main>
        ) : currentView.startsWith("project_") ? (
          <main
            className={cn(
              "mx-auto w-full max-w-6xl py-8 bg-white min-h-full",
              whenDark(theme, "bg-zinc-950"),
            )}
          >
            <ProjectTimeline
              key={currentView}
              dbMeetings={activeMeetings}
              projectId={currentProjectId}
              initialName={currentProject?.name}
              initialStatus={currentProject?.status}
              onSaveSuccess={workspace.fetchProjects}
              onDeleteSuccess={() => {
                workspace.fetchProjects();
                setCurrentView("dashboard");
              }}
              onMeetingClick={workspace.handleOpenDetail}
            />
          </main>
        ) : currentView === "dashboard" ? (
          <Home
            meetings={filtered}
            totalMeetings={activeMeetings.length}
            thisMonthMeetings={thisMonthMeetings}
            lastMeetingDateStr={lastMeetingDateStr}
            dashboardMode={dashboardMode}
            onDashboardModeChange={setDashboardMode}
            onNewRecording={() => setRecording(true)}
            onOpenDetail={workspace.handleOpenDetail}
            onToggleStar={workspace.handleToggleStar}
            query={query}
            onQueryChange={setQuery}
          />
        ) : (
          <main
            className={cn(
              "flex h-full items-center justify-center bg-white",
              whenDark(theme, "bg-zinc-950"),
            )}
          >
            <div className="text-center text-muted-foreground">
              <h3 className="text-lg font-bold text-foreground">
                🚀 준비 중인 기능입니다
              </h3>
              <p className="mt-2 text-sm">조금만 기다려주세요!</p>
            </div>
          </main>
        )}
        </div>
      </div>
      {recording && (
        <RecordingPanel
          onClose={() => setRecording(false)}
          onSaved={() => {
            setRecording(false);
          }}
        />
      )}
      {workspace.detail && (
        <DetailPanel
          onClose={() => {
            workspace.setDetail(false);
            workspace.setGeneratedMinutes(null);
          }}
          minutes={workspace.generatedMinutes || undefined}
          meeting={workspace.selectedMeeting}
          onUpdateTitle={workspace.handleUpdateTitle}
          onUpdateMinutes={workspace.handleUpdateMinutes}
          onDelete={workspace.handleDeleteMeeting}
          linkedTimelineNames={
            workspace.selectedMeeting?.id
              ? workspace.timelineLinks[workspace.selectedMeeting.id] ?? []
              : []
          }
        />
      )}
    </div>
  );
}
