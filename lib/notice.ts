export type InfoNotice = {
  title: string;
  description: string;
};

export const INFO_NOTICE_EVENT = "raple:info-notice";

export function showInfoNotice(title: string, description: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<InfoNotice>(INFO_NOTICE_EVENT, {
      detail: { title, description },
    }),
  );
}
