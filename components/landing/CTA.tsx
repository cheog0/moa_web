"use client";

import { ArrowRight } from "lucide-react";
import Magnetic from "@/components/landing/Magnetic";
import Reveal from "@/components/landing/Reveal";
import { APP_URL } from "@/lib/site";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-black px-5 py-28 text-center text-white sm:px-8">
      <div className="cta-glow" />
      <Reveal className="relative">
        <p className="font-display text-[12px] font-semibold tracking-[0.18em] text-white/45">
          START YOUR NEXT MEETING
        </p>
        <h2 className="mt-5 text-[40px] font-extrabold leading-[1.1] tracking-[-0.05em] sm:text-[64px]">
          더 나은 회의는
          <br />
          지금 시작됩니다.
        </h2>
        <p className="mt-5 text-[16px] text-white/55">
          무료로 시작하고, 회의가 문서로 남는 순간을 경험해 보세요.
        </p>
        <Magnetic className="mt-10 inline-flex">
          <a
            href={APP_URL}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-black"
          >
            무료로 시작하기
            <ArrowRight className="size-4" />
          </a>
        </Magnetic>
      </Reveal>
    </section>
  );
}
