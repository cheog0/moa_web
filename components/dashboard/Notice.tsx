import { Bell } from "lucide-react";

export default function Notice({ message }: { message: string }) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3 shadow-lg animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Bell className="size-3.5" />
      </div>
      <span className="text-xs font-semibold text-foreground">{message}</span>
    </div>
  );
}
