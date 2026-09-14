"use client";

import {
  LayoutDashboard,
  Plus,
  Settings,
  LogOut,
  LineChart,
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
  session,
}: {
  currentView: string;
  onNavigate: (view: string) => void;
  onNew: () => void;
  onLogout: () => void;
  projects?: any[];
  session?: any;
}) {
  // 💡 메인에서 전달받은 실제 로그인 유저 정보 우선 사용
  const userEmail = session?.user?.email || "로그인 필요";
  const userInitial = session?.user?.email
    ? session.user.email.charAt(0).toUpperCase()
    : "유";

  return (
    <aside
      style={{ backgroundColor: "#FBFCFF" }}
      className="hidden w-64 shrink-0 flex-col border-r border-slate-100 px-3.5 py-4 lg:flex print:hidden justify-between select-none text-sm"
    >
      {/* 🚀 상단 로고, 새 회의 버튼, 네비게이션 영역 */}
      <div className="flex flex-col gap-4 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* 로고 영역 */}
        <div className="flex items-center gap-2.5 px-2 pb-1">
          <div className="flex h-7 items-center gap-2">
            <img
              src="/raple_pas.png"
              alt="랩플 로고"
              className="h-6.5 w-auto object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-foreground">
              Raple
            </span>
          </div>
        </div>

        {/* 새 회의 시작 버튼 */}
        <Button
          onClick={onNew}
          className="w-full justify-center gap-2 shadow-sm rounded-lg h-10 text-xs font-semibold"
        >
          <Plus className="size-4" />새 회의 시작
        </Button>

        <nav className="flex flex-col gap-3.5">
          {/* 워크스페이스 */}
          <div className="flex flex-col gap-0.5">
            <span className="px-2.5 text-[11px] font-bold text-muted-foreground/60 mb-1 tracking-wider uppercase">
              워크스페이스
            </span>
            <NavItem
              icon={LayoutDashboard}
              label="대시보드"
              active={currentView === "dashboard"}
              onClick={() => onNavigate("dashboard")}
            />
            <NavItem
              icon={LineChart}
              label="인사이트"
              active={currentView === "insight"}
              onClick={() => onNavigate("insight")}
            />
          </div>

          {/* 타임라인 */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between px-2.5 mb-1">
              <span className="text-[11px] font-bold text-muted-foreground/60 tracking-wider uppercase">
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

          {/* 회의 관리 */}
          <div className="flex flex-col gap-0.5">
            <span className="px-2.5 text-[11px] font-bold text-muted-foreground/60 mb-1 tracking-wider uppercase">
              회의 관리
            </span>
            <NavItem
              icon={Star}
              label="즐겨찾기"
              active={currentView === "starred_meetings"}
              onClick={() => onNavigate("starred_meetings")}
            />
            <NavItem
              icon={FileEdit}
              label="맞춤 템플릿"
              active={currentView === "templates"}
              onClick={() => onNavigate("templates")}
            />
          </div>

          {/* 시스템 */}
          <div className="flex flex-col gap-0.5">
            <span className="px-2.5 text-[11px] font-bold text-muted-foreground/60 mb-1 tracking-wider uppercase">
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
      </div>

      {/* 🌟 하단 실제 세션 연동 유저 프로필 영역 */}
      <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100 mt-1 shrink-0">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-xs shadow-sm">
              {userInitial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate">
                {session?.user?.email ? userEmail.split("@")[0] : "게스트"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {userEmail}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600"
            title="로그아웃"
          >
            <LogOut className="size-4" />
          </button>
        </div>
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
      className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-all ${
        active
          ? "bg-primary/10 font-semibold text-primary shadow-2xs"
          : "text-muted-foreground hover:bg-slate-200/50 hover:text-foreground"
      }`}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate text-sm">{label}</span>
    </button>
  );
}
