import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DEFAULT_ENGINE_ID, engineRequiresOwnKey, isDefaultEngine, missingApiKeyMessage, normalizeEngine } from "@/lib/engines";
import { downloadRecordingBlob, processMeeting, uploadRecording } from "@/lib/transcribe";
import { TEMPLATE_SALES } from "@/lib/constants";
import { normalizeManuals, ReplyManual } from "@/lib/manuals";
import {
  consumeUsage,
  fetchUsage,
  formatUsageClock,
  FREE_MONTHLY_MINUTES,
  isUsageExhausted,
  type UsageSnapshot,
} from "@/lib/usage";
import { addMinutesReadyNotice } from "@/lib/notifications";
import { showInfoNotice, showToastNotice } from "@/lib/notice";

function warnRemainingQuota(leftSeconds: number) {
  if (leftSeconds >= 50) {
    showToastNotice(
      "무료 녹음이 1분 남았습니다.",
      "1분 후에 자동 종료됩니다.",
    );
    return;
  }
  showToastNotice(
    `무료 녹음이 ${formatUsageClock(leftSeconds)} 남았습니다.`,
    "곧 자동 종료됩니다.",
  );
}

export function useRecording(onSaved: (meetingId: string) => void) {
  const [status, setStatus] = useState<
    "ready" | "recording" | "paused" | "processing"
  >("ready");
  const [seconds, setSeconds] = useState(0);
  const [liveMemo, setLiveMemo] = useState("");
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);
  const [userSettings, setUserSettings] = useState({
    user_id: "",
    ai_engine: DEFAULT_ENGINE_ID,
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
  const remainingRef = useRef<number | null>(null);
  const meteredRef = useRef(true);
  const finishingRef = useRef(false);
  const oneMinuteWarnedRef = useRef(false);
  const finishRef = useRef<() => void>(() => {});

  const getElapsedSeconds = () => {
    let ms = elapsedMsRef.current;
    if (runningSinceRef.current != null) {
      ms += Date.now() - runningSinceRef.current;
    }
    return Math.max(0, Math.round(ms / 1000));
  };

  const refreshUsage = async () => {
    if (!meteredRef.current) {
      setUsage(null);
      remainingRef.current = null;
      return null;
    }
    const next = await fetchUsage();
    setUsage(next);
    remainingRef.current = next?.remainingSeconds ?? null;
    return next;
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
        .maybeSingle();
      const engine = normalizeEngine(data?.ai_engine);
      meteredRef.current = isDefaultEngine(engine);
      setUserSettings({
        user_id: user.id,
        ai_engine: engine,
        api_key: data?.api_key || "",
        keywords: Array.isArray(data?.keywords)
          ? data.keywords.join(",")
          : "기획",
        custom_template: data?.custom_template || TEMPLATE_SALES,
        manuals: normalizeManuals(data?.reply_manuals),
      });
      await refreshUsage();
    };
    void fetchSettings();
  }, []);

  useEffect(() => {
    if (status !== "recording") return;
    const timer = setInterval(() => {
      const elapsed = getElapsedSeconds();
      setSeconds(elapsed);
      const cap = remainingRef.current;
      if (cap != null && cap > 0 && !finishingRef.current) {
        const left = cap - elapsed;
        if (left > 0 && left <= 60 && !oneMinuteWarnedRef.current) {
          oneMinuteWarnedRef.current = true;
          warnRemainingQuota(left);
        }
        if (elapsed >= cap) {
          finishingRef.current = true;
          finishRef.current();
        }
      }
    }, 250);
    return () => {
      clearInterval(timer);
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
      if (engineRequiresOwnKey(userSettings.ai_engine) && !userSettings.api_key.trim()) {
        showInfoNotice(
          "API 키가 필요해요",
          missingApiKeyMessage(userSettings.ai_engine),
        );
        return;
      }
      if (meteredRef.current) {
        const current = await refreshUsage();
        if (isUsageExhausted(current)) {
          showInfoNotice(
            "이번 달 사용량을 다 썼어요",
            `기본 엔진은 한 달에 ${FREE_MONTHLY_MINUTES}분까지 사용할 수 있습니다. 다음 달에 다시 이용하거나 설정에서 내 API 키를 연결해 주세요.`,
          );
          return;
        }
      }
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
      finishingRef.current = false;
      const remainingAtStart = remainingRef.current;
      if (
        remainingAtStart != null &&
        remainingAtStart > 0 &&
        remainingAtStart <= 60
      ) {
        oneMinuteWarnedRef.current = true;
        warnRemainingQuota(remainingAtStart);
      } else {
        oneMinuteWarnedRef.current = false;
      }
      setSeconds(0);
      setStatus("recording");
    } catch (error) {
      showInfoNotice(
        "마이크 권한이 필요해요",
        "브라우저 설정에서 마이크 권한을 허용한 뒤 다시 시도해 주세요.",
      );
    }
  };

  const handleFinish = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || status === "processing") return;
    if (runningSinceRef.current != null) {
      elapsedMsRef.current += Date.now() - runningSinceRef.current;
      runningSinceRef.current = null;
    }
    finishingRef.current = true;
    const remaining = remainingRef.current;
    let durationSeconds = Math.max(0, Math.round(elapsedMsRef.current / 1000));
    if (remaining != null && remaining > 0 && durationSeconds > remaining) {
      durationSeconds = remaining;
    }
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
      showInfoNotice(
        "녹음된 음성이 없어요",
        "잠시 녹음한 뒤 다시 종료해 주세요.",
      );
      elapsedMsRef.current = 0;
      runningSinceRef.current = null;
      finishingRef.current = false;
      setStatus("ready");
      setSeconds(0);
      return;
    }
    try {
      const uploaded = await uploadRecording({
        audioBlob,
        userSettings,
        seconds: durationSeconds,
      });
      if (meteredRef.current) {
        const next = await consumeUsage(durationSeconds);
        if (next) setUsage(next);
      }
      showToastNotice(
        "녹음이 저장되었습니다.",
        "회의록 분석은 이어서 진행됩니다.",
      );
      onSaved(uploaded.meetingId);
      void processMeeting({
        meetingId: uploaded.meetingId,
        userSettings,
        attendees: selectedAttendees,
        liveMemo,
      }).then((result) => {
        if (!result.processed) return;
        void addMinutesReadyNotice(
          userSettings.user_id,
          uploaded.meetingId,
        );
        showToastNotice(
          "회의록이 성공적으로 생성되었습니다.",
          "회의 목록에서 확인해 주세요.",
        );
        window.dispatchEvent(new Event("raple:meetings-changed"));
      });
    } catch (error: any) {
      downloadRecordingBlob(audioBlob);
      showInfoNotice(
        "회의록을 만들지 못했어요",
        `${error.message || "연결이 끊겼습니다."}\n\n녹음 원본은 이 기기에 파일로 저장했습니다. 서버에 올라간 경우 직접 삭제하기 전까지 회의 목록에도 남아 있습니다.`,
      );
      finishingRef.current = false;
      setStatus("ready");
    }
  };

  finishRef.current = () => {
    void handleFinish();
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
  const metered = isDefaultEngine(userSettings.ai_engine);
  const remainingLabel =
    metered && usage ? formatUsageClock(usage.remainingSeconds) : null;

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
    timeString,
    usage,
    remainingLabel,
    exhausted: metered && isUsageExhausted(usage),
    handleStartRecording,
    handleFinish,
    togglePause,
  };
}
