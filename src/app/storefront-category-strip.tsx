"use client";

import { useMemo, useState } from "react";

const categoryHighlights = [
  {
    title: "Tarjetas premium",
    subtitle: "18 productos",
    tint: "from-sky-100 via-white to-cyan-50",
    shape: "card",
  },
  {
    title: "Stickers",
    subtitle: "16 productos",
    tint: "from-yellow-100 via-white to-amber-50",
    shape: "roll",
  },
  {
    title: "Árbol de levas",
    subtitle: "104 productos",
    tint: "from-zinc-100 via-white to-slate-50",
    shape: "bar",
  },
  {
    title: "Pendones",
    subtitle: "57 productos",
    tint: "from-violet-100 via-white to-fuchsia-50",
    shape: "pivot",
  },
  {
    title: "Barras telescópicas",
    subtitle: "1 producto",
    tint: "from-cyan-100 via-white to-sky-50",
    shape: "tube",
  },
  {
    title: "Facturas",
    subtitle: "117 productos",
    tint: "from-stone-100 via-white to-neutral-50",
    shape: "sheet",
  },
  {
    title: "Bomba de aceite",
    subtitle: "1 producto",
    tint: "from-slate-100 via-white to-zinc-50",
    shape: "gear",
  },
  {
    title: "Cables y guayas",
    subtitle: "1 producto",
    tint: "from-neutral-100 via-white to-slate-50",
    shape: "cable",
  },
];

function CategoryVisual({ shape }: { shape: string }) {
  if (shape === "roll") {
    return (
      <div className="relative h-20 w-20">
        <div className="absolute inset-x-5 top-2 h-16 rounded-full bg-yellow-400 shadow-[0_10px_18px_rgba(234,179,8,0.28)]" />
        <div className="absolute inset-x-4 top-6 h-8 rounded-full border border-slate-400/20 bg-white/70" />
      </div>
    );
  }

  if (shape === "bar") {
    return (
      <div className="relative h-20 w-20">
        <div className="absolute left-8 top-1 h-16 w-4 rounded-full bg-slate-500" />
        <div className="absolute left-6 top-0 h-5 w-8 rounded-full bg-slate-300" />
        <div className="absolute left-6 bottom-0 h-5 w-8 rounded-full bg-slate-300" />
      </div>
    );
  }

  if (shape === "pivot") {
    return (
      <div className="relative h-20 w-20">
        <div className="absolute left-6 top-5 h-10 w-8 rotate-[-18deg] rounded-[1rem] bg-slate-500" />
        <div className="absolute left-3 top-7 h-4 w-4 rounded-full bg-slate-300" />
        <div className="absolute right-4 top-3 h-5 w-5 rounded-full bg-slate-300" />
      </div>
    );
  }

  if (shape === "tube") {
    return (
      <div className="relative h-20 w-20">
        <div className="absolute left-5 top-2 h-16 w-2 rotate-[28deg] rounded-full bg-slate-400" />
        <div className="absolute left-10 top-2 h-16 w-2 rotate-[28deg] rounded-full bg-slate-500" />
      </div>
    );
  }

  if (shape === "sheet") {
    return (
      <div className="relative h-20 w-20">
        <div className="absolute left-5 top-4 h-12 w-10 rounded-xl border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-8 top-9 h-1.5 w-4 rounded-full bg-slate-200" />
        <div className="absolute left-8 top-13 h-1.5 w-6 rounded-full bg-slate-200" />
      </div>
    );
  }

  if (shape === "gear") {
    return (
      <div className="relative h-20 w-20">
        <div className="absolute left-5 top-3 h-11 w-11 rounded-full border-[6px] border-slate-400 bg-slate-200" />
        <div className="absolute right-3 bottom-4 h-6 w-6 rounded-lg bg-slate-500" />
      </div>
    );
  }

  if (shape === "cable") {
    return (
      <div className="relative h-20 w-20">
        <div className="absolute left-3 top-5 h-9 w-14 rounded-full border-[3px] border-slate-500" />
        <div className="absolute left-0 top-3 h-4 w-4 rounded-full bg-slate-600" />
        <div className="absolute right-0 bottom-2 h-4 w-4 rounded-full bg-slate-600" />
      </div>
    );
  }

  return (
    <div className="relative h-20 w-20">
      <div className="absolute left-5 top-4 h-12 w-10 rotate-[-18deg] rounded-xl border border-slate-300 bg-white shadow-sm" />
      <div className="absolute left-9 top-2 h-12 w-10 rotate-[12deg] rounded-xl border border-slate-300 bg-white/90 shadow-sm" />
    </div>
  );
}

export function StorefrontCategoryStrip() {
  const [page, setPage] = useState(0);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(categoryHighlights.length / pageSize));
  const visibleItems = useMemo(
    () => categoryHighlights.slice(page * pageSize, page * pageSize + pageSize),
    [page],
  );

  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 pb-6 sm:px-6 lg:px-8 2xl:px-10">
      <div className="rounded-[2rem] border border-slate-200 bg-white px-5 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:px-6">
        <div className="grid grid-cols-[2.8rem_1fr_2.8rem] items-center gap-3">
          <button
            type="button"
            onClick={() => setPage((current) => (current === 0 ? totalPages - 1 : current - 1))}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
            aria-label="Categoria anterior"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div className="grid gap-3 sm:grid-cols-4 xl:grid-cols-8">
            {visibleItems.map((item) => (
              <button
                key={item.title}
                type="button"
                className="cursor-pointer rounded-[1.35rem] px-2 py-3 text-center transition hover:bg-slate-50"
              >
                <div className={`mx-auto flex h-24 w-full max-w-[7rem] items-center justify-center rounded-[1.4rem] bg-gradient-to-br ${item.tint}`}>
                  <CategoryVisual shape={item.shape} />
                </div>
                <p className="mt-4 text-[1.05rem] font-semibold tracking-tight text-slate-950">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-slate-400">{item.subtitle}</p>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPage((current) => (current + 1) % totalPages)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
            aria-label="Categoria siguiente"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
