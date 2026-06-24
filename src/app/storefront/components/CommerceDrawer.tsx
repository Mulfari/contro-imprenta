"use client";

import Image from "next/image";
import {
  ArrowRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react";

import type { StorefrontProduct } from "../../storefront-data";
import { computeUnitPrice, formatPrice } from "@/lib/pricing";
import { buildWhatsappLink, whatsappCartMessage } from "@/lib/whatsapp";

const grotesk = { fontFamily: "var(--font-space-grotesk), sans-serif" };

type CommercePanel = "wishlist" | "cart" | null;

interface CommerceDrawerProps {
  panel: CommercePanel;
  cartItems: Array<{
    key: string;
    product: StorefrontProduct;
    quantity: number;
    options: Record<string, string>;
    artFileNames?: string[];
  }>;
  wishlistProducts: StorefrontProduct[];
  onClose: () => void;
  onPreview: (product: StorefrontProduct) => void;
  onAddProduct: (product: StorefrontProduct) => void;
  onRemoveWishlist: (productId: string) => void;
  onRemoveCartItem: (key: string) => void;
  onQuantityChange: (key: string, quantity: number) => void;
  onCheckout: () => void;
  onBrowseCatalog?: () => void;
  checkoutMessage: string;
}

// Drawer (export "Carrito y Deseados"): panel que entra desde la derecha sobre
// un backdrop. Carrito maneja precio fijo + "a cotizar" (suma lo fijo e indica
// los ítems por cotizar). Deseados con añadir/quitar. Estados vacíos.
export function CommerceDrawer({
  panel,
  cartItems,
  wishlistProducts,
  onClose,
  onPreview,
  onAddProduct,
  onRemoveWishlist,
  onRemoveCartItem,
  onQuantityChange,
  onCheckout,
  onBrowseCatalog,
  checkoutMessage,
}: CommerceDrawerProps) {
  if (!panel) {
    return null;
  }

  const fixedSubtotal = cartItems
    .filter((item) => !item.product.requiresQuote)
    .reduce((sum, item) => sum + computeUnitPrice(item.product, item.options) * item.quantity, 0);
  const quoteCount = cartItems.filter((item) => item.product.requiresQuote).length;

  const browse = () => {
    onClose();
    onBrowseCatalog?.();
  };

  return (
    <div className="fixed inset-0 z-[85] bg-[#0c0b08]/[0.42]">
      <button type="button" aria-label="Cerrar panel" className="absolute inset-0 cursor-default" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-[#fbfaf7] shadow-[-18px_0_50px_rgba(20,20,35,0.22)]">
        {/* Encabezado */}
        <div className="flex flex-none items-center justify-between border-b border-[#ece8df] px-5 py-[18px]">
          <div className="flex items-center gap-2.5">
            <span style={grotesk} className="text-[18px] font-semibold tracking-[-0.015em] text-[#1b1b20]">
              {panel === "cart" ? "Tu carrito" : "Deseados"}
            </span>
            {panel === "cart"
              ? cartItems.length > 0 && (
                  <span className="rounded-full bg-[#3558ff] px-2 py-0.5 text-[12.5px] font-semibold text-white">
                    {cartItems.length}
                  </span>
                )
              : wishlistProducts.length > 0 && (
                  <span className="rounded-full bg-[#fbbf24]/30 px-2 py-0.5 text-[12.5px] font-semibold text-[#1b1b20]">
                    {wishlistProducts.length}
                  </span>
                )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full text-[#3a3a42] transition hover:bg-[#1b1b20]/[0.05]"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {panel === "wishlist" ? (
            wishlistProducts.length > 0 ? (
              <div className="flex flex-col gap-3.5">
                {wishlistProducts.map((product) => (
                  <div key={product.id} className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onPreview(product)}
                      className={`relative flex h-[74px] w-[74px] flex-none cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${product.tint}`}
                    >
                      <Image
                        src={product.image}
                        alt={product.imageAlt}
                        width={260}
                        height={220}
                        sizes="74px"
                        className="h-auto max-h-[84%] w-auto max-w-[84%] object-contain"
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onPreview(product)}
                            style={grotesk}
                            className="block cursor-pointer text-left text-[15px] font-semibold tracking-[-0.01em] text-[#1b1b20]"
                          >
                            {product.title}
                          </button>
                          <div className="mt-0.5 text-[13px] font-semibold text-[#1b1b20]">
                            {product.requiresQuote ? "A cotización" : `Desde ${product.price}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveWishlist(product.id)}
                          aria-label="Quitar"
                          className="flex cursor-pointer rounded-md p-[3px] text-[#a7a49b] transition hover:bg-[#faf0ee] hover:text-[#c0392b]"
                        >
                          <X size={15} weight="bold" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onAddProduct(product)}
                        className="mt-2.5 inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-[11px] border border-[#e0dbcf] bg-white text-[12.5px] font-semibold text-[#1b1b20] transition hover:border-[#c9c3b6] hover:bg-[#fbfaf7]"
                      >
                        <Plus size={13} weight="bold" /> Añadir al carrito
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Heart size={27} />}
                title="Aún no tienes guardados"
                text="Guarda productos con el corazón para encontrarlos rápido."
                cta="Explorar catálogo"
                onCta={browse}
              />
            )
          ) : cartItems.length > 0 ? (
            <div className="flex flex-col gap-4">
              {cartItems.map((item) => {
                const lineQuote = item.product.requiresQuote;
                const lineTotal = computeUnitPrice(item.product, item.options) * item.quantity;
                const opts = Object.entries(item.options)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(" · ");
                return (
                  <div key={item.key} className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onPreview(item.product)}
                      className={`relative flex h-[74px] w-[74px] flex-none cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${item.product.tint}`}
                    >
                      <Image
                        src={item.product.image}
                        alt={item.product.imageAlt}
                        width={260}
                        height={220}
                        sizes="74px"
                        className="h-auto max-h-[84%] w-auto max-w-[84%] object-contain"
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onPreview(item.product)}
                          style={grotesk}
                          className="block min-w-0 cursor-pointer text-left text-[15px] font-semibold tracking-[-0.01em] text-[#1b1b20]"
                        >
                          {item.product.title}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveCartItem(item.key)}
                          aria-label="Quitar"
                          className="flex cursor-pointer rounded-md p-[3px] text-[#a7a49b] transition hover:bg-[#faf0ee] hover:text-[#c0392b]"
                        >
                          <Trash size={15} weight="bold" />
                        </button>
                      </div>
                      {opts ? <div className="mt-0.5 truncate text-[12.5px] text-[#8a857a]">{opts}</div> : null}
                      {item.artFileNames?.length ? (
                        <div className="mt-1.5 text-[11.5px] font-medium text-[#1f8a5b]">
                          Arte: {item.artFileNames.join(", ")}
                        </div>
                      ) : null}
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center overflow-hidden rounded-[9px] border border-[#e0dbcf]">
                          <button
                            type="button"
                            onClick={() => onQuantityChange(item.key, item.quantity - 1)}
                            aria-label="Menos"
                            className="flex h-7 w-7 cursor-pointer items-center justify-center bg-white text-[#3a3a42] transition hover:bg-[#f4f1ea]"
                          >
                            <Minus size={12} weight="bold" />
                          </button>
                          <span className="min-w-[34px] text-center text-[13px] font-semibold text-[#1b1b20]">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onQuantityChange(item.key, item.quantity + 1)}
                            aria-label="Más"
                            className="flex h-7 w-7 cursor-pointer items-center justify-center bg-white text-[#3a3a42] transition hover:bg-[#f4f1ea]"
                          >
                            <Plus size={12} weight="bold" />
                          </button>
                        </div>
                        <span className={`text-[14px] font-semibold ${lineQuote ? "text-[#a8841f]" : "text-[#1b1b20]"}`}>
                          {lineQuote ? "A cotizar" : formatPrice(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<ShoppingBag size={27} />}
              title="Tu carrito está vacío"
              text="Explora el catálogo y agrega lo que quieras imprimir."
              cta="Ver catálogo"
              onCta={browse}
            />
          )}
        </div>

        {/* Pie (solo carrito con ítems) */}
        {panel === "cart" && cartItems.length > 0 ? (
          <div className="flex-none border-t border-[#ece8df] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5d5a52]">Total estimado</span>
              <span style={grotesk} className="text-[20px] font-semibold text-[#1b1b20]">{formatPrice(fixedSubtotal)}</span>
            </div>
            {quoteCount > 0 ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbbf24]/[0.16] px-2.5 py-1 text-[11px] font-semibold text-[#a8841f]">
                  <Tag size={12} weight="bold" /> + {quoteCount} {quoteCount === 1 ? "ítem a cotizar" : "ítems a cotizar"}
                </span>
                <span className="text-[11.5px] text-[#9a968c]">se confirma por WhatsApp</span>
              </div>
            ) : null}
            <div className="mt-3.5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onCheckout}
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3558ff] text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(53,88,255,0.26)] transition hover:bg-[#2647e8]"
              >
                Ir a pagar <ArrowRight size={16} weight="bold" />
              </button>
              <a
                href={buildWhatsappLink(whatsappCartMessage(cartItems))}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#25d366] text-[15px] font-semibold text-[#06310f] transition hover:opacity-90"
              >
                <WhatsappLogo size={19} weight="fill" /> Pedir por WhatsApp
              </a>
            </div>
            {checkoutMessage ? (
              <p className="mt-3 text-center text-[11.5px] leading-5 text-[#9a968c]">{checkoutMessage}</p>
            ) : null}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
  cta,
  onCta,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  cta: string;
  onCta: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full border border-[#e6e3da] bg-white text-[#b8b3a7]">
        {icon}
      </div>
      <div style={grotesk} className="mt-4 text-[18px] font-semibold text-[#1b1b20]">
        {title}
      </div>
      <p className="mt-1.5 max-w-[240px] text-[13.5px] leading-relaxed text-[#75726a]">{text}</p>
      <button
        type="button"
        onClick={onCta}
        className="mt-5 cursor-pointer rounded-xl bg-[#3558ff] px-[22px] py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(53,88,255,0.26)] transition hover:bg-[#2647e8]"
      >
        {cta}
      </button>
    </div>
  );
}
