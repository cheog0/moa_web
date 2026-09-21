import { useEffect, useMemo, useRef, useState } from "react";
import { MeetingMinutes } from "@/lib/constants";
import { ActionItem, normalizeActionItems } from "@/lib/actionItems";
import { getApiUrl } from "@/lib/api";
import {
  formatClock,
  locateSegment,
  offsetBefore,
  parseClock,
} from "@/lib/audioSegments";
import { downloadAudioFiles, downloadTranscriptFile } from "@/lib/download";
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
  ) => Promise<void>;
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
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [currentSrc, setCurrentSrc] = useState("");
  const urlsRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const durationsRef = useRef<number[]>([]);
  const pendingOffsetRef = useRef<number | null>(null);
  const pendingPlayRef = useRef(false);

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
    let cancelled = false;
    const existing = Array.isArray(meeting?.audio_urls)
      ? meeting.audio_urls.filter(Boolean)
      : [];
    const fallback = meeting?.audio_url ? [meeting.audio_url] : [];
    setAudioUrls(existing.length ? existing : fallback);
    if (!meeting?.id) return;

    (async () => {
      try {
        const res = await fetch(
          `${getApiUrl()}/api/meetings/${meeting.id}/recordings`,
        );
        const data = await res.json();
        if (
          !cancelled &&
          data.success &&
          Array.isArray(data.urls) &&
          data.urls.length
        ) {
          setAudioUrls(data.urls);
        }
      } catch (error) {
        console.error("녹음 목록 로드 실패", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [meeting?.id, meeting?.audio_url, meeting?.audio_urls]);

  useEffect(() => {
    urlsRef.current = audioUrls;
    indexRef.current = 0;
    durationsRef.current = audioUrls.map(() => 0);
    pendingOffsetRef.current = null;
    pendingPlayRef.current = false;
    setCurrentSrc(audioUrls[0] || "");
    setCurrentTimeDisplay("00:00");
    setIsPlaying(false);

    audioUrls.forEach((url, i) => {
      const probe = new Audio();
      probe.preload = "metadata";
      probe.src = url;
      probe.onloadedmetadata = () => {
        durationsRef.current[i] = probe.duration || 0;
      };
    });
  }, [audioUrls]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSrc) return;

    const applyPending = () => {
      durationsRef.current[indexRef.current] = audio.duration || durationsRef.current[indexRef.current] || 0;
      const offset = pendingOffsetRef.current;
      if (offset != null) {
        try {
          audio.currentTime = Math.min(offset, Math.max(0, (audio.duration || offset) - 0.05));
        } catch {
          /* ignore */
        }
        pendingOffsetRef.current = null;
      }
      if (pendingPlayRef.current) {
        pendingPlayRef.current = false;
        audio.play().catch(() => setIsPlaying(false));
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      const global =
        offsetBefore(durationsRef.current, indexRef.current) + (audio.currentTime || 0);
      setCurrentTimeDisplay(formatClock(global));
    };
    const onEnded = () => {
      const next = indexRef.current + 1;
      if (next < urlsRef.current.length) {
        indexRef.current = next;
        pendingOffsetRef.current = 0;
        pendingPlayRef.current = true;
        setCurrentSrc(urlsRef.current[next]);
        return;
      }
      setIsPlaying(false);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("loadedmetadata", applyPending);
    if (audio.readyState >= 1) applyPending();

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("loadedmetadata", applyPending);
    };
  }, [currentSrc]);

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

  const persistChanges = async () => {
    if (!meeting?.id) return;
    if (meetingTitle !== meeting.title) onUpdateTitle(meeting.id, meetingTitle);
    if (
      summaryText !== minutes?.summary ||
      decisionsText !== minutes?.decisions ||
      JSON.stringify(actionItems) !== JSON.stringify(loadedActionItems) ||
      replyDraft !== loadedReplyDraft
    ) {
      await onUpdateMinutes(meeting.id, {
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
    audioUrls,
    currentSrc,
    isPlaying,
    currentTimeDisplay,
    hasChanges,
    dateStr,
    normalizedTranscript,
    hideUI: isPreviewMode ? "hidden" : "print:hidden",
    showPrintBlock: isPreviewMode ? "block" : "hidden print:block",
    handlePrintPDF,
    handleManualSave: async () => {
      if (!meeting?.id || !hasChanges) return;
      setSaveStatus("saving");
      try {
        await persistChanges();
        setSaveStatus("saved");
      } catch (error) {
        console.error(error);
        setSaveStatus("idle");
        showInfoNotice(
          "저장되지 않았어요",
          "회의록 변경사항을 저장하지 못했습니다. 다시 시도해 주세요.",
        );
      }
    },
    handleSmartClose: async () => {
      if (hasChanges && meeting?.id) {
        try {
          await persistChanges();
        } catch (error) {
          console.error(error);
          showInfoNotice(
            "저장되지 않았어요",
            "회의록 변경사항을 저장하지 못했습니다. 다시 시도해 주세요.",
          );
          return;
        }
      }
      onClose();
    },
    togglePlay: () => {
      const audio = audioRef.current;
      const urls = urlsRef.current;
      if (!audio || !urls.length) return;
      if (isPlaying) {
        audio.pause();
        return;
      }
      const atEnd = audio.ended && indexRef.current >= urls.length - 1;
      if (atEnd) {
        indexRef.current = 0;
        pendingOffsetRef.current = 0;
        pendingPlayRef.current = true;
        if (urls[0] === currentSrc) {
          try {
            audio.currentTime = 0;
          } catch {
            /* ignore */
          }
          pendingPlayRef.current = false;
          audio.play().catch(() => setIsPlaying(false));
          return;
        }
        setCurrentSrc(urls[0]);
        return;
      }
      audio.play().catch(() => setIsPlaying(false));
    },
    handleSeek: (timeStr: string) => {
      const urls = urlsRef.current;
      if (!urls.length) return;
      const { index, offset } = locateSegment(
        durationsRef.current,
        parseClock(timeStr),
      );
      pendingPlayRef.current = true;
      if (index !== indexRef.current || urls[index] !== currentSrc) {
        indexRef.current = index;
        pendingOffsetRef.current = offset;
        setCurrentSrc(urls[index]);
        return;
      }
      const audio = audioRef.current;
      if (!audio) return;
      try {
        audio.currentTime = offset;
      } catch {
        pendingOffsetRef.current = offset;
      }
      audio.play().catch(() => setIsPlaying(false));
    },
    handleDownloadAudio: async () => {
      if (!audioUrls.length) {
        showInfoNotice(
          "다운로드할 음성이 없어요",
          "이 회의에는 저장된 음성 파일이 없습니다.",
        );
        return;
      }
      try {
        await downloadAudioFiles(audioUrls, meetingTitle);
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
