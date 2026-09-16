import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getApiUrl } from "@/lib/api";
import { transcribeRecording } from "@/lib/transcribe";
import { MeetingMinutes } from "@/lib/constants";
import { parseMinutesPayload } from "@/lib/actionItems";
import { normalizeManuals, ReplyManual } from "@/lib/manuals";

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
    manuals: [] as ReplyManual[],
  });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const elapsedMsRef = useRef(0);
  const runningSinceRef = useRef<number | null>(null);

  const getElapsedSeconds = () => {
    let ms = elapsedMsRef.current;
    if (runningSinceRef.current != null) {
      ms += Date.now() - runningSinceRef.current;
    }
    return Math.max(0, Math.round(ms / 1000));
  };

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
          manuals: normalizeManuals(data.reply_manuals),
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
    const timer = setInterval(() => setSeconds(getElapsedSeconds()), 250);
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
      elapsedMsRef.current = 0;
      runningSinceRef.current = Date.now();
      setSeconds(0);
      setStatus("recording");
    } catch (error) {
      alert("마이크 권한을 확인해주세요.");
    }
  };

  const handleFinish = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || status === "processing") return;
    if (runningSinceRef.current != null) {
      elapsedMsRef.current += Date.now() - runningSinceRef.current;
      runningSinceRef.current = null;
    }
    const durationSeconds = Math.max(0, Math.round(elapsedMsRef.current / 1000));
    setSeconds(durationSeconds);
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
      elapsedMsRef.current = 0;
      runningSinceRef.current = null;
      setStatus("ready");
      setSeconds(0);
      return;
    }
    try {
      const result = await transcribeRecording({
        audioBlob,
        userSettings,
        seconds: durationSeconds,
        attendees: selectedAttendees,
        liveMemo,
      });
      onComplete(
        parseMinutesPayload(result.minutes) ?? result.minutes,
        result.meeting_id,
      );
    } catch (error: any) {
      alert(error.message);
      setStatus("ready");
    }
  };

  const togglePause = () => {
    if (status === "paused") {
      if (mediaRecorderRef.current?.state === "paused") {
        mediaRecorderRef.current.resume();
        runningSinceRef.current = Date.now();
        setStatus("recording");
      }
    } else if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      if (runningSinceRef.current != null) {
        elapsedMsRef.current += Date.now() - runningSinceRef.current;
        runningSinceRef.current = null;
      }
      setSeconds(getElapsedSeconds());
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
