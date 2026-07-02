"use client";

import { useState } from "react";

import {
  agingBucket,
  CASH_METHODS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  quoteSubtotal,
  type QuoteItem,
} from "@/lib/finance-math";
import type {
  CashMovement,
  CashSession,
  ExchangeRate,
  Invoice,
  Quote,
  ReceivableRow,
} from "@/lib/finance";

type FinanceTab = "caja" | "gastos" | "cobrar" | "presupuestos" | "facturas" | "cierres" | "tasa";

interface FinancePanelProps {
  ready: boolean;
  isAdmin: boolean;
  branches: string[];
  todayRate: ExchangeRate | null;
  recentRates: ExchangeRate[];
  movements: CashMovement[];
  openSessions: (CashSession | null)[];
  recentSessions: CashSession[];
  receivables: ReceivableRow[];
  quotes: Quote[];
  invoices: Invoice[];
  quoteClients: { id: string; name: string }[];
  invoiceOrders: { id: string; order_number: string; client_name: string; total_amount: number }[];
  onSetRate: (formData: FormData) => void;
  onCreateMovement: (formData: FormData) => void;
  onOpenSession: (formData: FormData) => void;
  onCloseSession: (formData: FormData) => void;
  onRegisterReceivable: (formData: FormData) => void;
  onCreateQuote: (formData: FormData) => void;
  onQuoteStatus: (formData: FormData) => void;
  onConvertQuote: (formData: FormData) => void;
  onCreateInvoice: (formData: FormData) => void;
  onAnnulInvoice: (formData: FormData) => void;
}

const tabs: { id: FinanceTab; label: string }[] = [
  { id: "caja", label: "Caja" },
  { id: "gastos", label: "Gastos" },
  { id: "cobrar", label: "Por cobrar" },
  { id: "presupuestos", label: "Presupuestos" },
  { id: "facturas", label: "Facturas" },
  { id: "cierres", label: "Cierres" },
  { id: "tasa", label: "Tasa" },
];

const usdFormatter = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const vesFormatter = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 });

function usd(value: number) {
  return usdFormatter.format(value);
}

function ves(value: number) {
  return `Bs ${vesFormatter.format(value)}`;
}

function timeLabel(iso: string) {
  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function methodLabel(method: string) {
  return CASH_METHODS.find((item) => item.value === method)?.label ?? method;
}

const quoteStatusStyles: Record<string, string> = {
  borrador: "border-slate-200 bg-slate-50 text-slate-500",
  enviado: "border-blue-200 bg-blue-50 text-blue-700",
  aceptado: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rechazado: "border-rose-200 bg-rose-50 text-rose-700",
  convertido: "border-violet-200 bg-violet-50 text-violet-700",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]";
const labelClass = "mb-1.5 block text-xs font-semibold text-slate-500";
const buttonClass =
  "cursor-pointer rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700";
const cardClass =
  "rounded-[1.75rem] border border-slate-200 bg-white/85 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.05)]";

// Panel de Finanzas (fase 1a, estilo Treinta): caja del día con movimientos,
// gastos, cuentas por cobrar con antigüedad, cierres y tasa del día.
export function FinancePanel({
  ready,
  isAdmin,
  branches,
  todayRate,
  recentRates,
  movements,
  openSessions,
  recentSessions,
  receivables,
  quotes,
  invoices,
  quoteClients,
  invoiceOrders,
  onSetRate,
  onCreateMovement,
  onOpenSession,
  onCloseSession,
  onRegisterReceivable,
  onCreateQuote,
  onQuoteStatus,
  onConvertQuote,
  onCreateInvoice,
  onAnnulInvoice,
}: FinancePanelProps) {
  const [tab, setTab] = useState<FinanceTab>("caja");

  if (!ready) {
    return (
      <section className={cardClass}>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          Finanzas
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-slate-950">
          Falta activar las tablas de finanzas.
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
          Ejecuta la última versión de <code className="rounded bg-slate-100 px-1.5 py-0.5">supabase/setup.sql</code> en
          el SQL Editor de Supabase (es idempotente: no daña lo que ya existe) y recarga esta página.
        </p>
      </section>
    );
  }

  const incomeUsd = movements
    .filter((m) => m.type === "ingreso")
    .reduce((sum, m) => sum + Number(m.amount_usd), 0);
  const expenseUsd = movements
    .filter((m) => m.type === "egreso")
    .reduce((sum, m) => sum + Number(m.amount_usd), 0);
  const expenses = movements.filter((m) => m.type === "egreso");
  const receivableTotal = receivables.reduce((sum, row) => sum + row.pending_amount, 0);

  const agingStyles: Record<string, string> = {
    "0-7": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "8-30": "bg-amber-50 text-amber-700 border-amber-200",
    "31+": "bg-rose-50 text-rose-700 border-rose-200",
  };

  const movementForm = (fixedType?: "ingreso" | "egreso") => (
    <form action={onCreateMovement} className="grid gap-3 sm:grid-cols-2">
      {fixedType ? (
        <input type="hidden" name="type" value={fixedType} />
      ) : (
        <div>
          <label className={labelClass}>Tipo</label>
          <select name="type" className={inputClass} defaultValue="ingreso">
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Gasto</option>
          </select>
        </div>
      )}
      <div>
        <label className={labelClass}>Método</label>
        <select name="method" className={inputClass} defaultValue="efectivo_usd">
          {CASH_METHODS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label} ({item.currency === "USD" ? "USD" : "Bs"})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Monto (en la moneda del método)</label>
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="0,00"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Categoría</label>
        <select
          name="category"
          className={inputClass}
          defaultValue={fixedType === "egreso" ? "insumos" : "venta"}
        >
          {fixedType !== "egreso" ? (
            <optgroup label="Ingresos">
              {INCOME_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace("_", " ")}
                </option>
              ))}
            </optgroup>
          ) : null}
          {fixedType !== "ingreso" ? (
            <optgroup label="Gastos">
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
      </div>
      <div>
        <label className={labelClass}>Sucursal</label>
        <select name="branch" className={inputClass} defaultValue={branches[0] ?? ""}>
          {branches.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Descripción (opcional)</label>
        <input name="description" type="text" placeholder="Ej: venta de tarjetas" className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" className={buttonClass}>
          Registrar {fixedType === "egreso" ? "gasto" : "movimiento"}
        </button>
      </div>
    </form>
  );

  const movementList = (items: CashMovement[]) => (
    <div className="divide-y divide-slate-100">
      {items.length === 0 ? (
        <p className="py-6 text-sm text-slate-500">Sin movimientos en las últimas 24 horas.</p>
      ) : (
        items.map((movement) => (
          <div key={movement.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                {movement.description || movement.category}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {timeLabel(movement.created_at)} · {methodLabel(movement.method)} · {movement.category}
                {movement.branch ? ` · ${movement.branch}` : ""}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={`text-sm font-semibold ${
                  movement.type === "ingreso" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {movement.type === "ingreso" ? "+" : "−"}
                {usd(Number(movement.amount_usd))}
              </p>
              {movement.currency_in === "VES" ? (
                <p className="text-xs text-slate-400">{ves(Number(movement.amount_in))}</p>
              ) : null}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <section className="grid gap-5">
      {/* Pestañas */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition ${
              tab === item.id
                ? "border-blue-200 bg-blue-50 text-slate-900"
                : "border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
            }`}
          >
            {item.label}
            {item.id === "cobrar" && receivables.length > 0 ? (
              <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                {receivables.length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "caja" ? (
        <>
          {/* Resumen del día */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className={cardClass}>
              <p className="text-sm text-slate-500">Tasa del día</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {todayRate ? `Bs ${vesFormatter.format(Number(todayRate.bs_per_usd))}` : "—"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {todayRate ? "por 1 USD" : "Fíjala en la pestaña Tasa"}
              </p>
            </article>
            <article className={cardClass}>
              <p className="text-sm text-slate-500">Ingresos (24h)</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-600">{usd(incomeUsd)}</p>
              <p className="mt-1 text-sm text-slate-500">Todos los métodos</p>
            </article>
            <article className={cardClass}>
              <p className="text-sm text-slate-500">Gastos (24h)</p>
              <p className="mt-2 text-3xl font-semibold text-rose-600">{usd(expenseUsd)}</p>
              <p className="mt-1 text-sm text-slate-500">Egresos registrados</p>
            </article>
            <article className={cardClass}>
              <p className="text-sm text-slate-500">Balance (24h)</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {usd(incomeUsd - expenseUsd)}
              </p>
              <p className="mt-1 text-sm text-slate-500">Ingresos − gastos</p>
            </article>
          </div>

          {/* Cajas por sucursal */}
          <div className="grid gap-4 lg:grid-cols-2">
            {branches.map((branch, index) => {
              const open = openSessions[index] ?? null;
              return (
                <article key={branch} className={cardClass}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold capitalize text-slate-900">
                        Caja · {branch}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {open
                          ? `Abierta desde ${timeLabel(open.opened_at)} · fondo ${usd(Number(open.opening_cash_usd))} + ${ves(Number(open.opening_cash_ves))}`
                          : "Cerrada"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        open
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      }`}
                    >
                      {open ? "Abierta" : "Cerrada"}
                    </span>
                  </div>

                  {open ? (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-semibold text-blue-600">
                        Cerrar caja (contar efectivo)
                      </summary>
                      <form action={onCloseSession} className="mt-3 grid gap-3 sm:grid-cols-2">
                        <input type="hidden" name="sessionId" value={open.id} />
                        <div>
                          <label className={labelClass}>Efectivo USD contado</label>
                          <input name="countedUsd" type="number" step="0.01" min="0" required className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Efectivo Bs contado</label>
                          <input name="countedVes" type="number" step="0.01" min="0" required className={inputClass} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Notas (opcional)</label>
                          <input name="notes" type="text" className={inputClass} />
                        </div>
                        <div className="sm:col-span-2">
                          <button type="submit" className={buttonClass}>
                            Cerrar caja
                          </button>
                        </div>
                      </form>
                    </details>
                  ) : (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-semibold text-blue-600">
                        Abrir caja
                      </summary>
                      <form action={onOpenSession} className="mt-3 grid gap-3 sm:grid-cols-2">
                        <input type="hidden" name="branch" value={branch} />
                        <div>
                          <label className={labelClass}>Fondo inicial USD</label>
                          <input name="openingUsd" type="number" step="0.01" min="0" defaultValue="0" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Fondo inicial Bs</label>
                          <input name="openingVes" type="number" step="0.01" min="0" defaultValue="0" className={inputClass} />
                        </div>
                        <div className="sm:col-span-2">
                          <button type="submit" className={buttonClass}>
                            Abrir caja
                          </button>
                        </div>
                      </form>
                    </details>
                  )}
                </article>
              );
            })}
          </div>

          {/* Registrar + lista */}
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <article className={cardClass}>
              <h3 className="text-lg font-semibold text-slate-950">Registrar movimiento</h3>
              <p className="mb-4 mt-1 text-sm text-slate-500">
                Los montos en Bs se convierten con la tasa del día.
              </p>
              {movementForm()}
            </article>
            <article className={cardClass}>
              <h3 className="text-lg font-semibold text-slate-950">Movimientos (24h)</h3>
              {movementList(movements)}
            </article>
          </div>
        </>
      ) : null}

      {tab === "gastos" ? (
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <article className={cardClass}>
            <h3 className="text-lg font-semibold text-slate-950">Registrar gasto</h3>
            <p className="mb-4 mt-1 text-sm text-slate-500">
              Insumos, servicios, sueldos, alquiler y otros egresos del negocio.
            </p>
            {movementForm("egreso")}
          </article>
          <article className={cardClass}>
            <h3 className="text-lg font-semibold text-slate-950">Gastos (24h)</h3>
            {movementList(expenses)}
          </article>
        </div>
      ) : null}

      {tab === "cobrar" ? (
        <article className={cardClass}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Cuentas por cobrar</h3>
              <p className="mt-1 text-sm text-slate-500">
                Pedidos con saldo pendiente. Registra abonos aquí y la caja se actualiza sola.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total por cobrar</p>
              <p className="text-2xl font-semibold text-rose-600">{usd(receivableTotal)}</p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {receivables.length === 0 ? (
              <p className="py-6 text-sm text-slate-500">Nadie te debe. 🎉</p>
            ) : (
              receivables.map((row) => {
                const bucket = agingBucket(row.created_at);
                return (
                  <div key={row.order_id} className="py-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {row.client_name}
                          <span className="ml-2 font-normal text-slate-400">
                            {row.order_number}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Total {usd(row.total_amount)} · Abonado {usd(row.deposit_amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${agingStyles[bucket]}`}
                        >
                          {bucket} días
                        </span>
                        <p className="text-base font-semibold text-slate-950">
                          {usd(row.pending_amount)}
                        </p>
                      </div>
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-semibold text-blue-600">
                        Registrar abono
                      </summary>
                      <form
                        action={onRegisterReceivable}
                        className="mt-2 flex flex-wrap items-end gap-2.5"
                      >
                        <input type="hidden" name="orderId" value={row.order_id} />
                        <div>
                          <label className={labelClass}>Monto</label>
                          <input
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            className={`${inputClass} w-32`}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Método</label>
                          <select name="method" className={`${inputClass} w-44`} defaultValue="efectivo_usd">
                            {CASH_METHODS.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label} ({item.currency === "USD" ? "USD" : "Bs"})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Sucursal</label>
                          <select name="branch" className={`${inputClass} w-40`} defaultValue={branches[0] ?? ""}>
                            {branches.map((branch) => (
                              <option key={branch} value={branch}>
                                {branch}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button type="submit" className={buttonClass}>
                          Abonar
                        </button>
                      </form>
                    </details>
                  </div>
                );
              })
            )}
          </div>
        </article>
      ) : null}

      {tab === "presupuestos" ? (
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <article className={cardClass}>
            <h3 className="text-lg font-semibold text-slate-950">Nuevo presupuesto</h3>
            <p className="mb-4 mt-1 text-sm text-slate-500">
              Cotización formal para el cliente; al aceptarla la conviertes en pedido con un clic.
            </p>
            <form action={onCreateQuote} className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Cliente registrado</label>
                  <select name="clientId" className={inputClass} defaultValue="">
                    <option value="">— Sin registrar (solo nombre) —</option>
                    {quoteClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Nombre del cliente</label>
                  <input name="clientName" type="text" required placeholder="Ej: Panadería La Espiga" className={inputClass} />
                </div>
              </div>
              <QuoteItemsEditor />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Válido hasta (opcional)</label>
                  <input name="validUntil" type="date" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Notas (opcional)</label>
                  <input name="notes" type="text" className={inputClass} />
                </div>
              </div>
              <div>
                <button type="submit" className={buttonClass}>
                  Crear presupuesto
                </button>
              </div>
            </form>
          </article>

          <article className={cardClass}>
            <h3 className="text-lg font-semibold text-slate-950">Presupuestos</h3>
            <div className="mt-3 divide-y divide-slate-100">
              {quotes.length === 0 ? (
                <p className="py-6 text-sm text-slate-500">Todavía no hay presupuestos.</p>
              ) : (
                quotes.map((quote) => (
                  <div key={quote.id} className="py-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          P-{String(quote.quote_number).padStart(4, "0")}
                          <span className="ml-2 font-normal text-slate-500">{quote.client_name}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {timeLabel(quote.created_at)}
                          {quote.valid_until ? ` · válido hasta ${quote.valid_until}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${quoteStatusStyles[quote.status]}`}>
                          {quote.status}
                        </span>
                        <p className="text-base font-semibold text-slate-950">{usd(Number(quote.subtotal_usd))}</p>
                      </div>
                    </div>
                    <details className="mt-1.5">
                      <summary className="cursor-pointer text-xs font-semibold text-blue-600">Ver ítems y acciones</summary>
                      <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        {(quote.items ?? []).map((item, index) => (
                          <p key={index}>
                            {item.description} — {item.quantity} × {usd(item.unit_price_usd)}
                          </p>
                        ))}
                        {quote.notes ? <p className="mt-1 italic">{quote.notes}</p> : null}
                      </div>
                      {quote.status !== "convertido" ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {quote.status !== "aceptado" ? (
                            <form action={onQuoteStatus}>
                              <input type="hidden" name="quoteId" value={quote.id} />
                              <input type="hidden" name="status" value="aceptado" />
                              <button type="submit" className="cursor-pointer rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">
                                Marcar aceptado
                              </button>
                            </form>
                          ) : null}
                          {quote.status !== "rechazado" ? (
                            <form action={onQuoteStatus}>
                              <input type="hidden" name="quoteId" value={quote.id} />
                              <input type="hidden" name="status" value="rechazado" />
                              <button type="submit" className="cursor-pointer rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">
                                Marcar rechazado
                              </button>
                            </form>
                          ) : null}
                          {quote.client_id ? (
                            <form action={onConvertQuote}>
                              <input type="hidden" name="quoteId" value={quote.id} />
                              <button type="submit" className="cursor-pointer rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700">
                                Convertir en pedido
                              </button>
                            </form>
                          ) : (
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-400">
                              Para convertirlo, créalo con cliente registrado
                            </span>
                          )}
                        </div>
                      ) : null}
                    </details>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      ) : null}

      {tab === "facturas" ? (
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <article className={cardClass}>
            <h3 className="text-lg font-semibold text-slate-950">Emitir factura</h3>
            <p className="mb-4 mt-1 text-sm text-slate-500">
              Desde un pedido con total. Control interno con IVA 16% e IGTF 3% (pago en divisas); no sustituye la facturación fiscal certificada.
            </p>
            {invoiceOrders.length === 0 ? (
              <p className="text-sm text-slate-500">No hay pedidos con total definido para facturar.</p>
            ) : (
              <form action={onCreateInvoice} className="grid gap-3">
                <div>
                  <label className={labelClass}>Pedido</label>
                  <select name="orderId" required className={inputClass} defaultValue="">
                    <option value="" disabled>
                      Selecciona un pedido…
                    </option>
                    {invoiceOrders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.order_number} · {order.client_name} · {usd(order.total_amount)}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2.5 text-sm text-slate-700">
                  <input type="checkbox" name="applyIva" defaultChecked className="h-4 w-4 accent-slate-900" />
                  Aplicar IVA (16%)
                </label>
                <label className="flex items-center gap-2.5 text-sm text-slate-700">
                  <input type="checkbox" name="foreignCurrencyPayment" className="h-4 w-4 accent-slate-900" />
                  Pago en divisas → aplicar IGTF (3%)
                </label>
                <div>
                  <label className={labelClass}>Notas (opcional)</label>
                  <input name="notes" type="text" className={inputClass} />
                </div>
                <div>
                  <button type="submit" className={buttonClass}>
                    Emitir factura
                  </button>
                </div>
              </form>
            )}
          </article>

          <article className={cardClass}>
            <h3 className="text-lg font-semibold text-slate-950">Facturas emitidas</h3>
            <div className="mt-3 divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <p className="py-6 text-sm text-slate-500">Todavía no hay facturas.</p>
              ) : (
                invoices.map((invoice) => (
                  <div key={invoice.id} className="py-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          F-{String(invoice.invoice_number).padStart(5, "0")}
                          <span className="ml-2 font-normal text-slate-500">{invoice.client_name}</span>
                          {invoice.status === "anulada" ? (
                            <span className="ml-2 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                              anulada
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">{timeLabel(invoice.issued_at)}</p>
                      </div>
                      <p className={`text-base font-semibold ${invoice.status === "anulada" ? "text-slate-400 line-through" : "text-slate-950"}`}>
                        {usd(Number(invoice.total_usd))}
                      </p>
                    </div>
                    <details className="mt-1.5">
                      <summary className="cursor-pointer text-xs font-semibold text-blue-600">Ver desglose</summary>
                      <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        {(invoice.items ?? []).map((item, index) => (
                          <p key={index}>{item.description}</p>
                        ))}
                        <p className="mt-1.5">Subtotal: {usd(Number(invoice.subtotal_usd))}</p>
                        <p>IVA ({Math.round(Number(invoice.iva_rate) * 100)}%): {usd(Number(invoice.iva_usd))}</p>
                        <p>IGTF ({Math.round(Number(invoice.igtf_rate) * 100)}%): {usd(Number(invoice.igtf_usd))}</p>
                        <p className="font-semibold text-slate-900">Total: {usd(Number(invoice.total_usd))}</p>
                        {invoice.exchange_rate ? (
                          <p className="mt-1 text-slate-500">
                            ≈ {ves(Number(invoice.total_usd) * Number(invoice.exchange_rate))} (tasa {vesFormatter.format(Number(invoice.exchange_rate))})
                          </p>
                        ) : null}
                      </div>
                      {invoice.status === "emitida" && isAdmin ? (
                        <form action={onAnnulInvoice} className="mt-2">
                          <input type="hidden" name="invoiceId" value={invoice.id} />
                          <button type="submit" className="cursor-pointer rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">
                            Anular factura
                          </button>
                        </form>
                      ) : null}
                    </details>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      ) : null}

      {tab === "cierres" ? (
        <article className={cardClass}>
          <h3 className="text-lg font-semibold text-slate-950">Cierres de caja</h3>
          <div className="mt-4 divide-y divide-slate-100">
            {recentSessions.length === 0 ? (
              <p className="py-6 text-sm text-slate-500">Todavía no hay cierres registrados.</p>
            ) : (
              recentSessions.map((session) => {
                const diffUsd =
                  session.counted_cash_usd !== null && session.expected_cash_usd !== null
                    ? Number(session.counted_cash_usd) - Number(session.expected_cash_usd)
                    : null;
                return (
                  <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                    <div>
                      <p className="text-sm font-semibold capitalize text-slate-900">
                        {session.branch}
                        <span
                          className={`ml-2 rounded-full border px-2 py-0.5 text-xs font-semibold ${
                            session.status === "abierta"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-500"
                          }`}
                        >
                          {session.status}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Abierta {timeLabel(session.opened_at)}
                        {session.closed_at ? ` · cerrada ${timeLabel(session.closed_at)}` : ""}
                      </p>
                      {session.notes ? (
                        <p className="mt-0.5 text-xs italic text-slate-400">{session.notes}</p>
                      ) : null}
                    </div>
                    {session.status === "cerrada" ? (
                      <div className="text-right text-sm">
                        <p className="text-slate-600">
                          Esperado {usd(Number(session.expected_cash_usd ?? 0))} ·{" "}
                          {ves(Number(session.expected_cash_ves ?? 0))}
                        </p>
                        <p className="text-slate-600">
                          Contado {usd(Number(session.counted_cash_usd ?? 0))} ·{" "}
                          {ves(Number(session.counted_cash_ves ?? 0))}
                        </p>
                        {diffUsd !== null ? (
                          <p
                            className={`font-semibold ${
                              Math.abs(diffUsd) < 0.01
                                ? "text-emerald-600"
                                : diffUsd > 0
                                  ? "text-blue-600"
                                  : "text-rose-600"
                            }`}
                          >
                            Diferencia USD: {diffUsd > 0 ? "+" : ""}
                            {usd(diffUsd)}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </article>
      ) : null}

      {tab === "tasa" ? (
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <article className={cardClass}>
            <h3 className="text-lg font-semibold text-slate-950">Tasa del día</h3>
            <p className="mb-4 mt-1 text-sm text-slate-500">
              Cuántos bolívares vale 1 USD hoy. Se usa para convertir todo lo que entre en Bs.
            </p>
            <form action={onSetRate} className="flex flex-wrap items-end gap-3">
              <div>
                <label className={labelClass}>Bs por 1 USD</label>
                <input
                  name="bsPerUsd"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  required
                  defaultValue={todayRate ? Number(todayRate.bs_per_usd) : undefined}
                  placeholder="Ej: 105,35"
                  className={`${inputClass} w-44`}
                />
              </div>
              <button type="submit" className={buttonClass}>
                Guardar tasa de hoy
              </button>
            </form>
          </article>
          <article className={cardClass}>
            <h3 className="text-lg font-semibold text-slate-950">Historial</h3>
            <div className="mt-3 divide-y divide-slate-100">
              {recentRates.length === 0 ? (
                <p className="py-6 text-sm text-slate-500">Sin tasas registradas todavía.</p>
              ) : (
                recentRates.map((rate) => (
                  <div key={rate.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-slate-600">{rate.rate_date}</span>
                    <span className="font-semibold text-slate-900">
                      Bs {vesFormatter.format(Number(rate.bs_per_usd))}
                    </span>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}

// Editor de ítems del presupuesto: filas descripción/cantidad/precio en estado
// local, serializadas a un input oculto (JSON) que consume la server action.
function QuoteItemsEditor() {
  const [items, setItems] = useState<QuoteItem[]>([
    { description: "", quantity: 1, unit_price_usd: 0 },
  ]);

  const update = (index: number, patch: Partial<QuoteItem>) => {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const validItems = items.filter(
    (item) => item.description.trim() && item.quantity > 0 && item.unit_price_usd >= 0,
  );

  return (
    <div>
      <label className={labelClass}>Ítems</label>
      <input type="hidden" name="items" value={JSON.stringify(validItems)} />
      <div className="grid gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={item.description}
              onChange={(event) => update(index, { description: event.target.value })}
              placeholder="Descripción (ej: 500 tarjetas mate)"
              className={`${inputClass} min-w-0 flex-1`}
            />
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(event) => update(index, { quantity: Math.max(1, Number(event.target.value) || 1) })}
              aria-label="Cantidad"
              className={`${inputClass} w-20`}
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={item.unit_price_usd}
              onChange={(event) => update(index, { unit_price_usd: Math.max(0, Number(event.target.value) || 0) })}
              aria-label="Precio unitario USD"
              className={`${inputClass} w-28`}
            />
            {items.length > 1 ? (
              <button
                type="button"
                onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                aria-label="Quitar ítem"
                className="cursor-pointer rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-rose-200 hover:text-rose-600"
              >
                ×
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setItems((current) => [...current, { description: "", quantity: 1, unit_price_usd: 0 }])}
          className="cursor-pointer text-xs font-semibold text-blue-600 transition hover:text-blue-800"
        >
          + Añadir ítem
        </button>
        <p className="text-sm font-semibold text-slate-900">
          Subtotal: {usd(quoteSubtotal(validItems))}
        </p>
      </div>
    </div>
  );
}
