"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Reveal from "@/components/landing/Reveal";

const faqs = [
  {
    q: "무료로 쓸 수 있나요?",
    a: "네. 기본 엔진은 래플이 API를 제공하고, 무료 회원은 월 사용량 한도 안에서 바로 녹음할 수 있습니다. 본인 API 키를 연결한 엔진은 그 한도에 잡히지 않습니다.",
  },
  {
    q: "어떤 음성 엔진을 쓰나요?",
    a: "기본 엔진 외에 Google Gemini, Deepgram, Soniox, ClovaNote를 설정에서 고를 수 있습니다. 기본이 아닌 엔진은 본인 API 키가 필요합니다.",
  },
  {
    q: "회의록은 나중에 고칠 수 있나요?",
    a: "문서 뷰에서 원문 편집으로 요약과 후속 조치를 수정하고 저장할 수 있습니다. 전체 대화에서는 발화 구간으로 음성을 찾아갈 수도 있습니다.",
  },
  {
    q: "팀에 맞는 양식으로 만들 수 있나요?",
    a: "미팅, 데일리 스크럼, 기본 회의 템플릿이 준비되어 있고, 필요한 포맷은 내 템플릿으로 추가해 쓰면 됩니다. 업무 매뉴얼로 회신 초안 기준도 맞출 수 있습니다.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[760px]">
        <Reveal>
          <h2 className="text-[36px] font-extrabold tracking-[-0.045em] text-black sm:text-[52px]">
            자주 묻는 질문
          </h2>
        </Reveal>
        <div className="mt-10 divide-y divide-[#E5E7EB]">
          {faqs.map((item, index) => {
            const active = open === index;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(active ? -1 : index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-[18px] font-semibold tracking-[-0.03em] text-black">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-[#8B95A5] transition-transform ${active ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {active ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-[15px] leading-7 text-[#5B6573]">
                        {item.a}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
