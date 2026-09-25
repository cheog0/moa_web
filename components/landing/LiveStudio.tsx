"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Mic } from "lucide-react";

const scenes = [
  {
    id: "kickoff",
    label: "킥오프",
    lines: [
      { who: "민준", text: "이번 스프린트는 온보딩 흐름을 먼저 맞추죠." },
      { who: "서연", text: "금요일까지 초안 공유할게요." },
      { who: "지훈", text: "배포는 다음 주 월요일로 잡겠습니다." },
    ],
    summary: "온보딩 초안을 금요일까지 공유하고, 월요일 배포로 일정을 맞춥니다.",
    actions: ["온보딩 초안 공유 · 서연", "월요일 배포 확정 · 지훈"],
  },
  {
    id: "scrum",
    label: "스크럼",
    lines: [
      { who: "하린", text: "알림 드롭다운은 오늘 안에 붙일 수 있어요." },
      { who: "도윤", text: "템플릿 저장은 한 버튼으로 통일했습니다." },
      { who: "하린", text: "내일 오전에 같이 한 번 보면 좋겠어요." },
    ],
    summary: "알림 UI와 템플릿 저장을 마무리하고, 내일 오전에 함께 확인합니다.",
    actions: ["알림 드롭다운 적용 · 하린", "내일 오전 리뷰 · 팀"],
  },
  {
    id: "sync",
    label: "리뷰",
    lines: [
      { who: "지아", text: "초안은 흐름은 괜찮은데 결론이 빠져 있어요." },
      { who: "현우", text: "결정이랑 담당자를 맨 위에 올려둘게요." },
      { who: "지아", text: "좋아요. 내일 오전에 한 번 더 보고 공유하죠." },
    ],
    summary: "초안 결론과 담당자를 앞에 두고, 내일 오전에 다시 보고 공유합니다.",
    actions: ["결론과 담당자 정리 · 현우", "내일 오전 재검토 · 지아"],
  },
] as const;

export default function LiveStudio() {
  const [sceneId, setSceneId] = useState<(typeof scenes)[number]["id"]>("kickoff");
  const [playId, setPlayId] = useState(0);
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<"live" | "notes">("live");
  const scene = useMemo(
    () => scenes.find((item) => item.id === sceneId) ?? scenes[0],
    [sceneId],
  );
  const fullText = scene.lines.map((line) => `${line.who}: ${line.text}`).join("\n");

  const play = (id: (typeof scenes)[number]["id"]) => {
    setSceneId(id);
    setPlayId((value) => value + 1);
    setTyped(0);
    setPhase("live");
  };

  useEffect(() => {
    let count = 0;
    let notesTimer = 0;
    const id = window.setInterval(() => {
      count += 1;
      if (count >= fullText.length) {
        setTyped(fullText.length);
        window.clearInterval(id);
        notesTimer = window.setTimeout(() => setPhase("notes"), 700);
        return;
      }
      setTyped(count);
    }, 28);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(notesTimer);
    };
  }, [fullText, playId]);

  const visible = fullText.slice(0, typed);
  const rows = visible.split("\n");

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#E8EAEE] bg-white shadow-[0_30px_80px_rgba(16,24,40,0.12)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF1F5] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-[#E11D48]">
          <span className="relative grid size-6 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#E11D48]/20" />
            <Mic className="size-3.5" />
          </span>
          실시간 회의
        </div>
      </div>

      <div className="min-h-[320px] px-4 py-5 sm:min-h-[360px] sm:px-6">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "live" ? (
            <motion.div
              key={`live-${scene.id}-${playId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 text-[15px] leading-7 text-[#1C1F24] sm:text-[16px]"
            >
              {rows.map((row, index) => {
                const [who, ...rest] = row.split(": ");
                const text = rest.join(": ");
                return (
                  <p key={`${row}-${index}`}>
                    <span className="mr-2 font-semibold text-[#2F7DE0]">{who}</span>
                    <span>{text}</span>
                    {index === rows.length - 1 ? (
                      <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-[#2F7DE0] align-middle" />
                    ) : null}
                  </p>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key={`notes-${scene.id}-${playId}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div>
                <p className="text-[11px] font-bold tracking-[0.16em] text-[#2F7DE0]">
                  SUMMARY
                </p>
                <p className="mt-2 text-[16px] font-semibold leading-7 tracking-[-0.02em] text-[#1C1F24]">
                  {scene.summary}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-bold tracking-[0.16em] text-[#2F7DE0]">
                  ACTION ITEMS
                </p>
                {scene.actions.map((action) => (
                  <div
                    key={action}
                    className="flex items-center gap-2 rounded-xl bg-[#F3F8FF] px-3 py-2.5 text-[14px] text-[#35598A]"
                  >
                    <Check className="size-4 text-[#2F7DE0]" />
                    {action}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF1F5] px-4 py-3 sm:px-5">
        <div className="flex flex-wrap gap-2">
          {scenes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => play(item.id)}
              className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                item.id === sceneId
                  ? "bg-[#2F7DE0] text-white"
                  : "bg-[#F3F5F8] text-[#5B6573] hover:bg-[#E9EEF5]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="text-[12px] text-[#8B95A5]">
          {phase === "live" ? "받아적는 중" : "AI가 정리했어요"}
        </p>
      </div>
    </div>
  );
}
