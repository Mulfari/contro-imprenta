import type { StorefrontProduct } from "@/app/storefront-data";

// Cálculo de precio compartido entre cliente y servidor. Mantener PURO (sin
// dependencias de servidor) para poder usarlo en componentes "use client".

type PricingProduct = Pick<
  StorefrontProduct,
  "pricingMode" | "basePrice" | "options"
>;

// Precio unitario de UN ítem (un paquete en modo 'package', una unidad en
// modo 'unit') según las opciones elegidas. El total de línea = este valor por
// la cantidad del carrito.
export function computeUnitPrice(
  product: PricingProduct,
  selectedOptions: Record<string, string> = {},
): number {
  let base = product.basePrice ?? 0;

  if (product.pricingMode === "package") {
    const packageGroup = product.options.find((group) => group.role === "package");

    if (packageGroup && packageGroup.values.length > 0) {
      const selectedLabel = selectedOptions[packageGroup.name];
      const selectedValue =
        packageGroup.values.find((value) => value.label === selectedLabel) ??
        packageGroup.values[0];
      base = selectedValue ? selectedValue.amount : base;
    }
  }

  let surcharge = 0;

  for (const group of product.options) {
    if (group.role !== "surcharge") {
      continue;
    }

    const selectedLabel = selectedOptions[group.name];
    const selectedValue = group.values.find((value) => value.label === selectedLabel);

    if (selectedValue) {
      surcharge += selectedValue.amount;
    }
  }

  return Math.max(0, Number((base + surcharge).toFixed(2)));
}

// Precio mínimo posible (para el "Desde $X" de las tarjetas).
export function productFromPrice(product: PricingProduct): number {
  if (product.pricingMode === "package") {
    const packageGroup = product.options.find((group) => group.role === "package");
    const baseMin =
      packageGroup && packageGroup.values.length > 0
        ? Math.min(...packageGroup.values.map((value) => value.amount))
        : product.basePrice ?? 0;
    const surchargeMin = product.options
      .filter((group) => group.role === "surcharge")
      .reduce(
        (sum, group) =>
          sum +
          (group.values.length > 0
            ? Math.min(...group.values.map((value) => value.amount))
            : 0),
        0,
      );

    return Math.max(0, Number((baseMin + surchargeMin).toFixed(2)));
  }

  return Math.max(0, product.basePrice ?? 0);
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

// "$18" sin decimales si es entero, para el texto "Desde".
export function formatFromPrice(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}
