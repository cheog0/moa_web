"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, Sparkles, X, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { MeetingMinutes } from "@/lib/constants";

export default function RecordingPanel({
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

  // 실시간 현장 메모
  const [liveMemo, setLiveMemo] = useState("");

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

      let finalTemplate = userSettings.custom_template;
      if (liveMemo.trim()) {
        const defaultStructure = `{\n  "summary": "회의 핵심 내용",\n  "decisions": "결정된 사항",\n  "action_items": []\n}`;
        finalTemplate = `[사용자 현장 실시간 메모]\n${liveMemo}\n\n⚠️ AI 지시사항: 사용자가 직접 작성한 위 현장 메모의 내용, 고유명사, 문맥을 오디오 스크립트 해석 시 최우선으로 반영하세요.\n\n[출력 템플릿 구조]\n${userSettings.custom_template || defaultStructure}`;
      }
      formData.append("custom_template", finalTemplate);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/api/meetings/transcribe`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(`서버 오류 (${response.status})`);

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      onComplete(result.minutes, result.meeting_id);
    } catch (error: any) {
      alert(error.message);
      setStatus("ready");
    }
  };

  const timeString = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm sm:p-10 print:hidden">
      {/* 💡 화면을 넓게 쓰도록 max-w-5xl, 높이 85vh 적용 */}
      <div className="relative flex h-full max-h-[900px] min-h-[500px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all">
        {/* 상단 헤더 영역 */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-8 py-5">
          <div className="flex items-center gap-3">
            <span
              className={`size-2.5 rounded-full ${status === "processing" ? "bg-primary" : status === "ready" ? "bg-muted-foreground/40" : status === "paused" ? "bg-amber-500" : "animate-pulse bg-red-500"}`}
            />
            <h2 className="text-xl font-bold tracking-tight">
              {status === "processing"
                ? "회의 내용을 정리하고 있어요"
                : "새로운 노트"}
            </h2>
          </div>
          {status !== "processing" && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 overflow-hidden p-8">
          {status === "processing" ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="size-10 animate-pulse text-primary" />
              </div>
              <p className="mt-6 text-lg font-semibold text-foreground">
                AI가 대화와 메모를 바탕으로 회의록을 생성하고 있습니다
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                잠시만 기다려주세요...
              </p>
            </div>
          ) : status === "ready" ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-primary/10">
                <Mic className="size-10 text-primary" />
              </div>
              <Button
                className="mt-8 px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                onClick={handleStartRecording}
              >
                <Mic className="mr-2 size-5" /> 녹음 및 노트 시작
              </Button>
            </div>
          ) : (
            // 💡 대형 텍스트 에디터 영역
            <div className="flex h-full flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-4 flex items-center text-sm font-semibold text-muted-foreground">
                <span className="font-mono text-primary mr-2">
                  {timeString}
                </span>
                자유롭게 현장 메모를 작성해보세요. (줄바꿈: Enter)
              </div>
              <textarea
                value={liveMemo}
                onChange={(e) => setLiveMemo(e.target.value)}
                placeholder="음성이 잘 안 들릴 때를 대비해 중요한 키워드나 결론을 메모해 두세요. AI가 회의록 작성 시 최우선으로 참고합니다."
                className="w-full flex-1 resize-none bg-transparent text-lg leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50"
              />
            </div>
          )}
        </div>

        {/* 💡 하단 플로팅 컨트롤 바 (스크린샷 스타일) */}
        {(status === "recording" || status === "paused") && (
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-6 rounded-full bg-zinc-900 px-6 py-3 shadow-2xl dark:bg-zinc-100">
            <button
              onClick={status === "paused" ? handleResume : handlePause}
              className="flex size-10 items-center justify-center rounded-full bg-zinc-700 text-white transition-colors hover:bg-zinc-600 dark:bg-zinc-200 dark:text-black dark:hover:bg-zinc-300"
            >
              {status === "paused" ? (
                <Play className="size-4 ml-0.5" fill="currentColor" />
              ) : (
                <Pause className="size-4" fill="currentColor" />
              )}
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-1.5 ${status === "recording" ? "animate-pulse" : "opacity-50"}`}
              >
                <span className="h-4 w-1 rounded-full bg-sky-500" />
                <span className="h-3 w-1 rounded-full bg-sky-500" />
                <span className="h-5 w-1 rounded-full bg-sky-500" />
                <span className="h-3 w-1 rounded-full bg-sky-500" />
              </div>
              <span className="font-mono text-sm font-medium text-zinc-300 dark:text-zinc-700">
                {status === "recording" ? "녹음 중" : "일시정지"} {timeString}
              </span>
            </div>

            <div className="h-5 w-px bg-zinc-700 dark:bg-zinc-300" />

            <button
              onClick={onClose}
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-white dark:text-zinc-500 dark:hover:text-black"
            >
              취소
            </button>
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 rounded-full bg-sky-500/10 px-4 py-1.5 text-sm font-bold text-sky-400 transition-colors hover:bg-sky-500/20 hover:text-sky-300 dark:text-sky-600 dark:hover:bg-sky-50 dark:hover:text-sky-700"
            >
              <Square className="size-3.5" fill="currentColor" /> 종료
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
