"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "@/components/landing/Logo";
import { APP_URL } from "@/lib/site";

const links = [
  { href: "#how", label: "사용 방법" },
  { href: "#features", label: "기능" },
  { href: "#templates", label: "템플릿" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-black text-white">
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center" aria-label="Raple 홈">
          <Logo dark className="h-[22px]" />
        </a>
        <nav className="hidden items-center gap-8 text-[14px] text-white/70 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href={APP_URL}
            className="inline-flex items-center rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black"
          >
            무료로 시작하기
          </a>
          <button
            type="button"
            className="rounded-lg p-2 text-white md:hidden"
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
            className="border-t border-white/10 bg-black px-5 py-4 md:hidden"
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
