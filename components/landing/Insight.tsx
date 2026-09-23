"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import { APP_URL } from "@/lib/site";

const bars = [38, 62, 48, 86, 70, 42, 31];
const days = ["월", "화", "수", "목", "금", "토", "일"];

export default function Insight() {
  return (
    <section className="bg-black px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-[1180px] items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <p className="font-display text-[11px] font-extrabold tracking-[0.22em] text-[#87B0FF]">
            A CLEARER RECORD
          </p>
          <h2 className="mt-4 text-[36px] font-extrabold leading-[1.12] tracking-[-0.045em] sm:text-[52px]">
            기억에 의존하지 않는
            <br />
            <span className="text-[#80AAFF]">팀의 새로운 습관.</span>
          </h2>
          <p className="mt-5 max-w-[440px] text-[16px] leading-7 text-[#A5B3C9]">
            요약부터 후속 조치까지. 래플은 팀이 같은 페이지를 보게 합니다.
            인사이트에서 이번 달 회의 패턴도 한눈에 확인할 수 있어요.
          </p>
          <a
            href={APP_URL}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-semibold text-[#1E5FCB]"
          >
            래플 둘러보기
            <ArrowRight className="size-4" />
          </a>
        </Reveal>
        <Reveal delay={0.12} y={48}>
          <motion.div
            whileHover={{ rotate: 0 }}
            className="rotate-2 rounded-[22px] border border-[#385174] bg-gradient-to-br from-[#1D3157] to-[#111F3D] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.28)]"
          >
            <div className="flex items-center justify-between text-[12px] text-[#AEBDD2]">
              <span className="inline-flex items-center gap-2 text-[#B9D2FF]">
                <Sparkles className="size-4" />
                AI 회의 인사이트
              </span>
              <span>이번 달</span>
            </div>
            <h3 className="mt-8 text-[26px] font-bold leading-snug tracking-[-0.03em]">
              우리 팀은 언제
              <br />
              <span className="text-[#84AFFF]">가장 많이 기록</span>할까요?
            </h3>
            <div className="mt-6 flex h-[132px] items-end gap-2.5 border-b border-[#405476]">
              {bars.map((height, index) => (
                <motion.i
                  key={days[index]}
                  className="block flex-1 rounded-t-md bg-gradient-to-t from-[#2759A6] to-[#76AAFF]"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.08 * index }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-[#7588A6]">
              {days.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <p className="mt-6 inline-flex items-center gap-2 text-[12px] text-[#9FE2BF]">
              <Check className="size-3.5" />
              목요일 회의가 가장 많이 쌓였어요
            </p>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
