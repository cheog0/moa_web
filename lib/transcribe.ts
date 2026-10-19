import { getApiUrl } from "@/lib/api";
import { toTranscribeApiKey, toTranscribeEngine } from "@/lib/engines";
import { formatManualsForPrompt, ReplyManual } from "@/lib/manuals";

type UserSettingsPayload = {
  user_id: string;
  ai_engine: string;
  api_key: string;
  keywords: string;
  custom_template: string;
  manuals: ReplyManual[];
};

function normalizeUploadMime(type: string, filename = "") {
  const lowered = (type || "").toLowerCase().split(";", 1)[0].trim();
  const name = filename.toLowerCase();
  if (lowered === "video/webm" || lowered === "audio/webm" || name.endsWith(".webm")) {
    return { type: "audio/webm", extension: "webm" };
  }
  if (
    lowered === "audio/mpeg" ||
    lowered === "audio/mp3" ||
    name.endsWith(".mp3") ||
    name.endsWith(".mpeg")
  ) {
    return { type: "audio/mpeg", extension: "mp3" };
  }
  if (lowered === "audio/wav" || name.endsWith(".wav")) {
    return { type: "audio/wav", extension: "wav" };
  }
  if (
    lowered === "video/mp4" ||
    lowered === "audio/mp4" ||
    lowered === "audio/m4a" ||
    lowered === "audio/x-m4a" ||
    lowered === "audio/aac" ||
    name.endsWith(".m4a") ||
    name.endsWith(".mp4") ||
    name.endsWith(".aac")
  ) {
    return { type: "audio/mp4", extension: name.endsWith(".mp4") ? "mp4" : "m4a" };
  }
  if (lowered.startsWith("audio/")) {
    const extension = lowered.includes("ogg")
      ? "ogg"
      : lowered.includes("wav")
        ? "wav"
        : "webm";
    return { type: lowered, extension };
  }
  return { type: "audio/webm", extension: "webm" };
}

function audioFileFromBlob(audioBlob: Blob) {
  const originalName =
    audioBlob instanceof File && audioBlob.name
      ? audioBlob.name
      : "meeting_recording";
  const { type, extension } = normalizeUploadMime(audioBlob.type, originalName);
  const base =
    originalName.includes(".")
      ? originalName.replace(/\.[^.]+$/, "")
      : originalName || "meeting_recording";
  return new File([audioBlob], `${base}.${extension}`, { type });
}

function readDurationViaElement(file: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    let settled = false;
    const finish = (seconds: number) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve(Math.max(0, Math.round(seconds || 0)));
    };
    const timer = window.setTimeout(() => finish(0), 8_000);
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      window.clearTimeout(timer);
      const duration = audio.duration;
      finish(Number.isFinite(duration) && duration !== Infinity ? duration : 0);
    };
    audio.onerror = () => {
      window.clearTimeout(timer);
      finish(0);
    };
    audio.src = url;
  });
}

async function readDurationViaDecode(file: Blob): Promise<number> {
  const AudioCtx =
    typeof window !== "undefined"
      ? window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      : undefined;
  if (!AudioCtx) return 0;
  let ctx: AudioContext | null = null;
  try {
    ctx = new AudioCtx();
    const buffer = await file.arrayBuffer();
    const decoded = await ctx.decodeAudioData(buffer.slice(0));
    const seconds = decoded.duration;
    return Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : 0;
  } catch {
    return 0;
  } finally {
    try {
      await ctx?.close();
    } catch {
      /* ignore */
    }
  }
}

/** Best-effort duration for uploaded audio files (seconds). */
export async function readAudioDurationSeconds(file: Blob): Promise<number> {
  const viaElement = await readDurationViaElement(file);
  if (viaElement > 0) return viaElement;
  return readDurationViaDecode(file);
}

function buildProcessTemplate({
  userSettings,
  attendees,
  liveMemo,
}: {
  userSettings: UserSettingsPayload;
  attendees: string[];
  liveMemo: string;
}) {
  const attendeesStr = attendees.join(", ");
  const manualsContext = formatManualsForPrompt(userSettings.manuals);
  let finalTemplate = userSettings.custom_template;
  if (liveMemo.trim() || attendeesStr || manualsContext) {
    const defaultStructure = `{\n  "summary": "회의 핵심 내용",\n  "decisions": "결정된 사항",\n  "action_items": [{"task": "후속 조치", "question": "관련 질문", "commitment": "우리 측 약속", "timestamp": "12:35", "speaker": "화자 2"}],\n  "reply_draft": "고객사/상대방에게 보낼 정중한 비즈니스 회신 메일 초안"\n}`;
    let extraContext = "";
    if (attendeesStr) extraContext += `[참석자]: ${attendeesStr}\n`;
    if (liveMemo.trim())
      extraContext += `[사용자 현장 실시간 메모]\n${liveMemo}\n`;
    if (manualsContext) extraContext += manualsContext;
    finalTemplate = `${extraContext}\n⚠️ AI 지시사항: 위 참석자 정보, 현장 메모, 업무 매뉴얼을 오디오 스크립트 해석과 회신 초안 작성 시 최우선으로 반영하세요.\n\n[출력 템플릿 구조]\n${userSettings.custom_template || defaultStructure}`;
  }
  return finalTemplate;
}

export async function uploadRecording({
  audioBlob,
  userSettings,
  seconds,
}: {
  audioBlob: Blob;
  userSettings: UserSettingsPayload;
  seconds: number;
}) {
  const formData = new FormData();
  formData.append("file", audioFileFromBlob(audioBlob));
  formData.append("user_id", userSettings.user_id);
  formData.append("keywords", userSettings.keywords);
  formData.append(
    "duration",
    String(Math.max(0, Math.round(Number(seconds) || 0))),
  );
  formData.append(
    "api_key",
    toTranscribeApiKey(userSettings.ai_engine, userSettings.api_key),
  );

  const response = await fetch(`${getApiUrl()}/api/meetings/upload`, {
    method: "POST",
    body: formData,
  });
  let result: { success?: boolean; meeting_id?: string; error?: string } = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }
  if (!response.ok) {
    throw new Error(
      result.error || `서버 오류 (${response.status}). 잠시 후 다시 시도해 주세요.`,
    );
  }
  if (!result.success || !result.meeting_id) {
    throw new Error(result.error || "녹음 업로드에 실패했습니다.");
  }
  return { meetingId: String(result.meeting_id) };
}

async function waitForMinutesReady(meetingId: string) {
  const started = Date.now();
  const timeoutMs = 45 * 60 * 1000;
  const intervalMs = 4_000;
  while (Date.now() - started < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    try {
      const response = await fetch(
        `${getApiUrl()}/api/meetings/${meetingId}/minutes`,
      );
      if (!response.ok) continue;
      const data = await response.json();
      if (data.success && data.minutes) return true;
    } catch {
      // keep polling through transient network blips
    }
  }
  return false;
}

export async function processMeeting({
  meetingId,
  userSettings,
  attendees,
  liveMemo,
}: {
  meetingId: string;
  userSettings: UserSettingsPayload;
  attendees: string[];
  liveMemo: string;
}) {
  const formData = new FormData();
  formData.append("engine", toTranscribeEngine(userSettings.ai_engine));
  formData.append(
    "api_key",
    toTranscribeApiKey(userSettings.ai_engine, userSettings.api_key),
  );
  formData.append(
    "custom_template",
    buildProcessTemplate({ userSettings, attendees, liveMemo }),
  );

  try {
    const response = await fetch(
      `${getApiUrl()}/api/meetings/${meetingId}/process`,
      {
        method: "POST",
        body: formData,
      },
    );
    let result: {
      success?: boolean;
      processed?: boolean;
      error?: string;
    } = {};
    try {
      result = await response.json();
    } catch {
      result = {};
    }
    if (!response.ok) {
      return {
        processed: false,
        error:
          result.error ||
          `회의록 분석 요청에 실패했습니다. (${response.status})`,
      };
    }
    // /process returns success:true as soon as the job is queued.
    // Only treat minutes as ready when the API says so, or after they exist.
    if (result.success !== true) {
      return {
        processed: false,
        error: result.error || "회의록 분석에 실패했습니다.",
      };
    }
    if (result.processed === true) return { processed: true };
    const ready = await waitForMinutesReady(meetingId);
    if (!ready) {
      return {
        processed: false,
        error:
          "회의록 생성이 오래 걸리거나 실패했습니다. 회의 목록에서 다시 확인해 주세요.",
      };
    }
    return { processed: true };
  } catch (error) {
    console.error("회의록 분석 연결 끊김:", error);
    return {
      processed: false,
      error: "회의록 분석 중 연결이 끊겼습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export function downloadRecordingBlob(blob: Blob) {
  const extension = blob.type.includes("mp4") ? "mp4" : "webm";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `meeting-recording-${stamp}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
