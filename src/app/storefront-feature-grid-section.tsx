"use client";

import { useEffect, useMemo, useState } from "react";

const products = [
  {
    title: "Tarjetas soft touch",
    category: "Tarjetas",
    price: "$29",
    previousPrice: "$34",
    discount: "-$5",
    tint: "from-[#fff7d6] via-white to-[#fff1bf]",
  },
  {
    title: "Stickers troquelados",
    category: "Etiquetas",
    price: "$19",
    previousPrice: "$23",
    discount: "-$4",
    tint: "from-[#dff3ff] via-white to-[#cae8ff]",
  },
  {
    title: "Pendon express",
    category: "Gran formato",
    price: "$32",
    previousPrice: "$39",
    discount: "-$7",
    tint: "from-[#efe4ff] via-white to-[#e2d7ff]",
  },
  {
    title: "Invitaciones deluxe",
    category: "Invitaciones",
    price: "$27",
    previousPrice: "$33",
    discount: "-$6",
    tint: "from-[#ffe0ea] via-white to-[#ffd2df]",
  },
  {
    title: "Sobres membretados",
    category: "Sobres",
    price: "$18",
    previousPrice: "$22",
    discount: "-$4",
    tint: "from-[#f3f4f6] via-white to-[#e5e7eb]",
  },
  {
    title: "Etiquetas metalizadas",
    category: "Etiquetas",
    price: "$18",
    previousPrice: "$22",
    discount: "-$4",
    tint: "from-[#eef2ff] via-white to-[#e4e9ff]",
  },
  {
    title: "Talonarios autocopiativos",
    category: "Talonarios",
    price: "$24",
    previousPrice: "$31",
    discount: "-$7",
    tint: "from-[#e8ffe7] via-white to-[#d8ffd5]",
  },
  {
    title: "Vinil adhesivo",
    category: "Vinil",
    price: "$28",
    previousPrice: "$35",
    discount: "-$7",
    tint: "from-[#fff3cf] via-white to-[#ffe7af]",
  },
];

function getVisibleCount(width: number) {
  if (width >= 1280) return 4;
  if (width >= 768) return 2;
  return 1;
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? <path d="M12.5 4.5 7 10l5.5 5.5" /> : <path d="M7.5 4.5 13 10l-5.5 5.5" />}
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 16.2 3.7 9.9a3.8 3.8 0 0 1 5.4-5.4L10 5.4l.9-.9a3.8 3.8 0 1 1 5.4 5.4Z" />
    </svg>
  );
}

function StarRow() {
  return (
    <div className="mt-4 flex gap-1 text-slate-300">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg key={index} aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-current">
          <path d="m10 2.4 2.3 4.7 5.2.8-3.7 3.6.9 5.1L10 14.2 5.3 16.6l.9-5.1L2.5 7.9l5.2-.8Z" />
        </svg>
      ))}
    </div>
  );
}

function SideFeature() {
  return (
    <article className="relative overflow-hidden bg-[#0d0d0d] p-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_40%)]" />
      <div className="absolute inset-y-0 right-0 w-[54%] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />

      <div className="relative z-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">
          Coleccion destacada
        </p>
        <h3 className="mt-4 max-w-[13rem] text-[2.15rem] font-black leading-tight tracking-tight">
          Papeleria comercial
        </h3>
        <ul className="mt-8 space-y-2.5">
          {["Tarjetas", "Talonarios", "Sobres", "Facturas", "Recibos", "Sellos"].map((item) => (
            <li key={item} className="flex items-center gap-3 text-[1.05rem] font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-[#facc15]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-8 inline-flex cursor-pointer items-center gap-2 text-base font-semibold text-white"
        >
          Ver todo
          <ArrowIcon direction="right" />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-0 h-[78%] w-[52%]">
        <div className="absolute bottom-2 right-4 h-full w-10 rounded-full bg-white/14" />
        <div className="absolute bottom-10 right-14 h-48 w-20 rounded-[1.5rem] bg-white shadow-[0_28px_52px_rgba(0,0,0,0.24)]" />
        <div className="absolute bottom-24 right-28 h-36 w-16 rounded-[1.2rem] bg-[#facc15] shadow-[0_28px_52px_rgba(0,0,0,0.24)]" />
        <div className="absolute bottom-10 right-30 h-24 w-24 rounded-full bg-[#38bdf8]/18 blur-2xl" />
        <div className="absolute bottom-28 right-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      </div>
    </article>
  );
}

function ProductCard({
  title,
  category,
  price,
  previousPrice,
  discount,
  tint,
}: {
  title: string;
  category: string;
  price: string;
  previousPrice: string;
  discount: string;
  tint: string;
}) {
  return (
    <article className="group relative border-r border-slate-200 px-5 py-5 last:border-r-0">
      <span className="absolute left-5 top-5 rounded-md bg-[#ff5b4d] px-2.5 py-1 text-xs font-bold text-white">
        {discount}
      </span>
      <button
        type="button"
        aria-label="Guardar"
        className="absolute right-5 top-5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
      >
        <HeartIcon />
      </button>

      <div className={`flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br ${tint}`}>
        <div className="relative h-32 w-28">
          <div className="absolute inset-0 rotate-[8deg] rounded-[1.45rem] bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)] transition duration-300 group-hover:-translate-y-1 group-hover:rotate-[10deg]" />
          <div className="absolute left-[-1rem] top-7 h-28 w-24 -rotate-[9deg] rounded-[1.3rem] bg-slate-950 shadow-[0_20px_40px_rgba(15,23,42,0.14)] transition duration-300 group-hover:translate-x-1 group-hover:translate-y-1" />
          <div className="absolute left-4 top-4 h-4 w-14 rounded-full bg-[#facc15]" />
          <div className="absolute left-6 top-12 h-2.5 w-10 rounded-full bg-slate-200" />
          <div className="absolute left-6 top-[4.45rem] h-2.5 w-7 rounded-full bg-slate-200" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-lg font-semibold">
        <span className="text-slate-300 line-through">{previousPrice}</span>
        <span className="text-[#3558ff]">{price}</span>
      </div>
      <h4 className="mt-3 text-[1.08rem] font-semibold leading-7 tracking-tight text-slate-950">
        {title}
      </h4>
      <p className="mt-2 text-sm font-medium uppercase tracking-[0.16em] text-slate-400">
        {category}
      </p>
      <StarRow />
    </article>
  );
}

export function StorefrontFeatureGridSection() {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const updateVisibleCount = () => {
      const nextVisibleCount = getVisibleCount(window.innerWidth);
      setVisibleCount(nextVisibleCount);
      setStartIndex((current) => Math.min(current, Math.max(products.length - nextVisibleCount, 0)));
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const visibleProducts = useMemo(
    () => products.slice(startIndex, startIndex + visibleCount),
    [startIndex, visibleCount],
  );
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + visibleCount < products.length;

  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 pb-16 sm:px-6 lg:px-8 2xl:px-10">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.04)] xl:grid xl:grid-cols-[430px_1fr]">
        <SideFeature />

        <div className="relative">
          <button
            type="button"
            onClick={() => setStartIndex((current) => Math.max(current - 1, 0))}
            disabled={!canGoPrev}
            className={`absolute left-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition xl:flex ${
              canGoPrev
                ? "cursor-pointer border-slate-200 bg-white/96 text-slate-500 hover:border-slate-300 hover:text-slate-900"
                : "cursor-default border-slate-100 bg-white/92 text-slate-300"
            }`}
            aria-label="Anterior"
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={() =>
              setStartIndex((current) => Math.min(current + 1, Math.max(products.length - visibleCount, 0)))
            }
            disabled={!canGoNext}
            className={`absolute right-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition xl:flex ${
              canGoNext
                ? "cursor-pointer border-slate-200 bg-white/96 text-slate-500 hover:border-slate-300 hover:text-slate-900"
                : "cursor-default border-slate-100 bg-white/92 text-slate-300"
            }`}
            aria-label="Siguiente"
          >
            <ArrowIcon direction="right" />
          </button>

          <div className="flex items-center justify-end gap-2 border-b border-slate-200 px-5 py-4 xl:hidden">
            <button
              type="button"
              onClick={() => setStartIndex((current) => Math.max(current - 1, 0))}
              disabled={!canGoPrev}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                canGoPrev
                  ? "cursor-pointer border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
                  : "cursor-default border-slate-100 bg-slate-50 text-slate-300"
              }`}
              aria-label="Anterior"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() =>
                setStartIndex((current) => Math.min(current + 1, Math.max(products.length - visibleCount, 0)))
              }
              disabled={!canGoNext}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                canGoNext
                  ? "cursor-pointer border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
                  : "cursor-default border-slate-100 bg-slate-50 text-slate-300"
              }`}
              aria-label="Siguiente"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>

          <div
            className={`grid ${
              visibleCount === 1
                ? "grid-cols-1"
                : visibleCount === 2
                  ? "md:grid-cols-2"
                  : "xl:grid-cols-4"
            }`}
          >
            {visibleProducts.map((product) => (
              <ProductCard key={product.title} {...product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
