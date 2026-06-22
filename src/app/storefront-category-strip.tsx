"use client";

import { useRef } from "react";
import {
  ArrowRight,
  BookOpen,
  Cards,
  CaretLeft,
  CaretRight,
  Envelope,
  FlagBanner,
  FrameCorners,
  type Icon,
  Notebook,
  Package,
  Receipt,
  Stamp,
  Sticker,
  Tag,
} from "@phosphor-icons/react";

// Tira de categorias ("opción marca de agua", de Claude Design): cada categoria
// es una tarjeta con un icono duotono grande como textura de fondo y el nombre
// nitido al frente. En hover la tarjeta se eleva, el icono crece/intensifica y
// aparece "Ver →". Riel horizontal con flechas (desktop) y swipe (movil). Cada
// tarjeta abre el catalogo filtrado por su categoria (onCategorySelect).

const grotesk = { fontFamily: "var(--font-space-grotesk), sans-serif" };

type Category = {
  name: string;
  desc: string;
  query: string;
  Glyph: Icon;
  color: string;
  tint: string;
};

const categories: Category[] = [
  { name: "Tarjetas", desc: "Mate o brillante", query: "Tarjetas", Glyph: Cards, color: "#3558ff", tint: "#fbfaf7" },
  { name: "Stickers", desc: "Troquelados", query: "Stickers", Glyph: Sticker, color: "#e0941a", tint: "#fdf9f0" },
  { name: "Folletos", desc: "Tríptico o díptico", query: "Afiches", Glyph: BookOpen, color: "#cf6342", tint: "#fcf6f3" },
  { name: "Pendones", desc: "Roll-up y banner", query: "Pendones", Glyph: FlagBanner, color: "#c0392b", tint: "#fcf5f4" },
  { name: "Talonarios", desc: "Numerados", query: "Talonarios", Glyph: Receipt, color: "#51607a", tint: "#f8f9fb" },
  { name: "Etiquetas", desc: "Adhesivas", query: "Etiquetas", Glyph: Tag, color: "#1f8a5b", tint: "#f4faf7" },
  { name: "Invitaciones", desc: "Con sobre", query: "Invitaciones", Glyph: Envelope, color: "#9d5577", tint: "#fbf6f9" },
  { name: "Packaging", desc: "Cajas y bolsas", query: "Packaging", Glyph: Package, color: "#a9743f", tint: "#fbf8f3" },
  { name: "Cuadernos", desc: "Personalizados", query: "Papeleria", Glyph: Notebook, color: "#2e8aa6", tint: "#f4fafc" },
  { name: "Acrílicos", desc: "Corte láser", query: "Gran formato", Glyph: FrameCorners, color: "#2a86c4", tint: "#f4f9fc" },
  { name: "Sellos", desc: "Automáticos", query: "Facturas", Glyph: Stamp, color: "#3a3a42", tint: "#f8f8f9" },
];

type StorefrontCategoryStripProps = {
  onCategorySelect: (query: string) => void;
};

export function StorefrontCategoryStrip({ onCategorySelect }: StorefrontCategoryStripProps) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (amount: number) => {
    railRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section id="catalogo" className="mx-auto w-full max-w-[112rem] scroll-mt-6 px-4 pb-6 sm:px-6 lg:px-8 2xl:px-10">
      <div className="mb-6 flex items-end justify-between gap-6 sm:mb-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#a8841f]">
            Qué imprimimos
          </p>
          <h2 style={grotesk} className="mt-2 text-[1.4rem] font-semibold tracking-[-0.025em] text-[#1b1b20] sm:text-[1.65rem]">
            Explora por categoría
          </h2>
        </div>

        <div className="hidden gap-2.5 pb-1 sm:flex">
          <button
            type="button"
            onClick={() => scrollByAmount(-432)}
            aria-label="Anterior"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#e6e3da] bg-white text-[#3a3a42] transition hover:border-[#3558ff]/40 hover:bg-[#fffdf6] hover:text-[#3558ff]"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(432)}
            aria-label="Siguiente"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#e6e3da] bg-white text-[#3a3a42] transition hover:border-[#3558ff]/40 hover:bg-[#fffdf6] hover:text-[#3558ff]"
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={railRef}
          className="storefront-strip-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-0.5 pb-3.5 pt-2 sm:gap-[22px]"
        >
          {categories.map(({ name, desc, query, Glyph, color, tint }) => (
            <button
              key={name}
              type="button"
              onClick={() => onCategorySelect(query)}
              className="group relative flex h-[8.5rem] w-[9.875rem] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border border-[#eceae2] p-[15px] text-left shadow-[0_6px_18px_rgba(20,20,35,0.05)] transition duration-[260ms] ease-out hover:-translate-y-1.5 hover:border-[#e2ded4] hover:shadow-[0_20px_38px_rgba(25,30,60,0.14)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:h-[9.875rem] sm:w-[12.125rem] sm:p-[18px]"
              style={{ backgroundColor: tint }}
            >
              <Glyph
                aria-hidden="true"
                weight="duotone"
                size={108}
                color={color}
                className="pointer-events-none absolute -bottom-[22px] -right-[18px] opacity-[0.13] transition duration-300 ease-out group-hover:-rotate-3 group-hover:scale-110 group-hover:opacity-90 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100"
              />

              <span
                className="relative flex h-9 w-9 items-center justify-center rounded-[11px] bg-white shadow-[0_2px_6px_rgba(20,20,35,0.07)] sm:h-[38px] sm:w-[38px]"
                style={{ color }}
              >
                <Glyph weight="fill" size={20} />
              </span>

              <span className="relative flex flex-col gap-1">
                <span style={grotesk} className="text-[16.5px] font-semibold leading-[1.1] tracking-[-0.015em] text-[#1b1b20] sm:text-[19px] sm:tracking-[-0.02em]">
                  {name}
                </span>
                <span className="text-[12px] text-[#7e7b73] sm:text-[12.5px]">{desc}</span>
                <span
                  className="mt-[3px] flex translate-x-[-4px] items-center gap-1.5 text-[12.5px] font-semibold opacity-0 transition duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none"
                  style={{ color }}
                >
                  Ver <ArrowRight size={12} weight="bold" />
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#f3f5f8] to-transparent sm:w-[72px]" />
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-[#a7a49b] sm:hidden">
        Desliza para ver más <ArrowRight size={12} weight="bold" />
      </p>
    </section>
  );
}
