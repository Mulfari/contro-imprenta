"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import type { DashboardNotificationItem } from "@/app/dashboard/notification-center-button";

type AdminNotificationsPanelProps = {
  items: DashboardNotificationItem[];
};

const notificationTone: Record<
  DashboardNotificationItem["type"],
  { badge: string; dot: string; label: string; title: string }
> = {
  recovery: {
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    label: "Recuperacion",
    title: "Solicitud de recuperacion",
  },
  alert: {
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    label: "Alerta",
    title: "Alerta de administracion",
  },
};

export function AdminNotificationsPanel({
  items,
}: AdminNotificationsPanelProps) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const paginatedItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page],
  );
  const activeItem = useMemo(
    () => items.find((item) => item.id === activeItemId) ?? null,
    [activeItemId, items],
  );

  return (
    <>
      <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Alertas de administracion</h3>
            <p className="mt-2 text-sm text-slate-500">
              Recuperaciones y eventos sensibles del panel en un solo lugar.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {items.length} notificaciones
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          {items.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
              No hay notificaciones administrativas registradas.
            </div>
          ) : (
            paginatedItems.map((item) => {
              const tone = notificationTone[item.type];

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveItemId(item.id)}
                  className="flex cursor-pointer items-start justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-5 text-left transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {item.subject}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {item.detail}
                    </p>
                    <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
                      {item.createdAtLabel}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${tone.badge}`}
                  >
                    {tone.label}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {items.length > 0 ? (
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Pagina {page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        ) : null}
      </article>

      {activeItem ? (
        <AdminNotificationModal
          item={activeItem}
          onClose={() => setActiveItemId(null)}
        />
      ) : null}
    </>
  );
}

type AdminNotificationModalProps = {
  item: DashboardNotificationItem;
  onClose: () => void;
};

function AdminNotificationModal({
  item,
  onClose,
}: AdminNotificationModalProps) {
  const tone = notificationTone[item.type];

  const modal = (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/20 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${tone.badge}`}
            >
              {tone.title}
            </span>
            <h4 className="mt-4 text-2xl font-semibold text-slate-950">
              {item.subject}
            </h4>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-400">
              {item.createdAtLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100"
            aria-label="Cerrar detalle"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-5">
          <p className="text-sm font-semibold text-slate-900">Detalle</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{item.detail}</p>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(modal, document.body);
}
