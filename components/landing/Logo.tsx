"use client";

import { cn } from "@/lib/utils";

export default function Logo({
  dark = false,
  className,
}: {
  dark?: boolean;
  className?: string;
}) {
  return (
    <img
      src={dark ? "/raple-wordmark-dark.png" : "/raple-wordmark.png"}
      alt="Raple"
      width={120}
      height={24}
      className={cn("h-6 w-auto select-none", className)}
    />
  );
}
