"use client";

import Link from "next/link";
import { type MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";

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
const navLinks = [
  { label: "Catalogo", href: "#catalogo", isCatalog: true },
  { label: "Destacados", href: "#destacados" },
  { label: "Nuevos productos", href: "#nuevos-productos" },
  { label: "Promociones", href: "#promociones" },
  { label: "Empresas", href: "#empresas" },
];

type StorefrontHeaderProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  hasActiveSearch: boolean;
  isAccountActive: boolean;
  onAccountClick: () => void;
  wishlistCount: number;
  cartCount: number;
  onWishlistClick: () => void;
  onCartClick: () => void;
  onCatalogClick: () => void;
  onSectionNavigate: () => void;
};

export function StorefrontHeader({
  searchQuery,
  onSearchQueryChange,
  hasActiveSearch,
  isAccountActive,
  onAccountClick,
  wishlistCount,
  cartCount,
  onWishlistClick,
  onCartClick,
  onCatalogClick,
  onSectionNavigate,
}: StorefrontHeaderProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const categoryAreaRef = useRef<HTMLDivElement | null>(null);
  const categoryPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInsideCategoryButton = categoryAreaRef.current?.contains(target);
      const clickedInsideCategoryPanel = categoryPanelRef.current?.contains(target);

      if (!clickedInsideCategoryButton && !clickedInsideCategoryPanel) {
        setCategoryOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);

    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleSectionLinkClick = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    event.preventDefault();

    const sectionId = href.slice(1);

    onSearchQueryChange("");
    onSectionNavigate();
    setCategoryOpen(false);
    setActiveCategoryIndex(null);
    window.history.pushState(null, "", href);
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  return (
    <>
      <div className="hidden border-b border-slate-800 bg-slate-950 text-white sm:block">
        <div className="mx-auto flex w-full max-w-[112rem] px-4 py-3 text-sm sm:px-6 lg:px-8 2xl:px-10">
          <p>Bienvenido a Express Printer. Impresion comercial, publicitaria y corporativa.</p>
        </div>
      </div>

      <header className="relative z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[112rem] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 2xl:px-10">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <Link href="/" className="relative flex items-center">
              <div
                className="h-[2.5rem] w-[8.8rem]"
                aria-label="Express Printer"
                role="img"
                style={{
                  width: "8.8rem",
                  height: "2.5rem",
                  backgroundImage: "url('/express-printer-logo.webp')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "left center",
                  backgroundSize: "contain",
                }}
              />
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onAccountClick}
                aria-label="Mi cuenta"
                className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border transition ${
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
              </button>
              <button
                type="button"
                aria-label="Deseados"
                onClick={onWishlistClick}
                className="relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
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
                {wishlistCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff5b4d] px-1 text-[0.68rem] font-bold text-white">
                    {wishlistCount}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                aria-label="Carrito"
                onClick={onCartClick}
                className="relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-slate-950 text-white transition hover:bg-slate-800"
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
                {cartCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ffd45f] px-1 text-[0.68rem] font-bold text-slate-950">
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="relative hidden items-center lg:ml-16 lg:flex">
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

            <div className="flex flex-1 lg:mx-8 lg:max-w-[62rem]">
              <div
                className={`flex w-full flex-col overflow-visible rounded-[1.35rem] border bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition xl:flex-row ${
                  hasActiveSearch || categoryOpen
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
                    className={`inline-flex w-full cursor-pointer items-center justify-between gap-3 rounded-[1.05rem] border border-transparent bg-slate-50 px-5 py-4 text-sm font-semibold transition-[background-color,color,border-color,box-shadow] duration-200 lg:min-w-[15.5rem] lg:rounded-r-none ${
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
                      className={`grid max-h-[70vh] overflow-auto rounded-[1.2rem] border border-slate-200 bg-white shadow-[0_26px_60px_rgba(15,23,42,0.18)] transition-all duration-200 ${
                        activeCategoryIndex !== null
                          ? "w-[min(22rem,calc(100vw-2rem))] grid-cols-1 lg:w-[44rem] lg:grid-cols-[17rem_1fr]"
                          : "w-[min(22rem,calc(100vw-2rem))] grid-cols-1 lg:w-[17rem] lg:grid-cols-[17rem]"
                      }`}
                    >
                      <div
                        className={`bg-slate-50/65 lg:border-r lg:border-slate-200 ${
                          activeCategoryIndex !== null ? "hidden lg:block" : ""
                        }`}
                      >
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
                        <div className="bg-white p-6 lg:border-t lg:border-t-0 lg:border-slate-200">
                          <button
                            type="button"
                            onClick={() => setActiveCategoryIndex(null)}
                            className="mb-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 lg:hidden"
                          >
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 24 24"
                              className="h-3.5 w-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m15 18-6-6 6-6" />
                            </svg>
                            Categorias
                          </button>
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
                    className="w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

              <div className="hidden flex-wrap items-center gap-3 lg:flex">
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
                onClick={onWishlistClick}
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
                {wishlistCount > 0 ? (
                  <span className="rounded-full bg-[#ff5b4d] px-2 py-0.5 text-xs font-bold text-white">
                    {wishlistCount}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                onClick={onCartClick}
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
                {cartCount > 0 ? (
                  <span className="rounded-full bg-[#ffd45f] px-2 py-0.5 text-xs font-bold text-slate-950">
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          <div className="hidden flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-100 pt-4 text-sm font-medium text-slate-700 lg:flex">
            {navLinks.map((item) => (
              item.isCatalog ? (
                <button
                  key={item.href}
                  type="button"
                  onClick={onCatalogClick}
                  className="cursor-pointer transition hover:text-slate-950"
                >
                  {item.label}
                </button>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(event) => handleSectionLinkClick(event, item.href)}
                  className="transition hover:text-slate-950"
                >
                  {item.label}
                </a>
              )
            ))}
          </div>
        </div>
      </header>

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

