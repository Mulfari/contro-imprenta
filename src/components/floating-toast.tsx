"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type FloatingToastProps = {
  message: string;
};

type AnimatedToastProps = {
  message: string;
};

function AnimatedToast({ message }: AnimatedToastProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<"enter" | "leave">("enter");

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

  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center px-4">
      <div
        className={`pointer-events-auto w-full max-w-md rounded-[1.35rem] border border-white/70 bg-white/90 px-5 py-4 text-center text-sm font-medium text-slate-700 shadow-[0_24px_60px_rgba(15,23,42,0.14)] backdrop-blur-xl ${
          phase === "enter" ? "toast-enter" : "toast-leave"
        }`}
      >
        <p className="leading-6">{message}</p>
      </div>
    </div>
  );
}

export function FloatingToast({ message }: FloatingToastProps) {
  if (!message) {
    return null;
  }

  return <AnimatedToast key={message} message={message} />;
}
