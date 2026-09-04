"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Mic, Pause, Play, Sparkles, X } from "lucide-react";
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
      if (!result.success) throw new Error(result.error);

      onComplete(result.minutes, result.meeting_id);
    } catch (error: any) {
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
          </div>
        ) : status === "ready" ? (
          <div className="py-10 text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10">
              <Mic className="size-9 text-primary" />
            </div>
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
            <div className="text-center font-mono text-4xl mt-10 font-semibold tabular-nums">
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
