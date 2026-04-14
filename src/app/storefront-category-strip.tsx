"use client";

import { useMemo, useState } from "react";

const items = [
  { title: "Tarjetas premium", count: "18 productos", art: "cards" },
  { title: "Stickers", count: "16 productos", art: "stickers" },
  { title: "Folletos", count: "12 productos", art: "booklet" },
  { title: "Pendones", count: "9 productos", art: "banner" },
  { title: "Talonarios", count: "7 productos", art: "invoice" },
  { title: "Etiquetas", count: "21 productos", art: "labels" },
  { title: "Invitaciones", count: "14 productos", art: "invite" },
  { title: "Packaging", count: "11 productos", art: "packaging" },
];

function CategoryArt({ art }: { art: string }) {
  if (art === "stickers") {
    return (
      <div className="relative h-24 w-24">
        <div className="absolute left-2 top-5 h-10 w-10 rounded-[1rem] bg-yellow-300 shadow-sm" />
        <div className="absolute left-11 top-2 h-10 w-10 rounded-full bg-pink-300 shadow-sm" />
        <div className="absolute right-1 bottom-2 h-7 w-11 rounded-full bg-cyan-300 shadow-sm" />
      </div>
    );
  }

  if (art === "booklet") {
    return (
      <div className="relative h-24 w-24">
        <div className="absolute left-4 top-5 h-13 w-10 rounded-[1rem] border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-9 top-2 h-13 w-10 rounded-[1rem] border border-slate-300 bg-white/92 shadow-sm" />
      </div>
    );
  }

  if (art === "banner") {
    return (
      <div className="relative h-24 w-24">
        <div className="absolute left-8 top-1 h-20 w-2 rounded-full bg-slate-400" />
        <div className="absolute left-10 top-7 h-12 w-9 rounded-r-[1rem] rounded-tl-[0.3rem] rounded-bl-[0.3rem] bg-violet-300 shadow-sm" />
      </div>
    );
  }

  if (art === "invoice") {
    return (
      <div className="relative h-24 w-24">
        <div className="absolute left-6 top-4 h-14 w-11 rounded-[1rem] border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-9 top-10 h-1.5 w-7 rounded-full bg-slate-200" />
        <div className="absolute left-9 top-14 h-1.5 w-8 rounded-full bg-slate-200" />
        <div className="absolute left-9 top-18 h-1.5 w-5 rounded-full bg-slate-200" />
      </div>
    );
  }

  if (art === "labels") {
    return (
      <div className="grid h-24 w-24 grid-cols-2 gap-2">
        <div className="rounded-xl bg-emerald-300" />
        <div className="rounded-xl bg-cyan-300" />
        <div className="rounded-xl bg-amber-300" />
        <div className="rounded-xl bg-pink-300" />
      </div>
    );
  }

  if (art === "invite") {
    return (
      <div className="relative h-24 w-24">
        <div className="absolute left-5 top-6 h-11 w-12 rotate-[-8deg] rounded-[1rem] border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-10 top-3 h-11 w-12 rotate-[8deg] rounded-[1rem] border border-slate-300 bg-white/92 shadow-sm" />
        <div className="absolute left-12 top-11 h-3 w-6 rounded-full bg-rose-300" />
      </div>
    );
  }

  if (art === "packaging") {
    return (
      <div className="relative h-24 w-24">
        <div className="absolute left-5 top-6 h-10 w-12 rounded-[0.9rem] border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-9 top-2 h-8 w-4 rounded-md bg-slate-300" />
        <div className="absolute left-9 bottom-3 h-2 w-4 rounded-full bg-amber-300" />
      </div>
    );
  }

  return (
    <div className="relative h-24 w-24">
      <div className="absolute left-3 top-7 h-13 w-10 rotate-[-14deg] rounded-[1rem] border border-slate-300 bg-white shadow-sm" />
      <div className="absolute left-10 top-3 h-13 w-10 rotate-[8deg] rounded-[1rem] border border-slate-300 bg-white/92 shadow-sm" />
    </div>
  );
}

export function StorefrontCategoryStrip() {
  const [page, setPage] = useState(0);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const visibleItems = useMemo(
    () => items.slice(page * pageSize, page * pageSize + pageSize),
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
            aria-label="Anterior"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {visibleItems.map((item) => (
              <button
                key={item.title}
                type="button"
                className="cursor-pointer rounded-[1.35rem] px-2 py-3 text-center transition hover:bg-slate-50"
              >
                <div className="mx-auto flex h-28 w-full max-w-[8.4rem] items-center justify-center rounded-[1.5rem] bg-white">
                  <CategoryArt art={item.art} />
                </div>
                <p className="mt-4 text-[1.05rem] font-semibold tracking-tight text-slate-950">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-slate-400">{item.count}</p>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPage((current) => (current + 1) % totalPages)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
            aria-label="Siguiente"
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
