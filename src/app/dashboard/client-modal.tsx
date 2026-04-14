"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

type ClientModalProps = {
  closeHref: string;
  action: (formData: FormData) => void;
  mode?: "create" | "edit";
  initialData?: {
    clientId: string;
    name: string;
    phone: string;
    email: string;
    documentId: string;
    address: string;
    notes: string;
  };
};

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full cursor-pointer rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      disabled={pending}
    >
      {pending
        ? mode === "edit"
          ? "Guardando cliente..."
          : "Registrando cliente..."
        : mode === "edit"
          ? "Guardar cambios"
          : "Registrar cliente"}
    </button>
  );
}

export function ClientModal({
  closeHref,
  action,
  mode = "create",
  initialData,
}: ClientModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/18 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.16)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">
              {mode === "edit" ? "Editar cliente" : "Nuevo cliente"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Registra o actualiza los datos del cliente.
            </p>
          </div>
          <Link
            href={closeHref}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100"
            aria-label="Cerrar modal"
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
          </Link>
        </div>

        <form action={action} className="mt-6 space-y-4">
          {initialData ? (
            <input type="hidden" name="clientId" value={initialData.clientId} />
          ) : null}

          <div>
            <label className="mb-2 block text-sm text-slate-600" htmlFor="clientName">
              Nombre o razon social
            </label>
            <input
              id="clientName"
              name="name"
              type="text"
              defaultValue={initialData?.name ?? ""}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Papeleria Central"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-600" htmlFor="clientPhone">
                Telefono
              </label>
              <input
                id="clientPhone"
                name="phone"
                type="text"
                defaultValue={initialData?.phone ?? ""}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="04141234567"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-600" htmlFor="clientEmail">
                Email opcional
              </label>
              <input
                id="clientEmail"
                name="email"
                type="email"
                defaultValue={initialData?.email ?? ""}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="cliente@correo.com"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-600" htmlFor="clientDocument">
                Cedula / RIF opcional
              </label>
              <input
                id="clientDocument"
                name="documentId"
                type="text"
                defaultValue={initialData?.documentId ?? ""}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="V12345678 o J123456789"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-600" htmlFor="clientAddress">
                Direccion si aplica delivery
              </label>
              <input
                id="clientAddress"
                name="address"
                type="text"
                defaultValue={initialData?.address ?? ""}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Av. principal, local 4"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-600" htmlFor="clientNotes">
              Observaciones del cliente
            </label>
            <textarea
              id="clientNotes"
              name="notes"
              defaultValue={initialData?.notes ?? ""}
              className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Indicaciones, preferencias o datos importantes"
            />
          </div>

          <SubmitButton mode={mode} />
        </form>
      </div>
    </div>
  );
}
