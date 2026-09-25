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

export default function StoreBadges({ compact = false }: { compact?: boolean }) {
  return (
    <>
      {stores.map((store) => (
        <StoreBadge key={store.name} compact={compact} {...store} />
      ))}
    </>
  );
}

function StoreBadge({
  href,
  kicker,
  name,
  mark,
  compact,
}: {
  href: string;
  kicker: string;
  name: string;
  mark: "apple" | "play";
  compact: boolean;
}) {
  const className = compact
    ? "inline-flex h-12 items-center gap-2.5 rounded-xl bg-black px-3.5 text-white"
    : "inline-flex h-14 min-w-[196px] items-center gap-3 rounded-xl bg-black px-4 text-white";
  const body = (
    <>
      {mark === "apple" ? <AppleMark compact={compact} /> : <PlayMark compact={compact} />}
      <span className="text-left leading-none">
        <span
          className={
            compact
              ? "block text-[9px] font-medium tracking-wide text-white/70"
              : "block text-[10px] font-medium tracking-wide text-white/70"
          }
        >
          {kicker}
        </span>
        <span
          className={
            compact
              ? "mt-0.5 block text-[14px] font-semibold tracking-[-0.03em]"
              : "mt-1 block text-[18px] font-semibold tracking-[-0.03em]"
          }
        >
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

function AppleMark({ compact }: { compact: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={compact ? "size-5 shrink-0" : "size-6 shrink-0"} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-.1 2.9-2.2c.7-1.1 1-2.1 1-2.2-.1 0-2.3-.9-2.3-3.3ZM14.7 6.2c.6-.8 1.1-1.9.9-3-1 .1-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.5 2.9-1.4Z"
      />
    </svg>
  );
}

function PlayMark({ compact }: { compact: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={compact ? "size-5 shrink-0" : "size-6 shrink-0"} aria-hidden="true">
      <path fill="#34A853" d="M3.5 20.6 13.2 12 3.5 3.4v17.2Z" />
      <path fill="#FBBC04" d="M16.2 14.7 13.2 12l3-2.7 3.6 2.1c.8.4.8 1.4 0 1.9l-3.6 2.4Z" />
      <path fill="#4285F4" d="M3.5 3.4 13.2 12l3-2.7L5.2 2.2c-.6-.3-1.3 0-1.7.5v.7Z" />
      <path fill="#EA4335" d="M13.2 12 3.5 20.6v.7c.4.5 1.1.8 1.7.5L16.2 14.7 13.2 12Z" />
    </svg>
  );
}
