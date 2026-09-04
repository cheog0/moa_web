"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  LayoutDashboard,
  Menu,
  Mic,
  Pause,
  Play,
  Plus,
  Search,
  Share2,
  Sparkles,
  Timer,
  Download,
  X,
  LogOut,
  Settings,
  Cpu,
  Key,
  FileEdit,
  Tags,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

/* =========================================================
   Supabase 클라이언트 초기화
========================================================= */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* =========================================================
   타입 및 프리셋 정의
========================================================= */
type MeetingMinutes = {
  summary: string;
  decisions: string;
  action_items: { task: string; assignee: string }[] | string;
  transcript: { time: string; speaker: string; text: string }[] | string;
};

const TEMPLATE_SALES = `📋 미팅 결과 보고서\n\n1️⃣ 기본 정보\n업체명: [파악된 업체명 작성]\n미팅 일시: [미팅 날짜 및 시간]\n참석자: [참석자 명단 기재]\n\n2️⃣ 미팅 목적\n- [미팅의 주요 목적을 개조식으로 요약]\n\n3️⃣ 주요 논의 사항\n📌 안건 1. [논의된 첫 번째 안건 제목]\n- [해당 안건의 세부 논의 내용 요약]\n\n💬 질의응답 정리본\n📌 Q. [핵심 질문 내용]\nA. [질문에 대한 답변 내용]`;
const TEMPLATE_SCRUM = `🏃‍♂️ 데일리 스크럼\n\n1️⃣ 어제 한 일 (Done)\n- [어제 완료한 주요 업무 내용]\n\n2️⃣ 오늘 할 일 (To-Do)\n- [오늘 진행할 핵심 목표 및 업무]\n\n3️⃣ 이슈 및 공유사항 (Blockers)\n- [업무 진행을 방해하는 장애물이나 팀원들과 공유할 내용]`;
const TEMPLATE_BASIC = `📝 회의 주요 내용\n\n🎯 회의 안건\n- [회의 주요 안건 기재]\n\n✅ 결정 사항\n- [회의를 통해 최종 결정된 항목 기재]\n\n🏃‍♂️ Action Items (향후 계획)\n- [누가, 언제까지, 무엇을 할 것인지 기재]`;

/* =========================================================
   1. 로그인 화면 (Auth Screen)
========================================================= */
function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert("로그인 실패: " + error.message);
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert("회원가입 실패: " + error.message);
    else alert("가입 완료! 이제 로그인할 수 있습니다.");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-4">
            <Mic className="size-6" />
          </div>
          <h1 className="text-2xl font-bold">모먼트 로그인</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            AI 회의록 서비스에 오신 것을 환영합니다.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary focus:ring-2"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary focus:ring-2"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" disabled={loading} className="mt-2 w-full h-11">
            {loading ? "처리 중..." : "로그인"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleSignUp}
            className="w-full h-11"
          >
            이메일로 회원가입
          </Button>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   Sidebar
========================================================= */
function Sidebar({
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
        <span className="text-lg font-bold tracking-tight">모먼트</span>
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
          icon={FileText}
          label="내 회의록"
          active={currentView === "minutes"}
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

/* =========================================================
   설정 패널 (Settings Panel)
========================================================= */
function SettingsPanel({ session }: { session: any }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiEngine, setAiEngine] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [customTemplate, setCustomTemplate] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      if (data) {
        setAiEngine(data.ai_engine || "gemini");
        setApiKey(data.api_key || "");
        setCustomTemplate(data.custom_template || "");
        setKeywords(
          Array.isArray(data.keywords)
            ? data.keywords
            : data.keywords
              ? data.keywords.split(",")
              : [],
        );
      }
      setLoading(false);
    };
    fetchSettings();
  }, [session.user.id]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("user_settings").upsert({
      user_id: session.user.id,
      ai_engine: aiEngine,
      api_key: apiKey,
      custom_template: customTemplate,
      keywords: keywords,
    });
    setSaving(false);
    if (error) alert("설정 저장에 실패했습니다.");
    else alert("설정이 안전하게 저장되었습니다.");
  };

  const addKeyword = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === "keydown" && (e as React.KeyboardEvent).key !== "Enter")
      return;
    e.preventDefault();
    const trimmed = newKeyword.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (target: string) => {
    setKeywords(keywords.filter((k) => k !== target));
  };

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        설정 불러오는 중...
      </div>
    );

  return (
    <main className="mx-auto max-w-3xl p-5 sm:p-8 print:hidden">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">AI 및 앱 설정</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          회의록 요약 방식과 AI 모델을 커스텀하세요.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <section>
          <div className="flex items-center gap-2 font-bold mb-4">
            <Cpu className="size-5" /> STT / AI 엔진 선택
          </div>
          {/* 변경된 엔진 선택 UI */}
          <select
            value={aiEngine}
            onChange={(e) => setAiEngine(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          >
            <option value="gemini">Google Gemini 3.6 Flash</option>
            <option value="deepgram">Deepgram</option>
            <option value="soniox">Soniox</option>
            <option value="clova">ClovaNote</option>
          </select>
        </section>

        <section>
          <div className="flex items-center gap-2 font-bold mb-2">
            <Key className="size-5" /> API 키
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            안전하게 클라우드 내 개인 계정에만 보관됩니다.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="API 키를 붙여넣으세요"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </section>

        <section>
          <div className="flex items-center gap-2 font-bold mb-2">
            <FileEdit className="size-5" /> 맞춤형 AI 회의록 템플릿
          </div>
          <p className="mb-4 text-xs text-muted-foreground leading-relaxed">
            자주 쓰는 양식을 버튼으로 불러오거나 직접 작성하세요.
            <br />
            AI가 형태를 100% 유지하며 [ ] 빈칸만 똑똑하게 채워줍니다.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setCustomTemplate(TEMPLATE_SALES)}
              className="rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
            >
              📋 영업 미팅
            </button>
            <button
              onClick={() => setCustomTemplate(TEMPLATE_SCRUM)}
              className="rounded-full bg-green-50 px-4 py-1.5 text-xs font-semibold text-green-600 transition-colors hover:bg-green-100"
            >
              🏃‍♂️ 데일리 스크럼
            </button>
            <button
              onClick={() => setCustomTemplate(TEMPLATE_BASIC)}
              className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200"
            >
              📝 기본 회의
            </button>
            <button
              onClick={() => setCustomTemplate("")}
              className="rounded-full border border-border bg-white px-4 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-gray-50"
            >
              🔄 비우기
            </button>
          </div>
          <textarea
            value={customTemplate}
            onChange={(e) => setCustomTemplate(e.target.value)}
            placeholder="여기에 템플릿 양식을 붙여넣거나 작성하세요. 내용이 들어가야 할 부분은 [ ] 로 표시해주세요."
            className="h-64 w-full resize-y rounded-lg border border-input bg-background p-4 text-sm outline-none focus:border-primary"
          />
        </section>

        <section>
          <div className="flex items-center gap-2 font-bold mb-2">
            <Tags className="size-5" /> 자동 적용 키워드
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            녹음 시 AI 요약에 기본으로 포함될 태그들을 관리합니다.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-medium"
              >
                {kw}
                <button
                  onClick={() => removeKeyword(kw)}
                  className="ml-1 rounded-full p-0.5 hover:bg-gray-300"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={addKeyword}
              placeholder="예: 디자인, 클라이언트"
              className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <Button onClick={addKeyword} variant="outline">
              추가
            </Button>
          </div>
        </section>

        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="w-full"
        >
          {saving ? "저장 중..." : "모든 설정 저장하기"}
        </Button>
      </div>
    </main>
  );
}

/* =========================================================
   녹음 패널
========================================================= */
function RecordingPanel({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: (minutes: MeetingMinutes, newId?: string) => void;
}) {
  const [status, setStatus] = useState<
    "ready" | "recording" | "paused" | "processing"
  >("ready");
  const [seconds, setSeconds] = useState(0);
  const [userSettings, setUserSettings] = useState({
    user_id: "",
    ai_engine: "gemini",
    api_key: "",
    keywords: "기획",
    custom_template: "",
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setUserSettings({
          user_id: user.id,
          ai_engine: data.ai_engine || "gemini",
          api_key: data.api_key || "",
          keywords: Array.isArray(data.keywords)
            ? data.keywords.join(",")
            : "기획",
          custom_template: data.custom_template || "",
        });
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (status !== "recording") return;
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      )
        mediaRecorderRef.current.stop();
      if (streamRef.current)
        streamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];
      let mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0)
          audioChunksRef.current.push(event.data);
      };
      recorder.start(1000);
      setSeconds(0);
      setStatus("recording");
    } catch (error) {
      alert("마이크 권한을 확인해주세요.");
    }
  };

  const handlePause = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setStatus("paused");
    }
  };

  const handleResume = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setStatus("recording");
    }
  };

  const handleFinish = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || status === "processing") return;
    setStatus("processing");

    const audioBlob = await new Promise<Blob | null>((resolve) => {
      if (!recorder) {
        resolve(null);
        return;
      }
      recorder.onstop = () =>
        resolve(
          audioChunksRef.current.length === 0
            ? null
            : new Blob(audioChunksRef.current, {
                type: recorder.mimeType || "audio/webm",
              }),
        );
      if (recorder.state !== "inactive") recorder.stop();
      else resolve(null);
    });

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (!audioBlob || audioBlob.size === 0) {
      alert("녹음된 음성이 없습니다.");
      setStatus("ready");
      setSeconds(0);
      return;
    }

    try {
      const extension = audioBlob.type.includes("mp4") ? "mp4" : "webm";
      const audioFile = new File(
        [audioBlob],
        `meeting_recording.${extension}`,
        { type: audioBlob.type },
      );

      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("user_id", userSettings.user_id);
      formData.append("engine", userSettings.ai_engine);
      formData.append("api_key", userSettings.api_key);
      formData.append("keywords", userSettings.keywords);
      formData.append("custom_template", userSettings.custom_template);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/api/meetings/transcribe`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(`서버 오류 (${response.status})`);
      const result = await response.json();
      // ...
      if (!result.success) throw new Error(result.error);

      onComplete(result.minutes, result.meeting_id);
    } catch (error: any) {
      // 💡 백엔드에서 던진 친절한 한국어 에러 메시지를 화면에 그대로 출력합니다!
      alert(error.message);
      setStatus("ready");
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-foreground/20 p-4 backdrop-blur-sm sm:items-center print:hidden">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span
                className={`size-2 rounded-full ${status === "processing" ? "bg-primary" : status === "ready" ? "bg-muted-foreground/40" : status === "paused" ? "bg-amber-500" : "animate-pulse bg-red-500"}`}
              />
              {status === "ready"
                ? "녹음 준비"
                : status === "recording"
                  ? "녹음 중"
                  : status === "paused"
                    ? "녹음 일시정지"
                    : "AI 처리 중"}
            </div>
            <h2 className="mt-2 text-xl font-bold">
              {status === "processing"
                ? "회의 내용을 정리하고 있어요"
                : "새 회의 녹음"}
            </h2>
          </div>
          {status !== "processing" && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {status === "processing" ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-7 animate-pulse text-primary" />
            </div>
            <p className="mt-5 text-sm font-semibold">
              AI가 회의록을 생성하고 있습니다
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              잠시만 기다려주세요.
            </p>
          </div>
        ) : status === "ready" ? (
          <div className="py-10 text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10">
              <Mic className="size-9 text-primary" />
            </div>
            <h3 className="mt-6 text-lg font-bold">
              회의 녹음을 시작할 준비가 되었어요
            </h3>
            <div className="mt-8">
              <Button
                className="w-full"
                size="lg"
                onClick={handleStartRecording}
              >
                <Mic className="mr-2 size-4" /> 녹음 시작
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="my-10 flex items-center justify-center gap-1">
              {[
                22, 42, 30, 56, 34, 64, 48, 38, 58, 28, 46, 68, 36, 52, 26, 44,
                60, 32, 48, 24,
              ].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full ${status === "paused" ? "bg-muted-foreground/30" : "bg-primary"}`}
                  style={{ height: h }}
                />
              ))}
            </div>
            <div className="text-center font-mono text-4xl font-semibold tabular-nums">
              {String(Math.floor(seconds / 60)).padStart(2, "0")}:
              {String(seconds % 60).padStart(2, "0")}
            </div>
            <div className="mt-8 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={status === "paused" ? handleResume : handlePause}
              >
                {status === "paused" ? (
                  <Play className="mr-2 size-4" />
                ) : (
                  <Pause className="mr-2 size-4" />
                )}{" "}
                {status === "paused" ? "계속 녹음" : "일시정지"}
              </Button>
              <Button className="flex-1" onClick={handleFinish}>
                <Check className="mr-2 size-4" /> 녹음 종료
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   회의 상세 패널 (✨ 문서 뷰 UI/UX 및 빈 데이터 렌더링 개선)
========================================================= */
function DetailPanel({
  onClose,
  minutes,
  meeting,
  onUpdateTitle,
  onDelete,
}: {
  onClose: () => void;
  minutes?: MeetingMinutes;
  meeting: any;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}) {
  const [tab, setTab] = useState<"minutes" | "transcript">("minutes");
  const [meetingTitle, setMeetingTitle] = useState(meeting?.title || "새 회의");
  const dateStr = meeting?.created_at
    ? new Date(meeting.created_at).toLocaleDateString("ko-KR")
    : new Date().toLocaleDateString("ko-KR");

  const handlePrintPDF = () => window.print();

  const handleTitleBlur = () => {
    if (
      meeting?.id &&
      meetingTitle.trim() !== "" &&
      meetingTitle !== meeting.title
    ) {
      onUpdateTitle(meeting.id, meetingTitle);
    }
  };

  const handleDelete = () => {
    if (
      confirm(
        "정말로 이 회의록을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.",
      )
    ) {
      if (meeting?.id) onDelete(meeting.id);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-foreground/20 backdrop-blur-sm print:static print:inset-auto print:bg-transparent print:backdrop-blur-none">
      <div className="flex h-full w-full max-w-4xl flex-col overflow-y-auto border-l border-border bg-background shadow-2xl print:w-full print:max-w-none print:overflow-visible print:border-none print:shadow-none print:bg-white">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-6 py-4 backdrop-blur print:hidden">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="rounded-lg p-2 hover:bg-muted">
              <X className="size-4" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground">{dateStr}</p>
              <h2 className="font-bold truncate max-w-[200px]">
                {meetingTitle}
              </h2>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" onClick={handlePrintPDF}>
              <Download className="mr-2 size-4" /> PDF
            </Button>
            {meeting?.id && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </header>

        <div className="flex border-b border-border px-6 pt-4 print:hidden">
          <button
            onClick={() => setTab("minutes")}
            className={`border-b-2 px-1 pb-3 text-sm font-semibold ${tab === "minutes" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            문서 뷰 (노션 스타일)
          </button>
          <button
            onClick={() => setTab("transcript")}
            className={`ml-6 border-b-2 px-1 pb-3 text-sm font-semibold ${tab === "transcript" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            전체 대화
          </button>
        </div>

        <main className="mx-auto w-full max-w-3xl p-6 sm:p-12 print:p-0 print:m-0 print:w-full print:max-w-none">
          {tab === "minutes" ? (
            <div className="min-h-[800px] rounded-xl bg-white p-8 shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
              <input
                className="w-full bg-transparent text-4xl font-extrabold tracking-tight text-gray-900 outline-none placeholder:text-gray-300 print:text-black transition-colors hover:bg-gray-50 focus:bg-white rounded-md"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                placeholder="제목 없는 문서"
              />
              <div className="mt-4 flex items-center gap-4 border-b border-gray-100 pb-6 text-sm text-gray-500 print:border-gray-300">
                <span className="flex items-center gap-1.5">
                  <Clock3 className="size-4" /> {dateStr}
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-4 text-blue-500" /> AI 생성됨
                </span>
              </div>

              {/* ✨ 템플릿 & 요약 본문 렌더링 개선 (소제목 추가 및 빈 데이터 방어) */}
              <div className="mt-8 text-gray-800">
                {minutes ? (
                  <div className="flex flex-col gap-10 text-base leading-relaxed">
                    {/* 1. 요약 또는 커스텀 템플릿 렌더링 */}
                    {minutes.summary && (
                      <div>
                        {/* 다른 섹션이 존재할 경우에만 '회의 요약'이라는 소제목을 붙여줍니다. */}
                        {(minutes.decisions ||
                          (Array.isArray(minutes.action_items) &&
                            minutes.action_items.length > 0)) && (
                          <h3 className="mb-3 text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="size-5 text-blue-500" /> 회의
                            요약
                          </h3>
                        )}
                        <div className="whitespace-pre-wrap">
                          {minutes.summary}
                        </div>
                      </div>
                    )}

                    {/* 2. 결정 사항 렌더링 */}
                    {minutes.decisions &&
                      minutes.decisions.trim() !== "" &&
                      minutes.decisions !== "내용이 없습니다." && (
                        <div>
                          <h3 className="mb-3 text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Check className="size-5 text-green-500" /> 결정된
                            사항
                          </h3>
                          <div className="whitespace-pre-wrap">
                            {minutes.decisions}
                          </div>
                        </div>
                      )}

                    {/* 3. 액션 아이템 렌더링 (빈 골뱅이 방어 로직 추가) */}
                    {minutes.action_items && (
                      <div>
                        {typeof minutes.action_items === "string" &&
                        minutes.action_items.trim() !== "" &&
                        minutes.action_items !== "등록된 할 일이 없습니다." ? (
                          <>
                            <h3 className="mb-3 text-lg font-bold text-gray-900 flex items-center gap-2">
                              <BookOpen className="size-5 text-orange-500" />{" "}
                              액션 아이템
                            </h3>
                            <div className="whitespace-pre-wrap">
                              {minutes.action_items}
                            </div>
                          </>
                        ) : Array.isArray(minutes.action_items) &&
                          minutes.action_items.length > 0 ? (
                          <>
                            <h3 className="mb-3 text-lg font-bold text-gray-900 flex items-center gap-2">
                              <BookOpen className="size-5 text-orange-500" />{" "}
                              액션 아이템
                            </h3>
                            <ul className="flex flex-col gap-3">
                              {minutes.action_items.map((item, idx) => {
                                // ✨ 불량 데이터 필터링: 담당자와 할 일이 모두 없으면 렌더링하지 않음
                                const hasAssignee =
                                  item.assignee &&
                                  item.assignee.trim() !== "" &&
                                  item.assignee !== "미정" &&
                                  item.assignee !== "담당자 미정";
                                const hasTask =
                                  item.task && item.task.trim() !== "";

                                if (!hasAssignee && !hasTask) return null;

                                return (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 print:bg-transparent print:p-0"
                                  >
                                    <input
                                      type="checkbox"
                                      className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="leading-relaxed">
                                      {hasAssignee && (
                                        <span className="font-semibold text-gray-900 mr-2">
                                          @{item.assignee}
                                        </span>
                                      )}
                                      {hasTask ? item.task : "내용 없음"}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-20 text-center text-gray-400">
                    문서를 불러오는 중입니다...
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 py-7 print:hidden">
              {minutes ? (
                typeof minutes.transcript === "string" ? (
                  <div className="rounded-xl border border-border bg-card p-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                    {minutes.transcript}
                  </div>
                ) : Array.isArray(minutes.transcript) &&
                  minutes.transcript.length > 0 ? (
                  minutes.transcript.map((t, idx) => (
                    <div key={idx} className="flex gap-4">
                      <span className="w-12 shrink-0 pt-0.5 font-mono text-xs text-muted-foreground">
                        {t.time || ""}
                      </span>
                      <div>
                        <div className="text-sm font-semibold">
                          {t.speaker || "알 수 없음"}
                        </div>
                        <p className="mt-1 text-sm leading-7 text-muted-foreground">
                          {t.text || ""}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-muted-foreground">
                    대화 내용이 없습니다.
                  </div>
                )
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  불러오는 중...
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

/* =========================================================
   메인 레이아웃 (Main Dashboard)
========================================================= */
export default function Page() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [currentView, setCurrentView] = useState<"dashboard" | "settings">(
    "dashboard",
  );

  const [recording, setRecording] = useState(false);
  const [detail, setDetail] = useState(false);
  const [generatedMinutes, setGeneratedMinutes] =
    useState<MeetingMinutes | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [dbMeetings, setDbMeetings] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session),
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || currentView !== "dashboard") return;
    const fetchMeetings = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/meetings`);
        const data = await res.json();
        if (data.success) setDbMeetings(data.meetings);
      } catch (error) {
        console.error("❌ 회의 목록을 불러오지 못했습니다.", error);
      }
    };
    fetchMeetings();
  }, [session, recording, currentView]);

  const handleLogout = async () => await supabase.auth.signOut();

  if (loadingSession)
    return (
      <div className="flex min-h-screen items-center justify-center">
        세션 확인 중...
      </div>
    );
  if (!session) return <AuthScreen />;

  const filtered = dbMeetings.filter((m) => m.title && m.title.includes(query));

  const totalMeetings = dbMeetings.length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthMeetings = dbMeetings.filter((m) => {
    if (!m.created_at) return false;
    const d = new Date(m.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  let lastMeetingDateStr = "기록 없음";
  if (dbMeetings.length > 0) {
    const latest = [...dbMeetings].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];
    if (latest?.created_at) {
      const d = new Date(latest.created_at);
      lastMeetingDateStr = `${d.getMonth() + 1}월 ${d.getDate()}일`;
    }
  }

  const handleNewMeeting = () => {
    setGeneratedMinutes(null);
    setSelectedMeeting(null);
    setRecording(false);
    setTimeout(() => setRecording(true), 0);
  };

  const handleOpenDetail = async (meeting: any) => {
    setGeneratedMinutes(null);
    setSelectedMeeting(meeting);
    setDetail(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/api/meetings/${meeting.id}/minutes`);
      const data = await res.json();
      if (data.success && data.minutes) setGeneratedMinutes(data.minutes);
    } catch (error) {
      console.error("❌ 회의록을 불러오지 못했습니다.", error);
    }
  };

  const handleUpdateTitle = async (id: string, newTitle: string) => {
    try {
      const { data, error } = await supabase
        .from("meetings")
        .update({ title: newTitle })
        .eq("id", id)
        .select();
      if (error) throw error;

      if (data && data.length > 0) {
        setDbMeetings((prev) =>
          prev.map((m) => (m.id === id ? { ...m, title: newTitle } : m)),
        );
      } else {
        alert("저장 권한이 없거나 회의록을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("제목 수정 실패", error);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    try {
      const { error } = await supabase.from("meetings").delete().eq("id", id);
      if (error) throw error;
      setDbMeetings((prev) => prev.filter((m) => m.id !== id));
      setDetail(false);
    } catch (error) {
      alert("삭제에 실패했습니다.");
      console.error("회의 삭제 실패", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as any)}
        onNew={handleNewMeeting}
        onLogout={handleLogout}
      />
      <div className="min-w-0 flex-1 flex flex-col h-screen overflow-y-auto print:hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-muted lg:hidden">
              <Menu className="size-5" />
            </button>
            {currentView === "dashboard" && (
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="회의 검색..."
                  className="h-9 w-64 rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm outline-none ring-primary focus:ring-2"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">{session.user.email}</span>
          </div>
        </header>

        {currentView === "settings" ? (
          <SettingsPanel session={session} />
        ) : (
          <main className="mx-auto w-full max-w-6xl p-5 sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-primary">
                  오늘의 회의를
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  더 선명하게 기록해보세요.
                </p>
              </div>
              <Button onClick={handleNewMeeting} className="w-full sm:w-auto">
                <Plus className="mr-2 size-4" />새 회의 시작
              </Button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Stat
                icon={BookOpen}
                label="전체 저장된 회의"
                value={`${totalMeetings}건`}
                hint="지금까지 기록한 모든 회의"
              />
              <Stat
                icon={Sparkles}
                label="이번 달 기록"
                value={`${thisMonthMeetings}건`}
                hint="이번 달 새롭게 생성된 회의록"
              />
              <Stat
                icon={Clock3}
                label="최근 활동일"
                value={lastMeetingDateStr}
                hint="가장 마지막으로 회의를 기록한 날"
              />
            </div>

            <section className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">최근 회의</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    가장 최근에 기록된 회의예요.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {filtered.map((meeting) => (
                  <button
                    key={meeting.id}
                    onClick={() => handleOpenDetail(meeting)}
                    className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold">
                        {meeting.title || "새 회의"}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(meeting.created_at).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                    아직 기록된 회의가 없습니다. '새 회의 시작'을 눌러보세요!
                  </div>
                )}
              </div>
            </section>
          </main>
        )}
      </div>

      {recording && (
        <RecordingPanel
          onClose={() => setRecording(false)}
          onComplete={(minutes, newId) => {
            setGeneratedMinutes(minutes);
            setSelectedMeeting({ id: newId, title: "새 회의" });
            setRecording(false);
            setDetail(true);
          }}
        />
      )}
      {detail && (
        <DetailPanel
          onClose={() => {
            setDetail(false);
            setGeneratedMinutes(null);
          }}
          minutes={generatedMinutes || undefined}
          meeting={selectedMeeting}
          onUpdateTitle={handleUpdateTitle}
          onDelete={handleDeleteMeeting}
        />
      )}
    </div>
  );
}
