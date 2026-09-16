"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthScreen from "@/components/auth/AuthScreen";
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
import Notice from "@/components/dashboard/Notice";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useWorkspace } from "@/hooks/useWorkspace";

export default function Page() {
  const { session, loadingSession } = useAuthSession();
  const [currentView, setCurrentView] = useState("dashboard");
  const [dashboardMode, setDashboardMode] = useState<"list" | "calendar">(
    "list",
  );
  const [recording, setRecording] = useState(false);
  const [query, setQuery] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const workspace = useWorkspace(session?.user?.id, recording);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        세션 확인 중...
      </div>
    );
  }
  if (!session) return <AuthScreen />;

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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-foreground print:block print:h-auto print:max-h-none print:overflow-visible print:bg-white">
      {notification && <Notice message={notification} />}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onNew={() => setRecording(true)}
        onLogout={() => supabase.auth.signOut()}
        projects={workspace.dbProjects}
        session={session}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="min-w-0 flex-1 flex flex-col h-full overflow-y-auto print:hidden bg-white">
        <Header
          currentView={currentView}
          query={query}
          onQueryChange={setQuery}
          email={session.user.email}
          onNotify={() => triggerNotification("새로운 알림이 없습니다.")}
          onMenuOpen={() => setMobileMenuOpen(true)}
        />
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
          />
        ) : currentView === "trash" ? (
          <Trash
            meetings={deletedMeetings}
            onRestore={workspace.handleRestoreMeeting}
            onPermanentlyDelete={workspace.handlePermanentlyDeleteMeeting}
          />
        ) : currentView === "new_project" ? (
          <main className="mx-auto w-full max-w-6xl py-8 bg-white min-h-full">
            <ProjectTimeline
              key="new_project"
              dbMeetings={activeMeetings}
              onSaveSuccess={workspace.fetchProjects}
              onMeetingClick={workspace.handleOpenDetail}
            />
          </main>
        ) : currentView.startsWith("project_") ? (
          <main className="mx-auto w-full max-w-6xl py-8 bg-white min-h-full">
            <ProjectTimeline
              key={currentView}
              dbMeetings={activeMeetings}
              projectId={currentView.replace("project_", "")}
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
          />
        ) : (
          <main className="flex h-full items-center justify-center bg-white">
            <div className="text-center text-muted-foreground">
              <h3 className="text-lg font-bold text-foreground">
                🚀 준비 중인 기능입니다
              </h3>
              <p className="mt-2 text-sm">조금만 기다려주세요!</p>
            </div>
          </main>
        )}
      </div>
      {recording && (
        <RecordingPanel
          onClose={() => setRecording(false)}
          onComplete={(minutes, newId) => {
            workspace.setGeneratedMinutes(minutes);
            workspace.setSelectedMeeting({ id: newId, title: "새 회의" });
            setRecording(false);
            workspace.setDetail(true);
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
        />
      )}
    </div>
  );
}
