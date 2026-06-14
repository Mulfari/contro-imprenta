import type { StorefrontProduct } from "@/app/storefront-data";
import { computeUnitPrice, formatPrice } from "@/lib/pricing";

// Numero de WhatsApp de la imprenta (mismo del header/footer).
export const WHATSAPP_NUMBER = "584243390487";

export function buildWhatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function optionLines(options: Record<string, string>) {
  return Object.entries(options)
    .filter(([, value]) => value)
    .map(([key, value]) => `• ${key}: ${value}`)
    .join("\n");
}

// Mensaje para un solo producto (vista de detalle).
export function whatsappProductMessage(
  product: StorefrontProduct,
  options: Record<string, string>,
  quantity: number,
) {
  const safeQuantity = Math.max(1, Number(quantity) || 1);
  const opts = optionLines(options);
  const priceLine = product.requiresQuote
    ? "Necesito cotizacion para este pedido."
    : `Precio estimado: ${formatPrice(computeUnitPrice(product, options) * safeQuantity)}`;

  return [
    "Hola Express Printer, quiero hacer un pedido:",
    "",
    `*${product.title}*`,
    `Cantidad: ${safeQuantity}`,
    opts,
    priceLine,
    "",
    "(Tengo el arte / quiero que me ayuden con el diseno)",
  ]
    .filter((line) => line !== null && line !== undefined)
    .join("\n");
}

type CartLike = {
  product: StorefrontProduct;
  options: Record<string, string>;
  quantity: number;
};

// Mensaje para todo el carrito.
export function whatsappCartMessage(items: CartLike[]) {
  if (items.length === 0) {
    return "Hola Express Printer, quiero hacer un pedido.";
  }

  let estimatedTotal = 0;
  let hasQuoteItem = false;

  const blocks = items.map((item, index) => {
    const safeQuantity = Math.max(1, Number(item.quantity) || 1);
    const opts = optionLines(item.options);
    let priceLine: string;

    if (item.product.requiresQuote) {
      hasQuoteItem = true;
      priceLine = "Precio: a cotizar";
    } else {
      const lineTotal = computeUnitPrice(item.product, item.options) * safeQuantity;
      estimatedTotal += lineTotal;
      priceLine = `Subtotal: ${formatPrice(lineTotal)}`;
    }

    return [
      `${index + 1}. *${item.product.title}* (x${safeQuantity})`,
      opts,
      priceLine,
    ]
      .filter(Boolean)
      .join("\n");
  });

  const totalLine = hasQuoteItem
    ? `Total estimado: ${formatPrice(estimatedTotal)} + items a cotizar`
    : `Total estimado: ${formatPrice(estimatedTotal)}`;

  return [
    "Hola Express Printer, quiero hacer este pedido:",
    "",
    blocks.join("\n\n"),
    "",
    totalLine,
  ].join("\n");
}
