"use client";

import { useEffect, useState } from "react";

type ToastMessage = {
  id: number;
  message: string;
  tone: "info" | "success" | "error";
};

interface StorefrontToastProps {
  toast: ToastMessage | null;
  onDone: () => void;
}

export function StorefrontToast({ toast, onDone }: StorefrontToastProps) {
  const [phase, setPhase] = useState<"enter" | "leave">("enter");

  useEffect(() => {
    if (!toast) {
      return;
    }

    const leaveTimer = window.setTimeout(() => setPhase("leave"), 2800);
    const cleanupTimer = window.setTimeout(onDone, 3500);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(cleanupTimer);
    };
  }, [toast, onDone]);

  if (!toast) {
    return null;
  }

  const toneClasses =
    toast.tone === "error"
      ? "border-rose-200/80 bg-rose-50/92 text-rose-700 shadow-[0_24px_60px_rgba(190,24,93,0.18)]"
      : toast.tone === "success"
        ? "border-emerald-200/80 bg-emerald-50/92 text-emerald-700 shadow-[0_24px_60px_rgba(5,150,105,0.16)]"
        : "border-blue-200/80 bg-blue-50/90 text-slate-700 shadow-[0_24px_60px_rgba(59,130,246,0.14)]";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[120] flex justify-center px-4">
      <div
        className={`pointer-events-auto w-full max-w-md rounded-[1.35rem] border px-5 py-4 text-center text-sm font-medium backdrop-blur-xl ${toneClasses} ${
          phase === "enter" ? "toast-enter" : "toast-leave"
        }`}
      >
        <p className="leading-6">{toast.message}</p>
      </div>
    </div>
  );
}