"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const items = [
  "실시간 녹음",
  "AI 회의록",
  "후속 조치",
  "맞춤 템플릿",
  "타임라인",
  "인사이트",
  "회의 알림",
  "다크 모드",
  "소셜 로그인",
];

export default function Marquee() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((value) => (value + 1) % items.length);
    }, 1700);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="bg-white py-12 sm:py-16">
      <p className="mb-8 text-center font-display text-[12px] font-semibold tracking-[0.18em] text-[#9AA3AF]">
        BUILT FOR THE WHOLE MEETING
      </p>
      <motion.div
        className="mx-auto flex max-w-[820px] flex-wrap justify-center gap-2.5 px-5 sm:gap-3 sm:px-8"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.05 } },
        }}
      >
        {items.map((item, index) => {
          const on = index === active;
          return (
            <motion.button
              key={item}
              type="button"
              variants={{
                hidden: { opacity: 0, y: 14, scale: 0.96 },
                show: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setActive(index)}
              className="relative rounded-2xl bg-[#F3F4F6] px-5 py-3.5 text-[16px] font-semibold tracking-[-0.03em] sm:px-6 sm:py-4 sm:text-[18px]"
            >
              {on ? (
                <motion.span
                  layoutId="meeting-feature-active"
                  className="absolute inset-0 rounded-2xl bg-[#0B1220]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span
                className={`relative z-10 transition-colors duration-200 ${
                  on ? "text-white" : "text-[#111827]"
                }`}
              >
                {item}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
}
