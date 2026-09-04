"use client";

import { LayoutDashboard, Mic, Plus, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar({
  currentView,
  onNavigate,
  onNew,
  onLogout,
}: {
  currentView: string;
  onNavigate: (view: string) => void;
  onNew: () => void;
  onLogout: () => void;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar px-4 py-5 lg:flex print:hidden">
      <div className="flex items-center gap-3 px-2 pb-8">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Mic className="size-4" />
        </div>
        <span className="text-lg font-bold tracking-tight">모아</span>
      </div>
      <Button onClick={onNew} className="mb-7 w-full justify-center gap-2">
        <Plus className="size-4" />새 회의 시작
      </Button>
      <nav className="flex flex-col gap-1 text-sm">
        <NavItem
          icon={LayoutDashboard}
          label="대시보드"
          active={currentView === "dashboard"}
          onClick={() => onNavigate("dashboard")}
        />
        <NavItem
          icon={Settings}
          label="설정"
          active={currentView === "settings"}
          onClick={() => onNavigate("settings")}
        />
      </nav>
      <div className="mt-auto">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" /> 로그아웃
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        active
          ? "bg-primary/10 font-semibold text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
