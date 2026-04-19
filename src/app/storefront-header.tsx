"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { storefrontCategories, storefrontProducts } from "@/app/storefront-data";

const promoTickerItems = [
  "Impresion express para tarjetas, stickers y pendones",
  "Pedidos online conectados al panel administrativo",
  "Cotizaciones rapidas para negocios, marcas y eventos",
  "Produccion publicitaria, corporativa y gran formato",
];
const categoryMenu = [
  {
    title: "Papeleria comercial",
    items: ["Tarjetas de presentacion", "Facturas", "Talonarios", "Sobres"],
  },
  {
    title: "Publicidad impresa",
    items: ["Volantes", "Dipticos", "Tripticos", "Afiches"],
  },
  {
    title: "Etiquetas y stickers",
    items: ["Stickers", "Etiquetas", "Packaging", "Sellos"],
  },
  {
    title: "Gran formato",
    items: ["Pendones", "Banners", "Vinil", "Lonas"],
  },
];

type StorefrontHeaderProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  recentSearches: string[];
  hasActiveSearch: boolean;
  isAccountActive: boolean;
  onAccountClick: () => void;
};

export function StorefrontHeader({
  searchQuery,
  onSearchQueryChange,
  recentSearches,
  hasActiveSearch,
  isAccountActive,
  onAccountClick,
}: StorefrontHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const searchAreaRef = useRef<HTMLDivElement | null>(null);
  const searchPanelRef = useRef<HTMLDivElement | null>(null);
  const categoryAreaRef = useRef<HTMLDivElement | null>(null);
  const categoryPanelRef = useRef<HTMLDivElement | null>(null);
  const showSearchPanel = searchOpen && !hasActiveSearch;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const suggestedProducts = normalizedQuery
    ? storefrontProducts.filter((item) =>
        `${item.title} ${item.note} ${item.category}`.toLowerCase().includes(normalizedQuery),
      )
    : storefrontProducts;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInsideInput = searchAreaRef.current?.contains(target);
      const clickedInsidePanel = searchPanelRef.current?.contains(target);
      const clickedInsideCategoryButton = categoryAreaRef.current?.contains(target);
      const clickedInsideCategoryPanel = categoryPanelRef.current?.contains(target);

      if (!clickedInsideInput && !clickedInsidePanel) {
        setSearchOpen(false);
      }

      if (!clickedInsideCategoryButton && !clickedInsideCategoryPanel) {
        setCategoryOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);

    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);
  return (
    <>
      {showSearchPanel ? (
        <div className="fixed inset-0 z-30 bg-slate-950/10 backdrop-blur-[4px]" />
      ) : null}

      <div className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex w-full max-w-[112rem] px-4 py-3 text-sm sm:px-6 lg:px-8 2xl:px-10">
          <p>Bienvenido a Express Printer. Impresion comercial, publicitaria y corporativa.</p>
        </div>
      </div>

      <header className="relative z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[112rem] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 2xl:px-10">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <Link href="/" className="relative ml-8 flex items-center sm:ml-12 xl:ml-16">
              <div
                className="h-[2.9rem] w-[10.4rem]"
                aria-label="Express Printer"
                role="img"
                style={{
                  width: "10.4rem",
                  height: "2.9rem",
                  backgroundImage: "url('/express-printer-logo.webp')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "left center",
                  backgroundSize: "contain",
                }}
              />
              <span
                className="pointer-events-none absolute text-[12px] font-black uppercase tracking-[0.08em] text-slate-500"
                style={{ left: "5.45rem", top: "1.9rem" }}
              >
                Printer
              </span>
            </Link>

            <div
              ref={searchAreaRef}
              className="flex flex-1 xl:mx-8 xl:max-w-[62rem]"
            >
              <div
                className={`flex w-full flex-col overflow-visible rounded-[1.35rem] border bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition xl:flex-row ${
                  searchOpen || categoryOpen
                    ? "border-slate-950"
                    : "border-slate-200"
                }`}
              >
                <div
                  ref={categoryAreaRef}
                  className="relative shrink-0 rounded-t-[1.35rem] border-b border-slate-200 bg-white p-1 xl:rounded-l-[1.35rem] xl:rounded-tr-none xl:border-b-0 xl:border-r"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setCategoryOpen((current) => {
                        const next = !current;

                        if (!next) {
                          setActiveCategoryIndex(null);
                        }

                        return next;
                      })
                    }
                    className={`inline-flex w-full cursor-pointer items-center justify-between gap-3 rounded-[1.05rem] border border-transparent bg-slate-50 px-5 py-4 text-sm font-semibold transition-[background-color,color,border-color,box-shadow] duration-200 xl:min-w-[15.5rem] xl:rounded-r-none ${
                      categoryOpen
                        ? "border-slate-200 bg-slate-100 text-slate-950 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]"
                        : "text-slate-700 hover:border-slate-200 hover:bg-slate-100 hover:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
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
                        <path d="M3 6h18" />
                        <path d="M3 12h18" />
                        <path d="M3 18h18" />
                      </svg>
                      Todas las categorias
                    </span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 transition ${categoryOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  <div
                    className={`absolute left-0 top-[calc(100%+0.9rem)] z-50 transition-all duration-200 ${
                      categoryOpen
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none -translate-y-2 opacity-0"
                    }`}
                  >
                    <div
                      ref={categoryPanelRef}
                      className={`grid overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white shadow-[0_26px_60px_rgba(15,23,42,0.18)] transition-all duration-200 ${
                        activeCategoryIndex !== null
                          ? "w-[44rem] grid-cols-[17rem_1fr]"
                          : "w-[17rem] grid-cols-[17rem]"
                      }`}
                    >
                      <div className="border-r border-slate-200 bg-slate-50/65">
                        {categoryMenu.map((group, index) => (
                          <button
                            key={group.title}
                            type="button"
                            onMouseEnter={() => setActiveCategoryIndex(index)}
                            onFocus={() => setActiveCategoryIndex(index)}
                            onClick={() => setActiveCategoryIndex(index)}
                            className={`flex w-full cursor-pointer items-center justify-between border-b border-slate-200 px-5 py-4 text-left text-[15px] font-medium transition last:border-b-0 ${
                              activeCategoryIndex === index
                                ? "bg-white text-slate-950"
                                : "bg-transparent text-slate-700 hover:bg-white hover:text-slate-950"
                            }`}
                          >
                            <span>{group.title}</span>
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
                              <path d="m9 6 6 6-6 6" />
                            </svg>
                          </button>
                        ))}
                      </div>

                      {activeCategoryIndex !== null ? (
                        <div className="bg-white p-6">
                          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
                            Subcategorias
                          </p>
                          <p className="mt-2 text-base font-semibold text-slate-950">
                            {categoryMenu[activeCategoryIndex]?.title}
                          </p>
                          <div className="mt-5 grid gap-x-4 gap-y-3 sm:grid-cols-2">
                            {categoryMenu[activeCategoryIndex]?.items.map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => {
                                  onSearchQueryChange(item);
                                  setCategoryOpen(false);
                                  setActiveCategoryIndex(null);
                                }}
                                className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
                              >
                                <span>{item}</span>
                                <svg
                                  aria-hidden="true"
                                  viewBox="0 0 24 24"
                                  className="h-4 w-4 text-slate-300"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="m9 6 6 6-6 6" />
                                </svg>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex min-h-[3.75rem] flex-1 items-center gap-3 px-5 py-3">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar productos de impresion, materiales, medidas o acabados..."
                    value={searchQuery}
                    onChange={(event) => onSearchQueryChange(event.target.value)}
                    onFocus={() => setSearchOpen(true)}
                    className="w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onAccountClick}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  isAccountActive
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
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
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </svg>
                Mi cuenta
              </button>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
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
                Deseados
              </button>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
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
                  <circle cx="9" cy="19" r="1.75" />
                  <circle cx="18" cy="19" r="1.75" />
                  <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H7.2" />
                </svg>
                Carrito
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-100 pt-4 text-sm font-medium text-slate-700">
            <a href="#catalogo" className="transition hover:text-slate-950">
              Catalogo
            </a>
            <a href="#destacados" className="transition hover:text-slate-950">
              Destacados
            </a>
            <button type="button" className="cursor-pointer transition hover:text-slate-950">
              Nuevos productos
            </button>
            <button type="button" className="cursor-pointer transition hover:text-slate-950">
              Promociones
            </button>
            <button type="button" className="cursor-pointer transition hover:text-slate-950">
              Empresas
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-x-0 top-[7.2rem] z-50 px-4 transition-all duration-300 sm:px-6 lg:px-8 2xl:px-10 ${
          showSearchPanel
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-6 opacity-0"
        }`}
      >
        <div ref={searchPanelRef} className="mx-auto w-full max-w-[112rem]">
          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_30px_70px_rgba(15,23,42,0.14)]">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-950">
                Busqueda rapida
              </p>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                aria-label="Cerrar busqueda"
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
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm font-semibold text-slate-950">Busquedas recientes</p>
                <div className="flex flex-wrap gap-2.5">
                  {recentSearches.length > 0 ? recentSearches.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onSearchQueryChange(item)}
                      className="cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                    >
                      {item}
                    </button>
                  )) : (
                    <span className="text-sm text-slate-500">
                      Empieza a buscar y aqui veras tus ultimas consultas.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[0.68fr_1.32fr]">
              <div>
                <p className="text-sm font-semibold text-slate-950">Categorias</p>
                <div className="mt-3 space-y-2">
                  {storefrontCategories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onSearchQueryChange(item)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                    >
                      <span>{item}</span>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-950">Productos sugeridos</p>
                  <button
                    type="button"
                    className="cursor-pointer text-sm font-medium text-slate-500 transition hover:text-slate-950"
                  >
                    Ver todo
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {suggestedProducts.slice(0, 4).map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => onSearchQueryChange(item.title)}
                      className="cursor-pointer overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white text-left shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_34px_rgba(15,23,42,0.1)]"
                    >
                      <div
                        className={`flex h-36 items-end rounded-b-[1.8rem] rounded-t-[1.35rem] bg-gradient-to-br ${item.tint} p-4`}
                      >
                        <div className="flex h-16 w-24 items-center justify-center rounded-[1.25rem] border border-white/80 bg-white/80 shadow-sm">
                          <div className="h-7 w-14 rounded-lg bg-slate-200/80" />
                        </div>
                      </div>
                      <div className="space-y-1 px-4 py-4">
                        <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.note}</p>
                        <p className="pt-1 text-sm font-semibold text-slate-700">
                          Desde {item.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <div className="overflow-hidden">
          <div className="storefront-marquee flex min-w-max items-center gap-10 px-4 py-3.5 sm:px-6 lg:px-8 2xl:px-10">
            {[...promoTickerItems, ...promoTickerItems].map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center gap-10 text-sm font-medium tracking-[0.02em] text-slate-700"
              >
                <span className="whitespace-nowrap rounded-full border border-slate-200/80 bg-white px-4 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                  {item}
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffcf33]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <a
        href="https://wa.me/351922250664?text=Hola%2C%20necesito%20ayuda%20con%20mi%20pedido%20en%20Express%20Printer."
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className="group fixed bottom-5 right-5 z-[60] inline-flex cursor-pointer items-center gap-3 rounded-full border border-emerald-200 bg-white px-3 py-3 text-left text-slate-800 shadow-[0_18px_38px_rgba(15,23,42,0.14)] transition-all duration-300 hover:border-emerald-300 hover:shadow-[0_24px_52px_rgba(15,23,42,0.2)] sm:bottom-6 sm:right-6 sm:px-4"
      >
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_22px_rgba(37,211,102,0.32)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_14px_28px_rgba(37,211,102,0.38)]">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5 transition-transform duration-300 group-hover:rotate-6"
            fill="currentColor"
          >
            <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2c-5.45 0-9.88 4.43-9.88 9.88 0 1.74.45 3.43 1.31 4.92L2 22l5.35-1.4a9.82 9.82 0 0 0 4.68 1.19h.01c5.45 0 9.88-4.43 9.88-9.88a9.8 9.8 0 0 0-2.87-7ZM12.04 20.1h-.01a8.13 8.13 0 0 1-4.14-1.13l-.3-.18-3.17.83.85-3.09-.2-.32a8.11 8.11 0 0 1 1.24-10.03 8.1 8.1 0 0 1 5.77-2.38c4.49 0 8.15 3.65 8.15 8.14 0 4.49-3.66 8.15-8.19 8.15Zm4.47-6.12c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.22-.72-.64-1.2-1.43-1.35-1.67-.14-.24-.01-.37.11-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.52.58.18 1.1.16 1.52.1.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
          </svg>
        </span>
        <span className="hidden sm:flex sm:flex-col sm:pr-1 sm:leading-tight">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 transition-colors duration-300 group-hover:text-emerald-600">
            ¿Necesitas ayuda?
          </span>
          <span className="text-sm font-semibold text-slate-800 transition-colors duration-300 group-hover:text-slate-950">WhatsApp</span>
        </span>
      </a>
    </>
  );
}

