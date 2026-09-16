import { getApiUrl } from "@/lib/api";
import { formatManualsForPrompt, ReplyManual } from "@/lib/manuals";

export async function transcribeRecording({
  audioBlob,
  userSettings,
  seconds,
  attendees,
  liveMemo,
}: {
  audioBlob: Blob;
  userSettings: {
    user_id: string;
    ai_engine: string;
    api_key: string;
    keywords: string;
    custom_template: string;
    manuals: ReplyManual[];
  };
  seconds: number;
  attendees: string[];
  liveMemo: string;
}) {
  const extension = audioBlob.type.includes("mp4") ? "mp4" : "webm";
  const audioFile = new File([audioBlob], `meeting_recording.${extension}`, {
    type: audioBlob.type,
  });
  const formData = new FormData();
  formData.append("file", audioFile);
  formData.append("user_id", userSettings.user_id);
  formData.append("engine", userSettings.ai_engine);
  formData.append("api_key", userSettings.api_key);
  formData.append("keywords", userSettings.keywords);
  formData.append(
    "duration",
    String(Math.max(0, Math.round(Number(seconds) || 0))),
  );

  const attendeesStr = attendees.join(", ");
  if (attendeesStr) formData.append("attendees", attendeesStr);
  if (userSettings.manuals.length > 0) {
    formData.append("manuals", JSON.stringify(userSettings.manuals));
  }

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
  formData.append("custom_template", finalTemplate);

  const response = await fetch(`${getApiUrl()}/api/meetings/transcribe`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error(`서버 오류 (${response.status})`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result;
}
