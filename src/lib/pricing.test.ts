import { describe, expect, it } from "vitest";

import { computeUnitPrice, formatFromPrice, productFromPrice } from "@/lib/pricing";
import type { StorefrontProduct } from "@/app/storefront-data";

type P = Pick<StorefrontProduct, "pricingMode" | "basePrice" | "options">;

const packageProduct = {
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

const unitProduct = {
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
