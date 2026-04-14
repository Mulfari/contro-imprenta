import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";

const quickLinks = ["Catalogo", "FAQ", "Contactanos"];

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

      <section className="mx-auto w-full max-w-[112rem] px-4 py-5 sm:px-6 lg:px-8 2xl:px-10">
        <article className="relative overflow-hidden rounded-[2.2rem] bg-[linear-gradient(120deg,#0f1f35_0%,#1d4f79_42%,#3b88c8_100%)] px-8 py-10 text-white shadow-[0_28px_70px_rgba(15,23,42,0.24)] sm:px-10 sm:py-12">
          <div className="absolute left-8 top-8 h-44 w-44 rounded-full bg-sky-300/14 blur-3xl" />
          <div className="absolute right-10 top-10 h-56 w-56 rounded-full bg-[#ffcf33]/12 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[0.92fr_1.08fr] xl:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-100/75">
                Banner principal
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Impresion online para marcas, negocios y eventos.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-100/88">
                Este banner será el espacio principal para promociones,
                campañas, productos destacados o llamados a pedir online.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="cursor-pointer rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Comprar ahora
                </button>
                <button
                  type="button"
                  className="cursor-pointer rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Solicitar cotizacion
                </button>
              </div>
            </div>

            <div className="relative min-h-[280px] rounded-[2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] p-5 backdrop-blur-sm sm:min-h-[360px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_36%)]" />
              <div className="relative flex h-full items-center justify-center rounded-[1.6rem] border border-white/12 bg-[linear-gradient(140deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))] p-6">
                <div className="grid w-full gap-4 sm:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[1.5rem] border border-white/14 bg-white/8 p-4">
                    <div className="rounded-[1.2rem] border border-white/12 bg-white/10 p-4">
                      <div className="space-y-3">
                        <div className="h-3 w-24 rounded-full bg-white/35" />
                        <div className="h-3 w-32 rounded-full bg-white/20" />
                        <div className="h-3 w-20 rounded-full bg-white/20" />
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="h-20 rounded-[1rem] border border-white/12 bg-white/12" />
                        <div className="h-20 rounded-[1rem] border border-white/12 bg-white/8" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center rounded-[1.5rem] border border-white/14 bg-white p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                    <div className="text-center">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Imagen principal
                      </p>
                      <p className="mt-3 text-lg font-semibold text-slate-700">
                        Banner de producto o promocion
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
