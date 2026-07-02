// Lógica financiera PURA (sin Supabase ni server): conversiones por tasa,
// antigüedad de deudas y totales de cierre de caja. Mantener testeable.

export type CashMethod =
  | "efectivo_usd"
  | "efectivo_bs"
  | "zelle"
  | "pago_movil"
  | "transferencia_bs"
  | "usdt"
  | "punto";

export type MovementType = "ingreso" | "egreso";
export type CurrencyIn = "USD" | "VES";

export const CASH_METHODS: { value: CashMethod; label: string; currency: CurrencyIn }[] = [
  { value: "efectivo_usd", label: "Efectivo USD", currency: "USD" },
  { value: "efectivo_bs", label: "Efectivo Bs", currency: "VES" },
  { value: "zelle", label: "Zelle", currency: "USD" },
  { value: "pago_movil", label: "Pago móvil", currency: "VES" },
  { value: "transferencia_bs", label: "Transferencia Bs", currency: "VES" },
  { value: "usdt", label: "USDT", currency: "USD" },
  { value: "punto", label: "Punto de venta", currency: "VES" },
];

export const EXPENSE_CATEGORIES = [
  "insumos",
  "servicios",
  "sueldos",
  "alquiler",
  "mantenimiento",
  "impuestos",
  "otros",
] as const;

export const INCOME_CATEGORIES = ["venta", "abono", "otro_ingreso"] as const;

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function bsToUsd(amountBs: number, bsPerUsd: number): number {
  if (!Number.isFinite(bsPerUsd) || bsPerUsd <= 0) {
    throw new Error("La tasa Bs/USD debe ser mayor que cero.");
  }
  return round2(amountBs / bsPerUsd);
}

export function usdToBs(amountUsd: number, bsPerUsd: number): number {
  if (!Number.isFinite(bsPerUsd) || bsPerUsd <= 0) {
    throw new Error("La tasa Bs/USD debe ser mayor que cero.");
  }
  return round2(amountUsd * bsPerUsd);
}

export type AgingBucket = "0-7" | "8-30" | "31+";

export function agingBucket(sinceIso: string, now: Date = new Date()): AgingBucket {
  const since = new Date(sinceIso).getTime();
  const days = Math.floor((now.getTime() - since) / (1000 * 60 * 60 * 24));
  if (days <= 7) return "0-7";
  if (days <= 30) return "8-30";
  return "31+";
}

// ── Presupuestos y facturas ─────────────────────────────────

export type QuoteItem = {
  description: string;
  quantity: number;
  unit_price_usd: number;
};

export function quoteSubtotal(items: QuoteItem[]): number {
  return round2(
    items.reduce((sum, item) => sum + item.quantity * item.unit_price_usd, 0),
  );
}

export const IVA_RATE = 0.16;
export const IGTF_RATE = 0.03;

export type InvoiceTotals = {
  ivaUsd: number;
  igtfUsd: number;
  totalUsd: number;
};

// IVA 16% sobre la base; IGTF 3% sobre (base + IVA) cuando el pago es en
// divisas. Control interno, no certificación fiscal.
export function computeInvoiceTotals(input: {
  subtotalUsd: number;
  applyIva: boolean;
  foreignCurrencyPayment: boolean;
}): InvoiceTotals {
  if (!Number.isFinite(input.subtotalUsd) || input.subtotalUsd <= 0) {
    throw new Error("El subtotal de la factura debe ser mayor que cero.");
  }

  const ivaUsd = input.applyIva ? round2(input.subtotalUsd * IVA_RATE) : 0;
  const baseWithIva = round2(input.subtotalUsd + ivaUsd);
  const igtfUsd = input.foreignCurrencyPayment ? round2(baseWithIva * IGTF_RATE) : 0;

  return {
    ivaUsd,
    igtfUsd,
    totalUsd: round2(baseWithIva + igtfUsd),
  };
}

export type SessionMovement = {
  type: MovementType;
  method: CashMethod;
  amount_usd: number;
  currency_in: CurrencyIn;
  amount_in: number;
};

export type SessionTotals = {
  incomeUsd: number;
  expenseUsd: number;
  expectedCashUsd: number;
  expectedCashVes: number;
  byMethod: Partial<Record<CashMethod, number>>;
};

// Efectivo esperado por moneda física (apertura + entradas − salidas de ese
// efectivo). Métodos no-efectivo se totalizan aparte (en USD) para conciliar.
export function computeSessionTotals(
  movements: SessionMovement[],
  opening: { openingUsd: number; openingVes: number },
): SessionTotals {
  let incomeUsd = 0;
  let expenseUsd = 0;
  let cashUsd = opening.openingUsd;
  let cashVes = opening.openingVes;
  const byMethod: Partial<Record<CashMethod, number>> = {};

  for (const movement of movements) {
    const sign = movement.type === "ingreso" ? 1 : -1;

    if (movement.type === "ingreso") {
      incomeUsd += movement.amount_usd;
    } else {
      expenseUsd += movement.amount_usd;
    }

    byMethod[movement.method] = round2(
      (byMethod[movement.method] ?? 0) + sign * movement.amount_usd,
    );

    if (movement.method === "efectivo_usd") {
      cashUsd += sign * movement.amount_usd;
    } else if (movement.method === "efectivo_bs") {
      cashVes += sign * movement.amount_in;
    }
  }

  return {
    incomeUsd: round2(incomeUsd),
    expenseUsd: round2(expenseUsd),
    expectedCashUsd: round2(cashUsd),
    expectedCashVes: round2(cashVes),
    byMethod,
  };
}
