"use client";

import Link from "next/link";

// Tablero de producción (fase 2): kanban por etapa con atrasados, días en
// etapa, prioridad y carga por área. Mover = server action (forms).

export type BoardOrder = {
  id: string;
  order_number: string;
  client_name: string;
  product_type: string;
  quantity: number;
  priority: string;
  urgency: string;
  status: string;
  promised_delivery_at: string | null;
  current_owner: string | null;
  current_area: string | null;
  days_in_status: number;
  overdue: boolean;
};

interface ProductionBoardProps {
  orders: BoardOrder[];
  deliveredToday: number;
  onMove: (formData: FormData) => void;
}

const columns: { status: string; label: string; accent: string }[] = [
  { status: "recibido", label: "Recibido", accent: "bg-slate-400" },
  { status: "disenando", label: "Diseñando", accent: "bg-violet-500" },
  { status: "imprimiendo", label: "Imprimiendo", accent: "bg-blue-500" },
  { status: "listo", label: "Listo", accent: "bg-emerald-500" },
];

const flow = ["recibido", "disenando", "imprimiendo", "listo", "entregado"];

const priorityStyles: Record<string, string> = {
  baja: "bg-slate-100 text-slate-600",
  media: "bg-blue-50 text-blue-700",
  alta: "bg-amber-50 text-amber-700",
  urgente: "bg-rose-50 text-rose-700",
};

const flowLabels: Record<string, string> = {
  recibido: "Recibido",
  disenando: "Diseñando",
  imprimiendo: "Imprimiendo",
  listo: "Listo",
  entregado: "Entregado",
};

function promisedLabel(value: string | null) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("es-VE", { day: "2-digit", month: "short" }).format(parsed);
}

export function ProductionBoard({ orders, deliveredToday, onMove }: ProductionBoardProps) {
  const active = orders.filter((order) => order.status !== "entregado");
  const overdueCount = active.filter((order) => order.overdue).length;
  const readyCount = active.filter((order) => order.status === "listo").length;

  const areaCounts = new Map<string, number>();
  for (const order of active) {
    const area = order.current_area?.trim() || "Sin área";
    areaCounts.set(area, (areaCounts.get(area) ?? 0) + 1);
  }

  return (
    <section className="grid gap-5">
      {/* Resumen */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "En producción", value: active.length, detail: "Pedidos activos en el taller" },
          {
            label: "Atrasados",
            value: overdueCount,
            detail: "Pasados de la fecha prometida",
            tone: overdueCount > 0 ? "text-rose-600" : undefined,
          },
          { label: "Listos para entregar", value: readyCount, detail: "Esperando al cliente" },
          { label: "Entregados hoy", value: deliveredToday, detail: "Cerrados en la jornada" },
        ].map((card) => (
          <article
            key={card.label}
            className="rounded-[1.75rem] border border-slate-200 bg-white/85 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.05)]"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${card.tone ?? "text-slate-950"}`}>{card.value}</p>
            <p className="mt-1 text-sm text-slate-500">{card.detail}</p>
          </article>
        ))}
      </div>

      {/* Carga por área */}
      {areaCounts.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Carga por área
          </span>
          {[...areaCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([area, count]) => (
              <span
                key={area}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {area} · {count}
              </span>
            ))}
        </div>
      ) : null}

      {/* Kanban */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((column) => {
          const columnOrders = active
            .filter((order) => order.status === column.status)
            .sort((a, b) => Number(b.overdue) - Number(a.overdue));

          return (
            <div
              key={column.status}
              className="flex flex-col rounded-[1.5rem] border border-slate-200 bg-white/70 p-3"
            >
              <div className="flex items-center gap-2 px-1.5 pb-3 pt-1">
                <span className={`h-2.5 w-2.5 rounded-full ${column.accent}`} />
                <span className="text-sm font-semibold text-slate-900">{column.label}</span>
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                  {columnOrders.length}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {columnOrders.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-3 py-5 text-center text-xs text-slate-400">
                    Sin pedidos aquí
                  </p>
                ) : (
                  columnOrders.map((order) => {
                    const stepIndex = flow.indexOf(order.status);
                    const previous = stepIndex > 0 ? flow[stepIndex - 1] : null;
                    const next = stepIndex < flow.length - 1 ? flow[stepIndex + 1] : null;
                    const promised = promisedLabel(order.promised_delivery_at);

                    return (
                      <article
                        key={order.id}
                        className={`rounded-2xl border bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] ${
                          order.overdue ? "border-rose-300" : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/dashboard?view=pedidos&orderQuery=${encodeURIComponent(order.order_number)}`}
                            className="cursor-pointer font-mono text-xs font-bold text-slate-950 transition hover:text-blue-600"
                          >
                            {order.order_number}
                          </Link>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                              priorityStyles[order.priority] ?? priorityStyles.media
                            }`}
                          >
                            {order.priority}
                          </span>
                        </div>

                        <p className="mt-1.5 truncate text-sm font-semibold text-slate-900">
                          {order.product_type}
                          {order.quantity > 1 ? ` ×${order.quantity}` : ""}
                        </p>
                        <p className="truncate text-xs text-slate-500">{order.client_name}</p>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-500">
                            {order.days_in_status === 0
                              ? "Hoy en esta etapa"
                              : `${order.days_in_status} d en etapa`}
                          </span>
                          {promised ? (
                            <span
                              className={`rounded-md px-1.5 py-0.5 font-medium ${
                                order.overdue ? "bg-rose-50 font-bold text-rose-700" : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {order.overdue ? "Atrasado · " : "Entrega "}
                              {promised}
                            </span>
                          ) : null}
                          {order.urgency === "express" ? (
                            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 font-bold text-amber-700">
                              EXPRESS
                            </span>
                          ) : null}
                        </div>

                        {order.current_owner ? (
                          <p className="mt-1.5 truncate text-[11px] text-slate-400">
                            Responsable: {order.current_owner}
                          </p>
                        ) : null}

                        <div className="mt-2.5 flex items-center gap-1.5 border-t border-slate-100 pt-2.5">
                          {previous ? (
                            <form action={onMove}>
                              <input type="hidden" name="orderId" value={order.id} />
                              <input type="hidden" name="status" value={previous} />
                              <button
                                type="submit"
                                title={`Devolver a ${flowLabels[previous]}`}
                                className="cursor-pointer rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
                              >
                                ←
                              </button>
                            </form>
                          ) : null}
                          {next ? (
                            <form action={onMove} className="flex-1">
                              <input type="hidden" name="orderId" value={order.id} />
                              <input type="hidden" name="status" value={next} />
                              <button
                                type="submit"
                                className="w-full cursor-pointer rounded-lg bg-slate-900 px-2 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"
                              >
                                {next === "entregado" ? "Entregar ✓" : `${flowLabels[next]} →`}
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
