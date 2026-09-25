import Reveal from "@/components/landing/Reveal";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/site";

const stores = [
  {
    href: APP_STORE_URL,
    kicker: "Download on the",
    name: "App Store",
    mark: "apple" as const,
  },
  {
    href: PLAY_STORE_URL,
    kicker: "GET IT ON",
    name: "Google Play",
    mark: "play" as const,
  },
];

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
            계정은 같습니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {stores.map((store) => (
              <StoreBadge key={store.name} {...store} />
            ))}
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

function StoreBadge({
  href,
  kicker,
  name,
  mark,
}: {
  href: string;
  kicker: string;
  name: string;
  mark: "apple" | "play";
}) {
  const className =
    "inline-flex h-14 min-w-[196px] items-center gap-3 rounded-xl bg-black px-4 text-white";
  const body = (
    <>
      {mark === "apple" ? <AppleMark /> : <PlayMark />}
      <span className="text-left leading-none">
        <span className="block text-[10px] font-medium tracking-wide text-white/70">
          {kicker}
        </span>
        <span className="mt-1 block text-[18px] font-semibold tracking-[-0.03em]">
          {name}
        </span>
      </span>
    </>
  );

  if (!href) {
    return (
      <span className={className} aria-disabled="true">
        {body}
      </span>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {body}
    </a>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-.1 2.9-2.2c.7-1.1 1-2.1 1-2.2-.1 0-2.3-.9-2.3-3.3ZM14.7 6.2c.6-.8 1.1-1.9.9-3-1 .1-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.5 2.9-1.4Z"
      />
    </svg>
  );
}

function PlayMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
      <path fill="#34A853" d="M3.5 20.6 13.2 12 3.5 3.4v17.2Z" />
      <path fill="#FBBC04" d="M16.2 14.7 13.2 12l3-2.7 3.6 2.1c.8.4.8 1.4 0 1.9l-3.6 2.4Z" />
      <path fill="#4285F4" d="M3.5 3.4 13.2 12l3-2.7L5.2 2.2c-.6-.3-1.3 0-1.7.5v.7Z" />
      <path fill="#EA4335" d="M13.2 12 3.5 20.6v.7c.4.5 1.1.8 1.7.5L16.2 14.7 13.2 12Z" />
    </svg>
  );
}
