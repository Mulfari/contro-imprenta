"use client";

import Link from "next/link";

import type { Client, OrderWithClient } from "@/lib/business";

type ClientDetailsModalProps = {
  client: Client;
  orders: OrderWithClient[];
  closeHref: string;
};

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Sin monto";
  }

  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

const orderStatusLabels: Record<string, string> = {
  recibido: "Recibido",
  disenando: "Disenando",
  imprimiendo: "Imprimiendo",
  listo: "Listo",
  entregado: "Entregado",
};

export function ClientDetailsModal({
  client,
  orders,
  closeHref,
}: ClientDetailsModalProps) {
  const payments = orders.filter((order) => order.total_amount !== null);
  const billed = payments.reduce((sum, order) => sum + (order.total_amount ?? 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/18 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.16)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">{client.name}</h3>
            <p className="mt-2 text-sm text-slate-500">
              Ficha del cliente, pedidos anteriores, pagos e historial.
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

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Telefono</p>
            <p className="mt-2 text-sm font-medium text-slate-800">
              {client.phone ?? "Sin telefono"}
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
            <p className="mt-2 text-sm font-medium text-slate-800">
              {client.email ?? "Sin email"}
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Cedula / RIF</p>
            <p className="mt-2 text-sm font-medium text-slate-800">
              {client.document_id ?? "Sin documento"}
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sucursal preferida</p>
            <p className="mt-2 text-sm font-medium text-slate-800">
              {client.preferred_branch ?? "Sin preferencia"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Direccion</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {client.address ?? "Sin direccion"}
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Observaciones del cliente
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {client.notes ?? "Sin observaciones"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pedidos</p>
                <p className="mt-2 text-2xl font-semibold">{orders.length}</p>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pagos</p>
                <p className="mt-2 text-2xl font-semibold">{payments.length}</p>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Facturado</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(billed)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold">Pagos</h3>
              <div className="mt-4 space-y-3">
                {payments.length === 0 ? (
                  <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    Aun no hay pagos registrados desde pedidos.
                  </div>
                ) : (
                  payments.map((order) => (
                    <div
                      key={`payment-${order.id}`}
                      className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">
                          {order.title}
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(order.total_amount)}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold">Historial</h3>
              <div className="mt-4 space-y-3">
                {orders.length === 0 ? (
                  <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    Este cliente aun no tiene historial de pedidos.
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={`history-${order.id}`}
                      className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {order.title}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Estado: {orderStatusLabels[order.status] ?? order.status}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
