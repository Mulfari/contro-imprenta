import { describe, expect, it } from "vitest";

import {
  agingBucket,
  bsToUsd,
  computeInvoiceTotals,
  computeSessionTotals,
  quoteSubtotal,
  round2,
  usdToBs,
  type QuoteItem,
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

describe("quoteSubtotal", () => {
  const items: QuoteItem[] = [
    { description: "Tarjetas premium", quantity: 2, unit_price_usd: 18 },
    { description: "Pendón 1x2m", quantity: 1, unit_price_usd: 25.5 },
  ];

  it("suma cantidad × precio unitario", () => {
    expect(quoteSubtotal(items)).toBe(61.5);
  });

  it("lista vacía = 0", () => {
    expect(quoteSubtotal([])).toBe(0);
  });
});

describe("computeInvoiceTotals", () => {
  it("con IVA y sin IGTF (pago en Bs)", () => {
    const totals = computeInvoiceTotals({ subtotalUsd: 100, applyIva: true, foreignCurrencyPayment: false });
    expect(totals.ivaUsd).toBe(16);
    expect(totals.igtfUsd).toBe(0);
    expect(totals.totalUsd).toBe(116);
  });

  it("con IVA e IGTF (pago en divisas): IGTF 3% sobre base+IVA", () => {
    const totals = computeInvoiceTotals({ subtotalUsd: 100, applyIva: true, foreignCurrencyPayment: true });
    expect(totals.ivaUsd).toBe(16);
    expect(totals.igtfUsd).toBe(3.48); // 3% de 116
    expect(totals.totalUsd).toBe(119.48);
  });

  it("sin IVA con IGTF", () => {
    const totals = computeInvoiceTotals({ subtotalUsd: 50, applyIva: false, foreignCurrencyPayment: true });
    expect(totals.ivaUsd).toBe(0);
    expect(totals.igtfUsd).toBe(1.5);
    expect(totals.totalUsd).toBe(51.5);
  });

  it("redondea a 2 decimales", () => {
    const totals = computeInvoiceTotals({ subtotalUsd: 33.33, applyIva: true, foreignCurrencyPayment: true });
    expect(totals.ivaUsd).toBe(5.33); // 33.33 * 0.16 = 5.3328
    expect(totals.igtfUsd).toBe(1.16); // (33.33+5.33)*0.03 = 1.1598
    expect(totals.totalUsd).toBe(39.82);
  });

  it("subtotal inválido lanza error", () => {
    expect(() =>
      computeInvoiceTotals({ subtotalUsd: 0, applyIva: true, foreignCurrencyPayment: false }),
    ).toThrow();
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
    expect(totals.expectedCashUsd).toBe(130);
    expect(totals.expectedCashVes).toBe(360);
  });

  it("totaliza ingresos/egresos del día en USD", () => {
    const totals = computeSessionTotals(movements, { openingUsd: 0, openingVes: 0 });
    expect(totals.incomeUsd).toBe(100);
    expect(totals.expenseUsd).toBe(20);
  });

  it("agrupa por método", () => {
    const totals = computeSessionTotals(movements, { openingUsd: 0, openingVes: 0 });
    expect(totals.byMethod.zelle).toBe(40);
    expect(totals.byMethod.efectivo_usd).toBe(30);
  });
});
