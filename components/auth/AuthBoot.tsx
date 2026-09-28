"use client";

import { motion } from "framer-motion";
import Logo from "@/components/landing/Logo";

const ease = [0.22, 1, 0.36, 1] as const;

/** Neutral boot screen while auth session is resolving. */
export default function AuthBoot() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease }}
    >
      <motion.div
        initial={{ opacity: 0.55, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease }}
      >
        <Logo className="h-7 w-auto" />
      </motion.div>
    </motion.div>
  );
}
