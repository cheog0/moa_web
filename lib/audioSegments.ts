export function parseClock(timeStr: string): number {
  const parts = String(timeStr || "0:00")
    .split(":")
    .map((part) => Number(part) || 0);
  if (parts.length >= 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function locateSegment(durations: number[], globalSeconds: number) {
  let acc = 0;
  for (let i = 0; i < durations.length; i++) {
    const duration = durations[i] || 0;
    const isLast = i === durations.length - 1;
    if (duration <= 0 && !isLast) {
      return { index: i, offset: Math.max(0, globalSeconds - acc) };
    }
    if (globalSeconds < acc + duration || isLast) {
      return { index: i, offset: Math.max(0, globalSeconds - acc) };
    }
    acc += duration;
  }
  return { index: 0, offset: Math.max(0, globalSeconds) };
}

export function offsetBefore(durations: number[], index: number): number {
  return durations.slice(0, Math.max(0, index)).reduce((sum, value) => sum + (value || 0), 0);
}
