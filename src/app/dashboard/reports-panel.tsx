"use client";

import Link from "next/link";

import { CASH_METHODS } from "@/lib/finance-math";

// Reportes (fase 4): P&L del período, ventas por día (barras CSS), métodos de
// pago, productos y clientes top, productividad del equipo.

interface ReportsPanelProps {
  ready: boolean;
  periodDays: number;
  pnl: { incomeUsd: number; expenseUsd: number; netUsd: number };
  ordersCreated: number;
  avgTicket: number;
  series: { day: string; income: number }[];
  byMethod: { method: string; income: number }[];
  products: { name: string; count: number; units: number; revenue: number }[];
  clientsTop: { name: string; count: number; revenue: number }[];
  productivity: { name: string; moves: number }[];
}

const usd = (value: number) =>
  new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const cardClass =
  "rounded-[1.75rem] border border-slate-200 bg-white/85 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.05)]";

function methodLabel(method: string) {
  return CASH_METHODS.find((item) => item.value === method)?.label ?? method;
}

function dayLabel(day: string) {
  const parsed = new Date(`${day}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return day;
  return new Intl.DateTimeFormat("es-VE", { day: "2-digit", month: "2-digit" }).format(parsed);
}

function BarList({
  items,
}: {
  items: { label: string; sublabel?: string; value: number; display: string }[];
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="mt-3 grid gap-2.5">
      {items.length === 0 ? (
        <p className="py-4 text-sm text-slate-500">Sin datos en este período.</p>
      ) : (
        items.map((item) => (
          <div key={item.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium text-slate-800">
                {item.label}
                {item.sublabel ? (
                  <span className="ml-1.5 text-xs font-normal text-slate-400">{item.sublabel}</span>
                ) : null}
              </span>
              <span className="shrink-0 font-semibold text-slate-950">{item.display}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function ReportsPanel({
  ready,
  periodDays,
  pnl,
  ordersCreated,
  avgTicket,
  series,
  byMethod,
  products,
  clientsTop,
  productivity,
}: ReportsPanelProps) {
  if (!ready) {
    return (
      <section className={cardClass}>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Reportes</p>
        <h3 className="mt-3 text-2xl font-semibold text-slate-950">
          Faltan las tablas de finanzas.
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
          Los reportes se alimentan de la caja. Ejecuta la última versión de{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5">supabase/setup.sql</code> y recarga.
        </p>
      </section>
    );
  }

  const maxIncome = Math.max(...series.map((point) => point.income), 1);

  return (
    <section className="grid gap-5">
      {/* Período */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Período
        </span>
        {[7, 30, 90].map((days) => (
          <Link
            key={days}
            href={`/dashboard?view=reportes&rp=${days}`}
            className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition ${
              periodDays === days
                ? "border-blue-200 bg-blue-50 text-slate-900"
                : "border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
            }`}
          >
            {days} días
          </Link>
        ))}
      </div>

      {/* P&L */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className={cardClass}>
          <p className="text-sm text-slate-500">Ingresos</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">{usd(pnl.incomeUsd)}</p>
          <p className="mt-1 text-sm text-slate-500">Todo lo que entró a caja</p>
        </article>
        <article className={cardClass}>
          <p className="text-sm text-slate-500">Gastos</p>
          <p className="mt-2 text-3xl font-semibold text-rose-600">{usd(pnl.expenseUsd)}</p>
          <p className="mt-1 text-sm text-slate-500">Egresos del negocio</p>
        </article>
        <article className={cardClass}>
          <p className="text-sm text-slate-500">Resultado</p>
          <p className={`mt-2 text-3xl font-semibold ${pnl.netUsd >= 0 ? "text-slate-950" : "text-rose-600"}`}>
            {usd(pnl.netUsd)}
          </p>
          <p className="mt-1 text-sm text-slate-500">Ingresos − gastos</p>
        </article>
        <article className={cardClass}>
          <p className="text-sm text-slate-500">Pedidos creados</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{ordersCreated}</p>
          <p className="mt-1 text-sm text-slate-500">En el período</p>
        </article>
        <article className={cardClass}>
          <p className="text-sm text-slate-500">Ticket promedio</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{usd(avgTicket)}</p>
          <p className="mt-1 text-sm text-slate-500">Total ÷ pedidos con monto</p>
        </article>
      </div>

      {/* Ventas por día */}
      <article className={cardClass}>
        <h3 className="text-lg font-semibold text-slate-950">Ingresos por día</h3>
        <p className="mt-1 text-sm text-slate-500">
          {series.length < periodDays
            ? `Últimos ${series.length} días del período.`
            : "Lo que entró a caja cada día."}
        </p>
        <div className="mt-4 flex h-40 items-end gap-1">
          {series.map((point) => (
            <div key={point.day} className="group relative flex-1">
              <div
                className={`w-full rounded-t ${point.income > 0 ? "bg-blue-500" : "bg-slate-100"}`}
                style={{ height: `${Math.max(3, (point.income / maxIncome) * 152)}px` }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white group-hover:block">
                {dayLabel(point.day)} · {usd(point.income)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-slate-400">
          <span>{series.length > 0 ? dayLabel(series[0].day) : ""}</span>
          <span>{series.length > 0 ? dayLabel(series[series.length - 1].day) : ""}</span>
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className={cardClass}>
          <h3 className="text-lg font-semibold text-slate-950">Ingresos por método de pago</h3>
          <BarList
            items={byMethod.map((item) => ({
              label: methodLabel(item.method),
              value: item.income,
              display: usd(item.income),
            }))}
          />
        </article>

        <article className={cardClass}>
          <h3 className="text-lg font-semibold text-slate-950">Productos más vendidos</h3>
          <BarList
            items={products.map((item) => ({
              label: item.name,
              sublabel: `${item.count} pedido${item.count === 1 ? "" : "s"}`,
              value: item.revenue,
              display: usd(item.revenue),
            }))}
          />
        </article>

        <article className={cardClass}>
          <h3 className="text-lg font-semibold text-slate-950">Clientes top</h3>
          <BarList
            items={clientsTop.map((item) => ({
              label: item.name,
              sublabel: `${item.count} pedido${item.count === 1 ? "" : "s"}`,
              value: item.revenue,
              display: usd(item.revenue),
            }))}
          />
        </article>

        <article className={cardClass}>
          <h3 className="text-lg font-semibold text-slate-950">Productividad del equipo</h3>
          <p className="mt-1 text-sm text-slate-500">Avances de etapa registrados por persona.</p>
          <BarList
            items={productivity.map((item) => ({
              label: item.name,
              value: item.moves,
              display: `${item.moves} avance${item.moves === 1 ? "" : "s"}`,
            }))}
          />
        </article>
      </div>
    </section>
  );
}
