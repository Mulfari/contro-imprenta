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

// Tira de categorias ("con foto de fondo", de Claude Design): cada tile lleva
// una foto del producto con scrim oscuro + glow del color de la categoria, un
// chip con icono duotono y el nombre siempre legible. Hover: el tile se eleva,
// la foto hace zoom, el chip sube y aparece el acento amarillo + flecha. Mismo
// lenguaje que los paneles. Fotos del export descargadas a /public (cat-*.jpg).

const grotesk = { fontFamily: "var(--font-space-grotesk), sans-serif" };

type Category = {
  name: string;
  desc: string;
  query: string;
  Glyph: Icon;
  color: string;
  img: string;
};

const categories: Category[] = [
  { name: "Tarjetas", desc: "Mate o brillante", query: "Tarjetas", Glyph: Cards, color: "#3558ff", img: "/cat-tarjetas.jpg" },
  { name: "Stickers", desc: "Troquelados", query: "Stickers", Glyph: Sticker, color: "#e0941a", img: "/cat-stickers.jpg" },
  { name: "Folletos", desc: "Tríptico o díptico", query: "Afiches", Glyph: BookOpen, color: "#cf6342", img: "/cat-folletos.jpg" },
  { name: "Pendones", desc: "Roll-up y banner", query: "Pendones", Glyph: FlagBanner, color: "#c0392b", img: "/cat-pendones.jpg" },
  { name: "Talonarios", desc: "Numerados", query: "Talonarios", Glyph: Receipt, color: "#6b7a99", img: "/cat-talonarios.jpg" },
  { name: "Etiquetas", desc: "Adhesivas", query: "Etiquetas", Glyph: Tag, color: "#1f8a5b", img: "/cat-etiquetas.jpg" },
  { name: "Invitaciones", desc: "Con sobre", query: "Invitaciones", Glyph: Envelope, color: "#9d5577", img: "/cat-invitaciones.jpg" },
  { name: "Packaging", desc: "Cajas y bolsas", query: "Packaging", Glyph: Package, color: "#a9743f", img: "/cat-packaging.jpg" },
  { name: "Cuadernos", desc: "Personalizados", query: "Papeleria", Glyph: Notebook, color: "#2e8aa6", img: "/cat-cuadernos.jpg" },
  { name: "Acrílicos", desc: "Corte láser", query: "Gran formato", Glyph: FrameCorners, color: "#2a86c4", img: "/cat-acrilicos.jpg" },
  { name: "Sellos", desc: "Automáticos", query: "Facturas", Glyph: Stamp, color: "#8a857a", img: "/cat-sellos.jpg" },
];

type StorefrontCategoryStripProps = {
  onCategorySelect: (query: string) => void;
  onViewAll?: () => void;
};

export function StorefrontCategoryStrip({ onCategorySelect, onViewAll }: StorefrontCategoryStripProps) {
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
            onClick={() => scrollByAmount(-376)}
            aria-label="Anterior"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#e6e3da] bg-white text-[#3a3a42] transition hover:border-[#3558ff]/40 hover:bg-[#fffdf6] hover:text-[#3558ff]"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(376)}
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
          className="storefront-strip-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-0.5 pb-4 pt-2 sm:gap-[18px]"
        >
          {categories.map(({ name, desc, query, Glyph, color, img }) => (
            <button
              key={name}
              type="button"
              onClick={() => onCategorySelect(query)}
              className="group relative h-[166px] w-[132px] shrink-0 snap-start overflow-hidden rounded-2xl bg-[#211c16] text-left shadow-[0_6px_18px_rgba(20,20,35,0.07),inset_0_0_0_1px_rgba(255,255,255,0.06)] transition duration-[280ms] ease-out hover:-translate-y-[7px] hover:shadow-[0_20px_38px_rgba(25,30,60,0.2),inset_0_0_0_1px_rgba(255,255,255,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:h-[208px] sm:w-[170px]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[600ms] ease-out group-hover:scale-[1.06] motion-reduce:group-hover:scale-100"
                style={{ backgroundImage: `url('${img}')` }}
              />
              <div
                className="absolute inset-0"
                style={{ background: `radial-gradient(120% 90% at 28% 16%, ${color}52, transparent 60%)` }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,11,8,0.82)_0%,rgba(13,11,8,0.32)_52%,rgba(13,11,8,0.08)_100%)]" />

              <span className="absolute left-3.5 top-3.5 flex h-[42px] w-[42px] items-center justify-center rounded-full border border-white/20 bg-white/20 text-white backdrop-blur-sm transition duration-[280ms] ease-out group-hover:-translate-y-[3px] group-hover:scale-[1.06] motion-reduce:group-hover:transform-none sm:left-[18px] sm:top-[18px] sm:h-[50px] sm:w-[50px]">
                <Glyph weight="duotone" size={24} />
              </span>

              <div className="absolute inset-x-3.5 bottom-3.5 flex flex-col gap-1.5 sm:inset-x-[18px] sm:bottom-[18px]">
                <span className="hidden h-[3px] w-0 rounded-full bg-[#fbbf24] transition-[width] duration-300 ease-out group-hover:w-8 sm:block" />
                <span
                  style={grotesk}
                  className="text-[15px] font-semibold leading-[1.1] tracking-[-0.01em] text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.4)] sm:text-[18px]"
                >
                  {name}
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11.5px] text-white/75 [text-shadow:0_1px_6px_rgba(0,0,0,0.4)] sm:text-[12.5px]">
                    {desc}
                  </span>
                  <ArrowRight
                    size={14}
                    weight="bold"
                    className="hidden -translate-x-1 text-[#fbbf24] opacity-0 transition duration-[260ms] ease-out group-hover:translate-x-0 group-hover:opacity-100 sm:block"
                  />
                </div>
              </div>
            </button>
          ))}

          {/* Ver todo (solo desktop) */}
          <button
            type="button"
            onClick={() => onViewAll?.()}
            className="group hidden h-[208px] w-[170px] shrink-0 snap-start flex-col items-center justify-center gap-3.5 rounded-2xl border-[1.5px] border-dashed border-[#d3cdbf] text-center transition hover:border-[#3558ff]/45 hover:bg-[#fffdf6] sm:flex"
          >
            <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#f1ede4] text-[#8a857a] transition group-hover:bg-[#3558ff]/10 group-hover:text-[#3558ff]">
              <ArrowRight size={24} weight="bold" />
            </span>
            <div>
              <div style={grotesk} className="text-[16px] font-semibold text-[#1b1b20]">
                Ver todo
              </div>
              <div className="mt-0.5 text-[12.5px] text-[#9a968c]">Catálogo completo</div>
            </div>
          </button>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#f3f5f8] to-transparent sm:w-[72px]" />
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-[#a7a49b] sm:hidden">
        Desliza para ver más <ArrowRight size={12} weight="bold" />
      </p>
    </section>
  );
}
