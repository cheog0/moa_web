/** Screen Wake Lock — keeps the device from sleeping mid-recording. */

let sentinel: WakeLockSentinel | null = null;
let wanted = false;

async function acquire() {
  if (!wanted) return;
  if (typeof navigator === "undefined" || !navigator.wakeLock?.request) return;
  if (document.visibilityState !== "visible") return;
  try {
    sentinel = await navigator.wakeLock.request("screen");
    sentinel.addEventListener("release", () => {
      sentinel = null;
    });
  } catch {
    sentinel = null;
  }
}

export async function startRecordingWakeLock() {
  wanted = true;
  await acquire();
}

export async function stopRecordingWakeLock() {
  wanted = false;
  try {
    await sentinel?.release();
  } catch {
    // ignore
  }
  sentinel = null;
}

export function bindRecordingWakeLockVisibility() {
  const onVisibility = () => {
    if (document.visibilityState === "visible") void acquire();
  };
  document.addEventListener("visibilitychange", onVisibility);
  return () => document.removeEventListener("visibilitychange", onVisibility);
}
