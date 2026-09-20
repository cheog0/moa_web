import { useEffect, useMemo, useRef, useState } from "react";
import { MeetingMinutes } from "@/lib/constants";
import { ActionItem, normalizeActionItems } from "@/lib/actionItems";
import { downloadTranscriptFile, seekAudio } from "@/lib/download";
import { showInfoNotice } from "@/lib/notice";

export function useDetail({
  minutes,
  meeting,
  onClose,
  onUpdateTitle,
  onUpdateMinutes,
}: {
  minutes?: MeetingMinutes;
  meeting: any;
  onClose: () => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onUpdateMinutes: (
    id: string,
    updatedMinutes: Partial<MeetingMinutes>,
  ) => void;
}) {
  const [tab, setTab] = useState<"minutes" | "transcript">("minutes");
  const [meetingTitle, setMeetingTitle] = useState(meeting?.title || "새 회의");
  const [summaryText, setSummaryText] = useState(minutes?.summary || "");
  const [decisionsText, setDecisionsText] = useState(minutes?.decisions || "");
  const [actionItems, setActionItems] = useState<ActionItem[]>(() =>
    normalizeActionItems(minutes?.action_items),
  );
  const [replyDraft, setReplyDraft] = useState(minutes?.reply_draft || "");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [printOptions, setPrintOptions] = useState({
    decisions: true,
    actionItems: true,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState("00:00");

  const loadedActionItems = useMemo(
    () => normalizeActionItems(minutes?.action_items),
    [minutes],
  );
  const loadedReplyDraft = minutes?.reply_draft || "";

  const hasChanges =
    meetingTitle !== (meeting?.title || "새 회의") ||
    summaryText !== (minutes?.summary || "") ||
    decisionsText !== (minutes?.decisions || "") ||
    JSON.stringify(actionItems) !== JSON.stringify(loadedActionItems) ||
    replyDraft !== loadedReplyDraft;

  useEffect(() => {
    if (hasChanges) setSaveStatus("idle");
  }, [hasChanges]);

  useEffect(() => {
    if (minutes) {
      setSummaryText(minutes.summary || "");
      setDecisionsText(minutes.decisions || "");
      setActionItems(normalizeActionItems(minutes.action_items));
      setReplyDraft(minutes.reply_draft || "");
    }
  }, [minutes]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      const current = audio.currentTime;
      const m = Math.floor(current / 60);
      const s = Math.floor(current % 60);
      setCurrentTimeDisplay(
        `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [meeting?.audio_url]);

  const dateStr = meeting?.created_at
    ? new Date(meeting.created_at).toLocaleDateString("ko-KR")
    : new Date().toLocaleDateString("ko-KR");

  const normalizedTranscript = useMemo(() => {
    const t = minutes?.transcript;
    if (typeof t === "string") {
      try {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return t;
  }, [minutes?.transcript]);

  const persistChanges = () => {
    if (!meeting?.id) return;
    if (meetingTitle !== meeting.title) onUpdateTitle(meeting.id, meetingTitle);
    if (
      summaryText !== minutes?.summary ||
      decisionsText !== minutes?.decisions ||
      JSON.stringify(actionItems) !== JSON.stringify(loadedActionItems) ||
      replyDraft !== loadedReplyDraft
    ) {
      onUpdateMinutes(meeting.id, {
        summary: summaryText,
        decisions: decisionsText,
        action_items: actionItems,
        reply_draft: replyDraft,
      });
    }
  };

  const handlePrintPDF = () => {
    setTab("minutes");
    setTimeout(() => window.print(), 100);
  };

  return {
    tab,
    setTab,
    meetingTitle,
    setMeetingTitle,
    summaryText,
    setSummaryText,
    decisionsText,
    setDecisionsText,
    actionItems,
    replyDraft,
    setReplyDraft,
    toggleActionItem: (id: string) => {
      setActionItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, done: !item.done } : item,
        ),
      );
    },
    isPreviewMode,
    setIsPreviewMode,
    isDownloadOpen,
    setIsDownloadOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    saveStatus,
    printOptions,
    setPrintOptions,
    audioRef,
    isPlaying,
    currentTimeDisplay,
    hasChanges,
    dateStr,
    normalizedTranscript,
    hideUI: isPreviewMode ? "hidden" : "print:hidden",
    showPrintBlock: isPreviewMode ? "block" : "hidden print:block",
    handlePrintPDF,
    handleManualSave: () => {
      if (!meeting?.id || !hasChanges) return;
      setSaveStatus("saving");
      persistChanges();
      setTimeout(() => setSaveStatus("saved"), 600);
    },
    handleSmartClose: () => {
      if (hasChanges && meeting?.id) persistChanges();
      onClose();
    },
    togglePlay: () => {
      if (!audioRef.current) return;
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
    },
    handleSeek: (timeStr: string) => {
      if (audioRef.current) seekAudio(audioRef.current, timeStr);
    },
    handleDownloadAudio: () => {
      if (!meeting?.audio_url) {
        showInfoNotice(
          "다운로드할 음성이 없어요",
          "이 회의에는 저장된 음성 파일이 없습니다.",
        );
        return;
      }
      try {
        window.open(meeting.audio_url, "_blank");
      } catch (e) {
        showInfoNotice(
          "음성을 열 수 없어요",
          "음성 다운로드에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        );
      }
    },
    handleDownloadTranscript: () =>
      downloadTranscriptFile(normalizedTranscript, meetingTitle),
  };
}
