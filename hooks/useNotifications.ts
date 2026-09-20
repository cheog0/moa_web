import { useEffect, useState } from "react";
import {
  loadNotices,
  markAllNoticesRead,
  NOTICES_CHANGED_EVENT,
  unreadNoticeCount,
  type AppNotice,
} from "@/lib/notifications";

export function useNotifications(userId?: string) {
  const [items, setItems] = useState<AppNotice[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      setUnread(0);
      return;
    }
    const refresh = () => {
      setItems(loadNotices(userId));
      setUnread(unreadNoticeCount(userId));
    };
    refresh();
    window.addEventListener(NOTICES_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(NOTICES_CHANGED_EVENT, refresh);
  }, [userId]);

  const markAllRead = () => {
    if (!userId) return;
    markAllNoticesRead(userId);
  };

  return { items, unread, markAllRead };
}
