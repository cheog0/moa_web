import { showInfoNotice } from "@/lib/notice";

export function downloadTranscriptFile(transcript: any, meetingTitle: string) {
  if (!transcript) {
    showInfoNotice(
      "다운로드할 내용이 없어요",
      "대화 내용이 아직 없어서 파일로 저장할 수 없습니다.",
    );
    return;
  }
  let content = "";
  if (typeof transcript === "string") content = transcript;
  else if (Array.isArray(transcript)) {
    content = transcript
      .map(
        (t) =>
          `[${t.time || "00:00"}] ${t.speaker || "알 수 없음"}: ${t.text || ""}`,
      )
      .join("\n\n");
  }
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${meetingTitle || "회의록"}_전체대화.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function seekAudio(audio: HTMLAudioElement, timeStr: string) {
  const parts = timeStr.split(":").map(Number);
  let seconds = 0;
  if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
  if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  audio.currentTime = seconds;
  audio.play();
}

function extensionFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const ext = path.split(".").pop()?.toLowerCase();
    if (ext && ["m4a", "mp4", "wav", "webm"].includes(ext)) return ext;
  } catch {
    /* ignore */
  }
  return "m4a";
}

export async function downloadAudioFiles(urls: string[], meetingTitle: string) {
  const title = meetingTitle || "회의녹음";
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const ext = extensionFromUrl(url);
    const name =
      urls.length === 1 ? `${title}.${ext}` : `${title}_${String(i + 1).padStart(2, "0")}.${ext}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(String(response.status));
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = name;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, "_blank");
    }
    if (i < urls.length - 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 400));
    }
  }
}
