"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "@/components/landing/Logo";

export default function Intro({
  open,
  onSkip,
}: {
  open: boolean;
  onSkip: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onSkip, 3400);
    return () => window.clearTimeout(timer);
  }, [open, onSkip]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex flex-col bg-white text-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex h-16 items-center justify-between px-5 sm:px-8">
            <Logo className="h-5 bg-white" />
            <button
              type="button"
              onClick={onSkip}
              className="text-[13px] font-medium text-black/40 transition-colors hover:text-black"
            >
              Skip intro
            </button>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <Logo className="h-10 bg-white sm:h-12" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-8 text-center text-[18px] font-medium tracking-[-0.03em] text-black/50 sm:text-[22px]"
            >
              말하고, 기록하고, 정리하고.
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
