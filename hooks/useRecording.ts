import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getApiUrl } from "@/lib/api";
import { transcribeRecording } from "@/lib/transcribe";
import { MeetingMinutes } from "@/lib/constants";

export function useRecording(
  onComplete: (minutes: MeetingMinutes, newId?: string) => void,
) {
  const [status, setStatus] = useState<
    "ready" | "recording" | "paused" | "processing"
  >("ready");
  const [seconds, setSeconds] = useState(0);
  const [liveMemo, setLiveMemo] = useState("");
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [isServerReady, setIsServerReady] = useState(false);
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
    fetch(`${getApiUrl()}/api/meetings`)
      .then(() => setIsServerReady(true))
      .catch(() => setIsServerReady(true));
  }, []);

  useEffect(() => {
    if (status !== "recording") return;
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    const keepAlive = setInterval(() => {
      fetch(`${getApiUrl()}/api/meetings`).catch(() => {});
    }, 10 * 60 * 1000);
    return () => {
      clearInterval(timer);
      clearInterval(keepAlive);
    };
  }, [status]);

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      )
        mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";
      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 64000,
      });
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

  const handleFinish = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || status === "processing") return;
    setStatus("processing");
    const audioBlob = await new Promise<Blob | null>((resolve) => {
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
      const result = await transcribeRecording({
        audioBlob,
        userSettings,
        seconds,
        attendees: selectedAttendees,
        liveMemo,
      });
      onComplete(result.minutes, result.meeting_id);
    } catch (error: any) {
      alert(error.message);
      setStatus("ready");
    }
  };

  const togglePause = () => {
    if (status === "paused") {
      if (mediaRecorderRef.current?.state === "paused") {
        mediaRecorderRef.current.resume();
        setStatus("recording");
      }
    } else if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setStatus("paused");
    }
  };

  const timeString = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return {
    status,
    liveMemo,
    setLiveMemo,
    selectedAttendees,
    setSelectedAttendees,
    customInput,
    setCustomInput,
    isAddingCustom,
    setIsAddingCustom,
    isServerReady,
    timeString,
    handleStartRecording,
    handleFinish,
    togglePause,
  };
}
