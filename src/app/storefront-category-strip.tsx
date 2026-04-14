"use client";

import { useMemo, useState } from "react";

const categoryHighlights = [
  {
    title: "Tarjetas",
    subtitle: "18 modelos",
    tint: "from-sky-100 via-white to-cyan-50",
    shape: "card",
  },
  {
    title: "Stickers",
    subtitle: "16 opciones",
    tint: "from-yellow-100 via-white to-amber-50",
    shape: "sticker",
  },
  {
    title: "Folletos",
    subtitle: "12 formatos",
    tint: "from-zinc-100 via-white to-slate-50",
    shape: "booklet",
  },
  {
    title: "Pendones",
    subtitle: "9 formatos",
    tint: "from-violet-100 via-white to-fuchsia-50",
    shape: "banner",
  },
  {
    title: "Talonarios",
    subtitle: "7 modelos",
    tint: "from-cyan-100 via-white to-sky-50",
    shape: "invoice",
  },
  {
    title: "Etiquetas",
    subtitle: "21 opciones",
    tint: "from-stone-100 via-white to-neutral-50",
    shape: "labels",
  },
  {
    title: "Packaging",
    subtitle: "11 opciones",
    tint: "from-slate-100 via-white to-zinc-50",
    shape: "packaging",
  },
  {
    title: "Invitaciones",
    subtitle: "14 disenos",
    tint: "from-neutral-100 via-white to-slate-50",
    shape: "invitation",
  },
];

function CategoryVisual({ shape }: { shape: string }) {
  if (shape === "sticker") {
    return (
      <div className="relative h-20 w-20">
        <div className="absolute left-3 top-4 h-9 w-9 rounded-[1rem] bg-yellow-300 shadow-[0_8px_18px_rgba(234,179,8,0.24)]" />
        <div className="absolute right-4 top-8 h-8 w-8 rounded-full bg-pink-300 shadow-[0_8px_18px_rgba(244,114,182,0.2)]" />
        <div className="absolute left-8 bottom-2 h-6 w-10 rounded-full bg-cyan-300 shadow-[0_8px_18px_rgba(34,211,238,0.2)]" />
      </div>
    );
  }

  if (shape === "booklet") {
    return (
      <div className="relative h-20 w-20">
        <div className="absolute left-5 top-4 h-12 w-10 rounded-[1rem] border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-9 top-2 h-12 w-10 rounded-[1rem] border border-slate-300 bg-white/92 shadow-sm" />
      </div>
    );
  }

  if (shape === "banner") {
    return (
      <div className="relative h-20 w-20">
        <div className="absolute left-8 top-2 h-16 w-2 rounded-full bg-slate-400" />
        <div className="absolute left-10 top-4 h-12 w-9 rounded-r-[0.9rem] rounded-tl-[0.3rem] rounded-bl-[0.3rem] bg-violet-300 shadow-[0_10px_18px_rgba(167,139,250,0.22)]" />
      </div>
    );
  }

  if (shape === "invoice") {
    return (
      <div className="relative h-20 w-20">
        <div className="absolute left-5 top-4 h-12 w-10 rounded-xl border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-9 top-8 h-1.5 w-12 rounded-full bg-slate-200" />
        <div className="absolute left-9 top-12 h-1.5 w-10 rounded-full bg-slate-200" />
        <div className="absolute left-9 top-16 h-1.5 w-8 rounded-full bg-slate-200" />
      </div>
    );
  }

  if (shape === "labels") {
    return (
      <div className="relative h-20 w-20">
        <div className="absolute left-4 top-4 grid grid-cols-2 gap-2">
          <div className="h-6 w-6 rounded-lg bg-emerald-300" />
          <div className="h-6 w-6 rounded-lg bg-cyan-300" />
          <div className="h-6 w-6 rounded-lg bg-amber-300" />
          <div className="h-6 w-6 rounded-lg bg-pink-300" />
        </div>
      </div>
    );
  }

  if (shape === "packaging") {
    return (
      <div className="relative h-20 w-20">
        <div className="absolute left-4 top-5 h-10 w-12 rounded-[0.9rem] border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-8 top-2 h-8 w-4 rounded-md bg-slate-300" />
        <div className="absolute left-8 bottom-2 h-2 w-4 rounded-full bg-amber-300" />
      </div>
    );
  }

  if (shape === "invitation") {
    return (
      <div className="relative h-20 w-20">
        <div className="absolute left-4 top-4 h-11 w-12 rotate-[-10deg] rounded-[1rem] border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-8 top-1 h-11 w-12 rotate-[8deg] rounded-[1rem] border border-slate-300 bg-white/92 shadow-sm" />
        <div className="absolute left-10 top-9 h-3 w-6 rounded-full bg-rose-300" />
      </div>
    );
  }

  return (
    <div className="relative h-20 w-20">
      <div className="absolute left-5 top-4 h-12 w-10 rotate-[-18deg] rounded-xl border border-slate-300 bg-white shadow-sm" />
      <div className="absolute left-9 top-2 h-12 w-10 rotate-[12deg] rounded-xl border border-slate-300 bg-white/92 shadow-sm" />
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
