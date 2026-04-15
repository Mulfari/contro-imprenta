"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { storefrontCategories, storefrontProducts } from "@/app/storefront-data";

const quickLinks = ["Catalogo", "FAQ", "Contactanos"];
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
};

export function StorefrontHeader({
  searchQuery,
  onSearchQueryChange,
  recentSearches,
  hasActiveSearch,
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
        <div className="mx-auto flex w-full max-w-[112rem] flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 2xl:px-10">
          <p>Bienvenido a Express Printer. Impresion comercial, publicitaria y corporativa.</p>
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            {quickLinks.map((item) => (
              <button key={item} type="button" className="cursor-pointer hover:text-white">
                {item}
              </button>
            ))}
            <Link href="/login" className="hover:text-white">
              Panel administrativo
            </Link>
          </div>
        </div>
      </div>

      <header className="relative z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[112rem] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 2xl:px-10">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <Link href="/" className="flex items-center">
              <div className="relative h-[3.15rem] w-[10.75rem] overflow-hidden sm:h-[3.5rem] sm:w-[12rem]">
                <Image
                  src="/express-printer-logo.png"
                  alt="Express Printer"
                  fill
                  sizes="(min-width: 640px) 12rem, 10.75rem"
                  className="object-cover object-center scale-[1.5]"
                  priority
                />
              </div>
            </Link>

            <div
              ref={searchAreaRef}
              className="flex flex-1 flex-col gap-3 xl:mx-10 xl:max-w-4xl xl:flex-row xl:items-center"
            >
              <div ref={categoryAreaRef} className="relative">
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
                  className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                    categoryOpen
                      ? "border-slate-950 bg-white text-slate-950"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
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
                    <path d="M3 6h18" />
                    <path d="M3 12h18" />
                    <path d="M3 18h18" />
                  </svg>
                  Todas las categorias
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

              <div
                className={`flex flex-1 items-center rounded-xl border bg-white px-4 py-3 shadow-sm transition ${
                  searchOpen
                    ? "border-slate-950"
                    : "border-slate-200"
                }`}
              >
                <input
                  type="text"
                  placeholder="Buscar productos de impresion..."
                  value={searchQuery}
                  onChange={(event) => onSearchQueryChange(event.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
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
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </svg>
                Mi cuenta
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
    </>
  );
}
