"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type FloatingToastProps = {
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

export function FloatingToast({ message }: FloatingToastProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(Boolean(message));

  const variant = useMemo(() => detectVariant(message), [message]);

  useEffect(() => {
    setVisible(Boolean(message));
  }, [message]);

  useEffect(() => {
    if (!message) {
      return;
    }

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 3200);

    const cleanupTimer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("message");
      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }, 3600);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(cleanupTimer);
    };
  }, [message, pathname, router, searchParams]);

  if (!message || !visible) {
    return null;
  }

  const toneClasses =
    variant === "error"
      ? "border-rose-200 bg-white text-rose-700 shadow-[0_18px_40px_rgba(190,24,93,0.12)]"
      : variant === "success"
        ? "border-emerald-200 bg-white text-emerald-700 shadow-[0_18px_40px_rgba(5,150,105,0.12)]"
        : "border-blue-200 bg-white text-slate-700 shadow-[0_18px_40px_rgba(59,130,246,0.12)]";

  const badgeClasses =
    variant === "error"
      ? "bg-rose-50 text-rose-700"
      : variant === "success"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-blue-50 text-blue-700";

  const badge =
    variant === "error" ? "Error" : variant === "success" ? "Listo" : "Aviso";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center px-4">
      <div
        className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-[1.4rem] border px-4 py-3 transition duration-300 ${toneClasses}`}
      >
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${badgeClasses}`}
        >
          {badge}
        </span>
        <p className="text-sm font-medium leading-6">{message}</p>
      </div>
    </div>
  );
}
