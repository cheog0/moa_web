import { getApiUrl } from "@/lib/api";

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
  formData.append("duration", seconds.toString());

  const attendeesStr = attendees.join(", ");
  if (attendeesStr) formData.append("attendees", attendeesStr);

  let finalTemplate = userSettings.custom_template;
  if (liveMemo.trim() || attendeesStr) {
    const defaultStructure = `{\n  "summary": "회의 핵심 내용",\n  "decisions": "결정된 사항",\n  "action_items": []\n}`;
    let extraContext = "";
    if (attendeesStr) extraContext += `[참석자]: ${attendeesStr}\n`;
    if (liveMemo.trim())
      extraContext += `[사용자 현장 실시간 메모]\n${liveMemo}\n`;
    finalTemplate = `${extraContext}\n⚠️ AI 지시사항: 위 참석자 정보 및 현장 메모의 내용, 고유명사를 오디오 스크립트 해석 시 최우선으로 반영하세요.\n\n[출력 템플릿 구조]\n${userSettings.custom_template || defaultStructure}`;
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
