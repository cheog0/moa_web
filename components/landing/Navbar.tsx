"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Logo from "@/components/landing/Logo";
import StoreBadges from "@/components/landing/StoreBadges";
import { APP_URL } from "@/lib/site";

const links = [
  { href: "#how", label: "사용 방법" },
  { href: "#features", label: "기능" },
  { href: "#templates", label: "템플릿" },
  { href: "#faq", label: "FAQ" },
  { href: "#app", label: "앱" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const appsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!appsOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!appsRef.current?.contains(event.target as Node)) setAppsOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAppsOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [appsOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-black text-white">
      <div className="flex h-16 w-full items-center justify-between px-5 sm:px-8 lg:px-10">
        <a href="#top" className="flex items-center" aria-label="Raple 홈">
          <Logo dark className="h-[22px]" />
        </a>
        <nav className="hidden items-center gap-6 text-[14px] text-white/70 sm:flex lg:gap-8">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div ref={appsRef} className="relative hidden sm:block">
            <button
              type="button"
              aria-expanded={appsOpen}
              aria-haspopup="menu"
              onClick={() => setAppsOpen((value) => !value)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border-0 bg-transparent px-4 text-[13px]! font-semibold! leading-none! text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] transition-colors hover:bg-white/10"
            >
              앱 설치
              <ChevronDown className={`size-[13px] transition-transform ${appsOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {appsOpen ? (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-[calc(100%+10px)] z-50 flex w-[240px] flex-col gap-1.5 rounded-[20px] bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
                >
                  <StoreBadges menu />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <a
            href={APP_URL}
            className="inline-flex h-9 items-center rounded-full bg-white px-3.5 text-[13px] font-semibold leading-none text-[#1C1F24]"
          >
            무료로 시작하기
          </a>
          <button
            type="button"
            className="rounded-lg p-2 text-white sm:hidden"
            aria-label={open ? "메뉴 닫기" : "메뉴"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-white/10 bg-black px-5 py-4 sm:hidden"
          >
            <div className="flex flex-col gap-1 text-sm text-white/75">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
