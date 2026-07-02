import { createOrder } from "@/lib/business";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  bsToUsd,
  computeInvoiceTotals,
  computeSessionTotals,
  IGTF_RATE,
  IVA_RATE,
  quoteSubtotal,
  round2,
  type CashMethod,
  type CurrencyIn,
  type MovementType,
  type QuoteItem,
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
  if (options.sinceIso) {
    query = query.gte("created_at", options.sinceIso);
  }
  if (options.sessionId) {
    query = query.eq("cash_session_id", options.sessionId);
  }
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
  if (!input.branch) {
    throw new Error("Selecciona la sucursal de la caja.");
  }
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
    .select(
      "id, order_number, client_id, total_amount, deposit_amount, pending_amount, created_at, status, client:clients(id, name)",
    )
    .gt("pending_amount", 0)
    .neq("status", "rechazado")
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

// ── Presupuestos ────────────────────────────────────────────

export type QuoteStatus = "borrador" | "enviado" | "aceptado" | "rechazado" | "convertido";

export type Quote = {
  id: string;
  quote_number: number;
  client_id: string | null;
  client_name: string;
  items: QuoteItem[];
  subtotal_usd: number;
  valid_until: string | null;
  status: QuoteStatus;
  converted_order_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

function validateQuoteItems(items: QuoteItem[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Agrega al menos un ítem al presupuesto.");
  }
  for (const item of items) {
    if (!item.description?.trim()) {
      throw new Error("Cada ítem necesita una descripción.");
    }
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw new Error("Cada ítem necesita una cantidad mayor que cero.");
    }
    if (!Number.isFinite(item.unit_price_usd) || item.unit_price_usd < 0) {
      throw new Error("Cada ítem necesita un precio válido.");
    }
  }
}

export async function listQuotes(limit = 30): Promise<Quote[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Quote[];
}

export async function createQuote(input: {
  clientId: string | null;
  clientName: string;
  items: QuoteItem[];
  validUntil: string | null;
  notes?: string;
  createdBy: string;
}): Promise<Quote> {
  const clientName = input.clientName.trim();
  if (!clientName) {
    throw new Error("Selecciona o escribe el cliente del presupuesto.");
  }
  validateQuoteItems(input.items);

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("quotes")
    .insert({
      client_id: input.clientId,
      client_name: clientName,
      items: input.items,
      subtotal_usd: quoteSubtotal(input.items),
      valid_until: input.validUntil,
      status: "enviado",
      notes: input.notes?.trim() || null,
      created_by: input.createdBy,
    })
    .select("*")
    .single<Quote>();
  if (error) throw error;
  return data;
}

export async function setQuoteStatus(input: {
  quoteId: string;
  status: Exclude<QuoteStatus, "convertido">;
}) {
  const supabase = createSupabaseAdminClient();
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("id, status")
    .eq("id", input.quoteId)
    .single<{ id: string; status: QuoteStatus }>();
  if (quoteError) throw quoteError;
  if (quote.status === "convertido") {
    throw new Error("Este presupuesto ya se convirtió en pedido.");
  }
  const { error } = await supabase
    .from("quotes")
    .update({ status: input.status })
    .eq("id", input.quoteId);
  if (error) throw error;
}

// Convierte un presupuesto en pedido real (reusa el flujo de pedidos).
export async function convertQuoteToOrder(input: {
  quoteId: string;
  createdBy: string;
}): Promise<{ orderId: string }> {
  const supabase = createSupabaseAdminClient();
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", input.quoteId)
    .single<Quote>();
  if (quoteError) throw quoteError;
  if (quote.status === "convertido") {
    throw new Error("Este presupuesto ya se convirtió en pedido.");
  }
  if (!quote.client_id) {
    throw new Error("Asocia el presupuesto a un cliente registrado para convertirlo.");
  }

  const items = quote.items ?? [];
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0) || 1;
  const description = items
    .map((item) => `${item.description} x${item.quantity} ($${item.unit_price_usd})`)
    .join("; ");

  const order = await createOrder({
    clientId: quote.client_id,
    productType: `Presupuesto P-${String(quote.quote_number).padStart(4, "0")}`,
    description,
    quantity: String(totalUnits),
    measurements: "",
    material: "",
    laminationFinish: "",
    colorProfile: "",
    includesDesign: false,
    includesInstallation: false,
    urgency: "normal",
    branch: "",
    quotedPrice: String(quote.subtotal_usd),
    discountAmount: "",
    totalAmount: String(quote.subtotal_usd),
    depositAmount: "",
    paymentMethod: "",
    paymentStatus: "pendiente",
    promisedDeliveryAt: "",
    priority: "media",
    currentOwner: "",
    currentArea: "Ventas",
    status: "recibido",
    internalNotes: quote.notes ?? "",
    createdBy: input.createdBy,
  });

  const { error } = await supabase
    .from("quotes")
    .update({ status: "convertido", converted_order_id: order.id })
    .eq("id", quote.id);
  if (error) throw error;

  return { orderId: order.id };
}

// ── Facturas ────────────────────────────────────────────────

export type Invoice = {
  id: string;
  invoice_number: number;
  order_id: string | null;
  client_id: string | null;
  client_name: string;
  client_document: string | null;
  items: QuoteItem[];
  subtotal_usd: number;
  iva_rate: number;
  iva_usd: number;
  igtf_rate: number;
  igtf_usd: number;
  total_usd: number;
  exchange_rate: number | null;
  status: "emitida" | "anulada";
  notes: string | null;
  issued_by: string | null;
  issued_at: string;
  annulled_by: string | null;
  annulled_at: string | null;
};

export async function listInvoices(limit = 30): Promise<Invoice[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("issued_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Invoice[];
}

// Emite una factura (control interno) desde un pedido con total.
export async function createInvoiceFromOrder(input: {
  orderId: string;
  applyIva: boolean;
  foreignCurrencyPayment: boolean;
  notes?: string;
  issuedBy: string;
}): Promise<Invoice> {
  const supabase = createSupabaseAdminClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_number, client_id, product_type, description, quantity, total_amount, client:clients(id, name, document_id)")
    .eq("id", input.orderId)
    .single();
  if (orderError) throw orderError;

  const totalAmount = Number(order.total_amount ?? 0);
  if (totalAmount <= 0) {
    throw new Error("El pedido no tiene un total definido; cotízalo primero.");
  }

  const client = Array.isArray(order.client) ? order.client[0] : order.client;
  const items: QuoteItem[] = [
    {
      description: `Pedido ${order.order_number} — ${order.product_type}${
        order.quantity ? ` (x${order.quantity})` : ""
      }`,
      quantity: 1,
      unit_price_usd: round2(totalAmount),
    },
  ];

  const totals = computeInvoiceTotals({
    subtotalUsd: totalAmount,
    applyIva: input.applyIva,
    foreignCurrencyPayment: input.foreignCurrencyPayment,
  });

  let exchangeRate: number | null = null;
  try {
    exchangeRate = (await getTodayRate())?.bs_per_usd ?? null;
  } catch {
    exchangeRate = null;
  }

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      order_id: order.id,
      client_id: (order.client_id as string) ?? null,
      client_name: (client?.name as string) ?? "Sin cliente",
      client_document: (client?.document_id as string) ?? null,
      items,
      subtotal_usd: round2(totalAmount),
      iva_rate: input.applyIva ? IVA_RATE : 0,
      iva_usd: totals.ivaUsd,
      igtf_rate: input.foreignCurrencyPayment ? IGTF_RATE : 0,
      igtf_usd: totals.igtfUsd,
      total_usd: totals.totalUsd,
      exchange_rate: exchangeRate,
      notes: input.notes?.trim() || null,
      issued_by: input.issuedBy,
    })
    .select("*")
    .single<Invoice>();
  if (error) throw error;
  return data;
}

export async function annulInvoice(input: { invoiceId: string; annulledBy: string }) {
  const supabase = createSupabaseAdminClient();
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, status")
    .eq("id", input.invoiceId)
    .single<{ id: string; status: string }>();
  if (invoiceError) throw invoiceError;
  if (invoice.status !== "emitida") {
    throw new Error("Esta factura ya está anulada.");
  }
  const { error } = await supabase
    .from("invoices")
    .update({
      status: "anulada",
      annulled_by: input.annulledBy,
      annulled_at: new Date().toISOString(),
    })
    .eq("id", input.invoiceId);
  if (error) throw error;
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
      payment_status:
        newDeposit <= 0 ? "pendiente" : newPending <= 0 ? "pagado" : "anticipo",
    })
    .eq("id", order.id);
  if (updateError) throw updateError;

  return movement;
}
