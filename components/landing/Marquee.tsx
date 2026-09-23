"use client";

const items = [
  "실시간 녹음",
  "AI 회의록",
  "후속 조치",
  "맞춤 템플릿",
  "타임라인",
  "인사이트",
  "회의 알림",
  "다크 모드",
  "카카오 로그인",
];

export default function Marquee() {
  const row = [...items, ...items];
  return (
    <section className="bg-white py-10 sm:py-14">
      <p className="mb-6 text-center font-display text-[12px] font-semibold tracking-[0.18em] text-[#9AA3AF]">
        BUILT FOR THE WHOLE MEETING
      </p>
      <div className="marquee-fade overflow-hidden">
        <div className="marquee-track flex w-max gap-3">
          {row.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-2xl bg-[#F3F4F6] px-6 py-4 text-[18px] font-semibold tracking-[-0.03em] text-[#111827]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
