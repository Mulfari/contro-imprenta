"use client";

import {
  ArrowRight,
  CaretDown,
  Cards,
  FlagBanner,
  type Icon,
  Plus,
  Receipt,
  Sticker,
} from "@phosphor-icons/react";

// Paneles destacados (export "paneles expansibles" de Claude Design): tipo
// triptico que se ensancha al pasar el cursor (desktop) y acordeon nativo en
// movil. Foto de referencia del export reemplazada por el producto real sobre
// un gradiente de marca (cuando Javier de fotos ambientales se cambian a cover).
// Cada panel abre el detalle (onPreviewProduct) o anade al carrito
// (onAddProduct); "Ver todo el catalogo" abre el catalogo (onViewAll).

const grotesk = { fontFamily: "var(--font-space-grotesk), sans-serif" };

type Panel = {
  productId: string;
  name: string;
  hook: string;
  Glyph: Icon;
  image: string;
  gradient: string;
};

const panels: Panel[] = [
  {
    productId: "tarjetas-premium",
    name: "Tarjetas premium",
    hook: "Acabado mate o brillante.",
    Glyph: Cards,
    image: "/storefront-promo-cards-premium.webp",
    gradient: "linear-gradient(135deg, #243154 0%, #0f1830 100%)",
  },
  {
    productId: "stickers-troquelados",
    name: "Stickers y etiquetas",
    hook: "Troquelados para tu marca.",
    Glyph: Sticker,
    image: "/storefront-promo-stickers-labels-trimmed.webp",
    gradient: "linear-gradient(135deg, #7a4a12 0%, #3a2206 100%)",
  },
  {
    productId: "pendon-publicitario",
    name: "Pendones y afiches",
    hook: "Gran formato que se ve.",
    Glyph: FlagBanner,
    image: "/storefront-promo-banners-posters-transparent.webp",
    gradient: "linear-gradient(135deg, #6b2420 0%, #2c0f0d 100%)",
  },
  {
    productId: "talonarios-fiscales",
    name: "Talonarios y recibos",
    hook: "Para el día a día del negocio.",
    Glyph: Receipt,
    image: "/storefront-promo-invoices-receipts-transparent.webp",
    gradient: "linear-gradient(135deg, #3b4a66 0%, #1a2433 100%)",
  },
];

const verBtn =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/40 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30";
const addBtn =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#3558ff] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(53,88,255,0.34)] transition hover:bg-[#2c49db] active:scale-[0.97]";

type StorefrontPromoPanelsProps = {
  onPreviewProduct: (productId: string) => void;
  onAddProduct: (productId: string) => void;
  onViewAll?: () => void;
};

export function StorefrontPromoPanels({
  onPreviewProduct,
  onAddProduct,
  onViewAll,
}: StorefrontPromoPanelsProps) {
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

      {/* Desktop: paneles que se expanden al pasar el cursor */}
      <div className="pp-row hidden h-[460px] gap-3.5 lg:flex">
        {panels.map(({ productId, name, hook, Glyph, image, gradient }) => (
          <div
            key={productId}
            role="button"
            tabIndex={0}
            onClick={() => onPreviewProduct(productId)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onPreviewProduct(productId);
              }
            }}
            aria-label={name}
            className="pp-panel group cursor-pointer rounded-[18px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#3558ff]/55"
            style={{ backgroundImage: gradient }}
          >
            <div
              className="pp-img absolute inset-x-5 inset-y-6 bg-center bg-no-repeat drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)]"
              style={{ backgroundImage: `url('${image}')`, backgroundSize: "contain" }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,13,10,0.85)_0%,rgba(15,13,10,0.32)_46%,rgba(15,13,10,0.05)_80%)]" />

            <span className="absolute left-5 top-[18px] flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
              <Glyph size={20} weight="bold" />
            </span>

            <div className="pp-label pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center">
              <span
                style={{ ...grotesk, writingMode: "vertical-rl" }}
                className="rotate-180 text-[17px] font-semibold whitespace-nowrap text-white"
              >
                {name}
              </span>
            </div>

            <div className="pp-exp absolute inset-x-[26px] bottom-[26px] flex flex-col gap-4">
              <div>
                <span className="mb-3 block h-[3px] w-[30px] rounded-full bg-[#fbbf24]" />
                <div style={grotesk} className="text-[1.5rem] font-semibold leading-[1.08] tracking-[-0.02em] text-white">
                  {name}
                </div>
                <div className="mt-1.5 text-sm text-white/85">{hook}</div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onAddProduct(productId);
                  }}
                  className={addBtn}
                >
                  <Plus size={15} weight="bold" /> Añadir
                </button>
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
        ))}
      </div>

      {/* Móvil / tablet: acordeón nativo */}
      <div className="flex flex-col gap-2.5 lg:hidden">
        {panels.map(({ productId, name, hook, Glyph, image, gradient }, index) => (
          <details key={productId} className="pp-mp overflow-hidden rounded-2xl shadow-[0_5px_14px_rgba(20,20,35,0.06)]" open={index === 0}>
            <summary className="relative flex h-[150px] cursor-pointer items-end p-4" style={{ backgroundImage: gradient }}>
              <div
                className="absolute inset-x-4 inset-y-3 bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${image}')`, backgroundSize: "contain" }}
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
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => onAddProduct(productId)} className={addBtn}>
                  <Plus size={14} weight="bold" /> Añadir
                </button>
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
