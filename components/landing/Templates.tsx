"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, FileText, Sparkles, Zap } from "lucide-react";
import Reveal from "@/components/landing/Reveal";

export default function Templates() {
  return (
    <section id="templates" className="scroll-mt-20 bg-white px-5 py-24 sm:px-8">
      <div className="mx-auto grid max-w-[1100px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="font-display text-[11px] font-extrabold tracking-[0.22em] text-[#2F7DE0]">
            MADE FOR YOUR TEAM
          </p>
          <h2 className="mt-4 text-[36px] font-extrabold leading-[1.12] tracking-[-0.045em] text-black sm:text-[52px]">
            우리 팀의 방식대로,
            <br />
            <span className="text-[#2F7DE0]">더 똑똑하게.</span>
          </h2>
          <p className="mt-5 max-w-[460px] text-[16px] leading-7 text-[#748298]">
            미팅, 데일리 스크럼, 기본 회의 양식을 바로 쓰고, 팀에 맞는 포맷은
            내 템플릿으로 추가해 같은 품질의 회의록을 만드세요.
          </p>
          <div className="mt-8 divide-y divide-[#E5EBF3] border-t border-[#E5EBF3]">
            {[
              ["맞춤 템플릿", "기본 양식은 미리보기로, 내 양식만 수정", FileText],
              ["업무 매뉴얼", "회신 초안에 팀의 기준을 반영", Zap],
            ].map(([title, copy, Icon]) => {
              const ItemIcon = Icon as typeof FileText;
              return (
                <div key={title as string} className="flex items-center gap-3 py-4">
                  <ItemIcon className="size-5 text-[#2F7DE0]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-[#1C1F24]">{title as string}</p>
                    <p className="text-[12px] text-[#8190A3]">{copy as string}</p>
                  </div>
                  <ArrowRight className="size-4 text-[#90A1B5]" />
                </div>
              );
            })}
          </div>
        </Reveal>
        <Reveal delay={0.12} className="relative">
          <div className="rounded-[26px] bg-[#F2F6FC] p-6 sm:p-8">
            <div className="rounded-[14px] border border-[#E4EAF3] bg-white p-7 shadow-[0_20px_40px_rgba(166,184,206,0.26)]">
              <p className="text-[10px] font-extrabold tracking-[0.16em] text-[#2F7DE0]">
                DAILY SCRUM
              </p>
              <h3 className="mt-3 text-[24px] font-extrabold tracking-tight text-[#1C1F24]">
                데일리 스크럼
              </h3>
              <p className="mt-1 text-[12px] text-[#94A0B0]">2026년 9월 23일 · 09:30</p>
              <div className="my-5 h-px bg-[#EDF0F5]" />
              <p className="text-[13px] font-bold text-[#1C1F24]">오늘의 요약</p>
              <div className="mt-2 h-2 w-[92%] rounded-full bg-[#EDF1F7]" />
              <div className="mt-2 h-2 w-[74%] rounded-full bg-[#EDF1F7]" />
              <p className="mt-5 text-[13px] font-bold text-[#1C1F24]">후속 조치</p>
              <div className="mt-2 rounded-lg bg-[#F3F8FF] px-3 py-2 text-[12px] text-[#5275A9]">
                신규 온보딩 플로우 적용
              </div>
              <div className="mt-2 rounded-lg bg-[#F3F8FF] px-3 py-2 text-[12px] text-[#5275A9]">
                다음 주 월요일 배포
              </div>
            </div>
          </div>
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-2 top-3 inline-flex items-center gap-1.5 rounded-xl border border-[#E2EAF5] bg-white px-3 py-2 text-[11px] font-semibold text-[#55708E] shadow-lg"
          >
            <Sparkles className="size-3.5 text-[#2F7DE0]" />
            AI가 정리했어요
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-4 left-1 inline-flex items-center gap-1.5 rounded-xl border border-[#E2EAF5] bg-white px-3 py-2 text-[11px] font-semibold text-[#55708E] shadow-lg"
          >
            <CalendarDays className="size-3.5 text-[#2F7DE0]" />
            9월 23일
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
