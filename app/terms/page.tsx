import type { Metadata } from "next";
import Logo from "@/components/landing/Logo";

export const metadata: Metadata = {
  title: "서비스 이용약관 | 래플",
  description: "래플 서비스 이용과 관련된 이용약관입니다.",
};

export default function TermsPage() {
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
          서비스 이용약관
        </h1>
        <p className="mt-3 text-[14px] text-[#5B6573]">시행일 2026년 9월 25일</p>
        <div className="mt-10 space-y-8 text-[15px] leading-7 text-[#1C1F24]">
          <section>
            <h2 className="text-[18px] font-bold tracking-[-0.03em]">제1조 (목적)</h2>
            <p className="mt-2">
              이 약관은 Raple(래플) 서비스 이용과 관련하여 회사와 이용자 간의
              권리·의무 및 책임사항을 규정합니다.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold tracking-[-0.03em]">
              제2조 (서비스 내용)
            </h2>
            <p className="mt-2">
              Raple은 회의 녹음, AI 받아쓰기·요약, 회의록 관리, 타임라인 등 관련
              기능을 제공합니다. 기능은 운영상 필요에 따라 추가·변경될 수
              있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold tracking-[-0.03em]">제3조 (계정)</h2>
            <p className="mt-2">
              이용자는 정확한 정보로 계정을 생성·관리해야 하며, 계정 관리 소홀로
              발생한 불이익에 대해 회사가 책임지지 않습니다. 회원 탈퇴는 앱 또는
              웹 설정에서 요청할 수 있으며, 탈퇴 시 계정과 저장된 회의 데이터가
              삭제됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold tracking-[-0.03em]">
              제4조 (이용자의 의무)
            </h2>
            <p className="mt-2">이용자는 다음 행위를 해서는 안 됩니다.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>타인의 권리를 침해하는 녹음·업로드</li>
              <li>법령 또는 공서양속에 위배되는 이용</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
            </ul>
            <p className="mt-2">
              회의를 녹음할 때 관련 법령에 따라 참석자에게 알리거나 동의를 받을
              책임은 이용자에게 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold tracking-[-0.03em]">
              제5조 (지적재산권)
            </h2>
            <p className="mt-2">
              서비스 및 관련 콘텐츠에 대한 권리는 회사 또는 정당한 권리자에게
              귀속됩니다. 이용자가 생성한 회의 데이터의 권리는 관련 법령과
              계약에 따릅니다.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold tracking-[-0.03em]">
              제6조 (서비스 변경·중단)
            </h2>
            <p className="mt-2">
              회사는 운영·기술상 필요에 따라 서비스를 변경하거나 일시 중단할 수
              있으며, 합리적인 범위에서 안내합니다.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold tracking-[-0.03em]">
              제7조 (책임의 제한)
            </h2>
            <p className="mt-2">
              천재지변, 통신 장애, 이용자 귀책 등으로 인한 손해에 대해 회사는
              법령이 허용하는 범위에서 책임을 제한합니다. AI 결과물은 참고용이며,
              최종 확인 책임은 이용자에게 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold tracking-[-0.03em]">제8조 (준거법)</h2>
            <p className="mt-2">
              본 약관은 대한민국 법령에 따르며, 분쟁 발생 시 관할 법원은 관련
              법령에 따릅니다.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold tracking-[-0.03em]">문의</h2>
            <p className="mt-2">
              약관 관련 문의는{" "}
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
