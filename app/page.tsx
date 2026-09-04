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
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { supabase } from "@/lib/supabase";
import { MeetingMinutes } from "@/lib/constants";

import AuthScreen from "@/components/auth/AuthScreen";
import Sidebar from "@/components/layout/Sidebar";
import SettingsPanel from "@/components/settings/SettingsPanel";
import RecordingPanel from "@/components/meeting/RecordingPanel";
import DetailPanel from "@/components/meeting/DetailPanel";

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
  const [currentView, setCurrentView] = useState<"dashboard" | "settings">(
    "dashboard",
  );
  const [recording, setRecording] = useState(false);
  const [detail, setDetail] = useState(false);
  const [generatedMinutes, setGeneratedMinutes] =
    useState<MeetingMinutes | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [dbMeetings, setDbMeetings] = useState<any[]>([]);
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

  useEffect(() => {
    if (!session || currentView !== "dashboard") return;
    const fetchMeetings = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/meetings`);
        const data = await res.json();
        if (data.success) setDbMeetings(data.meetings);
      } catch (error) {
        console.error("❌ 회의 목록을 불러오지 못했습니다.", error);
      }
    };
    fetchMeetings();
  }, [session, recording, currentView]);

  if (loadingSession)
    return (
      <div className="flex min-h-screen items-center justify-center">
        세션 확인 중...
      </div>
    );
  if (!session) return <AuthScreen />;

  const filtered = dbMeetings.filter((m) => m.title && m.title.includes(query));
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
    if (!error)
      setDbMeetings((prev) =>
        prev.map((m) => (m.id === id ? { ...m, title: newTitle } : m)),
      );
  };

  const handleUpdateMinutes = async (
    meetingId: string,
    updatedMinutes: Partial<MeetingMinutes>,
  ) => {
    await supabase
      .from("meeting_minutes")
      .update({
        summary: updatedMinutes.summary,
        decisions: updatedMinutes.decisions,
      })
      .eq("meeting_id", meetingId);
    setGeneratedMinutes((prev) =>
      prev ? { ...prev, ...updatedMinutes } : null,
    );
  };

  const handleDeleteMeeting = async (id: string) => {
    await supabase.from("meetings").delete().eq("id", id);
    setDbMeetings((prev) => prev.filter((m) => m.id !== id));
    setDetail(false);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as any)}
        onNew={() => setRecording(true)}
        onLogout={() => supabase.auth.signOut()}
      />

      <div className="min-w-0 flex-1 flex flex-col h-screen overflow-y-auto print:hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-muted lg:hidden">
              <Menu className="size-5" />
            </button>
            {currentView === "dashboard" && (
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
        ) : (
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
                className="w-full sm:w-auto"
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
              <h2 className="text-lg font-bold">최근 회의</h2>
              <div className="mt-4 flex flex-col gap-3">
                {filtered.map((meeting) => (
                  <button
                    key={meeting.id}
                    onClick={async () => {
                      setSelectedMeeting(meeting);
                      setDetail(true);
                      const apiUrl =
                        process.env.NEXT_PUBLIC_API_URL ||
                        "http://127.0.0.1:8000";
                      const res = await fetch(
                        `${apiUrl}/api/meetings/${meeting.id}/minutes`,
                      );
                      const data = await res.json();
                      if (data.success) setGeneratedMinutes(data.minutes);
                    }}
                    className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white">
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
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </section>
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
