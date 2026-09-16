"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ToastConfig } from "@/lib/timeline";
import { cn } from "@/lib/utils";

export default function StatusToast({ toast }: { toast: ToastConfig }) {
  return (
    <div
      className={cn(
        "fixed top-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full px-6 py-3.5 shadow-xl animate-in fade-in slide-in-from-top-5 duration-300",
        toast.type === "warning"
          ? "border border-amber-400/40 bg-amber-950 text-amber-50"
          : toast.type === "error"
            ? "border border-rose-400/40 bg-rose-950 text-rose-50"
            : "bg-slate-900 text-white",
      )}
    >
      {toast.type === "success" ? (
        <CheckCircle2 className="size-5 text-emerald-400" />
      ) : toast.type === "warning" ? (
        <AlertCircle className="size-5 text-amber-400" />
      ) : (
        <AlertCircle className="size-5 text-rose-400" />
      )}
      <p className="text-sm font-medium">{toast.message}</p>
    </div>
  );
}
