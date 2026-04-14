"use client";

import { useEffect, useMemo, useState } from "react";

import { storefrontProducts } from "@/app/storefront-data";
import { StorefrontHeader } from "@/app/storefront-header";
import { StorefrontHero } from "@/app/storefront-hero";

const RECENT_SEARCHES_KEY = "express-printer-recent-searches";

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
        const next = normalizeSearchList([trimmedQuery, ...current]);

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
      />

      {debouncedQuery ? (
        <section className="mx-auto w-full max-w-[112rem] px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
          <div className="rounded-[2.15rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Resultados de busqueda</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                  {debouncedQuery}
                </h1>
              </div>
              <p className="text-sm text-slate-500">
                {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"}
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filteredProducts.map((item) => (
                  <article
                    key={item.title}
                    className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.06)]"
                  >
                    <div
                      className={`flex h-44 items-end bg-gradient-to-br ${item.tint} p-5`}
                    >
                      <div className="flex h-20 w-28 items-center justify-center rounded-[1.4rem] border border-white/80 bg-white/85 shadow-sm">
                        <div className="h-10 w-16 rounded-xl bg-slate-200/80" />
                      </div>
                    </div>
                    <div className="space-y-2 px-5 py-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                        {item.category}
                      </p>
                      <h2 className="text-base font-semibold text-slate-950">{item.title}</h2>
                      <p className="text-sm text-slate-500">{item.note}</p>
                      <p className="pt-2 text-base font-semibold text-slate-800">
                        Desde {item.price}
                      </p>
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
                  Prueba con otra palabra o revisa las categorias sugeridas en el buscador.
                </p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <StorefrontHero />
      )}
    </main>
  );
}
