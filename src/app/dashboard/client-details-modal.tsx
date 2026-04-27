"use client";

import Link from "next/link";

import { ClientFilesPanel } from "@/app/dashboard/client-files-panel";
import type { Client, OrderWithClient } from "@/lib/business";
import type { ClientFile } from "@/lib/client-files";

type ClientDetailsModalProps = {
  client: Client;
  orders: OrderWithClient[];
  files: ClientFile[];
  closeHref: string;
  deleteAction: (formData: FormData) => void;
  isAdmin: boolean;
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
  rechazado: "Rechazado",
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
      <p className="mt-2 whitespace-pre-line break-words text-sm font-medium leading-6 text-slate-800">
        {value}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_35px_rgba(15,23,42,0.05)] sm:rounded-[1.5rem] sm:px-5 sm:py-5">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      {helper ? <p className="mt-1 text-xs font-medium text-slate-500">{helper}</p> : null}
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

export function ClientDetailsPanel({
  client,
  orders,
  files,
  closeHref,
  deleteAction,
  isAdmin,
}: ClientDetailsModalProps) {
  const payments = orders.filter((order) => order.total_amount !== null);
  const billed = payments.reduce((sum, order) => sum + (order.total_amount ?? 0), 0);
  const activeOrders = orders.filter(
    (order) => order.status !== "entregado" && order.status !== "rechazado",
  );
  const pendingBalance = activeOrders.reduce(
    (sum, order) => sum + Number(order.pending_amount ?? order.total_amount ?? 0),
    0,
  );
  const lastOrder = orders[0] ?? null;

  return (
    <aside className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,249,252,0.98))] shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:rounded-[2rem]">
      <div className="border-b border-slate-200 bg-slate-950 px-4 py-5 text-white backdrop-blur sm:px-7 sm:py-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#ffd45f]">
              Ficha de cliente
            </p>
            <h3 className="mt-2 break-words text-2xl font-black sm:text-4xl">
              {client.name}
            </h3>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-white">
                {client.phone ?? "Sin telefono"}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-white">
                {client.email ?? "Sin email"}
              </span>
              <span className="rounded-full bg-[#ffd45f] px-3 py-1.5 text-slate-950">
                {activeOrders.length} activo{activeOrders.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <Link
            href={closeHref}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Volver a clientes
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <MetricCard label="Pedidos" value={orders.length} helper="Historico" />
          <MetricCard label="Activos" value={activeOrders.length} helper="En proceso" />
          <MetricCard label="Facturado" value={formatCurrency(billed)} helper="Total vendido" />
          <MetricCard label="Por cobrar" value={formatCurrency(pendingBalance)} helper="Saldo abierto" />
        </div>
      </div>

      <div className="px-4 py-5 sm:px-7 sm:py-6">
        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr] xl:items-start">
          <section className="space-y-6">
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/85 p-4 sm:rounded-[1.8rem] sm:p-5">
              <div>
                <h4 className="text-lg font-semibold text-slate-950">Datos del cliente</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Informacion de contacto y referencias principales.
                </p>
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
                <DataCard
                  label="Ultimo pedido"
                  value={lastOrder ? `${lastOrder.order_number} - ${formatDateTime(lastOrder.created_at)}` : "Sin historial"}
                />
              </div>
            </div>
          </section>

          <section className="grid gap-6">
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:rounded-[1.8rem] sm:p-5">
              <div>
                <h4 className="text-lg font-semibold text-slate-950">Pagos</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Movimientos cobrados asociados a pedidos del cliente.
                </p>
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
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                      <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-500 sm:grid-cols-3">
                        <span>Abono: {formatCurrency(order.deposit_amount)}</span>
                        <span>Saldo: {formatCurrency(order.pending_amount)}</span>
                        <span>Pago: {order.payment_status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <ClientFilesPanel
              clientId={client.id}
              files={files}
              isAdmin={isAdmin}
              deleteAction={deleteAction}
            />

            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:rounded-[1.8rem] sm:p-5">
              <div>
                <h4 className="text-lg font-semibold text-slate-950">Historial</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Ultimos pedidos y estado actual del trabajo.
                </p>
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
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
    </aside>
  );
}
