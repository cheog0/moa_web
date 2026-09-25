"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { Check, Mic } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import StoreBadges from "@/components/landing/StoreBadges";

const wave = [10, 18, 12, 22, 14, 20, 11, 17, 13, 21, 12, 16];

export default function Download() {
  return (
    <section id="app" className="scroll-mt-20 bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-[1180px] items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <p className="font-display text-[11px] font-extrabold tracking-[0.22em] text-[#2F7DE0]">
            ALSO ON YOUR PHONE
          </p>
          <h2 className="mt-4 text-[36px] font-extrabold leading-[1.12] tracking-[-0.045em] text-black sm:text-[52px]">
            휴대폰에서도
            <br />
            같은 회의록.
          </h2>
          <p className="mt-5 max-w-[520px] text-[16px] leading-8 text-[#5B6573]">
            아이폰과 안드로이드에서 녹음하고, 웹에서 이어서 볼 수{"\u00a0"}있습니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <StoreBadges />
          </div>
        </Reveal>

        <Reveal delay={0.08} className="relative mx-auto w-full max-w-[260px]">
          <PhoneStage />
        </Reveal>
      </div>
    </section>
  );
}

function PhoneStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { once: true, amount: 0.4 });
  const [scene, setScene] = useState<"live" | "notes">("live");

  const rotateX = useSpring(0, { stiffness: 120, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 120, damping: 18 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(30);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.28), transparent 42%)`;

  useEffect(() => {
    if (!inView) return;
    setScene("live");
    const timer = window.setTimeout(() => setScene("notes"), 2800);
    const loop = window.setInterval(() => {
      setScene((value) => (value === "live" ? "notes" : "live"));
    }, 5200);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(loop);
    };
  }, [inView]);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 18);
    rotateX.set((0.5 - py) * 14);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };

  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(28);
  };

  return (
    <div
      ref={stageRef}
      className="relative [perspective:1200px]"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="pointer-events-none absolute inset-x-8 bottom-2 h-10 rounded-full bg-black/10 blur-2xl" />
      <motion.div
        className="relative will-change-transform [transform-style:preserve-3d]"
        style={{ rotateX, rotateY }}
        animate={inView ? { y: [0, -6, 0] } : undefined}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative overflow-hidden rounded-[38px] border border-[#1A2333]/70 bg-[#0B1220] p-[5px] shadow-[0_34px_70px_rgba(15,23,42,0.18)]">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 mix-blend-soft-light"
            style={{ background: glare }}
          />
          <div className="relative overflow-hidden rounded-[33px] bg-[#F4F6F8]">
            <div className="bg-white px-5 pb-3 pt-3">
              <div className="mx-auto h-[22px] w-[96px] rounded-full bg-[#0B1220]" />
              <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-[#9AA1AA]">
                <span>09:41</span>
                <span>래플</span>
              </div>
            </div>

            <div className="relative h-[390px] px-4 pb-5 pt-2">
              <AnimatePresence mode="wait" initial={false}>
                {scene === "live" ? (
                  <motion.div
                    key="live"
                    initial={{ opacity: 0, filter: "blur(8px)", y: 18 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={{ opacity: 0, filter: "blur(8px)", y: -16 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-x-4 top-2"
                  >
                    <LiveScene />
                  </motion.div>
                ) : (
                  <motion.div
                    key="notes"
                    initial={{ opacity: 0, filter: "blur(8px)", y: 18 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={{ opacity: 0, filter: "blur(8px)", y: -16 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-x-4 top-2"
                  >
                    <NotesScene />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function LiveScene() {
  return (
    <div className="space-y-3">
      <div className="rounded-[24px] bg-[#0B1220] px-4 py-5 text-white">
        <div className="flex items-center gap-2 text-[12px] text-white/55">
          <span className="size-1.5 animate-pulse rounded-full bg-[#EF4444]" />
          녹음 중 · 12:48
        </div>
        <div className="mt-5 flex h-12 items-end justify-center gap-1">
          {wave.map((base, index) => (
            <motion.i
              key={index}
              className="block w-1.5 origin-bottom rounded-full bg-[#4C9AFF]"
              style={{ height: base * 2.2 }}
              animate={{ scaleY: [0.4, 1, 0.55] }}
              transition={{
                duration: 0.95 + (index % 5) * 0.08,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#EF4444] shadow-[0_12px_30px_rgba(239,68,68,0.35)]">
            <Mic className="size-5 text-white" />
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-white px-3.5 py-3">
        <p className="text-[12px] font-semibold text-[#2F7DE0]">서연</p>
        <p className="mt-1 text-[13px] leading-5 text-[#3A4350]">
          금요일까지 초안 공유할게요.
        </p>
      </div>
      <div className="rounded-2xl bg-white/70 px-3.5 py-3 text-[12px] text-[#8B95A5]">
        받아쓰는 중...
      </div>
    </div>
  );
}

function NotesScene() {
  return (
    <div className="space-y-3">
      <div className="rounded-[24px] bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-[#059669]">
          <span className="flex size-5 items-center justify-center rounded-full bg-[#ECFDF5]">
            <Check className="size-3" />
          </span>
          AI가 정리했어요
        </div>
        <p className="mt-3 text-[11px] font-semibold tracking-[0.12em] text-[#8B95A5]">
          SUMMARY
        </p>
        <p className="mt-1.5 text-[14px] font-semibold leading-6 tracking-[-0.02em] text-[#1C1F24]">
          온보딩 초안을 금요일까지 공유하고, 월요일 배포로 일정을 맞춥니다.
        </p>
      </div>
      <div className="rounded-2xl bg-white px-3.5 py-3">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-[#8B95A5]">
          ACTION
        </p>
        <div className="mt-2 space-y-2">
          {["온보딩 초안 공유 · 서연", "월요일 배포 확정 · 지훈"].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + index * 0.1, duration: 0.35 }}
              className="flex items-center gap-2 text-[13px] text-[#3A4350]"
            >
              <span className="size-1.5 rounded-full bg-[#4C9AFF]" />
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
