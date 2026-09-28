"use client";

import Logo from "@/components/landing/Logo";

/** Neutral boot screen while auth session is resolving. */
export default function AuthBoot() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <Logo className="h-7 w-auto opacity-90" />
    </div>
  );
}
