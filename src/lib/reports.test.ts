import { describe, expect, it } from "vitest";

import {
  computePnl,
  incomeByDay,
  topClients,
  topProducts,
  totalsByMethod,
  type ReportMovement,
  type ReportOrder,
} from "@/lib/reports";

const movements: ReportMovement[] = [
  { type: "ingreso", amount_usd: 100, method: "efectivo_usd", created_at: "2026-07-01T14:00:00Z" },
  { type: "ingreso", amount_usd: 50, method: "zelle", created_at: "2026-07-01T15:00:00Z" },
  { type: "ingreso", amount_usd: 30, method: "zelle", created_at: "2026-06-30T15:00:00Z" },
  { type: "egreso", amount_usd: 40, method: "efectivo_usd", created_at: "2026-07-01T16:00:00Z" },
];

const orders: ReportOrder[] = [
  { product_type: "Tarjetas premium", quantity: 100, total_amount: 18, client_name: "Ana", created_at: "2026-07-01T10:00:00Z", status: "entregado" },
  { product_type: "Tarjetas premium", quantity: 250, total_amount: 35, client_name: "Luis", created_at: "2026-07-01T11:00:00Z", status: "recibido" },
  { product_type: "Pendón", quantity: 1, total_amount: 60, client_name: "Ana", created_at: "2026-06-30T10:00:00Z", status: "rechazado" },
];

describe("computePnl", () => {
  it("suma ingresos, gastos y resultado", () => {
    const pnl = computePnl(movements);
    expect(pnl.incomeUsd).toBe(180);
    expect(pnl.expenseUsd).toBe(40);
    expect(pnl.netUsd).toBe(140);
  });
});

describe("incomeByDay", () => {
  it("agrupa ingresos por día y rellena días vacíos", () => {
    const series = incomeByDay(movements, 3, new Date("2026-07-01T20:00:00Z"));
    expect(series).toHaveLength(3);
    expect(series[2].income).toBe(150); // 2026-07-01
    expect(series[1].income).toBe(30); // 2026-06-30
    expect(series[0].income).toBe(0); // 2026-06-29 (vacío)
  });
});

describe("totalsByMethod", () => {
  it("totaliza ingresos por método, ordenado desc", () => {
    const byMethod = totalsByMethod(movements);
    expect(byMethod[0]).toEqual({ method: "efectivo_usd", income: 100 });
    expect(byMethod[1]).toEqual({ method: "zelle", income: 80 });
  });
});

describe("topProducts", () => {
  it("agrupa por producto excluyendo rechazados", () => {
    const top = topProducts(orders);
    expect(top[0]).toMatchObject({ name: "Tarjetas premium", count: 2, revenue: 53 });
    expect(top).toHaveLength(1); // el pendón está rechazado
  });
});

describe("topClients", () => {
  it("ordena clientes por facturación excluyendo rechazados", () => {
    const top = topClients(orders);
    expect(top[0]).toMatchObject({ name: "Luis", revenue: 35 });
    expect(top[1]).toMatchObject({ name: "Ana", revenue: 18 });
  });
});
