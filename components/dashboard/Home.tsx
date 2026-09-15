import { BookOpen, Clock3, Plus, Sparkles, Calendar, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalendarView from "@/components/meeting/CalenderView";
import Stat from "@/components/dashboard/Stat";
import ListItem from "@/components/dashboard/ListItem";

export default function Home({
  meetings,
  totalMeetings,
  thisMonthMeetings,
  lastMeetingDateStr,
  dashboardMode,
  onDashboardModeChange,
  onNewRecording,
  onOpenDetail,
  onToggleStar,
}: {
  meetings: any[];
  totalMeetings: number;
  thisMonthMeetings: number;
  lastMeetingDateStr: string;
  dashboardMode: "list" | "calendar";
  onDashboardModeChange: (mode: "list" | "calendar") => void;
  onNewRecording: () => void;
  onOpenDetail: (meeting: any) => void;
  onToggleStar: (
    e: React.MouseEvent,
    id: string,
    currentStatus: boolean,
  ) => void;
}) {
  return (
    <main className="mx-auto w-full max-w-6xl p-5 sm:p-8 bg-white min-h-full">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">오늘의 회의를</p>
          <p className="mt-2 text-sm text-muted-foreground">
            더 선명하게 기록해보세요.
          </p>
        </div>
        <Button
          onClick={onNewRecording}
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
          <h2 className="text-lg font-bold">기록된 회의</h2>
          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1">
            <button
              onClick={() => onDashboardModeChange("list")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${dashboardMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="size-4" /> 리스트
            </button>
            <button
              onClick={() => onDashboardModeChange("calendar")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${dashboardMode === "calendar" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Calendar className="size-4" /> 캘린더
            </button>
          </div>
        </div>

        {dashboardMode === "calendar" ? (
          <CalendarView meetings={meetings} onMeetingClick={onOpenDetail} />
        ) : (
          <div className="flex flex-col gap-3">
            {meetings.map((meeting) => (
              <ListItem
                key={meeting.id}
                meeting={meeting}
                onOpen={onOpenDetail}
                onToggleStar={onToggleStar}
              />
            ))}
            {meetings.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                아직 기록된 회의가 없습니다. '새 회의 시작'을 눌러보세요!
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
