"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

export type ActivePersonnelItem = {
  id: string;
  displayName: string;
  role: string;
  connectedAtLabel: string;
  activeForLabel: string;
};

type ActivePersonnelCardProps = {
  count: number;
  items: ActivePersonnelItem[];
};

export function ActivePersonnelCard({
  count,
  items,
}: ActivePersonnelCardProps) {
  const [open, setOpen] = useState(false);
  const sortedItems = useMemo(
    () =>
      [...items].sort((left, right) =>
        left.displayName.localeCompare(right.displayName, "es"),
      ),
    [items],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-[1.4rem] border border-slate-200 bg-white/85 p-4 text-left shadow-[0_20px_40px_rgba(15,23,42,0.05)] transition hover:bg-white sm:rounded-[1.75rem] sm:p-5"
      >
        <p className="text-sm text-slate-500">Personal activo</p>
        <p className="mt-3 text-4xl font-semibold">{count}</p>
        <p className="mt-2 text-sm text-slate-600">
          Pulsa para ver quien esta conectado
        </p>
      </button>

      {open ? (
        <ActivePersonnelModal
          items={sortedItems}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

type ActivePersonnelModalProps = {
  items: ActivePersonnelItem[];
  onClose: () => void;
};

function ActivePersonnelModal({
  items,
  onClose,
}: ActivePersonnelModalProps) {
  const modal = (
    <div className="fixed inset-0 z-[80] flex overflow-y-auto bg-slate-950/20 px-3 py-5 backdrop-blur-sm sm:px-4 sm:py-6">
      <div className="mx-auto my-auto w-full max-w-3xl rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:rounded-[2rem] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-2xl font-semibold text-slate-950">
              Personal activo
            </h4>
            <p className="mt-2 text-sm text-slate-500">
              Sesiones activas detectadas en este momento.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100"
            aria-label="Cerrar personal activo"
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

        <div className="mt-6 hidden overflow-hidden rounded-[1.5rem] border border-slate-200 md:block">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Conectado desde</th>
                <th className="px-4 py-3 font-medium">Tiempo activo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-slate-800">
              {items.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={4}>
                    No hay personal activo en este momento.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium">{item.displayName}</td>
                    <td className="px-4 py-3">{item.role}</td>
                    <td className="px-4 py-3">{item.connectedAtLabel}</td>
                    <td className="px-4 py-3">{item.activeForLabel}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-3 md:hidden">
          {items.length === 0 ? (
            <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              No hay personal activo en este momento.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950">
                      {item.displayName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{item.role}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    {item.activeForLabel}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Conectado desde {item.connectedAtLabel}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(modal, document.body);
}
