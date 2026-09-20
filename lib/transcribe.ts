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

function audioFileFromBlob(audioBlob: Blob) {
  const extension = audioBlob.type.includes("mp4") ? "mp4" : "webm";
  return new File([audioBlob], `meeting_recording.${extension}`, {
    type: audioBlob.type,
  });
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
  if (!response.ok) throw new Error(`서버 오류 (${response.status})`);
  const result = await response.json();
  if (!result.success || !result.meeting_id) {
    throw new Error(result.error || "녹음 업로드에 실패했습니다.");
  }
  return { meetingId: String(result.meeting_id) };
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
    if (!response.ok) return { processed: false };
    const result = await response.json();
    return { processed: result.success === true };
  } catch (error) {
    console.error("회의록 분석 연결 끊김:", error);
    return { processed: false };
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
