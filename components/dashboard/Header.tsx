import { Bell, Menu, Search } from "lucide-react";

export default function Header({
  currentView,
  query,
  onQueryChange,
  email,
  onNotify,
  onMenuOpen,
}: {
  currentView: string;
  query: string;
  onQueryChange: (value: string) => void;
  email?: string;
  onNotify: () => void;
  onMenuOpen: () => void;
}) {
  return (
    <header className="relative flex h-16 shrink-0 items-center justify-between bg-white pl-5 pr-6 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-slate-200/70 after:blur-[0.3px] sm:pl-8 sm:pr-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="rounded-lg p-2 hover:bg-muted lg:hidden"
          aria-label="메뉴 열기"
          aria-controls="mobile-sidebar"
        >
          <Menu className="size-5" />
        </button>
        {(currentView === "dashboard" ||
          currentView === "starred_meetings") && (
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="회의 검색..."
              className="h-9 w-64 rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm outline-none ring-primary focus:ring-2"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onNotify}
          className="relative rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="알림"
        >
          <Bell className="size-5" />
        </button>
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-[11px] shadow-sm">
          {email ? email.charAt(0).toUpperCase() : "유"}
        </div>
      </div>
    </header>
  );
}
