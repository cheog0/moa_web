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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NavItem from "@/components/layout/NavItem";
import { useTheme } from "@/hooks/useTheme";
import { whenDark, whenDarkValue } from "@/lib/theme";
import { userAvatarInitial, userDisplayLabel } from "@/lib/userDisplay";
import { cn } from "@/lib/utils";

export default function Sidebar({
  currentView,
  onNavigate,
  onNew,
  onLogout,
  projects = [],
  session,
  mobileOpen = false,
  onMobileClose,
}: {
  currentView: string;
  onNavigate: (view: string) => void;
  onNew: () => void;
  onLogout: () => void;
  projects?: any[];
  session?: any;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const userLabel = userDisplayLabel(session?.user);
  const userInitial = userAvatarInitial(session?.user);
  const userSubtitle = session?.user?.email || "카카오 계정";

  const handleNavigate = (view: string) => {
    onNavigate(view);
    onMobileClose?.();
  };

  const handleNew = () => {
    onNew();
    onMobileClose?.();
  };
  const { theme } = useTheme();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden print:hidden"
          onClick={onMobileClose}
          aria-label="메뉴 닫기"
        />
      )}
      <aside
        id="mobile-sidebar"
        style={{
          backgroundColor: whenDarkValue(theme, "#18181b", "#FBFCFF"),
        }}
        className={cn(
          `fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col justify-between px-3.5 py-4 text-sm shadow-xl transition-transform duration-200 select-none after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-slate-200/70 after:blur-[0.3px] print:hidden lg:relative lg:z-auto lg:translate-x-0 lg:shadow-none ${
          mobileOpen
            ? "visible translate-x-0"
            : "invisible -translate-x-full lg:visible"
        }`,
          whenDark(theme, "after:bg-zinc-700 text-zinc-100"),
        )}
      >
      {/* 🚀 상단 로고, 새 회의 버튼, 네비게이션 영역 */}
      <div className="flex flex-col gap-4 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* 로고 영역 */}
        <div className="flex items-center justify-between gap-2.5 px-2 pb-1">
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
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="메뉴 닫기"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* 새 회의 시작 버튼 */}
        <Button
          onClick={handleNew}
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
              onClick={() => handleNavigate("dashboard")}
            />
            <NavItem
              icon={LineChart}
              label="인사이트"
              active={currentView === "insight"}
              onClick={() => handleNavigate("insight")}
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
                onClick={() => handleNavigate(`project_${project.id}`)}
              />
            ))}

            <NavItem
              icon={Plus}
              label="새 타임라인 생성"
              active={currentView === "new_project"}
              onClick={() => handleNavigate("new_project")}
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
              onClick={() => handleNavigate("starred_meetings")}
            />
            <NavItem
              icon={FileEdit}
              label="맞춤 템플릿"
              active={currentView === "templates"}
              onClick={() => handleNavigate("templates")}
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
              onClick={() => handleNavigate("settings")}
            />
            <NavItem
              icon={Trash2}
              label="휴지통"
              active={currentView === "trash"}
              onClick={() => handleNavigate("trash")}
            />
          </div>
        </nav>
      </div>

      {/* 🌟 하단 실제 세션 연동 유저 프로필 영역 */}
      <div
        className={cn(
          "flex flex-col gap-2.5 pt-3 border-t border-slate-100 mt-1 shrink-0",
          whenDark(theme, "border-zinc-800"),
        )}
      >
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-xs shadow-sm">
              {userInitial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate">
                {userLabel}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {userSubtitle}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className={cn(
              "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600",
              whenDark(theme, "hover:bg-rose-500/15 hover:text-rose-400"),
            )}
            title="로그아웃"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
      </aside>
    </>
  );
}
