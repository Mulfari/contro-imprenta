"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { CustomerAccountClient } from "@/app/mi-cuenta/account-client";
import { storefrontProducts, type StorefrontProduct } from "@/app/storefront-data";
import { StorefrontBusinessSection } from "@/app/storefront-business-section";
import { StorefrontCategoryStrip } from "@/app/storefront-category-strip";
import { StorefrontDealsSection } from "@/app/storefront-deals-section";
import { StorefrontFooter } from "@/app/storefront-footer";
import { StorefrontFeatureGridSection } from "@/app/storefront-feature-grid-section";
import { StorefrontHeader } from "@/app/storefront-header";
import { StorefrontHero } from "@/app/storefront-hero";
import { StorefrontPromoPanels } from "@/app/storefront-promo-panels";
import { StorefrontTestimonialsSection } from "@/app/storefront-testimonials-section";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

type CartItem = {
  key: string;
  product: StorefrontProduct;
  quantity: number;
  options: Record<string, string>;
};

type CommercePanel = "wishlist" | "cart" | null;

type StoredCartItem = {
  productId: string;
  quantity: number;
  options: Record<string, string>;
};

type ToastMessage = {
  id: number;
  message: string;
  tone: "info" | "success" | "error";
};

const cartStorageKey = "express-printer-cart";
const wishlistStorageKey = "express-printer-wishlist";

const categoryGroups = [
  {
    title: "Papeleria comercial",
    items: ["Tarjetas", "Talonarios", "Facturas", "Invitaciones"],
  },
  {
    title: "Gran formato",
    items: ["Pendones", "Gran formato", "Roll up", "Publicitario"],
  },
  {
    title: "Etiquetas y stickers",
    items: ["Stickers", "Etiquetas", "Packaging", "Troquelados"],
  },
  {
    title: "Acabados y usos",
    items: ["Premium", "Corporativas", "Autocopiativos", "Personalizados"],
  },
];

function getDefaultOptions(product: StorefrontProduct) {
  return Object.fromEntries(
    product.options.map((group) => [group.name, group.values[0] ?? ""]),
  );
}

function getCartKey(product: StorefrontProduct, options: Record<string, string>) {
  return `${product.id}:${Object.entries(options)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}-${value}`)
    .join("|")}`;
}

function parsePrice(price: string) {
  return Number(price.replace(/[^\d.]/g, "")) || 0;
}

function getProductById(productId: string) {
  return storefrontProducts.find((product) => product.id === productId) ?? null;
}

function restoreStoredCart(value: string | null) {
  if (!value) {
    return [] as CartItem[];
  }

  try {
    const parsed = JSON.parse(value) as StoredCartItem[];

    if (!Array.isArray(parsed)) {
      return [] as CartItem[];
    }

    return parsed.flatMap((item) => {
      const product = getProductById(item.productId);

      if (!product) {
        return [];
      }

      const options = item.options && typeof item.options === "object"
        ? item.options
        : getDefaultOptions(product);

      return [
        {
          key: getCartKey(product, options),
          product,
          quantity: Math.max(1, Number(item.quantity) || 1),
          options,
        },
      ];
    });
  } catch {
    return [] as CartItem[];
  }
}

function restoreStoredWishlist(value: string | null) {
  if (!value) {
    return new Set<string>();
  }

  try {
    const parsed = JSON.parse(value) as string[];

    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    const validIds = new Set(storefrontProducts.map((product) => product.id));
    return new Set(parsed.filter((productId) => validIds.has(productId)));
  } catch {
    return new Set<string>();
  }
}

function StorefrontToast({
  toast,
  onDone,
}: {
  toast: ToastMessage | null;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"enter" | "leave">("enter");

  useEffect(() => {
    if (!toast) {
      return;
    }

    const leaveTimer = window.setTimeout(() => setPhase("leave"), 2800);
    const cleanupTimer = window.setTimeout(onDone, 3500);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(cleanupTimer);
    };
  }, [toast, onDone]);

  if (!toast) {
    return null;
  }

  const toneClasses =
    toast.tone === "error"
      ? "border-rose-200/80 bg-rose-50/92 text-rose-700 shadow-[0_24px_60px_rgba(190,24,93,0.18)]"
      : toast.tone === "success"
        ? "border-emerald-200/80 bg-emerald-50/92 text-emerald-700 shadow-[0_24px_60px_rgba(5,150,105,0.16)]"
        : "border-blue-200/80 bg-blue-50/90 text-slate-700 shadow-[0_24px_60px_rgba(59,130,246,0.14)]";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[120] flex justify-center px-4">
      <div
        className={`pointer-events-auto w-full max-w-md rounded-[1.35rem] border px-5 py-4 text-center text-sm font-medium backdrop-blur-xl ${toneClasses} ${
          phase === "enter" ? "toast-enter" : "toast-leave"
        }`}
      >
        <p className="leading-6">{toast.message}</p>
      </div>
    </div>
  );
}

function CatalogProductCard({
  product,
  wished,
  onPreview,
  onToggleWishlist,
  onAddToCart,
}: {
  product: StorefrontProduct;
  wished: boolean;
  onPreview: () => void;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
}) {
  return (
    <article className="catalog-enter-card group overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_38px_rgba(15,23,42,0.08)] sm:rounded-[1.35rem]">
      <button
        type="button"
        onClick={onPreview}
        className={`relative flex h-44 w-full cursor-pointer items-center justify-center overflow-hidden bg-gradient-to-br ${product.tint} p-4 text-left sm:h-56 sm:p-5`}
      >
        <div className="absolute left-4 top-4 rounded-full bg-white/82 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {product.category}
        </div>
        <div className="absolute inset-x-10 bottom-6 h-10 rounded-full bg-slate-900/12 blur-2xl" />
        <Image
          src={product.image}
          alt={product.imageAlt}
          width={1000}
          height={760}
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 40vw, 88vw"
          className="relative z-10 h-auto max-h-[88%] w-auto max-w-[86%] object-contain drop-shadow-[0_22px_34px_rgba(15,23,42,0.18)] transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.02]"
        />
      </button>

      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold leading-tight tracking-tight text-slate-950">
              {product.title}
            </h3>
            <button
              type="button"
              onClick={onToggleWishlist}
              aria-label={wished ? "Quitar de deseados" : "Agregar a deseados"}
              className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border transition ${
                wished
                  ? "border-[#ff5b4d]/20 bg-[#ff5b4d] text-white"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 20-1.2-1.1C5.8 14.4 3 11.8 3 8.5A4.5 4.5 0 0 1 7.5 4C9.3 4 11 4.9 12 6.3 13 4.9 14.7 4 16.5 4A4.5 4.5 0 0 1 21 8.5c0 3.3-2.8 5.9-7.8 10.4L12 20Z" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{product.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.highlights.slice(0, 2).map((item) => (
            <span
              key={item}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Desde
            </p>
            <p className="text-2xl font-black tracking-tight text-slate-950">{product.price}</p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              onClick={onPreview}
              className="min-w-0 flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-none"
            >
              Ver
            </button>
            <button
              type="button"
              onClick={onAddToCart}
              className="min-w-0 flex-1 cursor-pointer rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:flex-none"
            >
              Anadir
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function CatalogProductSkeleton() {
  return (
    <article className="overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:rounded-[1.35rem]">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden bg-slate-100 p-4 sm:h-56 sm:p-5">
        <div className="absolute left-4 top-4 h-6 w-24 animate-pulse rounded-full bg-white/80" />
        <div className="h-28 w-36 animate-pulse rounded-[1.5rem] bg-slate-200 sm:h-36 sm:w-44" />
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="h-6 w-44 max-w-full animate-pulse rounded-full bg-slate-200" />
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="h-7 w-28 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="h-3 w-14 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-2 h-8 w-24 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <div className="h-10 flex-1 animate-pulse rounded-xl bg-slate-200 sm:w-16 sm:flex-none" />
            <div className="h-10 flex-1 animate-pulse rounded-xl bg-slate-200 sm:w-20 sm:flex-none" />
          </div>
        </div>
      </div>
    </article>
  );
}

function ProductPreviewModal({
  product,
  selectedOptions,
  onClose,
  onOptionChange,
  onAddToCart,
  wished,
  onToggleWishlist,
}: {
  product: StorefrontProduct;
  selectedOptions: Record<string, string>;
  onClose: () => void;
  onOptionChange: (group: string, value: string) => void;
  onAddToCart: () => void;
  wished: boolean;
  onToggleWishlist: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/45 px-4 py-5 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex h-full w-full max-w-[76rem] items-center">
        <article className="grid max-h-full w-full overflow-hidden rounded-[1.6rem] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] lg:grid-cols-[0.98fr_1.02fr]">
          <div className={`relative flex min-h-[20rem] items-center justify-center overflow-hidden bg-gradient-to-br ${product.tint} p-6 sm:min-h-[26rem]`}>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute left-4 top-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/88 text-slate-700 shadow-sm transition hover:bg-white hover:text-slate-950 lg:hidden"
            >
              x
            </button>
            <div className="absolute inset-x-14 bottom-10 h-12 rounded-full bg-slate-900/12 blur-2xl" />
            <Image
              src={product.image}
              alt={product.imageAlt}
              width={1200}
              height={900}
              sizes="(min-width: 1024px) 38vw, 88vw"
              className="relative z-10 h-auto max-h-[80%] w-auto max-w-[88%] object-contain drop-shadow-[0_28px_42px_rgba(15,23,42,0.2)]"
            />
          </div>

          <div className="overflow-y-auto p-5 sm:p-7 lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3558ff]">
                  {product.category}
                </p>
                <h2 className="mt-2 text-[1.9rem] font-black leading-tight tracking-tight text-slate-950 sm:text-[2.4rem]">
                  {product.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="hidden h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 lg:flex"
              >
                x
              </button>
            </div>

            <p className="mt-4 text-base leading-7 text-slate-600">{product.description}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {product.highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-5">
              {product.options.map((group) => (
                <div key={group.name}>
                  <p className="text-sm font-semibold text-slate-950">{group.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.values.map((value) => {
                      const selected = selectedOptions[group.name] === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => onOptionChange(group.name, value)}
                          className={`cursor-pointer rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                            selected
                              ? "border-slate-950 bg-slate-950 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Precio base
                  </p>
                  <p className="text-3xl font-black text-slate-950">{product.price}</p>
                </div>
                <p className="text-right text-sm font-medium text-slate-500">
                  Entrega estimada<br />
                  <span className="font-semibold text-slate-950">{product.turnaround}</span>
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <button
                  type="button"
                  onClick={onAddToCart}
                  className="cursor-pointer rounded-xl bg-[#ffd45f] px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-[#ffcd41]"
                >
                  Anadir al carrito
                </button>
                <button
                  type="button"
                  onClick={onToggleWishlist}
                  className={`cursor-pointer rounded-xl border px-5 py-3.5 text-sm font-semibold transition ${
                    wished
                      ? "border-[#ff5b4d] bg-[#ff5b4d] text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {wished ? "En deseados" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function MobileCatalogFilterSheet({
  open,
  activeQuery,
  onClose,
  onClear,
  onSelect,
}: {
  open: boolean;
  activeQuery: string;
  onClose: () => void;
  onClear: () => void;
  onSelect: (query: string) => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] xl:hidden">
      <button
        type="button"
        aria-label="Cerrar filtros"
        className="absolute inset-0 cursor-default bg-slate-950/35 backdrop-blur-sm"
        onClick={onClose}
      />
      <section className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-hidden rounded-t-[1.65rem] bg-white shadow-[0_-24px_70px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Catalogo
            </p>
            <h2 className="text-lg font-black tracking-tight text-slate-950">
              Filtrar productos
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
          >
            x
          </button>
        </div>

        <div className="max-h-[calc(78vh-5rem)] overflow-y-auto px-4 pb-28 pt-4">
          <button
            type="button"
            onClick={onClear}
            className={`w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-black transition ${
              activeQuery
                ? "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                : "bg-slate-950 text-white"
            }`}
          >
            Ver todo el catalogo
          </button>

          <div className="mt-5 space-y-5">
            {categoryGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {group.title}
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {group.items.map((item) => {
                    const isActive = activeQuery.toLowerCase() === item.toLowerCase();

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => onSelect(item)}
                        className={`min-w-0 cursor-pointer rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${
                          isActive
                            ? "border-slate-950 bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.14)]"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-950"
                        }`}
                      >
                        <span className="block truncate">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MobileStorefrontBar({
  isCatalogVisible,
  cartCount,
  wishlistCount,
  onCatalogClick,
  onFilterClick,
  onWishlistClick,
  onCartClick,
}: {
  isCatalogVisible: boolean;
  cartCount: number;
  wishlistCount: number;
  onCatalogClick: () => void;
  onFilterClick: () => void;
  onWishlistClick: () => void;
  onCartClick: () => void;
}) {
  const itemClass =
    "flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-[1rem] px-2 py-2 text-[0.68rem] font-black transition";

  return (
    <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[64] xl:hidden">
      <div className="mx-auto flex max-w-md items-center gap-1 rounded-[1.35rem] border border-slate-200/80 bg-white/94 p-1.5 text-slate-600 shadow-[0_22px_58px_rgba(15,23,42,0.22)] backdrop-blur-xl">
        <button
          type="button"
          onClick={onCatalogClick}
          className={`${itemClass} ${
            isCatalogVisible ? "bg-slate-950 text-white" : "hover:bg-slate-50 hover:text-slate-950"
          }`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5h16" />
            <path d="M4 12h16" />
            <path d="M4 19h16" />
          </svg>
          Catalogo
        </button>

        <button
          type="button"
          onClick={onFilterClick}
          className={`${itemClass} hover:bg-slate-50 hover:text-slate-950`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16" />
            <path d="M7 12h10" />
            <path d="M10 18h4" />
          </svg>
          Filtros
        </button>

        <button
          type="button"
          onClick={onWishlistClick}
          className={`${itemClass} relative hover:bg-slate-50 hover:text-slate-950`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 20-1.2-1.1C5.8 14.4 3 11.8 3 8.5A4.5 4.5 0 0 1 7.5 4C9.3 4 11 4.9 12 6.3 13 4.9 14.7 4 16.5 4A4.5 4.5 0 0 1 21 8.5c0 3.3-2.8 5.9-7.8 10.4L12 20Z" />
          </svg>
          Deseados
          {wishlistCount > 0 ? (
            <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff5b4d] px-1 text-[0.62rem] font-bold text-white">
              {wishlistCount}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={onCartClick}
          className={`${itemClass} relative hover:bg-slate-50 hover:text-slate-950`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="19" r="1.75" />
            <circle cx="18" cy="19" r="1.75" />
            <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H7.2" />
          </svg>
          Carrito
          {cartCount > 0 ? (
            <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ffd45f] px-1 text-[0.62rem] font-bold text-slate-950">
              {cartCount}
            </span>
          ) : null}
        </button>
      </div>
    </nav>
  );
}

function CommerceDrawer({
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
  isCheckingOut,
  checkoutMessage,
}: {
  panel: CommercePanel;
  cartItems: CartItem[];
  wishlistProducts: StorefrontProduct[];
  onClose: () => void;
  onPreview: (product: StorefrontProduct) => void;
  onAddProduct: (product: StorefrontProduct) => void;
  onRemoveWishlist: (productId: string) => void;
  onRemoveCartItem: (key: string) => void;
  onQuantityChange: (key: string, quantity: number) => void;
  onCheckout: () => void;
  isCheckingOut: boolean;
  checkoutMessage: string;
}) {
  if (!panel) {
    return null;
  }

  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + parsePrice(item.product.price) * item.quantity,
    0,
  );

  return (
    <div className="fixed inset-0 z-[85] bg-slate-950/35 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Cerrar panel"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[28rem] flex-col bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Express Printer
            </p>
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
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Guarda productos del catalogo para revisarlos despues.
                </p>
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
                          <p className="mt-1 text-sm font-semibold text-[#3558ff]">{item.product.price}</p>
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
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Agrega productos del catalogo para preparar tu pedido.
              </p>
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
              <span className="text-2xl font-black text-slate-950">${cartSubtotal}</span>
            </div>
            <button
              type="button"
              onClick={onCheckout}
              disabled={isCheckingOut}
              className="mt-4 w-full cursor-pointer rounded-xl bg-[#ffd45f] px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-[#ffcd41] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCheckingOut ? "Creando solicitud..." : "Crear solicitud"}
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-slate-400">
              Luego podras subir el arte y registrar el pago movil desde Mi cuenta.
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

export function StorefrontShell() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(() => new Set());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activePanel, setActivePanel] = useState<CommercePanel>(null);
  const [selectedProduct, setSelectedProduct] = useState<StorefrontProduct | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [customerSession, setCustomerSession] = useState<Session | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutNotice, setCheckoutNotice] = useState<{
    message: string;
    tone: "error" | "success";
  } | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    if (!hasSupabasePublicConfig()) {
      return;
    }

    const supabase = createBrowserSupabaseClient();

    void supabase.auth.getSession().then(({ data }) => {
      setCustomerSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setCustomerSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setWishlistIds(restoreStoredWishlist(window.localStorage.getItem(wishlistStorageKey)));
    setCartItems(restoreStoredCart(window.localStorage.getItem(cartStorageKey)));
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    window.localStorage.setItem(
      wishlistStorageKey,
      JSON.stringify(Array.from(wishlistIds)),
    );
  }, [storageReady, wishlistIds]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    const storedItems: StoredCartItem[] = cartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      options: item.options,
    }));

    window.localStorage.setItem(cartStorageKey, JSON.stringify(storedItems));
  }, [cartItems, storageReady]);

  useEffect(() => {
    if (!accountOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) {
        return;
      }

      if (
        accountDropdownRef.current?.contains(target) ||
        target.closest("[data-account-trigger='true']")
      ) {
        return;
      }

      setAccountOpen(false);
    };

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [accountOpen]);

  const isCatalogVisible = catalogOpen || Boolean(debouncedQuery);
  const isCatalogSettling = isCatalogVisible && searchQuery.trim() !== debouncedQuery;
  const showCatalogSkeleton = catalogLoading || isCatalogSettling;

  useEffect(() => {
    if (!catalogLoading) {
      return;
    }

    const timeout = window.setTimeout(() => setCatalogLoading(false), 260);

    return () => window.clearTimeout(timeout);
  }, [catalogLoading]);

  const filteredProducts = useMemo(() => {
    if (!isCatalogVisible) {
      return [];
    }

    const normalized = debouncedQuery.toLowerCase();

    if (!normalized) {
      return storefrontProducts;
    }

    return storefrontProducts.filter((item) =>
      [
        item.title,
        item.note,
        item.category,
        item.description,
        item.highlights.join(" "),
        item.options.map((group) => group.values.join(" ")).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [debouncedQuery, isCatalogVisible]);

  const wishlistProducts = useMemo(
    () => storefrontProducts.filter((product) => wishlistIds.has(product.id)),
    [wishlistIds],
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const publicAuthEnabled = hasSupabasePublicConfig();

  const showToast = (message: string, tone: ToastMessage["tone"] = "info") => {
    setToast({
      id: Date.now(),
      message,
      tone,
    });
  };

  const openCatalog = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setCatalogOpen(true);
    setCatalogLoading(true);
    setAccountOpen(false);
    setActivePanel(null);
    setMobileFilterOpen(false);
    window.history.pushState(null, "", "#catalogo");
    window.setTimeout(() => {
      document.getElementById("catalogo")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const openCatalogWithQuery = (query: string) => {
    setSearchQuery(query);
    setDebouncedQuery(query);
    setCatalogOpen(true);
    setCatalogLoading(true);
    setAccountOpen(false);
    setActivePanel(null);
    setMobileFilterOpen(false);
    window.history.pushState(null, "", "#catalogo");
    window.setTimeout(() => {
      document.getElementById("catalogo")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const closeCatalogForHomeSection = () => {
    setCatalogOpen(false);
    setActivePanel(null);
    setSelectedProduct(null);
    setMobileFilterOpen(false);
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);

    if (value.trim()) {
      setCatalogOpen(true);
      setCatalogLoading(true);
      setAccountOpen(false);
    }
  };

  const openPreview = (product: StorefrontProduct) => {
    setSelectedProduct(product);
    setSelectedOptions(getDefaultOptions(product));
    setActivePanel(null);
    setMobileFilterOpen(false);
  };

  const openPreviewById = (productId: string) => {
    const product = getProductById(productId);

    if (!product) {
      showToast("No se encontro ese producto.", "error");
      return;
    }

    openPreview(product);
  };

  const toggleWishlist = (productId: string) => {
    setWishlistIds((current) => {
      const next = new Set(current);

      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }

      return next;
    });
  };

  const addToCart = (product: StorefrontProduct, options = getDefaultOptions(product)) => {
    const key = getCartKey(product, options);

    setCartItems((current) => {
      const existing = current.find((item) => item.key === key);

      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [
        ...current,
        {
          key,
          product,
          quantity: 1,
          options,
        },
      ];
    });
    setActivePanel("cart");
    setMobileFilterOpen(false);
    showToast(`${product.title} agregado al carrito.`, "success");
  };

  const addProductById = (productId: string) => {
    const product = getProductById(productId);

    if (!product) {
      showToast("No se encontro ese producto.", "error");
      return;
    }

    addToCart(product);
  };

  const removeCartItem = (key: string) => {
    setCartItems((current) => current.filter((item) => item.key !== key));
  };

  const changeCartQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      removeCartItem(key);
      return;
    }

    setCartItems((current) =>
      current.map((item) => (item.key === key ? { ...item, quantity } : item)),
    );
  };

  const handleCheckout = async () => {
    setCheckoutMessage("");

    if (cartItems.length === 0) {
      setCheckoutMessage("Agrega productos al carrito antes de continuar.");
      setCheckoutNotice(null);
      showToast("Agrega productos al carrito antes de continuar.", "info");
      return;
    }

    if (!customerSession) {
      const message = "Necesitas iniciar sesion o registrarte para continuar con el pedido.";
      setCheckoutMessage(message);
      setCheckoutNotice({ message, tone: "error" });
      showToast(message, "error");
      setAccountOpen(true);
      setActivePanel(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/storefront/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.product.id,
            title: item.product.title,
            productType: item.product.category,
            quantity: item.quantity,
            unitPrice: parsePrice(item.product.price),
            options: item.options,
          })),
        }),
      });
      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo crear el pedido.");
      }

      setCartItems([]);
      const message =
        payload.message ||
        "Solicitud creada. Sube el arte y registra el pago movil desde Mi cuenta.";
      setCheckoutMessage(message);
      setCheckoutNotice({ message, tone: "success" });
      showToast(message, "success");
      setActivePanel(null);
      setAccountOpen(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear el pedido.";
      setCheckoutMessage(message);
      setCheckoutNotice({ message, tone: "error" });
      showToast(message, "error");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const clearCatalogFilters = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setCatalogOpen(true);
    setCatalogLoading(true);
    setMobileFilterOpen(false);
    setActivePanel(null);
    setAccountOpen(false);
    window.history.pushState(null, "", "#catalogo");
    window.setTimeout(() => {
      document.getElementById("catalogo")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const selectCatalogFilter = (query: string) => {
    setSearchQuery(query);
    setDebouncedQuery(query);
    setCatalogOpen(true);
    setCatalogLoading(true);
    setMobileFilterOpen(false);
    setActivePanel(null);
    setAccountOpen(false);
    window.history.pushState(null, "", "#catalogo");
    window.setTimeout(() => {
      document.getElementById("catalogo")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const openMobileFilters = () => {
    setCatalogOpen(true);
    setCatalogLoading(true);
    setActivePanel(null);
    setAccountOpen(false);
    setMobileFilterOpen(true);
    window.history.pushState(null, "", "#catalogo");
    window.setTimeout(() => {
      document.getElementById("catalogo")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  return (
    <main className="relative min-h-screen bg-[#f3f5f8] pb-24 text-slate-950 xl:pb-0">
      <StorefrontToast
        key={toast?.id ?? "empty-toast"}
        toast={toast}
        onDone={() => setToast(null)}
      />
      <StorefrontHeader
        searchQuery={searchQuery}
        onSearchQueryChange={handleSearchQueryChange}
        hasActiveSearch={isCatalogVisible}
        isAccountActive={accountOpen}
        onAccountClick={() => {
          setAccountOpen((current) => !current);
          setActivePanel(null);
        }}
        wishlistCount={wishlistIds.size}
        cartCount={cartCount}
        onWishlistClick={() => {
          setActivePanel("wishlist");
          setAccountOpen(false);
        }}
        onCartClick={() => {
          setActivePanel("cart");
          setAccountOpen(false);
        }}
        onCatalogClick={openCatalog}
        onSectionNavigate={closeCatalogForHomeSection}
      />

      {accountOpen ? (
        <div className="pointer-events-none absolute inset-x-0 top-[7.35rem] z-[70] px-4 sm:px-6 lg:px-8 2xl:px-10">
          <div
            ref={accountDropdownRef}
            className="mx-auto flex w-full max-w-[112rem] justify-end"
          >
            <CustomerAccountClient
              hasPublicAuth={publicAuthEnabled}
              onClose={() => setAccountOpen(false)}
              variant="dropdown"
              initialMode="login"
              showModeSwitch={false}
              initialNotice={checkoutNotice}
            />
          </div>
        </div>
      ) : null}

      {isCatalogVisible ? (
        <>
          <section id="catalogo" className="catalog-enter mx-auto w-full max-w-[112rem] scroll-mt-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 2xl:px-10">
            <div className="grid gap-4 xl:grid-cols-[300px_1fr] xl:gap-6">
              <aside className="catalog-enter-panel hidden rounded-[1.45rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)] xl:block xl:rounded-[1.8rem]">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Catalogo
                </p>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
                  Categorias
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedQuery("");
                    setCatalogOpen(true);
                    setCatalogLoading(true);
                  }}
                  className={`mt-5 w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    debouncedQuery
                      ? "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      : "bg-slate-950 text-white hover:bg-slate-800"
                  }`}
                >
                  Ver todos
                </button>
                <div className="mt-5 space-y-5">
                  {categoryGroups.map((group) => (
                    <div key={group.title} className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
                      <h3 className="text-sm font-semibold text-slate-500">{group.title}</h3>
                      <div className="mt-3 space-y-1.5">
                        {group.items.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setSearchQuery(item);
                              setDebouncedQuery(item);
                              setCatalogOpen(true);
                              setCatalogLoading(true);
                            }}
                            className={`block w-full cursor-pointer rounded-lg px-2 py-2.5 text-left text-sm transition ${
                              debouncedQuery.toLowerCase() === item.toLowerCase()
                                ? "bg-slate-950 text-white"
                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              <section className="catalog-enter-panel rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-6 xl:rounded-[1.9rem]">
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 sm:tracking-[0.32em]">
                      {showCatalogSkeleton
                        ? "Preparando catalogo"
                        : debouncedQuery
                          ? "Resultados de busqueda"
                          : "Catalogo completo"}
                    </p>
                    <h2 className="mt-2 text-[1.55rem] font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
                      {showCatalogSkeleton
                        ? searchQuery.trim() || "Productos de impresion"
                        : debouncedQuery || "Productos de impresion"}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                      {showCatalogSkeleton
                        ? "Cargando..."
                        : `${filteredProducts.length} producto${filteredProducts.length === 1 ? "" : "s"}`}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                      {cartCount} en carrito
                    </span>
                  </div>
                </div>

                {showCatalogSkeleton ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                    {[0, 1, 2, 3, 4, 5].map((item) => (
                      <CatalogProductSkeleton key={item} />
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <CatalogProductCard
                        key={product.id}
                        product={product}
                        wished={wishlistIds.has(product.id)}
                        onPreview={() => openPreview(product)}
                        onToggleWishlist={() => toggleWishlist(product.id)}
                        onAddToCart={() => addToCart(product)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                    <p className="text-lg font-semibold text-slate-900">
                      No encontramos productos para esa busqueda
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Prueba con otra palabra o selecciona una categoria del catalogo.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </section>
          <StorefrontFooter />
        </>
      ) : (
        <>
          <StorefrontHero />
          <StorefrontCategoryStrip onCategorySelect={openCatalogWithQuery} />
          <StorefrontPromoPanels
            onPreviewProduct={openPreviewById}
            onAddProduct={addProductById}
          />
          <StorefrontDealsSection
            onPreviewProduct={openPreviewById}
            onAddProduct={addProductById}
          />
          <StorefrontFeatureGridSection />
          <StorefrontBusinessSection />
          <StorefrontTestimonialsSection />
          <StorefrontFooter />
        </>
      )}

      {selectedProduct ? (
        <ProductPreviewModal
          product={selectedProduct}
          selectedOptions={selectedOptions}
          onClose={() => setSelectedProduct(null)}
          onOptionChange={(group, value) =>
            setSelectedOptions((current) => ({ ...current, [group]: value }))
          }
          onAddToCart={() => {
            addToCart(selectedProduct, selectedOptions);
            setSelectedProduct(null);
          }}
          wished={wishlistIds.has(selectedProduct.id)}
          onToggleWishlist={() => toggleWishlist(selectedProduct.id)}
        />
      ) : null}

      <CommerceDrawer
        panel={activePanel}
        cartItems={cartItems}
        wishlistProducts={wishlistProducts}
        onClose={() => setActivePanel(null)}
        onPreview={openPreview}
        onAddProduct={(product) => addToCart(product)}
        onRemoveWishlist={(productId) => toggleWishlist(productId)}
        onRemoveCartItem={removeCartItem}
        onQuantityChange={changeCartQuantity}
        onCheckout={handleCheckout}
        isCheckingOut={isCheckingOut}
        checkoutMessage={checkoutMessage}
      />

      <MobileCatalogFilterSheet
        open={mobileFilterOpen}
        activeQuery={debouncedQuery}
        onClose={() => setMobileFilterOpen(false)}
        onClear={clearCatalogFilters}
        onSelect={selectCatalogFilter}
      />

      <MobileStorefrontBar
        isCatalogVisible={isCatalogVisible}
        cartCount={cartCount}
        wishlistCount={wishlistIds.size}
        onCatalogClick={openCatalog}
        onFilterClick={openMobileFilters}
        onWishlistClick={() => {
          setActivePanel("wishlist");
          setAccountOpen(false);
          setMobileFilterOpen(false);
        }}
        onCartClick={() => {
          setActivePanel("cart");
          setAccountOpen(false);
          setMobileFilterOpen(false);
        }}
      />
    </main>
  );
}
