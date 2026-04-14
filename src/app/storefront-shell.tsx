"use client";

import { useEffect, useMemo, useState } from "react";

import { storefrontProducts } from "@/app/storefront-data";
import { StorefrontCategoryStrip } from "@/app/storefront-category-strip";
import { StorefrontHeader } from "@/app/storefront-header";
import { StorefrontHero } from "@/app/storefront-hero";

const RECENT_SEARCHES_KEY = "express-printer-recent-searches";
const categoryGroups = [
  {
    title: "Papeleria comercial",
    items: ["Tarjetas", "Facturas", "Sobres", "Talonarios"],
  },
  {
    title: "Publicidad impresa",
    items: ["Volantes", "Dipticos", "Tripticos", "Afiches"],
  },
  {
    title: "Etiquetas y stickers",
    items: ["Etiquetas", "Stickers", "Sellos", "Packaging"],
  },
  {
    title: "Gran formato",
    items: ["Pendones", "Banners", "Vinil", "Lonas"],
  },
];

function normalizeSearchList(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).slice(0, 6);
}

export function StorefrontShell() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? normalizeSearchList(JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmedQuery = searchQuery.trim();
      setDebouncedQuery(trimmedQuery);

      if (!trimmedQuery) {
        return;
      }

      setRecentSearches((current) => {
        const latestSearch = current[0]?.trim().toLowerCase();
        const nextSearch = trimmedQuery.toLowerCase();

        if (latestSearch === nextSearch) {
          return current;
        }

        let next: string[];

        if (latestSearch && nextSearch.startsWith(latestSearch)) {
          next = normalizeSearchList([trimmedQuery, ...current.slice(1)]);
        } else if (latestSearch && latestSearch.startsWith(nextSearch)) {
          return current;
        } else {
          next = normalizeSearchList([trimmedQuery, ...current]);
        }

        try {
          window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
        } catch {}

        return next;
      });
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    const normalized = debouncedQuery.toLowerCase();

    if (!normalized) {
      return [];
    }

    return storefrontProducts.filter((item) =>
      `${item.title} ${item.note} ${item.category}`.toLowerCase().includes(normalized),
    );
  }, [debouncedQuery]);

  return (
    <main className="min-h-screen bg-[#f3f5f8] text-slate-950">
      <StorefrontHeader
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        recentSearches={recentSearches}
        hasActiveSearch={Boolean(debouncedQuery)}
      />

      {debouncedQuery ? (
        <section className="mx-auto w-full max-w-[112rem] px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
          <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
            <aside className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Catalogo
              </p>
              <h2 className="mt-2 text-base font-semibold tracking-tight">
                Compra por categoria
              </h2>
              <div className="mt-5 space-y-5">
                {categoryGroups.map((group) => (
                  <div key={group.title} className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
                    <h3 className="text-sm font-semibold text-slate-500">{group.title}</h3>
                    <div className="mt-3 space-y-1.5">
                      {group.items.map((item) => {
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setSearchQuery(item)}
                            className="block w-full cursor-pointer rounded-lg px-2 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <section className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
                    Resultados de busqueda
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    {debouncedQuery}
                  </h2>
                </div>
                <p className="text-sm font-medium text-slate-500">
                  {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"}
                </p>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((item) => (
                    <article
                      key={item.title}
                      className="group overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_38px_rgba(15,23,42,0.08)]"
                    >
                      <div
                        className={`bg-gradient-to-br ${item.tint} p-5`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#8a6a00]">
                            Destacado
                          </span>
                          <span className="rounded-full border border-white/55 bg-white/45 px-3 py-1 text-xs font-medium text-slate-600">
                            {item.category}
                          </span>
                        </div>

                        <div className="mt-5 flex h-32 items-end justify-between rounded-[1.1rem] border border-white/55 bg-white/40 p-4">
                          <div className="space-y-2">
                            <div className="h-3 w-24 rounded-full bg-white/80" />
                            <div className="h-3 w-16 rounded-full bg-white/55" />
                          </div>
                          <div className="h-16 w-16 rounded-[1rem] border border-white/60 bg-white/80 shadow-sm" />
                        </div>
                      </div>

                      <div className="space-y-3 p-5">
                        <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                        <p className="text-sm leading-6 text-slate-600">{item.note}</p>
                        <div className="flex items-end justify-between gap-3 pt-1">
                          <p className="text-lg font-semibold text-slate-950">
                            Desde {item.price}
                          </p>
                          <button
                            type="button"
                            className="cursor-pointer rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            Ver
                          </button>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-medium text-slate-400">
                          <span>Entrega express</span>
                          <span>Personalizable</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                  <p className="text-lg font-semibold text-slate-900">
                    No encontramos productos para esa busqueda
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Prueba con otra palabra o selecciona una categoria del catalogo.
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>
      ) : (
        <>
          <StorefrontHero />
          <StorefrontCategoryStrip />
        </>
      )}
    </main>
  );
}
