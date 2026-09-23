"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Mic, Sparkles } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import { APP_URL } from "@/lib/site";

const WAVE = [22, 40, 18, 52, 28, 44, 16, 36, 24, 48, 20, 42];

export default function How() {
  return (
    <section id="how" className="scroll-mt-20 bg-white px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1180px]">
        <Reveal>
          <h2 className="max-w-[780px] text-[36px] font-extrabold leading-[1.12] tracking-[-0.045em] text-black sm:text-[56px]">
            말하는 순간부터
            <br />
            실행까지, 한 흐름으로.
          </h2>
        </Reveal>

        <div id="features" className="mt-14 space-y-16 sm:mt-20 sm:space-y-24">
          <Reveal>
            <article>
              <div className="relative grid min-h-[280px] place-items-center overflow-hidden rounded-[28px] bg-[#07111F] px-6 py-16 sm:min-h-[420px] sm:px-10">
                <div className="pointer-events-none absolute inset-0 opacity-40">
                  <div className="absolute left-1/2 top-1/2 size-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2F7DE0] blur-[90px]" />
                  <div className="absolute bottom-0 right-0 size-[280px] rounded-full bg-[#4C9AFF] blur-[80px]" />
                </div>
                <div className="relative flex items-center justify-center gap-1.5">
                  {WAVE.slice(0, 6).map((base, index) => (
                    <motion.i
                      key={`left-${index}`}
                      className="block w-2 shrink-0 rounded-full bg-white sm:w-2.5"
                      animate={{ height: [base * 1.2, base * 3.1, base * 1.4] }}
                      transition={{
                        duration: 1.1 + (index % 4) * 0.12,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                  <div className="mx-3 grid size-16 shrink-0 place-items-center rounded-[22px] bg-white text-black shadow-xl sm:mx-4 sm:size-20">
                    <Mic className="size-7" />
                  </div>
                  {WAVE.slice(6).map((base, index) => (
                    <motion.i
                      key={`right-${index}`}
                      className="block w-2 shrink-0 rounded-full bg-white sm:w-2.5"
                      animate={{ height: [base * 1.2, base * 3.1, base * 1.4] }}
                      transition={{
                        duration: 1.1 + (index % 4) * 0.12,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>
              <h3 className="mt-8 text-[28px] font-extrabold tracking-[-0.04em] text-black sm:text-[36px]">
                실시간으로 받아적어요
              </h3>
              <p className="mt-3 max-w-[640px] text-[16px] leading-7 text-[#5B6573] sm:text-[18px]">
                새 회의 시작을 누르고 대화에 집중하세요. 참석자와 현장 메모까지
                함께 남길 수 있습니다.
              </p>
            </article>
          </Reveal>

          <Reveal>
            <article>
              <div className="overflow-hidden rounded-[28px] bg-[#F4F6F8] px-6 py-10 sm:px-10 sm:py-14">
                <div className="mx-auto max-w-[560px] rounded-[22px] bg-white p-6 shadow-[0_20px_50px_rgba(16,24,40,0.08)] sm:p-8">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-[#2F7DE0]">
                    MEETING NOTES
                  </p>
                  <div className="mt-5 space-y-3">
                    {["오늘의 핵심을 세 줄로 정리", "결정 사항을 빠짐없이 남김", "담당자와 다음 액션을 붙임"].map(
                      (line, index) => (
                        <motion.p
                          key={line}
                          initial={{ opacity: 0.25, x: 8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.15 * index }}
                          className="flex items-start gap-3 text-[16px] font-medium text-[#1C1F24]"
                        >
                          <Sparkles className="mt-0.5 size-4 text-[#2F7DE0]" />
                          {line}
                        </motion.p>
                      ),
                    )}
                  </div>
                </div>
              </div>
              <h3 className="mt-8 text-[28px] font-extrabold tracking-[-0.04em] text-black sm:text-[36px]">
                회의가 끝나면 AI가 정리해요
              </h3>
              <p className="mt-3 max-w-[640px] text-[16px] leading-7 text-[#5B6573] sm:text-[18px]">
                녹음은 바로 저장되고, 분석은 뒤에서 이어집니다. 요약과 후속 조치가
                준비되면 알려 드려요.
              </p>
            </article>
          </Reveal>

          <Reveal>
            <article>
              <div className="overflow-hidden rounded-[28px] bg-black px-6 py-10 sm:px-10 sm:py-14">
                <div className="mx-auto max-w-[560px] space-y-3">
                  {["온보딩 초안 공유", "월요일 배포 일정 확정", "알림 드롭다운 적용"].map(
                    (item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.12 * index }}
                        className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-[15px] font-semibold text-black"
                      >
                        <span className="grid size-6 place-items-center rounded-full bg-[#2F7DE0] text-white">
                          <Check className="size-3.5" />
                        </span>
                        {item}
                      </motion.div>
                    ),
                  )}
                </div>
              </div>
              <h3 className="mt-8 text-[28px] font-extrabold tracking-[-0.04em] text-black sm:text-[36px]">
                다음 액션이 선명해져요
              </h3>
              <p className="mt-3 max-w-[640px] text-[16px] leading-7 text-[#5B6573] sm:text-[18px]">
                할 일과 담당자를 회의록에서 바로 확인하고, 타임라인에 묶어 팀의
                실행으로 이어 가세요.
              </p>
              <a
                href={APP_URL}
                className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-black"
              >
                래플에서 시작하기
                <ArrowRight className="size-4" />
              </a>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
