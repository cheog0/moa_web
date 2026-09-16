import { Search, X } from "lucide-react";

export default function MeetingSearch({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <label className="relative mb-4 flex h-10 w-full items-center rounded-lg border border-border bg-card px-3 transition-colors focus-within:border-primary/40">
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="회의 제목으로 검색"
        className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="검색어 지우기"
        >
          <X className="size-3.5" />
        </button>
      )}
    </label>
  );
}
