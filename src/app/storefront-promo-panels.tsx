"use client";

import { useState } from "react";
import {
  ArrowRight,
  CaretDown,
  Cards,
  FlagBanner,
  type Icon,
  Receipt,
  Sticker,
} from "@phosphor-icons/react";

// Paneles destacados (export "paneles expansibles" de Claude Design): tipo
// triptico que se ensancha al pasar el cursor (desktop) y acordeon nativo en
// movil. Usa las fotos del export, descargadas a /public para no depender de
// Unsplash en produccion. Cada panel abre el detalle (onPreviewProduct);
// "Ver todo el catalogo" abre el catalogo (onViewAll).

const grotesk = { fontFamily: "var(--font-space-grotesk), sans-serif" };

type Panel = {
  productId: string;
  name: string;
  hook: string;
  Glyph: Icon;
  image: string;
};

const panels: Panel[] = [
  {
    productId: "tarjetas-premium",
    name: "Tarjetas premium",
    hook: "Acabado mate o brillante.",
    Glyph: Cards,
    image: "/promo-panel-tarjetas.jpg",
  },
  {
    productId: "stickers-troquelados",
    name: "Stickers y etiquetas",
    hook: "Troquelados para tu marca.",
    Glyph: Sticker,
    image: "/promo-panel-stickers.jpg",
  },
  {
    productId: "pendon-publicitario",
    name: "Pendones y afiches",
    hook: "Gran formato que se ve.",
    Glyph: FlagBanner,
    image: "/promo-panel-pendones.jpg",
  },
  {
    productId: "talonarios-fiscales",
    name: "Talonarios y recibos",
    hook: "Para el día a día del negocio.",
    Glyph: Receipt,
    image: "/promo-panel-talonarios.jpg",
  },
];

const verBtn =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/40 bg-white/15 px-[18px] py-3 text-[14.5px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/30";

type StorefrontPromoPanelsProps = {
  onPreviewProduct: (productId: string) => void;
  onViewAll?: () => void;
};

export function StorefrontPromoPanels({
  onPreviewProduct,
  onViewAll,
}: StorefrontPromoPanelsProps) {
  // El panel "activo" (expandido) es el ultimo que se paso/enfoco; arranca en
  // el primero y NO se revierte al sacar el cursor, para que al seguir
  // deslizando quede el mismo.
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="destacados" className="mx-auto w-full max-w-[112rem] scroll-mt-6 px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8 2xl:px-10">
      <div className="mb-7 flex items-end justify-between gap-6">
        <div>
          <h2 style={grotesk} className="text-[1.5rem] font-semibold tracking-[-0.025em] text-[#1b1b20] sm:text-[1.85rem]">
            Lo más pedido
          </h2>
          <div className="mt-2.5 flex items-center gap-2.5">
            <span className="h-[3px] w-[26px] rounded-full bg-[#fbbf24]" />
            <span className="hidden text-sm text-[#75726a] sm:inline">
              Pasa el cursor sobre un panel para abrirlo.
            </span>
            <span className="text-sm text-[#75726a] sm:hidden">Toca un panel para abrirlo.</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onViewAll?.()}
          className="hidden cursor-pointer items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-[#3558ff] transition hover:gap-2.5 sm:inline-flex"
        >
          Ver todo el catálogo <ArrowRight size={14} weight="bold" />
        </button>
      </div>

      {/* Desktop: paneles que se expanden; el activo es el ultimo hover/foco */}
      <div className="hidden h-[460px] gap-3.5 lg:flex">
        {panels.map(({ productId, name, hook, Glyph, image }, index) => {
          const active = index === activeIndex;
          return (
            <div
              key={productId}
              role="button"
              tabIndex={0}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => onPreviewProduct(productId)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onPreviewProduct(productId);
                }
              }}
              aria-label={name}
              className="pp-panel group cursor-pointer rounded-[18px] bg-[#1b1714] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#3558ff]/55"
              style={{
                flexGrow: active ? 2.8 : 1,
                boxShadow: active
                  ? "0 18px 38px rgba(25,30,60,0.2), inset 0 0 0 1px rgba(255,255,255,0.07)"
                  : "0 6px 18px rgba(20,20,35,0.07), inset 0 0 0 1px rgba(255,255,255,0.07)",
              }}
            >
              <div
                className={`pp-img absolute inset-0 bg-cover bg-center ${active ? "scale-[1.05]" : "scale-100"}`}
                style={{ backgroundImage: `url('${image}')` }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,13,10,0.82)_0%,rgba(15,13,10,0.3)_46%,rgba(15,13,10,0.05)_80%)]" />

              <span className="absolute left-5 top-[18px] flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                <Glyph size={20} weight="bold" />
              </span>

              <div
                className={`pp-label pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center ${active ? "opacity-0" : "opacity-100"}`}
              >
                <span
                  style={{ ...grotesk, writingMode: "vertical-rl" }}
                  className="rotate-180 whitespace-nowrap text-[17px] font-semibold text-white"
                >
                  {name}
                </span>
              </div>

              <div
                className={`pp-exp absolute inset-x-[26px] bottom-[26px] flex flex-col gap-4 ${active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
              >
                <div>
                  <span className="mb-3 block h-[3px] w-[30px] rounded-full bg-[#fbbf24]" />
                  <div style={grotesk} className="whitespace-nowrap text-[27px] font-semibold leading-[1.08] tracking-[-0.02em] text-white">
                    {name}
                  </div>
                  <div className="mt-1.5 whitespace-nowrap text-sm text-white/88">{hook}</div>
                </div>
                <div className="flex">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onPreviewProduct(productId);
                    }}
                    className={verBtn}
                  >
                    Ver producto
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Móvil / tablet: acordeón nativo */}
      <div className="flex flex-col gap-2.5 lg:hidden">
        {panels.map(({ productId, name, hook, Glyph, image }, index) => (
          <details key={productId} className="pp-mp overflow-hidden rounded-2xl shadow-[0_5px_14px_rgba(20,20,35,0.06)]" open={index === 0}>
            <summary className="relative flex h-[150px] cursor-pointer items-end bg-[#1b1714] p-4">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${image}')` }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,13,10,0.82),rgba(15,13,10,0.05)_78%)]" />
              <div className="relative z-[2] flex w-full items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Glyph size={17} weight="bold" className="text-white/90" />
                  <span style={grotesk} className="text-[18px] font-semibold text-white">
                    {name}
                  </span>
                </div>
                <CaretDown size={15} weight="bold" className="pp-caret text-white" />
              </div>
            </summary>
            <div className="bg-[#1b1714] px-4 pb-4">
              <p className="pt-3 text-[12.5px] text-white/80">{hook}</p>
              <div className="mt-3 flex">
                <button type="button" onClick={() => onPreviewProduct(productId)} className={verBtn}>
                  Ver producto
                </button>
              </div>
            </div>
          </details>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onViewAll?.()}
        className="mt-5 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-[#3558ff] sm:hidden"
      >
        Ver todo el catálogo <ArrowRight size={14} weight="bold" />
      </button>
    </section>
  );
}
