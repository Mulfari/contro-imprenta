"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { CustomerAccountClient } from "@/app/mi-cuenta/account-client";
import {
  cartStorageKey,
  catalogQueryStorageKey,
  deleteCartArtFiles,
  getCartKey,
  getDefaultOptions,
  getProductById,
  parsePrice,
  restoreStoredCart,
  restoreStoredWishlist,
  saveCartArtFiles,
  serializeCartItems,
  wishlistStorageKey,
  type CartItem,
  type StoredCartItem,
} from "@/app/storefront-cart";
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

type CommercePanel = "wishlist" | "cart" | null;

type ToastMessage = {
  id: number;
  message: string;
  tone: "info" | "success" | "error";
};

type AccountActivity = {
  activeCount: number;
  needsAttention: boolean;
};

type AccountActivityOrder = {
  status: string;
  payment_review_status: string;
  files?: Array<{
    attachment_type: string;
  }>;
};

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
}: {
  product: StorefrontProduct;
  wished: boolean;
  onPreview: () => void;
  onToggleWishlist: () => void;
}) {
  return (
    <article className="catalog-enter-card group relative flex h-full w-full flex-col overflow-hidden rounded-[1.15rem] border border-slate-200 bg-white text-left shadow-[0_10px_28px_rgba(15,23,42,0.035)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_38px_rgba(15,23,42,0.075)]">
      <button
        type="button"
        onClick={onToggleWishlist}
        aria-label={wished ? "Quitar de deseados" : "Agregar a deseados"}
        className={`absolute right-5 top-5 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border shadow-sm backdrop-blur transition ${
          wished
            ? "border-[#ff5b4d]/20 bg-[#ff5b4d] text-white"
            : "border-white/70 bg-white/85 text-slate-500 hover:bg-white hover:text-[#ff5b4d]"
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill={wished ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 20-1.2-1.1C5.8 14.4 3 11.8 3 8.5A4.5 4.5 0 0 1 7.5 4C9.3 4 11 4.9 12 6.3 13 4.9 14.7 4 16.5 4A4.5 4.5 0 0 1 21 8.5c0 3.3-2.8 5.9-7.8 10.4L12 20Z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onPreview}
        className="flex h-full w-full cursor-pointer flex-col text-left"
      >
        <div className={`relative mx-3 mt-3 flex h-40 items-center justify-center overflow-hidden rounded-[0.95rem] bg-gradient-to-br ${product.tint} p-4 sm:h-44`}>
          <div className="absolute inset-x-8 bottom-5 h-8 rounded-full bg-slate-900/10 blur-2xl" />
          <Image
            src={product.image}
            alt={product.imageAlt}
            width={1000}
            height={760}
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 34vw, 88vw"
            className="relative z-10 h-auto max-h-[86%] w-auto max-w-[84%] object-contain drop-shadow-[0_18px_28px_rgba(15,23,42,0.16)] transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.025]"
          />
        </div>

        <div className="flex min-h-[9.6rem] flex-1 flex-col px-4 pb-4 pt-4">
          <h3 className="text-base font-black leading-tight tracking-tight text-slate-950 transition group-hover:text-[#3558ff] sm:text-lg">
            {product.title}
          </h3>
          <p
            className="mt-2 text-sm leading-5 text-slate-500"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </p>
          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Producto
            </p>
            <p className="text-right text-sm font-semibold text-slate-400">
              Desde <span className="text-2xl font-black tracking-tight text-slate-950">{product.price}</span>
            </p>
          </div>
        </div>
      </button>
    </article>
  );
}

function CatalogProductSkeleton() {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.035)]">
      <div className="mx-3 mt-3 flex h-40 items-center justify-center overflow-hidden rounded-[0.95rem] bg-slate-100 p-4 sm:h-44">
        <div className="h-24 w-32 animate-pulse rounded-[1.2rem] bg-slate-200 sm:h-28 sm:w-36" />
      </div>
      <div className="flex min-h-[9.6rem] flex-1 flex-col px-4 pb-4 pt-4">
        <div>
          <div className="h-5 w-40 max-w-full animate-pulse rounded-full bg-slate-200" />
          <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="h-3 w-16 animate-pulse rounded-full bg-slate-200" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200" />
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

function formatCatalogFileSize(value: number) {
  if (value < 1024 * 1024) {
    return `${Math.max(1, Math.round(value / 1024))} KB`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function CatalogArtPreview({ file }: { file: File }) {
  const isImage = file.type.startsWith("image/");
  const previewUrl = useMemo(
    () => (isImage ? URL.createObjectURL(file) : null),
    [file, isImage],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (previewUrl) {
    return (
      <div
        className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 bg-white bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${previewUrl})` }}
        aria-label={`Miniatura de ${file.name}`}
      />
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-500">
      {file.name.split(".").pop()?.slice(0, 4).toUpperCase() || "FILE"}
    </div>
  );
}

function CardMockup({
  design,
  finish,
}: {
  design: "minimal" | "bold" | "elegant";
  finish: string;
}) {
  const finishOverlay =
    finish === "Brillante"
      ? "after:absolute after:inset-0 after:rounded-[0.6rem] after:bg-gradient-to-br after:from-white/40 after:via-transparent after:to-white/10 after:pointer-events-none"
      : finish === "Soft touch"
        ? "after:absolute after:inset-0 after:rounded-[0.6rem] after:bg-[url('data:image/svg+xml,%3Csvg%20width%3D%224%22%20height%3D%224%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%224%22%20height%3D%224%22%20fill%3D%22%23000%22%20opacity%3D%220.03%22/%3E%3C/svg%3E')] after:pointer-events-none"
        : "";

  if (design === "minimal") {
    return (
      <div className={`relative aspect-[1.75/1] w-full overflow-hidden rounded-[0.6rem] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] ${finishOverlay}`}>
        <div className="flex h-full flex-col justify-between p-5">
          <div>
            <div className="h-1 w-8 rounded-full bg-slate-900" />
            <p className="mt-3 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-slate-900">
              Maria Rodriguez
            </p>
            <p className="mt-0.5 text-[0.5rem] tracking-[0.15em] text-slate-400">
              Directora Creativa
            </p>
          </div>
          <div className="flex items-end justify-between">
            <div className="space-y-0.5">
              <p className="text-[0.45rem] text-slate-400">+58 412 555 0123</p>
              <p className="text-[0.45rem] text-slate-400">maria@estudio.com</p>
            </div>
            <p className="text-[0.55rem] font-semibold tracking-[0.1em] text-slate-300">ESTUDIO</p>
          </div>
        </div>
      </div>
    );
  }

  if (design === "bold") {
    return (
      <div className={`relative aspect-[1.75/1] w-full overflow-hidden rounded-[0.6rem] bg-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.2)] ${finishOverlay}`}>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-amber-500/20 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-5">
          <div>
            <p className="text-[0.75rem] font-black uppercase tracking-[0.2em] text-white">
              Carlos Mendez
            </p>
            <p className="mt-0.5 text-[0.5rem] font-medium tracking-[0.15em] text-amber-400">
              CEO & Fundador
            </p>
          </div>
          <div className="flex items-end justify-between">
            <div className="space-y-0.5">
              <p className="text-[0.45rem] text-slate-400">+58 414 888 7654</p>
              <p className="text-[0.45rem] text-slate-400">carlos@nexus.io</p>
            </div>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
              <span className="text-[0.4rem] font-black text-slate-900">N</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative aspect-[1.75/1] w-full overflow-hidden rounded-[0.6rem] bg-gradient-to-br from-stone-50 to-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.1)] ${finishOverlay}`}>
      <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-rose-400 to-amber-400" />
      <div className="flex h-full flex-col justify-between p-5 pl-6">
        <div>
          <p className="text-[0.6rem] font-light italic tracking-[0.08em] text-stone-400">
            Abogados & Asociados
          </p>
          <p className="mt-2 text-[0.7rem] font-semibold text-stone-800">
            Ana Lucia Fernandez
          </p>
          <p className="mt-0.5 text-[0.45rem] tracking-[0.12em] text-stone-400">
            Socia Principal
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[0.45rem] text-stone-400">Av. Libertador, Torre Capital, Piso 12</p>
          <p className="text-[0.45rem] text-stone-400">+58 212 555 9876 · ana@fernandez.legal</p>
        </div>
      </div>
    </div>
  );
}

function CatalogProductDetail({
  product,
  selectedOptions,
  onBack,
  onOptionChange,
  onAddToCart,
  wished,
  onToggleWishlist,
}: {
  product: StorefrontProduct;
  selectedOptions: Record<string, string>;
  onBack: () => void;
  onOptionChange: (group: string, value: string) => void;
  onAddToCart: (quantity: number, files: File[]) => void;
  wished: boolean;
  onToggleWishlist: () => void;
}) {
  const [draftQuantity, setDraftQuantity] = useState(1);
  const [draftFiles, setDraftFiles] = useState<File[]>([]);
  const [activeDesign, setActiveDesign] = useState<"minimal" | "bold" | "elegant">("minimal");

  const hasFiles = draftFiles.length > 0;
  const unitPrice = parsePrice(product.price);
  const estimatedTotal = unitPrice * draftQuantity;
  const currentFinish = selectedOptions["Acabado"] ?? "";
  const isCardProduct = product.id === "tarjetas-premium" || product.id === "tarjetas-corporativas";

  const quantityOption = product.options.find(
    (g) => g.name === "Cantidad",
  );
  const otherOptions = product.options.filter(
    (g) => g.name !== "Cantidad",
  );

  return (
    <article className="mt-5">
      <div className="relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.07)]">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative border-b border-slate-100 lg:border-b-0 lg:border-r">
            <button
              type="button"
              onClick={onBack}
              className="absolute left-4 top-4 z-20 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-2 text-xs font-black text-slate-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-950"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Catalogo
            </button>

            <button
              type="button"
              onClick={onToggleWishlist}
              aria-label={wished ? "Quitar de deseados" : "Agregar a deseados"}
              className={`absolute right-4 top-4 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border shadow-sm backdrop-blur transition ${
                wished
                  ? "border-[#ff5b4d]/20 bg-[#ff5b4d] text-white"
                  : "border-slate-200/80 bg-white/90 text-slate-500 hover:bg-white hover:text-[#ff5b4d]"
              }`}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem]" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 20-1.2-1.1C5.8 14.4 3 11.8 3 8.5A4.5 4.5 0 0 1 7.5 4C9.3 4 11 4.9 12 6.3 13 4.9 14.7 4 16.5 4A4.5 4.5 0 0 1 21 8.5c0 3.3-2.8 5.9-7.8 10.4L12 20Z" />
              </svg>
            </button>

            {isCardProduct ? (
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 px-6 pb-6 pt-16 sm:px-10 sm:pt-18">
                <div className="w-full max-w-[22rem]">
                  <CardMockup design={activeDesign} finish={currentFinish} />
                </div>

                <div className="mt-6 flex items-center gap-3">
                  {(["minimal", "bold", "elegant"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setActiveDesign(d)}
                      className={`group cursor-pointer overflow-hidden rounded-[0.5rem] border-2 transition ${
                        activeDesign === d
                          ? "border-[#3558ff] shadow-[0_0_0_2px_rgba(53,88,255,0.15)]"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="w-24 sm:w-28">
                        <CardMockup design={d} finish={currentFinish} />
                      </div>
                    </button>
                  ))}
                </div>

                <p className="mt-3 text-center text-xs font-medium text-slate-400">
                  {activeDesign === "minimal" ? "Estilo minimalista" : activeDesign === "bold" ? "Estilo corporativo" : "Estilo elegante"}
                  {currentFinish ? ` · Acabado ${currentFinish.toLowerCase()}` : ""}
                </p>
              </div>
            ) : (
              <div className={`relative flex min-h-[16rem] items-center justify-center overflow-hidden bg-gradient-to-br ${product.tint} p-8 pt-16 sm:min-h-[22rem] lg:min-h-[26rem]`}>
                <div className="absolute inset-x-12 bottom-10 h-12 rounded-full bg-slate-900/10 blur-2xl" />
                <Image
                  src={product.image}
                  alt={product.imageAlt}
                  width={1200}
                  height={900}
                  sizes="(min-width: 1024px) 60vw, 92vw"
                  className="relative z-10 h-auto max-h-[80%] w-auto max-w-[70%] object-contain drop-shadow-[0_28px_48px_rgba(15,23,42,0.2)] sm:max-w-[60%]"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#3558ff]/8 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#3558ff]">
                {product.category}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                {product.turnaround}
              </span>
            </div>

            <h2 className="mt-3 text-[1.65rem] font-black leading-[1.15] tracking-tight text-slate-950 sm:text-[1.9rem]">
              {product.title}
            </h2>

            <p className="mt-2 text-[0.9rem] leading-7 text-slate-500">
              {product.description}
            </p>

            <ul className="mt-4 space-y-1.5">
              {product.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-5">
              {otherOptions.map((group) => (
                <div key={group.name}>
                  <p className="text-[0.82rem] font-black uppercase tracking-[0.12em] text-slate-950">{group.name}</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {group.values.map((value) => {
                      const selected = selectedOptions[group.name] === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => onOptionChange(group.name, value)}
                          className={`cursor-pointer rounded-[0.85rem] border-2 px-4 py-2.5 text-sm font-semibold transition ${
                            selected
                              ? "border-[#3558ff] bg-[#3558ff]/5 text-[#3558ff] shadow-[0_0_0_1px_rgba(53,88,255,0.15)]"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
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

            {quantityOption ? (
              <div className="mt-6">
                <p className="text-[0.82rem] font-black uppercase tracking-[0.12em] text-slate-950">Cantidad</p>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  {quantityOption.values.map((value) => {
                    const selected = selectedOptions["Cantidad"] === value;
                    const num = parseInt(value) || 0;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          onOptionChange("Cantidad", value);
                          if (num > 0) setDraftQuantity(num);
                        }}
                        className={`cursor-pointer rounded-[0.85rem] border-2 px-3 py-3 text-center transition ${
                          selected
                            ? "border-[#3558ff] bg-[#3558ff]/5 text-[#3558ff] shadow-[0_0_0_1px_rgba(53,88,255,0.15)]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span className="block text-lg font-black">{num || value}</span>
                        {num > 0 && <span className="block text-[0.7rem] font-medium text-slate-400">unidades</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-6 flex items-center gap-3">
                <p className="text-sm font-black text-slate-700">Cantidad</p>
                <div className="flex h-12 items-center overflow-hidden rounded-[0.85rem] border-2 border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setDraftQuantity((c) => Math.max(1, c - 1))}
                    className="flex h-full w-12 cursor-pointer items-center justify-center text-lg font-black text-slate-400 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    {"−"}
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={draftQuantity}
                    onChange={(e) => setDraftQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="h-full w-14 bg-transparent text-center text-[0.95rem] font-black text-slate-950 outline-none"
                    aria-label="Cantidad del producto"
                  />
                  <button
                    type="button"
                    onClick={() => setDraftQuantity((c) => c + 1)}
                    className="flex h-full w-12 cursor-pointer items-center justify-center text-lg font-black text-slate-400 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6">
              {hasFiles ? (
                <div className="space-y-2">
                  <p className="text-sm font-black text-slate-700">Arte cargado</p>
                  {draftFiles.map((file) => (
                    <div
                      key={`${file.name}-${file.lastModified}`}
                      className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5"
                    >
                      <CatalogArtPreview file={file} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-950">{file.name}</p>
                        <p className="text-xs text-slate-400">{formatCatalogFileSize(file.size)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <label className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-xs font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                      Cambiar
                      <input type="file" multiple className="sr-only" onChange={(e) => { setDraftFiles(Array.from(e.target.files ?? [])); e.currentTarget.value = ""; }} />
                    </label>
                    <button type="button" onClick={() => setDraftFiles([])} className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-400 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700">
                      Quitar
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center gap-3 rounded-[0.85rem] border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-3.5 transition hover:border-slate-300 hover:bg-white">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-600">Subir arte</p>
                    <p className="text-xs text-slate-400">Opcional — puedes enviarlo despues</p>
                  </div>
                  <input type="file" multiple className="sr-only" onChange={(e) => { setDraftFiles(Array.from(e.target.files ?? [])); e.currentTarget.value = ""; }} />
                </label>
              )}
            </div>

            <div className="mt-auto pt-6">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <p className="text-[2.2rem] font-black leading-none tracking-tight text-slate-950">
                    ${estimatedTotal}
                  </p>
                  {draftQuantity > 1 && (
                    <p className="text-sm font-semibold text-slate-400">
                      {product.price}/und
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onAddToCart(draftQuantity, draftFiles)}
                className="mt-4 w-full cursor-pointer rounded-2xl bg-[#ffd45f] px-6 py-[1.15rem] text-[0.95rem] font-black text-slate-950 shadow-[0_14px_32px_rgba(255,212,95,0.4)] transition hover:bg-[#ffcd41] hover:shadow-[0_18px_40px_rgba(255,212,95,0.5)] active:scale-[0.98]"
              >
                Anadir al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
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
              className="mt-4 w-full cursor-pointer rounded-xl bg-[#ffd45f] px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-[#ffcd41]"
            >
              Preparar pedido
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-slate-400">
              Revisaras arte, pago movil y total antes de enviar la solicitud.
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

export function StorefrontShell() {
  const router = useRouter();
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
  const [accountActivity, setAccountActivity] = useState<AccountActivity | null>(null);
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
  const toastIdRef = useRef(0);

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
    if (!customerSession) {
      setAccountActivity(null);
      return;
    }

    let isMounted = true;

    async function loadAccountActivity() {
      try {
        const response = await fetch("/api/storefront/account", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar la actividad de cuenta.");
        }

        const payload = (await response.json()) as {
          orders?: AccountActivityOrder[];
        };
        const activeOrders = (payload.orders ?? []).filter(
          (order) => order.status !== "entregado" && order.status !== "rechazado",
        );
        const needsAttention = activeOrders.some((order) => {
          const hasArt = order.files?.some(
            (file) => file.attachment_type === "arte_cliente",
          );

          return (
            !hasArt ||
            order.payment_review_status === "sin_pago" ||
            order.payment_review_status === "rechazado"
          );
        });

        if (isMounted) {
          setAccountActivity({
            activeCount: activeOrders.length,
            needsAttention,
          });
        }
      } catch {
        if (isMounted) {
          setAccountActivity(null);
        }
      }
    }

    void loadAccountActivity();

    return () => {
      isMounted = false;
    };
  }, [customerSession]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setWishlistIds(restoreStoredWishlist(window.localStorage.getItem(wishlistStorageKey)));
      setCartItems(restoreStoredCart(window.localStorage.getItem(cartStorageKey)));
      setStorageReady(true);
    }, 0);

    return () => window.clearTimeout(timeout);
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

    const storedItems: StoredCartItem[] = serializeCartItems(cartItems);

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
    toastIdRef.current += 1;

    setToast({
      id: toastIdRef.current,
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
    setSelectedProduct(null);
    setMobileFilterOpen(false);
    window.history.pushState(null, "", "#catalogo");
    window.setTimeout(() => {
      document.getElementById("catalogo")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const goToHome = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setCatalogOpen(false);
    setCatalogLoading(false);
    setAccountOpen(false);
    setActivePanel(null);
    setSelectedProduct(null);
    setMobileFilterOpen(false);
    window.history.pushState(null, "", "/");
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  const openCatalogWithQuery = (query: string) => {
    setSearchQuery(query);
    setDebouncedQuery(query);
    setCatalogOpen(true);
    setCatalogLoading(true);
    setAccountOpen(false);
    setActivePanel(null);
    setSelectedProduct(null);
    setMobileFilterOpen(false);
    window.history.pushState(null, "", "#catalogo");
    window.setTimeout(() => {
      document.getElementById("catalogo")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (window.location.hash !== "#catalogo") {
        return;
      }

      const storedQuery = window.sessionStorage.getItem(catalogQueryStorageKey) ?? "";
      window.sessionStorage.removeItem(catalogQueryStorageKey);

      if (storedQuery.trim()) {
        openCatalogWithQuery(storedQuery.trim());
        return;
      }

      openCatalog();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const closeCatalogForHomeSection = () => {
    setCatalogOpen(false);
    setActivePanel(null);
    setSelectedProduct(null);
    setMobileFilterOpen(false);
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    setSelectedProduct(null);

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

    if (isCatalogVisible) {
      window.setTimeout(() => {
        document.getElementById("catalogo")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 0);
    }
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

  const addToCart = async (
    product: StorefrontProduct,
    options = getDefaultOptions(product),
    quantity = 1,
    artFiles: File[] = [],
  ) => {
    const key = getCartKey(product, options);
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    const artFileNames = artFiles.map((file) => file.name);

    if (artFiles.length > 0) {
      try {
        await saveCartArtFiles(key, artFiles);
      } catch {
        showToast("No se pudo preparar el arte en este navegador.", "error");
      }
    }

    setCartItems((current) => {
      const existing = current.find((item) => item.key === key);

      if (existing) {
        return current.map((item) =>
          item.key === key
            ? {
                ...item,
                quantity: item.quantity + safeQuantity,
                artFileNames: artFileNames.length > 0 ? artFileNames : item.artFileNames,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          key,
          product,
          quantity: safeQuantity,
          options,
          artFileNames,
        },
      ];
    });
    setActivePanel("cart");
    setMobileFilterOpen(false);
    showToast(
      artFiles.length > 0
        ? `${product.title} agregado con arte preparado.`
        : `${product.title} agregado al carrito.`,
      "success",
    );
  };

  const addProductById = (productId: string) => {
    const product = getProductById(productId);

    if (!product) {
      showToast("No se encontro ese producto.", "error");
      return;
    }

    void addToCart(product);
  };

  const removeCartItem = (key: string) => {
    setCartItems((current) => current.filter((item) => item.key !== key));
    void deleteCartArtFiles(key);
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

    setActivePanel(null);
    router.push("/checkout");
  };

  const clearCatalogFilters = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setCatalogOpen(true);
    setCatalogLoading(true);
    setSelectedProduct(null);
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
    setSelectedProduct(null);
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
    setSelectedProduct(null);
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
        accountActivity={accountActivity ?? undefined}
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
        onHomeClick={goToHome}
        onSectionNavigate={() => closeCatalogForHomeSection()}
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
                    setSelectedProduct(null);
                  }}
                  className={`mt-5 w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    debouncedQuery
                      ? "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      : "bg-slate-950 text-white hover:bg-slate-800"
                  }`}
                >
                  Catalogo completo
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
                              setSelectedProduct(null);
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

                {selectedProduct ? (
                  <CatalogProductDetail
                    key={selectedProduct.id}
                    product={selectedProduct}
                    selectedOptions={selectedOptions}
                    onBack={() => setSelectedProduct(null)}
                    onOptionChange={(group, value) =>
                      setSelectedOptions((current) => ({ ...current, [group]: value }))
                    }
                    onAddToCart={(quantity, files) => {
                      void addToCart(selectedProduct, selectedOptions, quantity, files);
                      setSelectedProduct(null);
                    }}
                    wished={wishlistIds.has(selectedProduct.id)}
                    onToggleWishlist={() => toggleWishlist(selectedProduct.id)}
                  />
                ) : showCatalogSkeleton ? (
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

      {selectedProduct && !isCatalogVisible ? (
        <ProductPreviewModal
          product={selectedProduct}
          selectedOptions={selectedOptions}
          onClose={() => setSelectedProduct(null)}
          onOptionChange={(group, value) =>
            setSelectedOptions((current) => ({ ...current, [group]: value }))
          }
          onAddToCart={() => {
            void addToCart(selectedProduct, selectedOptions);
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
        onAddProduct={(product) => void addToCart(product)}
        onRemoveWishlist={(productId) => toggleWishlist(productId)}
        onRemoveCartItem={removeCartItem}
        onQuantityChange={changeCartQuantity}
        onCheckout={handleCheckout}
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
