# Fase 0 (testing) + Fase 1a (Finanzas/caja tipo Treinta) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Darle a Express Printer un control financiero interno estilo Treinta (tasa del día, caja con ingresos/egresos, gastos, cierre diario, cuentas por cobrar) sobre el dashboard existente, con base de pruebas Vitest.

**Architecture:** Lógica pura de dinero en `src/lib/finance-math.ts` (testeable sin Supabase); acceso a datos en `src/lib/finance.ts` (patrón `createSupabaseAdminClient` como `business.ts`); SQL idempotente añadido a `supabase/setup.sql` (Jose lo pega en el SQL Editor — la única acción manual); UI como nueva vista `finanzas` del dashboard con panel cliente `finance-panel.tsx` que recibe datos + server actions por props (patrón de los paneles existentes). Los pagos del storefront aprobados generan movimientos de caja automáticamente (best-effort). El dashboard NO se rompe si las tablas nuevas no existen todavía (carga de finanzas en try/catch propio).

**Tech Stack:** Next.js 16 (App Router, server actions), Supabase (service role), Vitest (unit), Tailwind 4.

**Decisiones tomadas (delegadas por Jose):**
- Moneda: USD referencia + tasa del día (Bs→USD); cada movimiento guarda en qué entró (`currency_in`/`amount_in`) y su equivalente USD.
- Vista "Finanzas" visible para admin y staff (el staff registra cobros/gastos y hace su cierre; roles finos = futuro).
- Playwright e2e del repo: pospuesto (regla "no localhost"); la verificación e2e se hace manualmente contra producción con browser MCP, como siempre.
- Fase 1b (facturas IVA/IGTF + presupuestos) queda para el siguiente plan.
- Categorías de movimiento validadas en la app, no con CHECK en DB (para poder evolucionarlas sin migración).

---

### Task 1: Base de testing con Vitest

**Files:**
- Modify: `package.json` (scripts + devDependency)
- Create: `vitest.config.ts`

- [ ] **Step 1: Instalar Vitest**

Run: `npm install -D vitest`
Expected: added N packages, sin errores.

- [ ] **Step 2: Crear `vitest.config.ts`**

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 3: Añadir scripts a `package.json`**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 4: Verificar que corre (sin tests aún)**

Run: `npx vitest run --passWithNoTests`
Expected: "No test files found" + exit 0.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "test: base de testing con Vitest (fase 0)"
```

---

### Task 2: Tests del pricing existente (protege lo que ya funciona)

**Files:**
- Create: `src/lib/pricing.test.ts`

- [ ] **Step 1: Escribir los tests**

```ts
import { describe, expect, it } from "vitest";

import { computeUnitPrice, formatFromPrice, productFromPrice } from "@/lib/pricing";
import type { StorefrontProduct } from "@/app/storefront-data";

type P = Pick<StorefrontProduct, "pricingMode" | "basePrice" | "options">;

const packageProduct: P = {
  pricingMode: "package",
  basePrice: 0,
  options: [
    {
      name: "Cantidad",
      role: "package",
      values: [
        { label: "100 unidades", amount: 18 },
        { label: "250 unidades", amount: 35 },
      ],
    },
    {
      name: "Acabado",
      role: "surcharge",
      values: [
        { label: "Mate", amount: 0 },
        { label: "Soft touch", amount: 8 },
      ],
    },
  ],
} as P;

const unitProduct: P = {
  pricingMode: "unit",
  basePrice: 25,
  options: [],
} as P;

describe("computeUnitPrice", () => {
  it("usa el primer paquete si no hay selección", () => {
    expect(computeUnitPrice(packageProduct)).toBe(18);
  });

  it("usa el paquete seleccionado", () => {
    expect(computeUnitPrice(packageProduct, { Cantidad: "250 unidades" })).toBe(35);
  });

  it("suma el recargo seleccionado", () => {
    expect(
      computeUnitPrice(packageProduct, { Cantidad: "100 unidades", Acabado: "Soft touch" }),
    ).toBe(26);
  });

  it("modo unit devuelve basePrice", () => {
    expect(computeUnitPrice(unitProduct)).toBe(25);
  });

  it("nunca devuelve negativo", () => {
    expect(computeUnitPrice({ ...unitProduct, basePrice: -5 } as P)).toBe(0);
  });
});

describe("productFromPrice", () => {
  it("mínimo de paquetes + mínimo de recargos", () => {
    expect(productFromPrice(packageProduct)).toBe(18);
  });

  it("modo unit usa basePrice", () => {
    expect(productFromPrice(unitProduct)).toBe(25);
  });
});

describe("formatFromPrice", () => {
  it("entero sin decimales", () => {
    expect(formatFromPrice(18)).toBe("$18");
  });

  it("decimal con 2 dígitos", () => {
    expect(formatFromPrice(18.5)).toBe("$18.50");
  });
});
```

- [ ] **Step 2: Correr y ver que pasan**

Run: `npx vitest run src/lib/pricing.test.ts`
Expected: todos PASS (si alguno falla, el test documenta el comportamiento real — ajustar la EXPECTATIVA, no el código de producción).

- [ ] **Step 3: Commit**

```bash
git add src/lib/pricing.test.ts
git commit -m "test: cobertura del pricing existente"
```

---

### Task 3: `finance-math.ts` — lógica pura de dinero (TDD)

**Files:**
- Create: `src/lib/finance-math.test.ts`
- Create: `src/lib/finance-math.ts`

- [ ] **Step 1: Escribir los tests que fallan**

```ts
import { describe, expect, it } from "vitest";

import {
  agingBucket,
  bsToUsd,
  computeSessionTotals,
  round2,
  usdToBs,
  type SessionMovement,
} from "@/lib/finance-math";

describe("round2", () => {
  it("redondea a 2 decimales", () => {
    expect(round2(10.005)).toBe(10.01);
    expect(round2(10)).toBe(10);
  });
});

describe("bsToUsd / usdToBs", () => {
  it("convierte con la tasa", () => {
    expect(bsToUsd(3600, 36)).toBe(100);
    expect(usdToBs(100, 36)).toBe(3600);
  });

  it("tasa inválida lanza error", () => {
    expect(() => bsToUsd(100, 0)).toThrow();
    expect(() => usdToBs(100, -1)).toThrow();
  });
});

describe("agingBucket", () => {
  const now = new Date("2026-07-01T12:00:00Z");

  it("0-7 días", () => {
    expect(agingBucket("2026-06-28T00:00:00Z", now)).toBe("0-7");
  });

  it("8-30 días", () => {
    expect(agingBucket("2026-06-10T00:00:00Z", now)).toBe("8-30");
  });

  it("31+ días", () => {
    expect(agingBucket("2026-05-01T00:00:00Z", now)).toBe("31+");
  });
});

describe("computeSessionTotals", () => {
  const movements: SessionMovement[] = [
    { type: "ingreso", method: "efectivo_usd", amount_usd: 50, currency_in: "USD", amount_in: 50 },
    { type: "ingreso", method: "efectivo_bs", amount_usd: 10, currency_in: "VES", amount_in: 360 },
    { type: "ingreso", method: "zelle", amount_usd: 40, currency_in: "USD", amount_in: 40 },
    { type: "egreso", method: "efectivo_usd", amount_usd: 20, currency_in: "USD", amount_in: 20 },
  ];

  it("calcula el efectivo esperado por moneda (apertura + entradas − salidas)", () => {
    const totals = computeSessionTotals(movements, { openingUsd: 100, openingVes: 0 });
    expect(totals.expectedCashUsd).toBe(130); // 100 + 50 − 20
    expect(totals.expectedCashVes).toBe(360); // 0 + 360
  });

  it("totaliza ingresos/egresos del día en USD", () => {
    const totals = computeSessionTotals(movements, { openingUsd: 0, openingVes: 0 });
    expect(totals.incomeUsd).toBe(100); // 50 + 10 + 40
    expect(totals.expenseUsd).toBe(20);
  });

  it("agrupa por método", () => {
    const totals = computeSessionTotals(movements, { openingUsd: 0, openingVes: 0 });
    expect(totals.byMethod.zelle).toBe(40);
    expect(totals.byMethod.efectivo_usd).toBe(30); // 50 − 20
  });
});
```

- [ ] **Step 2: Correr y verificar que fallan**

Run: `npx vitest run src/lib/finance-math.test.ts`
Expected: FAIL — "Cannot find module '@/lib/finance-math'".

- [ ] **Step 3: Implementar `src/lib/finance-math.ts`**

```ts
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

    byMethod[movement.method] = round2((byMethod[movement.method] ?? 0) + sign * movement.amount_usd);

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
```

- [ ] **Step 4: Correr y verificar que pasan**

Run: `npx vitest run`
Expected: pricing + finance-math PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/finance-math.ts src/lib/finance-math.test.ts
git commit -m "feat(finanzas): lógica pura de dinero (tasa, aging, cierre) con TDD"
```

---

### Task 4: SQL idempotente — tablas de finanzas

**Files:**
- Modify: `supabase/setup.sql` (añadir al final, sección nueva)

- [ ] **Step 1: Añadir la sección al final de `setup.sql`**

```sql
-- ============================================================
-- 12) Finanzas (fase 1a): tasa del día, cierres y movimientos
-- ============================================================

create table if not exists public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  rate_date date not null unique,
  bs_per_usd numeric(14,4) not null check (bs_per_usd > 0),
  set_by uuid null references public.app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.exchange_rates enable row level security;

create index if not exists exchange_rates_rate_date_idx
  on public.exchange_rates (rate_date desc);

create table if not exists public.cash_sessions (
  id uuid primary key default gen_random_uuid(),
  branch text not null,
  status text not null default 'abierta' check (status in ('abierta', 'cerrada')),
  opened_by uuid null references public.app_users(id) on delete set null,
  opened_at timestamptz not null default now(),
  opening_cash_usd numeric(12,2) not null default 0,
  opening_cash_ves numeric(14,2) not null default 0,
  closed_by uuid null references public.app_users(id) on delete set null,
  closed_at timestamptz null,
  counted_cash_usd numeric(12,2) null,
  counted_cash_ves numeric(14,2) null,
  expected_cash_usd numeric(12,2) null,
  expected_cash_ves numeric(14,2) null,
  notes text null,
  created_at timestamptz not null default now()
);

alter table public.cash_sessions enable row level security;

create index if not exists cash_sessions_branch_status_idx
  on public.cash_sessions (branch, status);

create index if not exists cash_sessions_opened_at_idx
  on public.cash_sessions (opened_at desc);

create table if not exists public.cash_movements (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('ingreso', 'egreso')),
  amount_usd numeric(12,2) not null check (amount_usd > 0),
  currency_in text not null default 'USD' check (currency_in in ('USD', 'VES')),
  amount_in numeric(14,2) not null,
  exchange_rate numeric(14,4) null,
  method text not null,
  category text not null default 'venta',
  description text null,
  order_id uuid null references public.orders(id) on delete set null,
  client_id uuid null references public.clients(id) on delete set null,
  payment_id uuid null references public.order_payments(id) on delete set null,
  branch text null,
  cash_session_id uuid null references public.cash_sessions(id) on delete set null,
  created_by uuid null references public.app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.cash_movements enable row level security;

create index if not exists cash_movements_created_at_idx
  on public.cash_movements (created_at desc);

create index if not exists cash_movements_type_idx
  on public.cash_movements (type);

create index if not exists cash_movements_session_idx
  on public.cash_movements (cash_session_id);

create index if not exists cash_movements_order_idx
  on public.cash_movements (order_id);
```

- [ ] **Step 2: Verificar idempotencia visual** (todas las sentencias usan `if not exists` / son re-ejecutables)

- [ ] **Step 3: Commit**

```bash
git add supabase/setup.sql
git commit -m "feat(finanzas): esquema SQL de tasa, movimientos y cierres de caja"
```

---

### Task 5: `src/lib/finance.ts` — capa de datos

**Files:**
- Create: `src/lib/finance.ts`

- [ ] **Step 1: Implementar el módulo completo**

```ts
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  bsToUsd,
  computeSessionTotals,
  round2,
  type CashMethod,
  type CurrencyIn,
  type MovementType,
  type SessionMovement,
} from "@/lib/finance-math";

export type ExchangeRate = {
  id: string;
  rate_date: string;
  bs_per_usd: number;
  set_by: string | null;
  created_at: string;
};

export type CashMovement = {
  id: string;
  type: MovementType;
  amount_usd: number;
  currency_in: CurrencyIn;
  amount_in: number;
  exchange_rate: number | null;
  method: CashMethod;
  category: string;
  description: string | null;
  order_id: string | null;
  client_id: string | null;
  payment_id: string | null;
  branch: string | null;
  cash_session_id: string | null;
  created_by: string | null;
  created_at: string;
};

export type CashSession = {
  id: string;
  branch: string;
  status: "abierta" | "cerrada";
  opened_by: string | null;
  opened_at: string;
  opening_cash_usd: number;
  opening_cash_ves: number;
  closed_by: string | null;
  closed_at: string | null;
  counted_cash_usd: number | null;
  counted_cash_ves: number | null;
  expected_cash_usd: number | null;
  expected_cash_ves: number | null;
  notes: string | null;
  created_at: string;
};

// ── Tasa del día ────────────────────────────────────────────

function caracasDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Caracas",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export async function getTodayRate(): Promise<ExchangeRate | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("exchange_rates")
    .select("*")
    .eq("rate_date", caracasDateKey())
    .maybeSingle<ExchangeRate>();
  if (error) throw error;
  return data ?? null;
}

export async function listRecentRates(limit = 10): Promise<ExchangeRate[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("exchange_rates")
    .select("*")
    .order("rate_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ExchangeRate[];
}

export async function setTodayRate(input: { bsPerUsd: number; setBy: string }) {
  if (!Number.isFinite(input.bsPerUsd) || input.bsPerUsd <= 0) {
    throw new Error("Escribe una tasa válida (mayor que cero).");
  }
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("exchange_rates").upsert(
    {
      rate_date: caracasDateKey(),
      bs_per_usd: round2(input.bsPerUsd),
      set_by: input.setBy,
    },
    { onConflict: "rate_date" },
  );
  if (error) throw error;
}

// ── Movimientos ─────────────────────────────────────────────

export async function createCashMovement(input: {
  type: MovementType;
  method: CashMethod;
  currencyIn: CurrencyIn;
  amountIn: number;
  exchangeRate: number | null;
  category: string;
  description?: string;
  orderId?: string | null;
  clientId?: string | null;
  paymentId?: string | null;
  branch?: string | null;
  createdBy?: string | null;
}): Promise<CashMovement> {
  if (!Number.isFinite(input.amountIn) || input.amountIn <= 0) {
    throw new Error("Escribe un monto válido (mayor que cero).");
  }

  const amountUsd =
    input.currencyIn === "USD"
      ? round2(input.amountIn)
      : bsToUsd(input.amountIn, input.exchangeRate ?? 0);

  const supabase = createSupabaseAdminClient();

  // Enlaza a la sesión de caja abierta de la sucursal (si hay) para el cierre.
  let sessionId: string | null = null;
  if (input.branch) {
    const open = await getOpenCashSession(input.branch);
    sessionId = open?.id ?? null;
  }

  const { data, error } = await supabase
    .from("cash_movements")
    .insert({
      type: input.type,
      amount_usd: amountUsd,
      currency_in: input.currencyIn,
      amount_in: round2(input.amountIn),
      exchange_rate: input.exchangeRate,
      method: input.method,
      category: input.category,
      description: input.description?.trim() || null,
      order_id: input.orderId ?? null,
      client_id: input.clientId ?? null,
      payment_id: input.paymentId ?? null,
      branch: input.branch ?? null,
      cash_session_id: sessionId,
      created_by: input.createdBy ?? null,
    })
    .select("*")
    .single<CashMovement>();
  if (error) throw error;
  return data;
}

export async function listCashMovements(options: {
  sinceIso?: string;
  sessionId?: string;
  limit?: number;
}): Promise<CashMovement[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("cash_movements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 200);
  if (options.sinceIso) query = query.gte("created_at", options.sinceIso);
  if (options.sessionId) query = query.eq("cash_session_id", options.sessionId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CashMovement[];
}

// ── Sesiones / cierre de caja ───────────────────────────────

export async function getOpenCashSession(branch: string): Promise<CashSession | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("cash_sessions")
    .select("*")
    .eq("branch", branch)
    .eq("status", "abierta")
    .order("opened_at", { ascending: false })
    .limit(1)
    .maybeSingle<CashSession>();
  if (error) throw error;
  return data ?? null;
}

export async function openCashSession(input: {
  branch: string;
  openingUsd: number;
  openingVes: number;
  openedBy: string;
}): Promise<CashSession> {
  const existing = await getOpenCashSession(input.branch);
  if (existing) {
    throw new Error("Ya hay una caja abierta en esta sucursal. Ciérrala primero.");
  }
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("cash_sessions")
    .insert({
      branch: input.branch,
      opened_by: input.openedBy,
      opening_cash_usd: round2(Math.max(0, input.openingUsd)),
      opening_cash_ves: round2(Math.max(0, input.openingVes)),
    })
    .select("*")
    .single<CashSession>();
  if (error) throw error;
  return data;
}

export async function closeCashSession(input: {
  sessionId: string;
  countedUsd: number;
  countedVes: number;
  closedBy: string;
  notes?: string;
}): Promise<CashSession> {
  const supabase = createSupabaseAdminClient();
  const { data: session, error: sessionError } = await supabase
    .from("cash_sessions")
    .select("*")
    .eq("id", input.sessionId)
    .single<CashSession>();
  if (sessionError) throw sessionError;
  if (session.status !== "abierta") {
    throw new Error("Esta caja ya está cerrada.");
  }

  const movements = await listCashMovements({ sessionId: session.id, limit: 1000 });
  const totals = computeSessionTotals(movements as SessionMovement[], {
    openingUsd: Number(session.opening_cash_usd),
    openingVes: Number(session.opening_cash_ves),
  });

  const { data, error } = await supabase
    .from("cash_sessions")
    .update({
      status: "cerrada",
      closed_by: input.closedBy,
      closed_at: new Date().toISOString(),
      counted_cash_usd: round2(input.countedUsd),
      counted_cash_ves: round2(input.countedVes),
      expected_cash_usd: totals.expectedCashUsd,
      expected_cash_ves: totals.expectedCashVes,
      notes: input.notes?.trim() || null,
    })
    .eq("id", session.id)
    .select("*")
    .single<CashSession>();
  if (error) throw error;
  return data;
}

export async function listRecentSessions(limit = 15): Promise<CashSession[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("cash_sessions")
    .select("*")
    .order("opened_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as CashSession[];
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit` (o `npm run build` si tsc no está expuesto)
Expected: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add src/lib/finance.ts
git commit -m "feat(finanzas): capa de datos (tasa, movimientos, sesiones de caja)"
```

---

### Task 6: Cuentas por cobrar + registrar abono (reusa el modelo de pedidos)

**Files:**
- Modify: `src/lib/finance.ts` (añadir al final)

- [ ] **Step 1: Añadir a `finance.ts`**

```ts
// ── Cuentas por cobrar ──────────────────────────────────────

export type ReceivableRow = {
  order_id: string;
  order_number: string;
  client_id: string | null;
  client_name: string;
  total_amount: number;
  deposit_amount: number;
  pending_amount: number;
  created_at: string;
  status: string;
};

export async function listReceivables(): Promise<ReceivableRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, client_id, total_amount, deposit_amount, pending_amount, created_at, status, client:clients(id, name)")
    .gt("pending_amount", 0)
    .not("status", "in", "(rechazado)")
    .order("created_at", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const client = Array.isArray(row.client) ? row.client[0] : row.client;
    return {
      order_id: row.id as string,
      order_number: (row.order_number as string) ?? "",
      client_id: (row.client_id as string) ?? null,
      client_name: (client?.name as string) ?? "Sin cliente",
      total_amount: Number(row.total_amount ?? 0),
      deposit_amount: Number(row.deposit_amount ?? 0),
      pending_amount: Number(row.pending_amount ?? 0),
      created_at: row.created_at as string,
      status: row.status as string,
    };
  });
}

// Registra un abono manual a un pedido con saldo: crea el movimiento de caja
// y actualiza deposit/pending/payment_status del pedido (misma matemática que
// la revisión de pagos del storefront).
export async function registerReceivablePayment(input: {
  orderId: string;
  method: CashMethod;
  currencyIn: CurrencyIn;
  amountIn: number;
  exchangeRate: number | null;
  branch?: string | null;
  createdBy: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_number, client_id, total_amount, deposit_amount")
    .eq("id", input.orderId)
    .single<{
      id: string;
      order_number: string | null;
      client_id: string | null;
      total_amount: number | null;
      deposit_amount: number | null;
    }>();
  if (orderError) throw orderError;

  const movement = await createCashMovement({
    type: "ingreso",
    method: input.method,
    currencyIn: input.currencyIn,
    amountIn: input.amountIn,
    exchangeRate: input.exchangeRate,
    category: "abono",
    description: `Abono al pedido ${order.order_number ?? order.id}`,
    orderId: order.id,
    clientId: order.client_id,
    branch: input.branch ?? null,
    createdBy: input.createdBy,
  });

  const totalAmount = Number(order.total_amount ?? 0);
  const newDeposit = round2(Number(order.deposit_amount ?? 0) + movement.amount_usd);
  const newPending = Math.max(0, round2(totalAmount - newDeposit));

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      deposit_amount: newDeposit,
      pending_amount: newPending,
      payment_status: newDeposit <= 0 ? "pendiente" : newPending <= 0 ? "pagado" : "anticipo",
    })
    .eq("id", order.id);
  if (updateError) throw updateError;

  return movement;
}
```

- [ ] **Step 2: Type-check + commit**

Run: `npm run build` → sin errores.

```bash
git add src/lib/finance.ts
git commit -m "feat(finanzas): cuentas por cobrar y registro de abonos"
```

---

### Task 7: Pagos del storefront aprobados → movimiento automático

**Files:**
- Modify: `src/lib/customer-commerce.ts` (dentro de `reviewOrderPayment`, tras aprobar un pago con `order_id`)

- [ ] **Step 1: Import arriba del archivo**

```ts
import { createCashMovement } from "@/lib/finance";
```

- [ ] **Step 2: Insertar al FINAL de `reviewOrderPayment` (después del bloque `applyCustomerBalanceChange`)**

```ts
  if (input.status === "aprobado") {
    // Registro automático en caja (best-effort: si las tablas de finanzas aún
    // no existen, no rompe la revisión del pago).
    try {
      await createCashMovement({
        type: "ingreso",
        method: "pago_movil",
        currencyIn: "USD",
        amountIn: Number(payment.amount),
        exchangeRate: null,
        category: "venta",
        description: `Pago móvil aprobado — pedido ${order.order_number ?? payment.order_id}`,
        orderId: payment.order_id,
        paymentId: payment.id,
        createdBy: input.reviewedBy,
      });
    } catch (error) {
      console.error("No se pudo registrar el movimiento de caja:", error);
    }
  }
```

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/lib/customer-commerce.ts
git commit -m "feat(finanzas): pago aprobado del storefront genera movimiento de caja"
```

---

### Task 8: Vista "Finanzas" en el dashboard (nav + datos + server actions)

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Create: `src/app/dashboard/finance-panel.tsx` (Task 9)

- [ ] **Step 1: Añadir la vista al nav** (en `page.tsx`)

```ts
const dashboardViews = [
  "resumen", "clientes", "pedidos", "pagos", "finanzas",
  "inventario", "productos", "equipo",
] as const;

const sideNavItems: { label: string; view: DashboardView }[] = [
  { label: "Resumen", view: "resumen" },
  { label: "Pedidos", view: "pedidos" },
  { label: "Pagos", view: "pagos" },
  { label: "Finanzas", view: "finanzas" },
  { label: "Clientes", view: "clientes" },
  { label: "Inventario", view: "inventario" },
  { label: "Productos", view: "productos" },
  { label: "Equipo", view: "equipo" },
];

const userSideNavViews: DashboardView[] = ["resumen", "pedidos", "pagos", "finanzas", "clientes"];
```

Además: en `getViewLabel` añadir `case "finanzas": return "Finanzas";` (y NO añadir "finanzas" a la lista de vistas admin-only de `resolveView`).

- [ ] **Step 2: Server actions de finanzas** (en `page.tsx`, junto a las demás; todas siguen el patrón sesión→try/catch→revalidate→redirect con `buildDashboardUrl("finanzas", mensaje)`)

```ts
async function setRateAction(formData: FormData) {
  "use server";
  const session = await getCurrentSession();
  if (!session) redirect("/login?message=Inicia%20sesion%20para%20continuar");
  try {
    await setTodayRate({
      bsPerUsd: Number(String(formData.get("bsPerUsd") ?? "").replace(",", ".")),
      setBy: session.userId,
    });
  } catch (error) {
    redirect(buildDashboardUrl("finanzas", error instanceof Error ? error.message : "No se pudo guardar la tasa."));
  }
  revalidatePath("/dashboard");
  redirect(buildDashboardUrl("finanzas", "Tasa del día guardada"));
}

async function createMovementAction(formData: FormData) {
  "use server";
  const session = await getCurrentSession();
  if (!session) redirect("/login?message=Inicia%20sesion%20para%20continuar");
  const type = String(formData.get("type") ?? "ingreso") === "egreso" ? "egreso" : "ingreso";
  try {
    const method = String(formData.get("method") ?? "efectivo_usd") as CashMethod;
    const methodInfo = CASH_METHODS.find((item) => item.value === method);
    const currencyIn = methodInfo?.currency ?? "USD";
    const rate = currencyIn === "VES" ? (await getTodayRate())?.bs_per_usd ?? null : null;
    if (currencyIn === "VES" && !rate) {
      throw new Error("Fija la tasa del día antes de registrar montos en Bs.");
    }
    await createCashMovement({
      type,
      method,
      currencyIn,
      amountIn: Number(String(formData.get("amount") ?? "").replace(",", ".")),
      exchangeRate: rate,
      category: String(formData.get("category") ?? (type === "ingreso" ? "venta" : "otros")),
      description: String(formData.get("description") ?? ""),
      branch: String(formData.get("branch") ?? "") || null,
      createdBy: session.userId,
    });
  } catch (error) {
    redirect(buildDashboardUrl("finanzas", error instanceof Error ? error.message : "No se pudo registrar el movimiento."));
  }
  revalidatePath("/dashboard");
  redirect(buildDashboardUrl("finanzas", type === "ingreso" ? "Ingreso registrado" : "Gasto registrado"));
}

async function openSessionAction(formData: FormData) {
  "use server";
  const session = await getCurrentSession();
  if (!session) redirect("/login?message=Inicia%20sesion%20para%20continuar");
  try {
    await openCashSession({
      branch: String(formData.get("branch") ?? ""),
      openingUsd: Number(String(formData.get("openingUsd") ?? "0").replace(",", ".")) || 0,
      openingVes: Number(String(formData.get("openingVes") ?? "0").replace(",", ".")) || 0,
      openedBy: session.userId,
    });
  } catch (error) {
    redirect(buildDashboardUrl("finanzas", error instanceof Error ? error.message : "No se pudo abrir la caja."));
  }
  revalidatePath("/dashboard");
  redirect(buildDashboardUrl("finanzas", "Caja abierta"));
}

async function closeSessionAction(formData: FormData) {
  "use server";
  const session = await getCurrentSession();
  if (!session) redirect("/login?message=Inicia%20sesion%20para%20continuar");
  try {
    await closeCashSession({
      sessionId: String(formData.get("sessionId") ?? ""),
      countedUsd: Number(String(formData.get("countedUsd") ?? "0").replace(",", ".")) || 0,
      countedVes: Number(String(formData.get("countedVes") ?? "0").replace(",", ".")) || 0,
      closedBy: session.userId,
      notes: String(formData.get("notes") ?? ""),
    });
  } catch (error) {
    redirect(buildDashboardUrl("finanzas", error instanceof Error ? error.message : "No se pudo cerrar la caja."));
  }
  revalidatePath("/dashboard");
  redirect(buildDashboardUrl("finanzas", "Caja cerrada"));
}

async function registerReceivableAction(formData: FormData) {
  "use server";
  const session = await getCurrentSession();
  if (!session) redirect("/login?message=Inicia%20sesion%20para%20continuar");
  try {
    const method = String(formData.get("method") ?? "efectivo_usd") as CashMethod;
    const methodInfo = CASH_METHODS.find((item) => item.value === method);
    const currencyIn = methodInfo?.currency ?? "USD";
    const rate = currencyIn === "VES" ? (await getTodayRate())?.bs_per_usd ?? null : null;
    if (currencyIn === "VES" && !rate) {
      throw new Error("Fija la tasa del día antes de registrar montos en Bs.");
    }
    await registerReceivablePayment({
      orderId: String(formData.get("orderId") ?? ""),
      method,
      currencyIn,
      amountIn: Number(String(formData.get("amount") ?? "").replace(",", ".")),
      exchangeRate: rate,
      branch: String(formData.get("branch") ?? "") || null,
      createdBy: session.userId,
    });
  } catch (error) {
    redirect(buildDashboardUrl("finanzas", error instanceof Error ? error.message : "No se pudo registrar el abono."));
  }
  revalidatePath("/dashboard");
  redirect(buildDashboardUrl("finanzas", "Abono registrado"));
}
```

Imports nuevos en `page.tsx`: `FinancePanel`, `{ CASH_METHODS, type CashMethod }` de `finance-math`, y de `finance.ts`: `getTodayRate, listRecentRates, setTodayRate, createCashMovement, openCashSession, closeCashSession, getOpenCashSession, listCashMovements, listRecentSessions, listReceivables, registerReceivablePayment` + tipos.

- [ ] **Step 3: Carga de datos de finanzas** (en el cuerpo de `DashboardPage`, DESPUÉS del try/catch existente, con try/catch PROPIO para no romper el dashboard si faltan las tablas)

```ts
  let financeReady = true;
  let todayRate: ExchangeRate | null = null;
  let recentRates: ExchangeRate[] = [];
  let todayMovements: CashMovement[] = [];
  let openSessions: (CashSession | null)[] = [];
  let recentSessions: CashSession[] = [];
  let receivables: ReceivableRow[] = [];
  const financeBranches: string[] = ["5 de julio", "las americas"];

  if (activeView === "finanzas") {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(startOfToday.getHours() - 24);
      [todayRate, recentRates, todayMovements, recentSessions, receivables] = await Promise.all([
        getTodayRate(),
        listRecentRates(10),
        listCashMovements({ sinceIso: startOfToday.toISOString(), limit: 200 }),
        listRecentSessions(15),
        listReceivables(),
      ]);
      openSessions = await Promise.all(financeBranches.map((branch) => getOpenCashSession(branch)));
    } catch {
      financeReady = false;
    }
  }
```

(Nota: `activeView` ya está calculado antes en el archivo — mover esta carga después de ese cálculo.)

- [ ] **Step 4: Render de la vista** (junto a los demás `activeView === ...`)

```tsx
{activeView === "finanzas" ? (
  <FinancePanel
    ready={financeReady}
    isAdmin={session.role === "admin"}
    branches={financeBranches}
    todayRate={todayRate}
    recentRates={recentRates}
    movements={todayMovements}
    openSessions={openSessions}
    recentSessions={recentSessions}
    receivables={receivables}
    onSetRate={setRateAction}
    onCreateMovement={createMovementAction}
    onOpenSession={openSessionAction}
    onCloseSession={closeSessionAction}
    onRegisterReceivable={registerReceivableAction}
  />
) : null}
```

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add src/app/dashboard/page.tsx
git commit -m "feat(finanzas): vista Finanzas en el dashboard (nav, datos y acciones)"
```

---

### Task 9: `finance-panel.tsx` — la UI (Caja · Gastos · Por cobrar · Cierres · Tasa)

**Files:**
- Create: `src/app/dashboard/finance-panel.tsx`

Panel cliente con pestañas locales (useState). Diseño consistente con el dashboard (cards `rounded-[1.75rem] border-slate-200 bg-white/85`). Contenido por pestaña:

1. **Caja (hoy):** tasa del día visible; resumen del día (ingresos USD, egresos USD, balance); estado de caja por sucursal (abierta/cerrada, abrir con fondos iniciales o cerrar con contado vs esperado y diferencia); formulario "Registrar movimiento" (tipo ingreso/egreso, método `CASH_METHODS` con la moneda visible, monto, categoría según tipo, descripción, sucursal); lista de movimientos de las últimas 24h con hora, tipo (color), método, categoría, descripción y monto USD (+ monto original si fue Bs).
2. **Gastos:** los mismos movimientos filtrados `type === "egreso"` + acceso rápido al formulario con tipo=egreso.
3. **Por cobrar:** tabla de `receivables` (pedido, cliente, total, abonado, **pendiente**, antigüedad con `agingBucket` coloreada 0-7 verde / 8-30 ámbar / 31+ rojo) + formulario inline "Registrar abono" (monto + método) por fila; totales arriba (deuda total, nº clientes).
4. **Cierres:** historial `recentSessions` (sucursal, abierta/cerrada por, apertura, esperado vs contado, **diferencia** coloreada, notas).
5. **Tasa:** form para fijar la tasa de hoy + historial `recentRates`.

Si `ready === false`: card única con aviso "Ejecuta la última versión de `supabase/setup.sql` en el SQL Editor de Supabase para activar Finanzas" (patrón `schemaMessage` existente).

(El código completo del componente se escribe en la implementación siguiendo estas especificaciones exactas; usa `formatPrice` de `@/lib/pricing` para USD, `Intl.NumberFormat("es-VE")` para Bs, y las props tipadas del Task 8 Step 4.)

- [ ] **Step 1: Implementar el componente completo** según el spec de arriba
- [ ] **Step 2: `npm run lint` + `npm run build`** → 0 errores
- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/finance-panel.tsx
git commit -m "feat(finanzas): panel de caja, gastos, por cobrar, cierres y tasa"
```

---

### Task 10: Verificación en producción + entrega

- [ ] **Step 1: Push + deploy**

```bash
git push origin main
```

Confirmar deploy READY vía Vercel MCP.

- [ ] **Step 2: Recordatorio a Jose (ÚNICA acción manual):** ejecutar la última versión de `supabase/setup.sql` en el SQL Editor de Supabase (es idempotente: no daña lo existente).

- [ ] **Step 3: Verificar en producción con browser MCP:** login → vista Finanzas → (si SQL ya corrido) fijar tasa, registrar ingreso/gasto, abrir/cerrar caja, registrar abono. Si el SQL no está corrido, verificar que el aviso aparece y el resto del dashboard sigue intacto.

- [ ] **Step 4: `npm run test:run`** → todo verde. Actualizar memoria del proyecto.
