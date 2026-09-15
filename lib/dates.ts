export function formatMeetingDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date
    .toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(/\./g, ".")
    .replace(/\s/g, " ");
}

export function formatTimeAgo(dateStr: string, now = new Date()) {
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const time = date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (diffMins < 60) return "방금 전";
  if (diffHours < 24) return `오늘 · ${time}`;
  if (diffDays === 1) return `어제 · ${time}`;
  return `${diffDays}일 전 · ${time}`;
}
