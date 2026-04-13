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
        className="cursor-pointer rounded-[1.75rem] border border-slate-200 bg-white/85 p-5 text-left shadow-[0_20px_40px_rgba(15,23,42,0.05)] transition hover:bg-white"
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/20 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:p-7">
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

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
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
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(modal, document.body);
}
