import { supabase } from "@/lib/supabase";

export type AppNotice = {
  meetingId: string;
  title: string;
  createdAt: string;
  read: boolean;
};

export const NOTICES_CHANGED_EVENT = "raple:notices-changed";

const MAX_ITEMS = 50;

function storageKey(userId: string) {
  return `raple_in_app_notifications:${userId}`;
}

function notifyChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOTICES_CHANGED_EVENT));
}

export function loadNotices(userId: string): AppNotice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const list = JSON.parse(raw) as AppNotice[];
    return Array.isArray(list)
      ? list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      : [];
  } catch {
    return [];
  }
}

function saveNotices(userId: string, items: AppNotice[]) {
  localStorage.setItem(
    storageKey(userId),
    JSON.stringify(items.slice(0, MAX_ITEMS)),
  );
  notifyChanged();
}

export function unreadNoticeCount(userId: string) {
  return loadNotices(userId).filter((item) => !item.read).length;
}

export function markAllNoticesRead(userId: string) {
  const items = loadNotices(userId);
  if (items.every((item) => item.read)) return;
  saveNotices(
    userId,
    items.map((item) => ({ ...item, read: true })),
  );
}

export async function addMinutesReadyNotice(
  userId: string,
  meetingId: string,
  fallbackTitle = "새 회의",
) {
  let title = fallbackTitle;
  try {
    const { data } = await supabase
      .from("meetings")
      .select("title")
      .eq("id", meetingId)
      .maybeSingle();
    const next = (data?.title as string | undefined)?.trim();
    if (next) title = next;
  } catch {
    // keep fallback
  }

  const items = loadNotices(userId).filter(
    (item) => item.meetingId !== meetingId,
  );
  saveNotices(userId, [
    {
      meetingId,
      title,
      createdAt: new Date().toISOString(),
      read: false,
    },
    ...items,
  ]);
}

export function relativeNoticeLabel(iso: string) {
  const createdAt = new Date(iso);
  const diff = Date.now() - createdAt.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 30) return "방금 전";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  return `${createdAt.getFullYear()}. ${createdAt.getMonth() + 1}. ${createdAt.getDate()}.`;
}

export function completedNoticeLabel(iso: string) {
  const createdAt = new Date(iso);
  const now = new Date();
  const two = (n: number) => String(n).padStart(2, "0");
  const time = `${two(createdAt.getHours())}:${two(createdAt.getMinutes())}`;
  const sameDay =
    now.getFullYear() === createdAt.getFullYear() &&
    now.getMonth() === createdAt.getMonth() &&
    now.getDate() === createdAt.getDate();
  if (sameDay) return `오늘 ${time}에 완료`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    yesterday.getFullYear() === createdAt.getFullYear() &&
    yesterday.getMonth() === createdAt.getMonth() &&
    yesterday.getDate() === createdAt.getDate()
  ) {
    return `어제 ${time}에 완료`;
  }
  return `${createdAt.getMonth() + 1}. ${createdAt.getDate()}. ${time}에 완료`;
}
