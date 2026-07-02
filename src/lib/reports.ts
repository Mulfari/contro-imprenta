import { round2 } from "@/lib/finance-math";

// Lógica PURA de reportes (fase 4): P&L, serie de ingresos por día, métodos,
// productos y clientes top. Sin Supabase — testeable.

export type ReportMovement = {
  type: "ingreso" | "egreso";
  amount_usd: number;
  method: string;
  created_at: string;
};

export type ReportOrder = {
  product_type: string;
  quantity: number;
  total_amount: number | null;
  client_name: string;
  created_at: string;
  status: string;
};

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Caracas",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dayKey(value: string | Date) {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return dayFormatter.format(parsed);
}

export function computePnl(movements: ReportMovement[]) {
  let incomeUsd = 0;
  let expenseUsd = 0;
  for (const movement of movements) {
    if (movement.type === "ingreso") incomeUsd += Number(movement.amount_usd);
    else expenseUsd += Number(movement.amount_usd);
  }
  return {
    incomeUsd: round2(incomeUsd),
    expenseUsd: round2(expenseUsd),
    netUsd: round2(incomeUsd - expenseUsd),
  };
}

// Serie diaria de ingresos (rellena con 0 los días sin movimientos), del día
// más viejo al más nuevo.
export function incomeByDay(
  movements: ReportMovement[],
  days: number,
  now: Date = new Date(),
): { day: string; income: number }[] {
  const totals = new Map<string, number>();
  for (const movement of movements) {
    if (movement.type !== "ingreso") continue;
    const key = dayKey(movement.created_at);
    totals.set(key, round2((totals.get(key) ?? 0) + Number(movement.amount_usd)));
  }

  const series: { day: string; income: number }[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
    const key = dayKey(date);
    series.push({ day: key, income: totals.get(key) ?? 0 });
  }
  return series;
}

export function totalsByMethod(
  movements: ReportMovement[],
): { method: string; income: number }[] {
  const totals = new Map<string, number>();
  for (const movement of movements) {
    if (movement.type !== "ingreso") continue;
    totals.set(
      movement.method,
      round2((totals.get(movement.method) ?? 0) + Number(movement.amount_usd)),
    );
  }
  return [...totals.entries()]
    .map(([method, income]) => ({ method, income }))
    .sort((a, b) => b.income - a.income);
}

export function topProducts(
  orders: ReportOrder[],
  limit = 6,
): { name: string; count: number; units: number; revenue: number }[] {
  const totals = new Map<string, { count: number; units: number; revenue: number }>();
  for (const order of orders) {
    if (order.status === "rechazado") continue;
    const name = order.product_type || "Sin tipo";
    const current = totals.get(name) ?? { count: 0, units: 0, revenue: 0 };
    current.count += 1;
    current.units += Number(order.quantity ?? 0);
    current.revenue = round2(current.revenue + Number(order.total_amount ?? 0));
    totals.set(name, current);
  }
  return [...totals.entries()]
    .map(([name, value]) => ({ name, ...value }))
    .sort((a, b) => b.revenue - a.revenue || b.count - a.count)
    .slice(0, limit);
}

export function topClients(
  orders: ReportOrder[],
  limit = 6,
): { name: string; count: number; revenue: number }[] {
  const totals = new Map<string, { count: number; revenue: number }>();
  for (const order of orders) {
    if (order.status === "rechazado") continue;
    const name = order.client_name || "Sin cliente";
    const current = totals.get(name) ?? { count: 0, revenue: 0 };
    current.count += 1;
    current.revenue = round2(current.revenue + Number(order.total_amount ?? 0));
    totals.set(name, current);
  }
  return [...totals.entries()]
    .map(([name, value]) => ({ name, ...value }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
