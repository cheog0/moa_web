"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  History,
  Pencil,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Link as LinkIcon,
  X,
  Search,
  FileText,
  Save,
  AlertCircle,
  Loader2,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface TimelineItem {
  id: string;
  date: string;
  title: string;
}

export default function ProjectTimeline({
  dbMeetings = [],
  projectId,
  onSaveSuccess,
  onDeleteSuccess,
  onMeetingClick,
}: {
  dbMeetings?: any[];
  projectId?: string;
  onSaveSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onMeetingClick?: (meeting: any) => void;
}) {
  const [projectName, setProjectName] = useState("");
  const [projectStatus, setProjectStatus] = useState("진행 중");
  const [isEditing, setIsEditing] = useState(false);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);

  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toastConfig, setToastConfig] = useState<{
    message: React.ReactNode;
    type: "success" | "warning" | "error";
  } | null>(null);

  const showToast = (
    message: React.ReactNode,
    type: "success" | "warning" | "error" = "success",
  ) => {
    setToastConfig({ message, type });
    setTimeout(() => setToastConfig(null), 3000);
  };

  useEffect(() => {
    setCreatedProjectId(null);
  }, [projectId]);

  useEffect(() => {
    if (!projectId) {
      setProjectName("");
      setProjectStatus("진행 중");
      setTimelineItems([]);
      setIsEditing(true);
      return;
    }

    const fetchProjectData = async () => {
      try {
        const { data: pData } = await supabase
          .from("projects")
          .select("name, status")
          .eq("id", projectId)
          .single();

        if (pData) {
          setProjectName(pData.name);
          setProjectStatus(pData.status || "진행 중");
        }

        const { data: pmData, error: pmError } = await supabase
          .from("project_meetings")
          .select("*")
          .eq("project_id", projectId);

        if (pmError) throw pmError;

        if (pmData) {
          const loadedItems = pmData.map((pm: any) => {
            const matchedMeeting = dbMeetings.find(
              (m) => m.id === pm.meeting_id,
            );
            return {
              id: pm.meeting_id,
              date: pm.timeline_date,
              title: matchedMeeting?.title || "기록된 회의 (불러오는 중...)",
            };
          });

          loadedItems.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );
          setTimelineItems(loadedItems);
        }
      } catch (error) {
        console.error("❌ 타임라인 데이터를 불러오지 못했습니다.", error);
      }
    };

    fetchProjectData();
  }, [projectId, dbMeetings]);

  const handleOpenModal = () => {
    if (!projectName.trim()) {
      showToast("타임라인 이름을 먼저 입력해 주세요", "warning");
      setIsEditing(true);
      return;
    }
    setIsModalOpen(true);
    setSearchQuery("");
  };

  const handleSelectMeeting = (meeting: any) => {
    if (timelineItems.some((item) => item.id === meeting.id)) {
      showToast("이미 타임라인에 연결된 회의입니다.", "warning");
      return;
    }

    const dateObj = new Date(meeting.created_at);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    const newItem: TimelineItem = {
      id: meeting.id,
      date: formattedDate,
      title: meeting.title || "새 회의",
    };
    setTimelineItems([...timelineItems, newItem]);
    setIsModalOpen(false);
  };

  const handleUpdateDate = (id: string, newDate: string) => {
    setTimelineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, date: newDate } : item)),
    );
  };

  const handleRemoveMeeting = (idToRemove: string) => {
    const targetId = projectId || createdProjectId;
    if (targetId && timelineItems.length === 1) {
      showToast(
        "최소 1개의 회의가 필요합니다. 전체 삭제는 상단의 [삭제] 버튼을 이용해주세요.",
        "warning",
      );
      return;
    }

    setTimelineItems((prev) => prev.filter((item) => item.id !== idToRemove));
    showToast(
      "타임라인에서 제외되었습니다. 변경사항을 저장하여 완료해 주세요.",
      "warning",
    );
  };

  const handleDeleteClick = () => {
    const targetId = projectId || createdProjectId;
    if (!targetId) return;
    setIsDeleteModalOpen(true);
  };

  const executeDeleteProject = async () => {
    const targetId = projectId || createdProjectId;
    if (!targetId) return;

    setIsDeleting(true);
    setIsDeleteModalOpen(false);

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", targetId);
      if (error) throw error;

      showToast(
        <>
          <span className="font-bold text-rose-400">'{projectName}'</span>{" "}
          타임라인이 삭제되었습니다.
        </>,
        "success",
      );

      setTimeout(() => {
        if (onDeleteSuccess) {
          onDeleteSuccess();
        } else {
          window.location.href = "/";
        }
      }, 1000);
    } catch (error: any) {
      console.error("❌ 삭제 에러:", error);
      showToast("삭제 중 서버 오류가 발생했습니다.", "error");
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!projectName.trim()) {
      showToast("타임라인 이름을 먼저 입력해주세요!", "warning");
      setIsEditing(true);
      return;
    }

    if (timelineItems.length === 0) return;
    setIsSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        showToast("로그인 정보가 만료되었습니다.", "error");
        setIsSaving(false);
        return;
      }

      let currentProjectId = projectId || createdProjectId;

      if (currentProjectId) {
        await supabase
          .from("projects")
          .update({ name: projectName, status: projectStatus })
          .eq("id", currentProjectId);
        await supabase
          .from("project_meetings")
          .delete()
          .eq("project_id", currentProjectId);
      } else {
        const { data: pData, error: pError } = await supabase
          .from("projects")
          .insert({
            user_id: user.id,
            name: projectName,
            status: projectStatus,
          })
          .select()
          .single();

        if (pError) throw pError;
        currentProjectId = pData.id;
        setCreatedProjectId(pData.id);
      }

      const meetingsToInsert = timelineItems.map((item) => ({
        project_id: currentProjectId,
        meeting_id: item.id,
        timeline_date: item.date,
      }));

      const { error: mappingError } = await supabase
        .from("project_meetings")
        .insert(meetingsToInsert);
      if (mappingError) throw mappingError;

      showToast(
        <>
          <span className="font-bold text-sky-400">'{projectName}'</span>{" "}
          타임라인이 저장되었습니다.
        </>,
        "success",
      );

      if (onSaveSuccess) onSaveSuccess();
    } catch (error: any) {
      console.error("❌ 저장 에러:", error);
      showToast("저장 중 서버 오류가 발생했습니다.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMeetings = dbMeetings.filter((m) =>
    (m.title || "새 회의").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="relative mx-auto w-full max-w-4xl p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {timelineItems.length === 0 ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-400">
                대기 중
              </span>
            ) : (
              <div className="relative inline-flex items-center group">
                <select
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value)}
                  className={`appearance-none rounded-full pl-3 pr-7 py-0.5 text-xs font-bold outline-none cursor-pointer transition-colors border border-transparent focus:ring-2 focus:ring-sky-500/20 ${
                    projectStatus === "완료"
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                  }`}
                >
                  <option value="진행 중">진행 중</option>
                  <option value="완료">완료됨</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-current opacity-60" />
              </div>
            )}
            <span className="text-sm text-muted-foreground">타임라인</span>
          </div>

          <div className="flex items-center gap-2 group">
            {isEditing ? (
              <input
                autoFocus
                className="text-2xl font-extrabold tracking-tight text-foreground bg-transparent border-b-2 border-sky-500 outline-none w-64 placeholder:text-muted-foreground/40 placeholder:font-semibold"
                placeholder="타임라인 이름 입력..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => {
                  if (projectName.trim()) setIsEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && projectName.trim())
                    setIsEditing(false);
                }}
              />
            ) : (
              <>
                <h1
                  className="text-2xl font-extrabold tracking-tight text-foreground cursor-pointer hover:text-sky-600 transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  {projectName}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-sky-500 transition-opacity ml-1"
                >
                  <Pencil className="size-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(projectId || createdProjectId) && (
            <Button
              variant="outline"
              onClick={handleDeleteClick}
              disabled={isSaving || isDeleting}
              className="text-rose-500 border-rose-200 hover:bg-rose-50 hover:text-rose-600 shadow-sm h-10 animate-in fade-in"
            >
              {isDeleting ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4 mr-1.5" />
              )}
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          )}

          {timelineItems.length > 0 && (
            <Button
              onClick={handleSave}
              disabled={isSaving || isDeleting}
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm h-10 px-6 rounded-lg font-semibold animate-in fade-in"
            >
              {isSaving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              {isSaving ? "저장 중..." : "저장하기"}
            </Button>
          )}
        </div>
      </div>

      {timelineItems.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-24 text-center transition-all hover:bg-slate-50">
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-sky-100 text-sky-500 shadow-sm">
            <History className="size-10" />
          </div>
          <h2 className="mb-3 text-xl font-bold text-slate-900">
            첫 번째 회의를 연동해주세요
          </h2>
          <p className="mb-8 max-w-md text-sm leading-relaxed text-slate-500">
            제목을 클릭해 이름을 변경하고, 기존에 기록해둔 회의록을 하나씩
            불러와서 타임라인을 만들어보세요.
          </p>
          <Button
            onClick={handleOpenModal}
            className="h-12 rounded-xl bg-sky-500 px-8 text-base font-semibold hover:bg-sky-600 shadow-sm transition-all hover:-translate-y-0.5 text-white"
          >
            <LinkIcon className="mr-2 size-5" /> 첫 회의 연결하기
          </Button>
        </div>
      ) : (
        <div className="relative ml-4 sm:ml-8 border-l-2 border-sky-100 py-4">
          {timelineItems.map((meeting) => (
            <div
              key={meeting.id}
              className="relative mb-8 pl-8 sm:pl-10 group animate-in slide-in-from-left-2 duration-300"
            >
              <span className="absolute -left-[13px] top-1 flex size-6 items-center justify-center bg-background">
                <CheckCircle2
                  className="size-6 text-sky-500 drop-shadow-sm"
                  fill="#e0f2fe"
                />
              </span>

              <div
                onClick={() => {
                  if (onMeetingClick) {
                    const originalMeeting = dbMeetings.find(
                      (m) => m.id === meeting.id,
                    );
                    if (originalMeeting) onMeetingClick(originalMeeting);
                  }
                }}
                className="rounded-2xl border bg-white border-border p-4 transition-all hover:shadow-md cursor-pointer hover:border-sky-300 group/card"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    {/* 💡 개별 지정 컬러를 빼고 원래의 기본 테마 색상(text-muted-foreground)으로 원복 */}
                    <Calendar className="size-4 ml-1 text-muted-foreground" />
                    <input
                      type="date"
                      value={meeting.date}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleUpdateDate(meeting.id, e.target.value)
                      }
                      className="bg-transparent outline-none text-slate-600 font-medium cursor-pointer px-1 py-1 rounded-md hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-sky-500/30 transition-all [&::-webkit-calendar-picker-indicator]:hidden"
                    />
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMeeting(meeting.id);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                    title="타임라인에서 제외"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pr-2">
                  <h3 className="text-lg font-bold text-foreground truncate pl-1">
                    {meeting.title}
                  </h3>
                  <ChevronRight className="size-5 text-sky-500 opacity-0 group-hover/card:opacity-100 transition-all -translate-x-2 group-hover/card:translate-x-0" />
                </div>
              </div>
            </div>
          ))}

          <div className="relative pl-8 sm:pl-10 mt-4">
            <span className="absolute -left-[11px] top-2 flex size-5 items-center justify-center bg-background rounded-full border-2 border-slate-200" />
            <Button
              variant="ghost"
              onClick={handleOpenModal}
              className="text-muted-foreground hover:text-sky-600 border border-dashed border-border hover:border-sky-300 w-full justify-start py-6 rounded-xl"
            >
              <Plus className="mr-2 size-4" /> 다음 회의 연결하기
            </Button>
          </div>
          <div className="absolute -bottom-4 -left-[1px] h-10 w-0.5 bg-gradient-to-b from-sky-100 to-transparent" />
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-background rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="text-lg font-bold">기존 회의 연결하기</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  타임라인에 추가할 회의를 선택하세요.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 border-b border-border bg-muted/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="회의 제목으로 검색..."
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-y-auto p-4 flex-1 custom-scrollbar flex flex-col gap-2">
              {filteredMeetings.length > 0 ? (
                filteredMeetings.map((meeting) => {
                  const isAlreadyAdded = timelineItems.some(
                    (item) => item.id === meeting.id,
                  );

                  return (
                    <button
                      key={meeting.id}
                      onClick={() =>
                        !isAlreadyAdded && handleSelectMeeting(meeting)
                      }
                      disabled={isAlreadyAdded}
                      className={`flex items-center gap-4 w-full p-4 rounded-xl border text-left transition-all group ${
                        isAlreadyAdded
                          ? "border-transparent bg-slate-50 opacity-50 cursor-not-allowed"
                          : "border-transparent hover:border-sky-200 hover:bg-sky-50 hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                          isAlreadyAdded
                            ? "bg-slate-200 text-slate-400"
                            : "bg-sky-100 text-sky-600 group-hover:bg-sky-500 group-hover:text-white"
                        } transition-colors`}
                      >
                        <FileText className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-semibold text-sm truncate ${
                            isAlreadyAdded
                              ? "text-slate-500"
                              : "group-hover:text-sky-700"
                          }`}
                        >
                          {meeting.title || "새 회의"}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {new Date(meeting.created_at).toLocaleString(
                              "ko-KR",
                            )}
                          </p>
                          {isAlreadyAdded && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-sm">
                              <AlertCircle className="size-3" /> 이미 추가됨
                            </span>
                          )}
                        </div>
                      </div>
                      {!isAlreadyAdded && (
                        <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center">
                  <Search className="size-8 text-muted-foreground/30 mb-3" />
                  검색된 회의가 없거나 아직 기록된 회의가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-background rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col border border-border p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-100 text-rose-500 mb-5">
              <Trash2 className="size-7" />
            </div>

            <h2 className="text-xl font-bold mb-2 text-foreground">
              타임라인 삭제
            </h2>

            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              <span className="font-bold text-foreground">'{projectName}'</span>{" "}
              타임라인을 정말 삭제하시겠습니까?
              <br />
              (연동된 회의 자체는 지워지지 않습니다)
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 h-11"
              >
                취소
              </Button>
              <Button
                onClick={executeDeleteProject}
                className="flex-1 h-11 bg-rose-500 hover:bg-rose-600 text-white font-semibold flex items-center justify-center"
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                {isDeleting ? "삭제 중..." : "삭제하기"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {toastConfig && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full bg-slate-900 px-6 py-3.5 text-white shadow-xl animate-in fade-in slide-in-from-top-5 duration-300">
          {toastConfig.type === "success" ? (
            <CheckCircle2 className="size-5 text-emerald-400" />
          ) : toastConfig.type === "warning" ? (
            <AlertCircle className="size-5 text-amber-400" />
          ) : (
            <AlertCircle className="size-5 text-rose-400" />
          )}
          <p className="text-sm font-medium">{toastConfig.message}</p>
        </div>
      )}
    </div>
  );
}
