import { ChevronRight, FileText, Star } from "lucide-react";
import { formatMeetingDate } from "@/lib/dates";

export default function ListItem({
  meeting,
  onOpen,
  onToggleStar,
  alwaysFilledStar = false,
}: {
  meeting: any;
  onOpen: (meeting: any) => void;
  onToggleStar: (
    e: React.MouseEvent,
    id: string,
    currentStatus: boolean,
  ) => void;
  alwaysFilledStar?: boolean;
}) {
  const filled = alwaysFilledStar || meeting.is_starred;

  return (
    <div
      onClick={() => onOpen(meeting)}
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
          {formatMeetingDate(meeting.created_at)}
        </p>
      </div>
      <button
        onClick={(e) => onToggleStar(e, meeting.id, meeting.is_starred)}
        className={`p-2 transition-transform hover:scale-110 ${
          filled
            ? "text-amber-400 hover:text-amber-500"
            : "text-muted-foreground/30 hover:text-amber-400"
        }`}
        title={meeting.is_starred ? "중요 회의 해제" : "중요 회의로 지정"}
      >
        <Star className="size-5" fill={filled ? "currentColor" : "none"} />
      </button>
      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </div>
  );
}
