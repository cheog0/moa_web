import Reveal from "@/components/landing/Reveal";
import StoreBadges from "@/components/landing/StoreBadges";

export default function Download() {
  return (
    <section id="app" className="scroll-mt-20 bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
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
        <Reveal delay={0.08}>
          <div className="mx-auto w-full max-w-[320px] rounded-[36px] bg-[#07111F] px-6 pb-8 pt-8 text-white shadow-[0_24px_60px_rgba(7,17,31,0.18)]">
            <div className="mx-auto mb-8 h-1.5 w-16 rounded-full bg-white/20" />
            <p className="text-[13px] text-white/50">지금 회의</p>
            <p className="mt-2 text-[28px] font-extrabold leading-tight tracking-[-0.04em]">
              녹음하고,
              <br />
              바로 정리.
            </p>
            <div className="mt-8 space-y-3">
              {["실시간 받아쓰기", "요약과 후속 조치", "웹과 같은 계정"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-white/8 px-4 py-3 text-[14px] text-white/85"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

