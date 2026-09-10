"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Clock3,
  FileText,
  Menu,
  Plus,
  Search,
  Sparkles,
  ChevronRight,
  Calendar,
  List,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { supabase } from "@/lib/supabase";
import { MeetingMinutes } from "@/lib/constants";

import AuthScreen from "@/components/auth/AuthScreen";
import Sidebar from "@/components/layout/Sidebar";
import SettingsPanel from "@/components/settings/SettingsPanel";
import TemplatePanel from "@/components/settings/TemplatePanel";
import RecordingPanel from "@/components/meeting/RecordingPanel";
import DetailPanel from "@/components/meeting/DetailPanel";
import CalendarView from "@/components/meeting/CalenderView";
import ProjectTimeline from "@/components/meeting/ProjectTimeline";

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: any;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export default function Page() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [dashboardMode, setDashboardMode] = useState<"list" | "calendar">(
    "list",
  );

  const [recording, setRecording] = useState(false);
  const [detail, setDetail] = useState(false);
  const [generatedMinutes, setGeneratedMinutes] =
    useState<MeetingMinutes | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  const [dbMeetings, setDbMeetings] = useState<any[]>([]);
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session),
    );
    return () => subscription.unsubscribe();
  }, []);

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
    const userId = session?.user?.id;
    if (!userId) return;

    const fetchMeetings = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/meetings`);
        const data = await res.json();
        if (data.success) setDbMeetings(data.meetings);
      } catch (error) {
        console.error("회의 목록 로드 실패", error);
      }
    };

    fetchMeetings();
    fetchProjects();
  }, [session?.user?.id, recording]);

  if (loadingSession)
    return (
      <div className="flex min-h-screen items-center justify-center">
        세션 확인 중...
      </div>
    );
  if (!session) return <AuthScreen />;

  const filtered = dbMeetings.filter((m) => m.title && m.title.includes(query));
  const starredMeetings = filtered.filter((m) => m.is_starred);

  const totalMeetings = dbMeetings.length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthMeetings = dbMeetings.filter((m) => {
    if (!m.created_at) return false;
    const d = new Date(m.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  let lastMeetingDateStr = "기록 없음";
  if (dbMeetings.length > 0) {
    const latest = [...dbMeetings].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];
    if (latest?.created_at)
      lastMeetingDateStr = `${new Date(latest.created_at).getMonth() + 1}월 ${new Date(latest.created_at).getDate()}일`;
  }

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/api/meetings/${meeting.id}/minutes`);
      const data = await res.json();
      if (data.success) setGeneratedMinutes(data.minutes);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground print:block print:h-auto print:max-h-none print:overflow-visible print:bg-white">
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onNew={() => setRecording(true)}
        onLogout={() => supabase.auth.signOut()}
        projects={dbProjects}
      />

      <div className="min-w-0 flex-1 flex flex-col h-full overflow-y-auto print:hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-muted lg:hidden">
              <Menu className="size-5" />
            </button>
            {(currentView === "dashboard" ||
              currentView === "starred_meetings") && (
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="회의 검색..."
                  className="h-9 w-64 rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm outline-none ring-primary focus:ring-2"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">{session.user.email}</span>
          </div>
        </header>

        {currentView === "settings" ? (
          <SettingsPanel session={session} />
        ) : currentView === "templates" ? (
          <TemplatePanel session={session} />
        ) : currentView === "starred_meetings" ? (
          <main className="mx-auto w-full max-w-6xl p-5 sm:p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight">즐겨찾기</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                자주 찾는 회의록을 모아두었어요.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {starredMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  onClick={() => handleOpenDetail(meeting)}
                  className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm cursor-pointer"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">
                      {meeting.title || "새 회의"}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(meeting.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>

                  <button
                    onClick={(e) =>
                      handleToggleStar(e, meeting.id, meeting.is_starred)
                    }
                    className="p-2 text-amber-400 hover:text-amber-500 transition-transform hover:scale-110"
                    title="중요 회의 해제"
                  >
                    <Star className="size-5" fill="currentColor" />
                  </button>

                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              ))}

              {starredMeetings.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
                  <Star className="mx-auto size-10 text-muted-foreground/30 mb-3" />
                  아직 지정된 즐겨찾기가 없습니다. 대시보드에서 별표를
                  눌러보세요!
                </div>
              )}
            </div>
          </main>
        ) : currentView === "new_project" ? (
          <main className="mx-auto w-full max-w-6xl py-8">
            <ProjectTimeline
              key="new_project"
              dbMeetings={dbMeetings}
              onSaveSuccess={fetchProjects}
              onMeetingClick={handleOpenDetail}
            />
          </main>
        ) : currentView.startsWith("project_") ? (
          <main className="mx-auto w-full max-w-6xl py-8">
            <ProjectTimeline
              key={currentView}
              dbMeetings={dbMeetings}
              projectId={currentView.replace("project_", "")}
              onSaveSuccess={fetchProjects}
              onDeleteSuccess={() => {
                fetchProjects();
                setCurrentView("dashboard");
              }}
              onMeetingClick={handleOpenDetail}
            />
          </main>
        ) : currentView === "dashboard" ? (
          <main className="mx-auto w-full max-w-6xl p-5 sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-primary">
                  오늘의 회의를
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  더 선명하게 기록해보세요.
                </p>
              </div>

              <Button
                onClick={() => setRecording(true)}
                className="w-full sm:w-auto shadow-sm"
              >
                <Plus className="mr-2 size-4" />새 회의 시작
              </Button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Stat
                icon={BookOpen}
                label="전체 저장된 회의"
                value={`${totalMeetings}건`}
                hint="지금까지 기록한 모든 회의"
              />
              <Stat
                icon={Sparkles}
                label="이번 달 기록"
                value={`${thisMonthMeetings}건`}
                hint="이번 달 새롭게 생성된 회의록"
              />
              <Stat
                icon={Clock3}
                label="최근 활동일"
                value={lastMeetingDateStr}
                hint="가장 마지막으로 회의를 기록한 날"
              />
            </div>

            <section className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">기록된 회의</h2>
                </div>
                <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1">
                  <button
                    onClick={() => setDashboardMode("list")}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${dashboardMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <List className="size-4" /> 리스트
                  </button>
                  <button
                    onClick={() => setDashboardMode("calendar")}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${dashboardMode === "calendar" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Calendar className="size-4" /> 캘린더
                  </button>
                </div>
              </div>

              {dashboardMode === "calendar" ? (
                <CalendarView
                  meetings={filtered}
                  onMeetingClick={handleOpenDetail}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {filtered.map((meeting) => (
                    /* 💡 <button> 대신 <div> 태그를 사용하여 button 안에 button이 들어가는 구조적 에러를 완벽히 해결했습니다. */
                    <div
                      key={meeting.id}
                      onClick={() => handleOpenDetail(meeting)}
                      className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm cursor-pointer"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
                        <FileText className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold">
                          {meeting.title || "새 회의"}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(meeting.created_at).toLocaleString("ko-KR")}
                        </p>
                      </div>

                      <button
                        onClick={(e) =>
                          handleToggleStar(e, meeting.id, meeting.is_starred)
                        }
                        className={`p-2 transition-transform hover:scale-110 ${
                          meeting.is_starred
                            ? "text-amber-400 hover:text-amber-500"
                            : "text-muted-foreground/30 hover:text-amber-400"
                        }`}
                        title={
                          meeting.is_starred
                            ? "중요 회의 해제"
                            : "중요 회의로 지정"
                        }
                      >
                        <Star
                          className="size-5"
                          fill={meeting.is_starred ? "currentColor" : "none"}
                        />
                      </button>

                      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                      아직 기록된 회의가 없습니다. '새 회의 시작'을 눌러보세요!
                    </div>
                  )}
                </div>
              )}
            </section>
          </main>
        ) : (
          <main className="flex h-full items-center justify-center">
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
            setGeneratedMinutes(minutes);
            setSelectedMeeting({ id: newId, title: "새 회의" });
            setRecording(false);
            setDetail(true);
          }}
        />
      )}
      {detail && (
        <DetailPanel
          onClose={() => {
            setDetail(false);
            setGeneratedMinutes(null);
          }}
          minutes={generatedMinutes || undefined}
          meeting={selectedMeeting}
          onUpdateTitle={handleUpdateTitle}
          onUpdateMinutes={handleUpdateMinutes}
          onDelete={handleDeleteMeeting}
        />
      )}
    </div>
  );
}
