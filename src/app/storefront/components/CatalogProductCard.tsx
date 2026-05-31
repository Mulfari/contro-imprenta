"use client";

import Image from "next/image";
import type { StorefrontProduct } from "../../storefront-data";

interface CatalogProductCardProps {
  product: StorefrontProduct;
  wished: boolean;
  onPreview: () => void;
  onToggleWishlist: () => void;
}

export function CatalogProductCard({ product, wished, onPreview, onToggleWishlist }: CatalogProductCardProps) {
  return (
    <article className="catalog-enter-card group relative flex h-full w-full flex-col overflow-hidden rounded-[1.15rem] border border-slate-200 bg-white text-left shadow-[0_10px_28px_rgba(15,23,42,0.035)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_38px_rgba(15,23,42,0.075)]">
      <button
        type="button"
        onClick={onToggleWishlist}
        aria-label={wished ? "Quitar de deseados" : "Agregar a deseados"}
        className={`absolute right-5 top-5 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border shadow-sm backdrop-blur transition ${
          wished ? "border-[#ff5b4d]/20 bg-[#ff5b4d] text-white" : "border-white/70 bg-white/85 text-slate-500 hover:bg-white hover:text-[#ff5b4d]"
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

      <button type="button" onClick={onPreview} className="flex h-full w-full cursor-pointer flex-col text-left">
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
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Producto</p>
            <p className="text-right text-sm font-semibold text-slate-400">
              Desde <span className="text-2xl font-black tracking-tight text-slate-950">{product.price}</span>
            </p>
          </div>
        </div>
      </button>
    </article>
  );
}