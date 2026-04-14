"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AdminNotificationModal } from "@/app/dashboard/admin-notifications-panel";

export type DashboardNotificationItem = {
  id: string;
  type: "recovery" | "alert";
  title: string;
  subject: string;
  detail: string;
  createdAt: string;
  createdAtLabel: string;
};

type NotificationCenterButtonProps = {
  items: DashboardNotificationItem[];
  scopeKey: string;
};

const notificationLimit = 8;
const dashboardTimeZone = "America/Caracas";

function getDateKey(value: string | Date) {
  const parsed = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: dashboardTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
}

function getSeenNotificationsKey(scopeKey: string, dateKey: string) {
  return `dashboard_seen_notifications_${scopeKey}_${dateKey}`;
}

const notificationTone: Record<
  DashboardNotificationItem["type"],
  { dot: string }
> = {
  recovery: {
    dot: "bg-blue-500",
  },
  alert: {
    dot: "bg-amber-500",
  },
};

export function NotificationCenterButton({
  items,
  scopeKey,
}: NotificationCenterButtonProps) {
  const [open, setOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const todayKey = getDateKey(new Date());
  const [displayItems, setDisplayItems] = useState<DashboardNotificationItem[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const storageKey = getSeenNotificationsKey(scopeKey, getDateKey(new Date()));
      const raw = window.localStorage.getItem(storageKey);

      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const todayItems = useMemo(
    () =>
      items
        .filter((item) => getDateKey(item.createdAt) === todayKey)
        .slice(0, notificationLimit),
    [items, todayKey],
  );
  const unseenItems = useMemo(
    () => todayItems.filter((item) => !seenIds.includes(item.id)),
    [todayItems, seenIds],
  );
  const activeItem = useMemo(
    () => displayItems.find((item) => item.id === activeItemId) ?? null,
    [activeItemId, displayItems],
  );
  const notificationCount = unseenItems.length;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storageKey = getSeenNotificationsKey(scopeKey, todayKey);
    window.localStorage.setItem(storageKey, JSON.stringify(seenIds));
  }, [scopeKey, seenIds, todayKey]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => {
          if (open) {
            setOpen(false);
            return;
          }

          setDisplayItems(todayItems);

          if (todayItems.length > 0) {
            setSeenIds((current) => [
              ...new Set([...current, ...todayItems.map((item) => item.id)]),
            ]);
          }

          setOpen(true);
        }}
        className="flex w-full cursor-pointer items-center justify-between rounded-[1.5rem] border border-slate-200/80 bg-white/88 px-5 py-4 text-left shadow-[0_16px_40px_rgba(15,23,42,0.05)] backdrop-blur transition hover:bg-white lg:min-w-[220px]"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
              <path d="M10 17a2 2 0 0 0 4 0" />
            </svg>
            {notificationCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-semibold text-white">
                {notificationCount}
              </span>
            ) : null}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
            <p className="mt-1 text-xs text-slate-500">
              {notificationCount === 0
                ? "Sin novedades"
                : `${notificationCount} nuevas`}
            </p>
          </div>
        </div>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-sm font-semibold text-slate-900">
              Centro de notificaciones
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Actualizaciones recientes del panel administrativo.
            </p>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-3">
            {displayItems.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No hay notificaciones para hoy.
              </div>
            ) : (
              <div className="space-y-2">
                {displayItems.map((item) => {
                  const tone = notificationTone[item.type];
                  const isSeen = seenIds.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveItemId(item.id)}
                      className={`w-full cursor-pointer rounded-[1.25rem] border px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white ${
                        isSeen
                          ? "border-slate-200 bg-slate-50/50 opacity-75"
                          : "border-slate-200 bg-slate-50/70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                          <p className="text-sm font-semibold text-slate-900">
                            {item.title}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{item.subject}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {item.detail}
                      </p>
                      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
                        {item.createdAtLabel}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {activeItem ? (
        <AdminNotificationModal
          item={activeItem}
          onClose={() => setActiveItemId(null)}
        />
      ) : null}
    </div>
  );
}
