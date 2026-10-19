import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_ENGINE_ID,
  engineRequiresOwnKey,
  isDefaultEngine,
  missingApiKeyMessage,
  normalizeEngine,
} from "@/lib/engines";
import { TEMPLATE_SALES } from "@/lib/constants";
import { normalizeManuals, ReplyManual } from "@/lib/manuals";
import {
  processMeeting,
  readAudioDurationSeconds,
  uploadRecording,
} from "@/lib/transcribe";
import {
  fetchUsage,
  formatUsageClock,
  FREE_MONTHLY_MINUTES,
  isUsageExhausted,
  notifyUsageChanged,
  type UsageSnapshot,
} from "@/lib/usage";
import { addMinutesReadyNotice } from "@/lib/notifications";
import { showInfoNotice, showToastNotice } from "@/lib/notice";

// Browsers often report MediaRecorder webm as video/webm (audio-only).
const ACCEPT = /^(audio\/|video\/(webm|mp4))/i;
const ACCEPT_EXT = /\.(webm|mp3|m4a|mp4|wav|aac|ogg|mpeg)$/i;

export function useAudioUpload(onSaved: (meetingId: string) => void) {
  const [status, setStatus] = useState<"ready" | "uploading">("ready");
  const [settingsReady, setSettingsReady] = useState(false);
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);
  const [userSettings, setUserSettings] = useState({
    user_id: "",
    ai_engine: DEFAULT_ENGINE_ID,
    api_key: "",
    keywords: "기획",
    custom_template: "",
    manuals: [] as ReplyManual[],
  });

  useEffect(() => {
    const load = async () => {
      try {
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
        if (isDefaultEngine(engine)) {
          const next = await fetchUsage();
          setUsage(next);
        } else {
          setUsage(null);
        }
      } finally {
        setSettingsReady(true);
      }
    };
    void load();
  }, []);

  const metered = isDefaultEngine(userSettings.ai_engine);
  const exhausted = metered && isUsageExhausted(usage);
  const remainingSeconds =
    metered && usage ? usage.remainingSeconds : null;
  const remainingLabel =
    remainingSeconds != null ? formatUsageClock(remainingSeconds) : null;

  const uploadFile = async (file: File) => {
    if (status === "uploading") return;
    if (!settingsReady || !userSettings.user_id) {
      showInfoNotice(
        "잠시만요",
        "계정 정보를 불러오는 중입니다. 잠깐 뒤 다시 시도해 주세요.",
      );
      return;
    }
    if (
      engineRequiresOwnKey(userSettings.ai_engine) &&
      !userSettings.api_key.trim()
    ) {
      showInfoNotice(
        "API 키가 필요해요",
        missingApiKeyMessage(userSettings.ai_engine),
      );
      return;
    }
    if (exhausted) {
      showInfoNotice(
        "이번 달 사용량을 다 썼어요",
        `기본 엔진은 한 달에 ${FREE_MONTHLY_MINUTES}분까지 사용할 수 있습니다. 다음 달에 다시 이용하거나 설정에서 내 API 키를 연결해 주세요.`,
      );
      return;
    }
    if (!ACCEPT.test(file.type) && !ACCEPT_EXT.test(file.name)) {
      showInfoNotice(
        "지원하지 않는 파일이에요",
        "mp3, m4a, wav, webm, aac 같은 음성 파일을 올려 주세요.",
      );
      return;
    }

    setStatus("uploading");
    try {
      const durationSeconds = await readAudioDurationSeconds(file);
      if (metered) {
        const remaining = usage?.remainingSeconds ?? 0;
        if (durationSeconds <= 0) {
          showInfoNotice(
            "파일 길이를 확인하지 못했어요",
            "남은 시간보다 긴 파일은 올릴 수 없어서, 길이를 읽지 못하면 업로드를 막아요. mp3·m4a·wav로 다시 시도하거나 설정에서 내 API 키를 연결해 주세요.",
          );
          setStatus("ready");
          return;
        }
        if (remaining <= 0 || durationSeconds > remaining) {
          showInfoNotice(
            "이번 달 남은 시간이 부족해요",
            `파일 길이 ${formatUsageClock(durationSeconds)} · 남은 시간 ${formatUsageClock(remaining)}\n더 짧은 파일로 나누거나 설정에서 API 키를 연결해 주세요.`,
          );
          setStatus("ready");
          return;
        }
      }

      const uploaded = await uploadRecording({
        audioBlob: file,
        userSettings,
        seconds: durationSeconds,
      });
      if (metered) {
        const next = await fetchUsage();
        if (next) setUsage(next);
        notifyUsageChanged();
      }
      showToastNotice(
        "음성 파일이 저장되었습니다.",
        "회의록 분석은 이어서 진행됩니다.",
      );
      onSaved(uploaded.meetingId);
      void processMeeting({
        meetingId: uploaded.meetingId,
        userSettings,
        attendees: [],
        liveMemo: "",
      }).then((result) => {
        if (metered) {
          void fetchUsage().then((next) => {
            if (next) setUsage(next);
            notifyUsageChanged();
          });
        }
        if (!result.processed) {
          showInfoNotice(
            "회의록을 만들지 못했어요",
            result.error ||
              "음성은 저장됐지만 회의록 분석에 실패했습니다. 설정에서 엔진/API 키를 확인한 뒤 다시 시도해 주세요.",
          );
          return;
        }
        void addMinutesReadyNotice(userSettings.user_id, uploaded.meetingId);
        showToastNotice(
          "회의록이 성공적으로 생성되었습니다.",
          "회의 목록에서 확인해 주세요.",
        );
        window.dispatchEvent(new Event("raple:meetings-changed"));
      });
    } catch (error: any) {
      showInfoNotice(
        "파일을 올리지 못했어요",
        error.message || "업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
      setStatus("ready");
    }
  };

  return {
    status,
    exhausted,
    remainingSeconds,
    remainingLabel,
    uploadFile,
  };
}
