import Logo from "@/components/landing/Logo";
import { APP_URL } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-black px-5 py-10 text-white/55 sm:px-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center gap-x-6 gap-y-3">
        <a href="#top" aria-label="Raple 홈">
          <Logo dark />
        </a>
        <p className="text-[13px]">말하고, 기록하고, 앞으로.</p>
        <div className="ml-auto flex flex-wrap gap-5 text-[13px] text-white/70">
          <a href="#features">기능</a>
          <a href="#templates">템플릿</a>
          <a href="#faq">FAQ</a>
          <a href={APP_URL}>무료로 시작하기</a>
        </div>
        <small className="w-full text-[11px] text-white/40 sm:w-auto">
          © 2026 Raple. All rights reserved.
        </small>
      </div>
    </footer>
  );
}
