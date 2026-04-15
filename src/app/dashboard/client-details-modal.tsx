"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

import type { Client, OrderWithClient } from "@/lib/business";
import type { ClientFile } from "@/lib/client-files";

type ClientDetailsModalProps = {
  client: Client;
  orders: OrderWithClient[];
  files: ClientFile[];
  closeHref: string;
  uploadAction: (formData: FormData) => void;
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

function formatFileSize(value: number | null) {
  if (!value || value <= 0) {
    return "Sin tamano";
  }

  if (value < 1024 * 1024) {
    return `${Math.max(1, Math.round(value / 1024))} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      disabled={pending}
    >
      {pending ? "Subiendo..." : "Subir archivo"}
    </button>
  );
}

export function ClientDetailsPanel({
  client,
  orders,
  files,
  closeHref,
  uploadAction,
  deleteAction,
  isAdmin,
}: ClientDetailsModalProps) {
  const payments = orders.filter((order) => order.total_amount !== null);
  const billed = payments.reduce((sum, order) => sum + (order.total_amount ?? 0), 0);

  return (
    <aside className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,249,252,0.98))] shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200 bg-white/88 px-6 py-5 backdrop-blur sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
              Cliente cargado
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {client.name}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Consulta sus datos, actividad comercial, pagos e historial sin salir del modulo.
            </p>
          </div>

          <Link
            href={closeHref}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800"
          >
            Volver a clientes
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <MetricCard label="Pedidos" value={orders.length} />
          <MetricCard label="Pagos registrados" value={payments.length} />
          <MetricCard label="Facturado" value={formatCurrency(billed)} />
        </div>
      </div>

      <div className="px-6 py-6 sm:px-7">
        <div className="grid gap-6">
          <section className="space-y-6">
            <div className="rounded-[1.8rem] border border-slate-200 bg-slate-50/85 p-5">
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
              </div>
            </div>
          </section>

          <section className="grid gap-6">
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
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
              <div>
                <h4 className="text-lg font-semibold text-slate-950">Archivos adjuntos</h4>
                <p className="mt-1 text-sm text-slate-500">
                  PDFs, imagenes y piezas listas para reutilizar en futuros pedidos.
                </p>
              </div>

              <form action={uploadAction} className="mt-5 flex flex-col gap-3 rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-4">
                <input type="hidden" name="clientId" value={client.id} />
                <input
                  name="file"
                  type="file"
                  className="block w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.ai,.psd,.zip,.rar"
                  required
                />
                <p className="text-xs text-slate-500">
                  Puedes cargar artes, PDFs, imagenes o empaquetados de trabajo de hasta 20 MB.
                </p>
                <div className="flex justify-end">
                  <UploadButton />
                </div>
              </form>

              <div className="mt-5 space-y-3">
                {files.length === 0 ? (
                  <EmptyState message="Aun no hay archivos cargados para este cliente." />
                ) : (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className="rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {file.file_name}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>{file.file_type ?? "Archivo"}</span>
                            <span>•</span>
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>•</span>
                            <span>{formatDateTime(file.created_at)}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {file.signed_url ? (
                            <a
                              href={file.signed_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              Abrir
                            </a>
                          ) : null}
                          {isAdmin ? (
                            <form action={deleteAction}>
                              <input type="hidden" name="clientId" value={client.id} />
                              <input type="hidden" name="fileId" value={file.id} />
                              <button
                                type="submit"
                                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                              >
                                Eliminar
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
              <div>
                <h4 className="text-lg font-semibold text-slate-950">Referencias del cliente</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Enlaces, notas o ubicaciones utiles relacionadas con sus artes y materiales.
                </p>
              </div>

              <div className="mt-5">
                <DataCard
                  label="Referencias guardadas"
                  value={client.reference_files ?? "Sin referencias guardadas"}
                />
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
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
    </aside>
  );
}
