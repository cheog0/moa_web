"use client";

import { useEffect, useState } from "react";
import InfoDialog from "@/components/ui/InfoDialog";
import { INFO_NOTICE_EVENT, type InfoNotice } from "@/lib/notice";

export default function InfoNoticeHost() {
  const [notice, setNotice] = useState<InfoNotice | null>(null);

  useEffect(() => {
    const onNotice = (event: Event) => {
      const detail = (event as CustomEvent<InfoNotice>).detail;
      if (!detail?.title || !detail.description) return;
      setNotice(detail);
    };
    window.addEventListener(INFO_NOTICE_EVENT, onNotice);
    return () => window.removeEventListener(INFO_NOTICE_EVENT, onNotice);
  }, []);

  if (!notice) return null;

  return (
    <InfoDialog
      title={notice.title}
      description={notice.description}
      onClose={() => setNotice(null)}
    />
  );
}
