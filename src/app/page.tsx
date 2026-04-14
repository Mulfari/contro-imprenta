import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { StorefrontHero } from "@/app/storefront-hero";

const quickLinks = ["Catalogo", "FAQ", "Contactanos"];
const promoTickerItems = [
  "Impresion express para tarjetas, stickers y pendones",
  "Pedidos online conectados al panel administrativo",
  "Cotizaciones rapidas para negocios, marcas y eventos",
  "Produccion publicitaria, corporativa y gran formato",
];

export default async function Home() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f3f5f8] text-slate-950">
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

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[112rem] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 2xl:px-10">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffcf33] text-lg font-bold text-slate-950">
                EP
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">
                  Express Printer
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight">
                  Tienda online de impresion
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 xl:mx-10 xl:max-w-4xl xl:flex-row xl:items-center">
              <button
                type="button"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
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

              <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <input
                  type="text"
                  placeholder="Buscar productos de impresion..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  className="cursor-pointer rounded-lg bg-[#ffcf33] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#f5c61f]"
                >
                  Buscar
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Mi cuenta
              </button>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Cotizar
              </button>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Carrito $0
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

      <section className="border-b border-slate-200 bg-white">
        <div className="overflow-hidden">
          <div className="storefront-marquee flex min-w-max items-center gap-8 px-4 py-3 sm:px-6 lg:px-8 2xl:px-10">
            {[...promoTickerItems, ...promoTickerItems].map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center gap-8 text-sm font-medium text-slate-700"
              >
                <span className="whitespace-nowrap">{item}</span>
                <span className="h-2 w-2 rounded-full bg-[#ffcf33]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <StorefrontHero />
    </main>
  );
}
