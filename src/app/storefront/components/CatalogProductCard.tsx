"use client";

import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react";

import type { StorefrontProduct } from "../../storefront-data";

const grotesk = { fontFamily: "var(--font-space-grotesk), sans-serif" };

interface CatalogProductCardProps {
  product: StorefrontProduct;
  view?: "grid" | "list";
  onPreview: () => void;
}

// Tarjeta de catalogo (export "Catálogo definitivo"): specs como etiquetas,
// precio discreto, "Ver producto" (toda la tarjeta es clicable), estado
// "Agotado". Vista cuadricula o lista.
export function CatalogProductCard({ product, view = "grid", onPreview }: CatalogProductCardProps) {
  const agotado = product.stock !== null && product.stock <= 0;
  const priceLabel = product.requiresQuote ? "A cotización" : `Desde ${product.price}`;
  const tags = product.highlights.slice(0, view === "list" ? 2 : 3);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPreview();
    }
  };

  const verBtn = agotado
    ? "inline-flex items-center gap-2 rounded-[10px] border border-[#ece8df] bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-[#a7a49b]"
    : "inline-flex items-center gap-2 rounded-[10px] border border-[#e0dbcf] bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-[#1b1b20] transition group-hover:border-[#3558ff] group-hover:bg-[#fbfcff] group-hover:text-[#3558ff]";

  const eyebrow = (
    <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#a8841f]">
      {product.category}
    </span>
  );
  const agotadoBadge = (
    <span className="inline-flex items-center rounded-full bg-[#1b1b20]/85 px-2.5 py-1 text-[11.5px] font-semibold text-white">
      Agotado
    </span>
  );
  const tagChips = tags.map((tag) => (
    <span key={tag} className="rounded-md bg-[#f4f1ea] px-2 py-[3px] text-[11.5px] font-medium text-[#5d5a52]">
      {tag}
    </span>
  ));
  const priceBlock = (
    <div>
      <div className="text-[10.5px] text-[#a7a49b]">Precio</div>
      <div className="text-[14.5px] font-semibold text-[#1b1b20]">{priceLabel}</div>
    </div>
  );

  if (view === "list") {
    return (
      <article
        role="button"
        tabIndex={0}
        onClick={onPreview}
        onKeyDown={handleKeyDown}
        className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-[#ececec] bg-white p-3.5 shadow-[0_1px_2px_rgba(20,20,35,0.04)] transition duration-200 hover:-translate-y-[3px] hover:border-[#e4dfd2] hover:shadow-[0_18px_34px_rgba(25,30,60,0.12)]"
      >
        <div className={`relative flex h-[84px] w-[104px] flex-none items-center justify-center overflow-hidden rounded-[11px] bg-gradient-to-br ${product.tint}`}>
          <Image
            src={product.image}
            alt={product.imageAlt}
            width={400}
            height={320}
            sizes="120px"
            className={`h-auto max-h-[82%] w-auto max-w-[84%] object-contain transition duration-500 group-hover:scale-105 ${agotado ? "opacity-70 grayscale" : ""}`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            {eyebrow}
            {agotado ? agotadoBadge : null}
          </div>
          <h3 style={grotesk} className="mt-1 truncate text-[17px] font-semibold tracking-[-0.015em] text-[#1b1b20]">
            {product.title}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">{tagChips}</div>
        </div>
        <div className="hidden flex-none text-right sm:block">{priceBlock}</div>
        <span className={`${verBtn} hidden flex-none sm:inline-flex`}>
          Ver producto
          {!agotado ? <ArrowRight size={13} weight="bold" className="transition group-hover:translate-x-0.5" /> : null}
        </span>
      </article>
    );
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onPreview}
      onKeyDown={handleKeyDown}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white shadow-[0_1px_2px_rgba(20,20,35,0.04)] transition duration-200 hover:-translate-y-[5px] hover:border-[#e4dfd2] hover:shadow-[0_18px_34px_rgba(25,30,60,0.12)]"
    >
      <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br ${product.tint} p-4`}>
        <Image
          src={product.image}
          alt={product.imageAlt}
          width={1000}
          height={760}
          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 40vw, 88vw"
          className={`h-auto max-h-[86%] w-auto max-w-[84%] object-contain drop-shadow-[0_18px_28px_rgba(15,23,42,0.16)] transition duration-500 group-hover:scale-105 ${agotado ? "opacity-70 grayscale" : ""}`}
        />
        {agotado ? <div className="absolute left-3 top-3">{agotadoBadge}</div> : null}
      </div>
      <div className="flex flex-1 flex-col px-4 pb-[17px] pt-4">
        {eyebrow}
        <h3 style={grotesk} className="mt-1.5 text-[17px] font-semibold leading-tight tracking-[-0.015em] text-[#1b1b20]">
          {product.title}
        </h3>
        <div className="mt-2.5 flex flex-wrap gap-1.5">{tagChips}</div>
        <div className="mt-4 flex items-end justify-between gap-3 pt-1">
          {priceBlock}
          <span className={verBtn}>
            Ver producto
            {!agotado ? <ArrowRight size={13} weight="bold" className="transition group-hover:translate-x-0.5" /> : null}
          </span>
        </div>
      </div>
    </article>
  );
}
