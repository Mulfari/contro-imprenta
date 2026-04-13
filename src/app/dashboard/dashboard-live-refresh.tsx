"use client";

import { startTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type DashboardLiveRefreshProps = {
  intervalMs?: number;
};

export function DashboardLiveRefresh({
  intervalMs = 4000,
}: DashboardLiveRefreshProps) {
  const router = useRouter();
  const versionRef = useRef<string | null>(null);
  const requestInFlightRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const checkForChanges = async () => {
      if (requestInFlightRef.current || document.hidden) {
        return;
      }

      requestInFlightRef.current = true;

      try {
        const response = await fetch("/api/dashboard/live", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { version?: string };

        if (!mounted || !data.version) {
          return;
        }

        if (!versionRef.current) {
          versionRef.current = data.version;
          return;
        }

        if (versionRef.current !== data.version) {
          versionRef.current = data.version;
          startTransition(() => {
            router.refresh();
          });
        }
      } finally {
        requestInFlightRef.current = false;
      }
    };

    void checkForChanges();

    const interval = window.setInterval(() => {
      void checkForChanges();
    }, intervalMs);

    const handleVisibility = () => {
      if (!document.hidden) {
        void checkForChanges();
      }
    };

    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [intervalMs, router]);

  return null;
}
