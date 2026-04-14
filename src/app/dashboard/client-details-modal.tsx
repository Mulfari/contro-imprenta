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

function DataCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-800">{value}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.3rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
      {message}
    </div>
  );
}

export function ClientDetailsModal({
  client,
  orders,
  closeHref,
}: ClientDetailsModalProps) {
  const payments = orders.filter((order) => order.total_amount !== null);
  const billed = payments.reduce((sum, order) => sum + (order.total_amount ?? 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/18 px-4 py-5 backdrop-blur-sm sm:px-6">
      <div className="flex h-full items-center justify-center">
        <div className="flex h-full max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2.2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,249,252,0.98))] shadow-[0_35px_90px_rgba(15,23,42,0.18)]">
          <div className="border-b border-slate-200 bg-white/88 px-6 py-5 backdrop-blur sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                  Cliente seleccionado
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
                  {client.name}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Consulta sus datos, actividad comercial, pagos e historial reciente.
                </p>
              </div>

              <Link
                href={closeHref}
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
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

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <MetricCard label="Pedidos" value={orders.length} />
              <MetricCard label="Pagos registrados" value={payments.length} />
              <MetricCard label="Facturado" value={formatCurrency(billed)} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-7">
            <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <section className="space-y-6">
                <div className="rounded-[1.8rem] border border-slate-200 bg-slate-50/85 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-950">Datos del cliente</h4>
                      <p className="mt-1 text-sm text-slate-500">
                        Informacion de contacto y referencias principales.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <DataCard label="Telefono" value={client.phone ?? "Sin telefono"} />
                    <DataCard label="Email" value={client.email ?? "Sin email"} />
                    <DataCard
                      label="Cedula / RIF"
                      value={client.document_id ?? "Sin documento"}
                    />
                    <DataCard
                      label="Sucursal preferida"
                      value={client.preferred_branch ?? "Sin preferencia"}
                    />
                  </div>

                  <div className="mt-3 space-y-3">
                    <DataCard
                      label="Direccion"
                      value={client.address ?? "Sin direccion registrada"}
                    />
                    <DataCard
                      label="Observaciones"
                      value={client.notes ?? "Sin observaciones registradas"}
                    />
                  </div>
                </div>
              </section>

              <section className="grid gap-6">
                <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-950">Pagos</h4>
                      <p className="mt-1 text-sm text-slate-500">
                        Movimientos cobrados asociados a pedidos del cliente.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {payments.length === 0 ? (
                      <EmptyState message="Aun no hay pagos registrados para este cliente." />
                    ) : (
                      payments.map((order) => (
                        <div
                          key={`payment-${order.id}`}
                          className="rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {order.title}
                              </p>
                              <p className="mt-2 text-xs text-slate-500">
                                {formatDateTime(order.created_at)}
                              </p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold text-slate-900">
                              {formatCurrency(order.total_amount)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-950">Historial</h4>
                      <p className="mt-1 text-sm text-slate-500">
                        Ultimos pedidos y estado actual del trabajo.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {orders.length === 0 ? (
                      <EmptyState message="Este cliente aun no tiene historial de pedidos." />
                    ) : (
                      orders.map((order) => (
                        <div
                          key={`history-${order.id}`}
                          className="rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {order.title}
                              </p>
                              <p className="mt-2 text-sm text-slate-600">
                                Estado: {orderStatusLabels[order.status] ?? order.status}
                              </p>
                            </div>
                            <p className="shrink-0 text-xs text-slate-500">
                              {formatDateTime(order.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
