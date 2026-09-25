import type { Metadata } from "next";
import Logo from "@/components/landing/Logo";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 래플",
  description:
    "래플이 구글 로그인 정보와 회의 기록을 어떻게 다루는지 설명합니다.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-[#E8EAEE]">
        <div className="mx-auto flex h-16 w-full max-w-[760px] items-center px-5">
          <a href="/" aria-label="Raple 홈">
            <Logo />
          </a>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[760px] px-5 py-12 sm:py-16">
        <h1 className="text-[32px] font-extrabold tracking-[-0.04em] sm:text-[40px]">
          개인정보처리방침
        </h1>
        <p className="mt-3 text-[14px] text-[#5B6573]">시행일 2026년 9월 25일</p>
        <div className="mt-10 space-y-8 text-[15px] leading-7 text-[#1C1F24]">
          <p>
            래플(raple.co.kr)은 회의를 녹음하고, 받아쓴 뒤, 요약과 후속 조치로
            정리하는 서비스입니다. 이 방침은 그 과정에서 어떤 정보를 다루는지
            설명합니다.
          </p>

          <section>
            <h2 className="text-[18px] font-bold tracking-[-0.03em]">
              계정 정보
            </h2>
            <p className="mt-2">
              이메일과 비밀번호로 가입할 수 있습니다. 카카오 로그인을 쓰면
              카카오가 제공하는 이메일과 닉네임을 받습니다. 구글 로그인을 쓰면
              구글 계정의 이름, 이메일, 프로필 사진을 받습니다. 이 정보는
              계정을 만들고, 로그인을 유지하고, 화면에 사용자를 표시하는 데만
              씁니다.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold tracking-[-0.03em]">
              구글 사용자 데이터
            </h2>
            <p className="mt-2">
              구글 로그인의 권한은 기본 프로필과 이메일입니다. 래플은 이
              정보로 광고를 하지 않고, 팔지 않으며, 회의 내용과 합쳐 다른
              회사에 넘기지 않습니다. 구글에서 받은 사용자 데이터는 이 방침에
              적힌 로그인과 계정 표시 목적 밖으로 쓰지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold tracking-[-0.03em]">
              회의 기록
            </h2>
            <p className="mt-2">
              녹음 파일, 회의 제목, 참석자, 받아쓴 내용, 요약, 후속 조치,
              템플릿, 업무 매뉴얼은 그 사용자의 계정에 저장됩니다. 기본 음성
              엔진은 래플이 제공하는 엔진으로 음성을 글로 바꿉니다. 설정에서
              Google Gemini, Deepgram, Soniox, ClovaNote를 고르면 사용자가
              넣은 API 키로 그 서비스에 음성이 전달됩니다. API 키도 그
              사용자의 설정에 저장됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold tracking-[-0.03em]">
              보관과 삭제
            </h2>
            <p className="mt-2">
              계정, 회의 기록, 녹음 파일, 설정은 서비스를 제공하는 동안
              보관합니다. 설정에서 회원 탈퇴를 하면 계정과 저장된 회의록,
              녹음 파일, 설정을 삭제합니다. 로그인 상태는 브라우저에
              남습니다.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold tracking-[-0.03em]">
              처리를 맡기는 곳
            </h2>
            <p className="mt-2">
              계정과 회의 데이터는 Supabase에, 웹사이트는 Vercel에
              둡니다. Vercel Analytics로 방문 통계를 봅니다. 사용자가 직접
              고른 음성 엔진이 있을 때만 해당 엔진 제공자에게 음성이
              전달됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold tracking-[-0.03em]">문의</h2>
            <p className="mt-2">
              개인정보와 관련된 문의는{" "}
              <a
                href="mailto:cheogo09@gmail.com"
                className="underline underline-offset-4"
              >
                cheogo09@gmail.com
              </a>
              으로 보내 주세요.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
