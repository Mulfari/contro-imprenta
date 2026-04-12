"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";

type FloatingToastProps = {
  message: string;
};

type AnimatedToastProps = {
  message: string;
};

function detectVariant(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("incorrecto") ||
    normalized.includes("error") ||
    normalized.includes("falta") ||
    normalized.includes("no se pudo")
  ) {
    return "error";
  }

  if (
    normalized.includes("creado") ||
    normalized.includes("actualizado") ||
    normalized.includes("cerrada") ||
    normalized.includes("correcto")
  ) {
    return "success";
  }

  return "info";
}

function AnimatedToast({ message }: AnimatedToastProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<"enter" | "leave">("enter");
  const variant = detectVariant(message);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => {
      setPhase("leave");
    }, 2800);

    const cleanupTimer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("message");
      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }, 3500);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(cleanupTimer);
    };
  }, [message, pathname, router, searchParams]);

  const toneClasses =
    variant === "error"
      ? "border-rose-200/80 bg-rose-50/92 text-rose-700 shadow-[0_24px_60px_rgba(190,24,93,0.18)]"
      : variant === "success"
        ? "border-emerald-200/80 bg-emerald-50/92 text-emerald-700 shadow-[0_24px_60px_rgba(5,150,105,0.16)]"
        : "border-blue-200/80 bg-blue-50/90 text-slate-700 shadow-[0_24px_60px_rgba(59,130,246,0.14)]";

  const toast = (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[120] flex justify-center px-4">
      <div
        className={`pointer-events-auto w-full max-w-md rounded-[1.35rem] border px-5 py-4 text-center text-sm font-medium backdrop-blur-xl ${
          toneClasses
        } ${
          phase === "enter" ? "toast-enter" : "toast-leave"
        }`}
      >
        <p className="leading-6">{message}</p>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(toast, document.body);
}

export function FloatingToast({ message }: FloatingToastProps) {
  if (!message) {
    return null;
  }

  return <AnimatedToast key={message} message={message} />;
}
