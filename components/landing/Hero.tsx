"use client";

import { ArrowRight } from "lucide-react";
import LiveStudio from "@/components/landing/LiveStudio";
import Magnetic from "@/components/landing/Magnetic";
import Reveal from "@/components/landing/Reveal";
import { APP_URL } from "@/lib/site";

export default function Hero() {
  return (
    <section className="relative bg-white pt-[88px]">
      <div className="mx-auto w-full max-w-[1180px] px-5 pb-8 pt-10 sm:px-8 sm:pt-16">
        <Reveal y={18}>
          <p className="font-display text-[13px] font-semibold tracking-[0.08em] text-[#6B7280]">
            Raple is here
          </p>
        </Reveal>
        <Reveal delay={0.08} y={24}>
          <h1 className="mt-4 max-w-[920px] text-[42px] font-extrabold leading-[1.08] tracking-[-0.05em] text-black sm:text-[64px] lg:text-[80px]">
            회의가 끝나면,
            <br />
            <span className="mask-title">일이 시작됩니다.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.16} y={18}>
          <p className="mt-6 max-w-[560px] text-[17px] leading-8 text-[#5B6573] sm:text-[19px]">
            대화에 집중하세요. 래플이 녹음부터 AI 요약, 후속 조치까지
            실행 가능한 회의록으로 남겨 드립니다.
          </p>
        </Reveal>
        <Reveal delay={0.22} y={16}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Magnetic>
              <a
                href={APP_URL}
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-[14px] font-semibold text-white"
              >
                무료로 시작하기
                <ArrowRight className="size-4" />
              </a>
            </Magnetic>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-5 py-3 text-[14px] font-semibold text-black"
            >
              어떻게 작동하나요?
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.12} y={36} className="mt-12 sm:mt-16">
          <LiveStudio />
        </Reveal>
      </div>
    </section>
  );
}
