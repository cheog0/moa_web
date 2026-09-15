"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ToastConfig } from "@/lib/timeline";

export default function StatusToast({ toast }: { toast: ToastConfig }) {
  return (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full bg-slate-900 px-6 py-3.5 text-white shadow-xl animate-in fade-in slide-in-from-top-5 duration-300">
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
