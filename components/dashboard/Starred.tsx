import { Star } from "lucide-react";
import ListItem from "@/components/dashboard/ListItem";
import MeetingSearch from "@/components/dashboard/MeetingSearch";

export default function Starred({
  meetings,
  onOpenDetail,
  onToggleStar,
  query,
  onQueryChange,
}: {
  meetings: any[];
  onOpenDetail: (meeting: any) => void;
  onToggleStar: (
    e: React.MouseEvent,
    id: string,
    currentStatus: boolean,
  ) => void;
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <main className="mx-auto w-full max-w-6xl p-5 sm:p-8 bg-white min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">즐겨찾기</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          자주 찾는 회의록을 모아두었어요.
        </p>
      </div>
      <MeetingSearch query={query} onQueryChange={onQueryChange} />
      <div className="flex flex-col gap-3">
        {meetings.map((meeting) => (
          <ListItem
            key={meeting.id}
            meeting={meeting}
            onOpen={onOpenDetail}
            onToggleStar={onToggleStar}
            alwaysFilledStar
          />
        ))}
        {meetings.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
            <Star className="mx-auto size-10 text-muted-foreground/30 mb-3" />
            아직 지정된 즐겨찾기가 없습니다. 대시보드에서 별표를 눌러보세요!
          </div>
        )}
      </div>
    </main>
  );
}
