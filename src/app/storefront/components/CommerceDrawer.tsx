"use client";

import Image from "next/image";
import type { StorefrontProduct } from "../../storefront-data";
import { computeUnitPrice, formatPrice } from "@/lib/pricing";
import { buildWhatsappLink, whatsappCartMessage } from "@/lib/whatsapp";

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
  checkoutMessage: string;
}

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
  checkoutMessage,
}: CommerceDrawerProps) {
  if (!panel) {
    return null;
  }

  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + computeUnitPrice(item.product, item.options) * item.quantity,
    0,
  );

  return (
    <div className="fixed inset-0 z-[85] bg-slate-950/35 backdrop-blur-sm">
      <button type="button" aria-label="Cerrar panel" className="absolute inset-0 cursor-default" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[28rem] flex-col bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Express Printer</p>
            <h2 className="text-xl font-black tracking-tight text-slate-950">
              {panel === "cart" ? "Carrito de compras" : "Lista de deseados"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
            aria-label="Cerrar"
          >
            x
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {panel === "wishlist" ? (
            wishlistProducts.length > 0 ? (
              <div className="space-y-4">
                {wishlistProducts.map((product) => (
                  <div key={product.id} className="grid grid-cols-[5.5rem_1fr] gap-3 rounded-2xl border border-slate-200 p-3">
                    <button
                      type="button"
                      onClick={() => onPreview(product)}
                      className={`flex h-22 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${product.tint}`}
                    >
                      <Image
                        src={product.image}
                        alt={product.imageAlt}
                        width={260}
                        height={220}
                        sizes="6rem"
                        className="h-auto max-h-[84%] w-auto max-w-[84%] object-contain"
                      />
                    </button>
                    <div>
                      <h3 className="font-semibold leading-tight text-slate-950">{product.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{product.price}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onAddProduct(product)}
                          className="cursor-pointer rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          Anadir
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveWishlist(product.id)}
                          className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <p className="font-semibold text-slate-950">No tienes productos guardados.</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Guarda productos del catalogo para revisarlos despues.</p>
              </div>
            )
          ) : cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.key} className="rounded-2xl border border-slate-200 p-3">
                  <div className="grid grid-cols-[5.5rem_1fr] gap-3">
                    <button
                      type="button"
                      onClick={() => onPreview(item.product)}
                      className={`flex h-22 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${item.product.tint}`}
                    >
                      <Image
                        src={item.product.image}
                        alt={item.product.imageAlt}
                        width={260}
                        height={220}
                        sizes="6rem"
                        className="h-auto max-h-[84%] w-auto max-w-[84%] object-contain"
                      />
                    </button>
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold leading-tight text-slate-950">{item.product.title}</h3>
                          <p className="mt-1 text-sm font-semibold text-[#3558ff]">{formatPrice(computeUnitPrice(item.product, item.options))}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveCartItem(item.key)}
                          className="cursor-pointer text-sm font-semibold text-slate-400 transition hover:text-slate-950"
                        >
                          Quitar
                        </button>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {Object.entries(item.options).map(([key, value]) => `${key}: ${value}`).join(" / ")}
                      </p>
                      {item.artFileNames?.length ? (
                        <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                          Arte cargado: {item.artFileNames.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <p className="text-sm font-medium text-slate-500">Cantidad</p>
                    <div className="flex items-center rounded-full border border-slate-200">
                      <button
                        type="button"
                        onClick={() => onQuantityChange(item.key, item.quantity - 1)}
                        className="h-9 w-9 cursor-pointer text-slate-500 transition hover:text-slate-950"
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onQuantityChange(item.key, item.quantity + 1)}
                        className="h-9 w-9 cursor-pointer text-slate-500 transition hover:text-slate-950"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
              <p className="font-semibold text-slate-950">Tu carrito esta vacio.</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Agrega productos del catalogo para preparar tu pedido.</p>
            </div>
          )}
        </div>

        {panel === "cart" ? (
          <div className="border-t border-slate-200 p-5">
            {checkoutMessage ? (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-900">
                {checkoutMessage}
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Subtotal estimado</span>
              <span className="text-2xl font-black text-slate-950">{formatPrice(cartSubtotal)}</span>
            </div>
            <a
              href={buildWhatsappLink(whatsappCartMessage(cartItems))}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#1ebe5d]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2c-5.45 0-9.88 4.43-9.88 9.88 0 1.74.45 3.43 1.31 4.92L2 22l5.35-1.4a9.82 9.82 0 0 0 4.68 1.19h.01c5.45 0 9.88-4.43 9.88-9.88a9.8 9.8 0 0 0-2.87-7Zm-7.01 15.19h-.01a8.13 8.13 0 0 1-4.14-1.13l-.3-.18-3.17.83.85-3.09-.2-.32a8.11 8.11 0 0 1 1.24-10.03 8.1 8.1 0 0 1 5.77-2.38c4.49 0 8.15 3.65 8.15 8.14 0 4.49-3.66 8.15-8.19 8.15Z" />
              </svg>
              Pedir por WhatsApp
            </a>
            <button
              type="button"
              onClick={onCheckout}
              className="mt-2 w-full cursor-pointer rounded-xl bg-[#ffd45f] px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-[#ffcd41]"
            >
              Prepararlo en la web
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-slate-400">
              Por WhatsApp cierras al instante. En la web subes arte y pago tu mismo.
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}