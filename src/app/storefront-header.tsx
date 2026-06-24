"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { WhatsappHelpBubble } from "./storefront/components/WhatsappHelpBubble";

const promoTickerItems = [
  "Horario: lunes a sabado",
  "Pedidos online",
  "Cotizaciones por WhatsApp",
  "Impresion comercial y publicitaria",
];

// Ticker superior con loop continuo y sin huecos: mide el ancho real de la
// barra y repite el contenido las veces necesarias para llenarla en cualquier
// pantalla, desplazando exactamente el ancho de una copia (loop perfecto).
function PromoTicker({ items }: { items: string[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const setRef = useRef<HTMLDivElement | null>(null);
  const [copies, setCopies] = useState(2);
  const [setWidth, setSetWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const set = setRef.current;

    if (!container || !set) {
      return;
    }

    const measure = () => {
      const containerWidth = container.offsetWidth;
      const singleWidth = set.scrollWidth;

      if (singleWidth <= 0) {
        return;
      }

      setSetWidth(singleWidth);
      // Suficientes copias para cubrir la barra + margen, minimo 2 para el loop.
      setCopies(Math.max(2, Math.ceil(containerWidth / singleWidth) + 2));
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(set);

    return () => observer.disconnect();
  }, [items]);

  const pixelsPerSecond = 22;
  const style = {
    "--marquee-shift": setWidth > 0 ? `${setWidth}px` : "50%",
    "--marquee-duration": `${setWidth > 0 ? Math.max(12, setWidth / pixelsPerSecond) : 34}s`,
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      className="min-w-0 flex-1 overflow-hidden rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
    >
      <div className="storefront-marquee flex w-max items-center" style={style}>
        {Array.from({ length: copies }).map((_, copyIndex) => (
          <div
            key={copyIndex}
            ref={copyIndex === 0 ? setRef : undefined}
            aria-hidden={copyIndex > 0}
            className="flex shrink-0 items-center gap-8 pr-8"
          >
            {items.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center gap-8 text-xs font-semibold tracking-[0.04em] text-slate-300"
              >
                <span className="whitespace-nowrap">{item}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#ffd45f]" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
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
  accountActivity?: {
    activeCount: number;
    needsAttention: boolean;
  };
  onAccountClick: () => void;
  wishlistCount: number;
  cartCount: number;
  onWishlistClick: () => void;
  onCartClick: () => void;
  onCatalogClick: () => void;
  onHomeClick?: () => void;
  onSectionNavigate: (href: string) => void;
};

export function StorefrontHeader({
  searchQuery,
  onSearchQueryChange,
  hasActiveSearch,
  isAccountActive,
  accountActivity,
  onAccountClick,
  wishlistCount,
  cartCount,
  onWishlistClick,
  onCartClick,
  onCatalogClick,
  onHomeClick,
  onSectionNavigate,
}: StorefrontHeaderProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const categoryAreaRef = useRef<HTMLDivElement | null>(null);
  const categoryPanelRef = useRef<HTMLDivElement | null>(null);
  const hasAccountActivity = Boolean(accountActivity && accountActivity.activeCount > 0);
  const accountIndicatorClass = accountActivity?.needsAttention
    ? "bg-[#ffd45f] text-slate-950"
    : "bg-blue-500 text-white";

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
    onSectionNavigate(href);
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

  const handleHomeClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (!onHomeClick) {
      return;
    }

    event.preventDefault();
    onHomeClick();
    setCategoryOpen(false);
    setActiveCategoryIndex(null);
  };

  return (
    <>
      <div className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex w-full max-w-[112rem] items-center gap-4 px-4 py-2.5 sm:px-6 lg:gap-8 lg:px-8 2xl:px-10">
          <p className="shrink-0 text-xs font-semibold tracking-[0.02em] text-slate-100 sm:text-sm">
            Bienvenido a Express Printer
          </p>

          <PromoTicker items={promoTickerItems} />
        </div>
      </div>

      <header className="relative z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[112rem] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 2xl:px-10">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <Link href="/" onClick={handleHomeClick} className="relative flex items-center">
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
                data-account-trigger="true"
                className={`relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border transition ${
                  isAccountActive
                    ? "border-slate-950 bg-slate-950 text-white"
                    : accountActivity?.needsAttention
                      ? "border-amber-300 bg-amber-50 text-slate-950 shadow-[0_0_0_4px_rgba(253,224,71,0.18)]"
                      : hasAccountActivity
                        ? "border-blue-200 bg-blue-50 text-blue-700"
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
                {hasAccountActivity ? (
                  <span className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.66rem] font-black ${accountIndicatorClass} ${accountActivity?.needsAttention ? "animate-pulse" : ""}`}>
                    {accountActivity?.activeCount}
                  </span>
                ) : null}
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
                className="relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#ffd45f] text-slate-950 transition hover:bg-[#ffcd41]"
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
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-950 px-1 text-[0.68rem] font-bold text-[#ffd45f]">
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link
              href="/"
              onClick={handleHomeClick}
              className="relative hidden items-center lg:ml-16 lg:flex"
            >
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
                      className={`grid max-h-[70vh] max-w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto rounded-[1.2rem] border border-slate-200 bg-white shadow-[0_26px_60px_rgba(15,23,42,0.18)] transition-all duration-200 ${
                        activeCategoryIndex !== null
                          ? "w-[min(21rem,calc(100vw-2rem))] grid-cols-1 lg:w-[40rem] lg:grid-cols-[16rem_1fr]"
                          : "w-[min(21rem,calc(100vw-2rem))] grid-cols-1 lg:w-[16rem] lg:grid-cols-[16rem]"
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
                        <div className="min-w-0 bg-white p-4 sm:p-5 lg:border-t lg:border-t-0 lg:border-slate-200">
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
                          <div className="mt-5 grid min-w-0 gap-2 sm:grid-cols-2">
                            {categoryMenu[activeCategoryIndex]?.items.map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => {
                                  onSearchQueryChange(item);
                                  setCategoryOpen(false);
                                  setActiveCategoryIndex(null);
                                }}
                                className="flex min-w-0 cursor-pointer items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
                              >
                                <span className="min-w-0">{item}</span>
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

              <div className="hidden items-center gap-2 lg:flex">
              <button
                type="button"
                onClick={onAccountClick}
                data-account-trigger="true"
                className={`group inline-flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition ${
                  isAccountActive
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
                    accountActivity?.needsAttention
                      ? "bg-amber-100 text-amber-900"
                      : hasAccountActivity
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
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
                  {hasAccountActivity ? (
                    <span className={`absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.62rem] font-black ${accountIndicatorClass} ${accountActivity?.needsAttention ? "animate-pulse" : ""}`}>
                      {accountActivity?.activeCount}
                    </span>
                  ) : null}
                </span>
                Mi cuenta
              </button>
              <button
                type="button"
                onClick={onWishlistClick}
                aria-label="Deseados"
                className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-50"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 20-1.2-1.1C5.8 14.4 3 11.8 3 8.5A4.5 4.5 0 0 1 7.5 4C9.3 4 11 4.9 12 6.3 13 4.9 14.7 4 16.5 4A4.5 4.5 0 0 1 21 8.5c0 3.3-2.8 5.9-7.8 10.4L12 20Z" />
                </svg>
                {wishlistCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff5b4d] px-1 text-[0.66rem] font-bold text-white">
                    {wishlistCount}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                onClick={onCartClick}
                className="ml-1 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#ffd45f] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#ffcd41]"
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
                  <span className="rounded-full bg-slate-950 px-2 py-0.5 text-xs font-bold text-[#ffd45f]">
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
      <WhatsappHelpBubble />
    </>
  );
}

