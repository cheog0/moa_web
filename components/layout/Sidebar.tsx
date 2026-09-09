"use client";

import {
  LayoutDashboard,
  Mic,
  Plus,
  Settings,
  LogOut,
  CheckSquare,
  LineChart,
  FolderClosed,
  Star,
  FileEdit,
  Trash2,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar({
  currentView,
  onNavigate,
  onNew,
  onLogout,
  projects = [],
}: {
  currentView: string;
  onNavigate: (view: string) => void;
  onNew: () => void;
  onLogout: () => void;
  projects?: any[];
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar px-4 py-5 lg:flex print:hidden">
      <div className="flex items-center gap-3 px-2 pb-8">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Mic className="size-4" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          모아
        </span>
      </div>

      <Button
        onClick={onNew}
        className="mb-7 w-full justify-center gap-2 shadow-sm"
      >
        <Plus className="size-4" />새 회의 시작
      </Button>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto custom-scrollbar text-sm">
        {/* 워크스페이스 */}
        <div className="flex flex-col gap-1">
          <span className="px-3 text-xs font-bold text-muted-foreground/60 mb-1 tracking-wider">
            워크스페이스
          </span>
          <NavItem
            icon={LayoutDashboard}
            label="대시보드"
            active={currentView === "dashboard"}
            onClick={() => onNavigate("dashboard")}
          />
          <NavItem icon={CheckSquare} label="내 할 일" disabled />
          <NavItem icon={LineChart} label="인사이트" disabled />
        </div>

        {/* 타임라인 */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-xs font-bold text-muted-foreground/60 tracking-wider">
              타임라인
            </span>
          </div>

          {projects.map((project) => (
            <NavItem
              key={project.id}
              icon={Folder}
              label={project.name}
              active={currentView === `project_${project.id}`}
              onClick={() => onNavigate(`project_${project.id}`)}
            />
          ))}

          <NavItem
            icon={Plus}
            label="새 타임라인 생성"
            active={currentView === "new_project"}
            onClick={() => onNavigate("new_project")}
          />
        </div>

        {/* 💡 회의 관리 (맞춤 템플릿 잠금 해제!) */}
        <div className="flex flex-col gap-1">
          <span className="px-3 text-xs font-bold text-muted-foreground/60 mb-1 tracking-wider">
            회의 관리
          </span>
          <NavItem icon={FolderClosed} label="전체 폴더" disabled />
          <NavItem icon={Star} label="중요한 회의" disabled />
          <NavItem
            icon={FileEdit}
            label="맞춤 템플릿"
            active={currentView === "templates"}
            onClick={() => onNavigate("templates")}
          />
        </div>

        {/* 시스템 */}
        <div className="flex flex-col gap-1">
          <span className="px-3 text-xs font-bold text-muted-foreground/60 mb-1 tracking-wider">
            시스템
          </span>
          <NavItem
            icon={Settings}
            label="설정"
            active={currentView === "settings"}
            onClick={() => onNavigate("settings")}
          />
          <NavItem icon={Trash2} label="휴지통" disabled />
        </div>
      </nav>

      <div className="mt-6 shrink-0 border-t border-border pt-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
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
  disabled = false,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const handleClick = () => {
    if (disabled) {
      alert("🚀 곧 추가될 업데이트 준비 중인 기능입니다!");
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        active
          ? "bg-primary/10 font-semibold text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="size-4" />
      <span className="truncate">{label}</span>
    </button>
  );
}
