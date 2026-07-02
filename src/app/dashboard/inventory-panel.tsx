"use client";

import { useState } from "react";

import { CASH_METHODS } from "@/lib/finance-math";
import {
  SUPPLY_CATEGORIES,
  SUPPLY_UNITS,
  type Supply,
  type SupplyMovement,
} from "@/lib/supplies";

// Inventario real (fase 3): insumos con stock/mínimos, entradas (compras con
// gasto opcional en caja), salidas (consumo por pedido), ajustes y alertas.

type MovementWithSupply = SupplyMovement & { supply_name: string; supply_unit: string };

interface InventoryPanelProps {
  ready: boolean;
  supplies: Supply[];
  movements: MovementWithSupply[];
  activeOrders: { id: string; order_number: string; client_name: string }[];
  onCreateSupply: (formData: FormData) => void;
  onUpdateSupply: (formData: FormData) => void;
  onDeactivateSupply: (formData: FormData) => void;
  onMovement: (formData: FormData) => void;
}

const usdFormatter = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const qtyFormatter = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 });

function timeLabel(iso: string) {
  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]";
const labelClass = "mb-1.5 block text-xs font-semibold text-slate-500";
const buttonClass =
  "cursor-pointer rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700";
const cardClass =
  "rounded-[1.75rem] border border-slate-200 bg-white/85 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.05)]";

const movementTone: Record<string, string> = {
  entrada: "text-emerald-600",
  salida: "text-rose-600",
  ajuste: "text-blue-600",
};

export function InventoryPanel({
  ready,
  supplies,
  movements,
  activeOrders,
  onCreateSupply,
  onUpdateSupply,
  onDeactivateSupply,
  onMovement,
}: InventoryPanelProps) {
  const [query, setQuery] = useState("");

  if (!ready) {
    return (
      <section className={cardClass}>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          Inventario
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-slate-950">
          Falta activar las tablas de inventario.
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
          Ejecuta la última versión de <code className="rounded bg-slate-100 px-1.5 py-0.5">supabase/setup.sql</code> en
          el SQL Editor de Supabase y recarga esta página.
        </p>
      </section>
    );
  }

  const lowStock = supplies.filter((supply) => Number(supply.stock) <= Number(supply.min_stock));
  const inventoryValue = supplies.reduce(
    (sum, supply) => sum + Number(supply.stock) * Number(supply.cost_usd ?? 0),
    0,
  );
  const visibleSupplies = supplies.filter((supply) => {
    if (!query.trim()) return true;
    return `${supply.name} ${supply.category} ${supply.supplier ?? ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  });

  return (
    <section className="grid gap-5">
      {/* Resumen */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className={cardClass}>
          <p className="text-sm text-slate-500">Insumos activos</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{supplies.length}</p>
          <p className="mt-1 text-sm text-slate-500">Materiales bajo control</p>
        </article>
        <article className={cardClass}>
          <p className="text-sm text-slate-500">Bajo stock</p>
          <p className={`mt-2 text-3xl font-semibold ${lowStock.length > 0 ? "text-rose-600" : "text-slate-950"}`}>
            {lowStock.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">En o por debajo del mínimo</p>
        </article>
        <article className={cardClass}>
          <p className="text-sm text-slate-500">Valor del inventario</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{usdFormatter.format(inventoryValue)}</p>
          <p className="mt-1 text-sm text-slate-500">Stock × costo unitario</p>
        </article>
        <article className={cardClass}>
          <p className="text-sm text-slate-500">Movimientos recientes</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{movements.length}</p>
          <p className="mt-1 text-sm text-slate-500">Entradas, salidas y ajustes</p>
        </article>
      </div>

      {/* Alerta de bajo stock */}
      {lowStock.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <span className="text-sm font-bold text-rose-700">⚠ Comprar pronto:</span>
          {lowStock.map((supply) => (
            <span key={supply.id} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700">
              {supply.name} · quedan {qtyFormatter.format(Number(supply.stock))} {supply.unit}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Lista de insumos */}
        <article className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-950">Insumos</h3>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar insumo…"
              className={`${inputClass} w-52`}
            />
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {visibleSupplies.length === 0 ? (
              <p className="py-6 text-sm text-slate-500">
                {supplies.length === 0
                  ? "Registra tu primer insumo con el formulario de al lado."
                  : "Sin resultados para esa búsqueda."}
              </p>
            ) : (
              visibleSupplies.map((supply) => {
                const isLow = Number(supply.stock) <= Number(supply.min_stock);
                return (
                  <div key={supply.id} className="py-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {supply.name}
                          {isLow ? (
                            <span className="ml-2 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                              BAJO STOCK
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {supply.category}
                          {supply.supplier ? ` · ${supply.supplier}` : ""}
                          {supply.cost_usd ? ` · ${usdFormatter.format(Number(supply.cost_usd))}/${supply.unit}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${isLow ? "text-rose-600" : "text-slate-950"}`}>
                          {qtyFormatter.format(Number(supply.stock))}{" "}
                          <span className="text-xs font-normal text-slate-400">{supply.unit}</span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          mínimo {qtyFormatter.format(Number(supply.min_stock))}
                        </p>
                      </div>
                    </div>

                    <details className="mt-1.5">
                      <summary className="cursor-pointer text-xs font-semibold text-blue-600">
                        Entrada · salida · ajuste · editar
                      </summary>
                      <div className="mt-2 grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                        {/* Entrada (compra) */}
                        <form action={onMovement} className="flex flex-wrap items-end gap-2">
                          <input type="hidden" name="supplyId" value={supply.id} />
                          <input type="hidden" name="type" value="entrada" />
                          <div>
                            <label className={labelClass}>Entrada (compra)</label>
                            <input name="quantity" type="number" step="0.01" min="0.01" required placeholder={`Cant. (${supply.unit})`} className={`${inputClass} w-32`} />
                          </div>
                          <div>
                            <label className={labelClass}>Costo total USD (opc.)</label>
                            <input name="costUsd" type="number" step="0.01" min="0" placeholder="0,00" className={`${inputClass} w-32`} />
                          </div>
                          <div>
                            <label className={labelClass}>Gasto en caja</label>
                            <select name="expenseMethod" className={`${inputClass} w-44`} defaultValue="">
                              <option value="">No registrar gasto</option>
                              {CASH_METHODS.map((item) => (
                                <option key={item.value} value={item.value}>
                                  Sí — {item.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button type="submit" className="cursor-pointer rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100">
                            + Entrada
                          </button>
                        </form>

                        {/* Salida (consumo) */}
                        <form action={onMovement} className="flex flex-wrap items-end gap-2">
                          <input type="hidden" name="supplyId" value={supply.id} />
                          <input type="hidden" name="type" value="salida" />
                          <div>
                            <label className={labelClass}>Salida (consumo)</label>
                            <input name="quantity" type="number" step="0.01" min="0.01" required placeholder={`Cant. (${supply.unit})`} className={`${inputClass} w-32`} />
                          </div>
                          <div>
                            <label className={labelClass}>Pedido (opcional)</label>
                            <select name="orderId" className={`${inputClass} w-52`} defaultValue="">
                              <option value="">Sin pedido</option>
                              {activeOrders.map((order) => (
                                <option key={order.id} value={order.id}>
                                  {order.order_number} · {order.client_name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button type="submit" className="cursor-pointer rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100">
                            − Salida
                          </button>
                        </form>

                        {/* Ajuste */}
                        <form action={onMovement} className="flex flex-wrap items-end gap-2">
                          <input type="hidden" name="supplyId" value={supply.id} />
                          <input type="hidden" name="type" value="ajuste" />
                          <div>
                            <label className={labelClass}>Ajuste (stock real contado)</label>
                            <input name="quantity" type="number" step="0.01" min="0" required placeholder={`Total (${supply.unit})`} className={`${inputClass} w-36`} />
                          </div>
                          <button type="submit" className="cursor-pointer rounded-full border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100">
                            Ajustar
                          </button>
                        </form>

                        {/* Editar / desactivar */}
                        <details>
                          <summary className="cursor-pointer text-xs font-semibold text-slate-500">
                            Editar insumo
                          </summary>
                          <form action={onUpdateSupply} className="mt-2 grid gap-2 sm:grid-cols-2">
                            <input type="hidden" name="supplyId" value={supply.id} />
                            <input name="name" type="text" defaultValue={supply.name} required className={inputClass} aria-label="Nombre" />
                            <input name="supplier" type="text" defaultValue={supply.supplier ?? ""} placeholder="Proveedor" className={inputClass} aria-label="Proveedor" />
                            <select name="category" defaultValue={supply.category} className={inputClass} aria-label="Categoría">
                              {SUPPLY_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                            <select name="unit" defaultValue={supply.unit} className={inputClass} aria-label="Unidad">
                              {SUPPLY_UNITS.map((unit) => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                            <input name="minStock" type="number" step="0.01" min="0" defaultValue={Number(supply.min_stock)} className={inputClass} aria-label="Stock mínimo" />
                            <input name="costUsd" type="number" step="0.01" min="0" defaultValue={supply.cost_usd ? Number(supply.cost_usd) : ""} placeholder="Costo USD/unidad" className={inputClass} aria-label="Costo unitario" />
                            <div className="flex gap-2 sm:col-span-2">
                              <button type="submit" className={buttonClass}>Guardar cambios</button>
                            </div>
                          </form>
                          <form action={onDeactivateSupply} className="mt-2">
                            <input type="hidden" name="supplyId" value={supply.id} />
                            <button type="submit" className="cursor-pointer text-xs font-semibold text-rose-500 transition hover:text-rose-700">
                              Quitar del inventario
                            </button>
                          </form>
                        </details>
                      </div>
                    </details>
                  </div>
                );
              })
            )}
          </div>
        </article>

        <div className="grid gap-4 self-start">
          {/* Nuevo insumo */}
          <article className={cardClass}>
            <h3 className="text-lg font-semibold text-slate-950">Nuevo insumo</h3>
            <form action={onCreateSupply} className="mt-3 grid gap-3">
              <div>
                <label className={labelClass}>Nombre</label>
                <input name="name" type="text" required placeholder="Ej: Vinil blanco mate 1.22m" className={inputClass} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Categoría</label>
                  <select name="category" className={inputClass} defaultValue="papel">
                    {SUPPLY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Unidad</label>
                  <select name="unit" className={inputClass} defaultValue="unidad">
                    {SUPPLY_UNITS.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Stock inicial</label>
                  <input name="stock" type="number" step="0.01" min="0" defaultValue="0" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Stock mínimo (alerta)</label>
                  <input name="minStock" type="number" step="0.01" min="0" defaultValue="0" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Costo USD/unidad (opc.)</label>
                  <input name="costUsd" type="number" step="0.01" min="0" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Proveedor (opc.)</label>
                  <input name="supplier" type="text" className={inputClass} />
                </div>
              </div>
              <div>
                <button type="submit" className={buttonClass}>Registrar insumo</button>
              </div>
            </form>
          </article>

          {/* Movimientos recientes */}
          <article className={cardClass}>
            <h3 className="text-lg font-semibold text-slate-950">Movimientos recientes</h3>
            <div className="mt-2 divide-y divide-slate-100">
              {movements.length === 0 ? (
                <p className="py-6 text-sm text-slate-500">Todavía no hay movimientos.</p>
              ) : (
                movements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{movement.supply_name}</p>
                      <p className="text-xs text-slate-500">
                        {timeLabel(movement.created_at)}
                        {movement.description ? ` · ${movement.description}` : ""}
                      </p>
                    </div>
                    <p className={`shrink-0 text-sm font-semibold ${movementTone[movement.type] ?? "text-slate-600"}`}>
                      {movement.type === "entrada" ? "+" : movement.type === "salida" ? "−" : "="}
                      {qtyFormatter.format(Number(movement.quantity))} {movement.supply_unit}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
