import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";

const quickLinks = ["Catalogo", "FAQ", "Contactanos"];

const mainCategories = [
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

const featuredProducts = [
  {
    name: "Tarjetas de presentacion premium",
    category: "Papeleria comercial",
    price: "$18",
  },
  {
    name: "Volantes promocionales",
    category: "Publicidad impresa",
    price: "$25",
  },
  {
    name: "Etiquetas para productos",
    category: "Etiquetas y stickers",
    price: "$16",
  },
  {
    name: "Pendones publicitarios",
    category: "Gran formato",
    price: "$35",
  },
  {
    name: "Facturas y talonarios",
    category: "Papeleria comercial",
    price: "$22",
  },
  {
    name: "Stickers personalizados",
    category: "Etiquetas y stickers",
    price: "$14",
  },
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

      <section className="mx-auto w-full max-w-[112rem] px-4 py-5 sm:px-6 lg:px-8 2xl:px-10">
        <div className="grid gap-6 xl:grid-cols-[360px_1fr] 2xl:grid-cols-[390px_1fr]">
          <aside
            id="catalogo"
            className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]"
          >
            <h2 className="text-base font-semibold tracking-tight">Compra por categoria</h2>
            <div className="mt-5 space-y-5">
              {mainCategories.map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-semibold text-slate-500">{group.title}</h3>
                  <div className="mt-3 space-y-2">
                    {group.items.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="block cursor-pointer text-left text-sm text-slate-700 transition hover:text-slate-950"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="grid gap-6">
            <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,#102038_0%,#1a4b74_44%,#3b86c4_100%)] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.24)]">
              <div className="absolute left-8 top-8 h-44 w-44 rounded-full bg-sky-300/16 blur-3xl" />
              <div className="absolute right-12 top-8 h-56 w-56 rounded-full bg-[#ffcf33]/14 blur-3xl" />

              <div className="relative grid gap-8 xl:grid-cols-[1.02fr_1.08fr] xl:items-center">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-100/75">
                    Hero principal
                  </p>
                  <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                    Impresion profesional para marcas, negocios y eventos.
                  </h1>
                  <p className="mt-4 text-base leading-7 text-slate-100/88">
                    Compra, cotiza y solicita impresiones desde la web de Express Printer.
                    Este espacio puede usarse para campañas, promociones, lanzamientos o categorias destacadas.
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

                <div className="relative min-h-[320px] rounded-[2rem] border border-white/12 bg-[linear-gradient(140deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))] p-5 backdrop-blur-sm sm:min-h-[380px]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_35%)]" />
                  <div className="relative flex h-full flex-col justify-between rounded-[1.6rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-100/75">
                          Banner promocional
                        </p>
                        <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                          Tarjetas Premium
                        </h3>
                      </div>
                      <span className="rounded-full bg-[#ffcf33] px-3 py-1 text-xs font-semibold text-slate-950">
                        Oferta
                      </span>
                    </div>

                    <div className="grid flex-1 gap-4 py-6 md:grid-cols-[1.05fr_0.95fr]">
                      <div className="rounded-[1.5rem] border border-white/12 bg-white/8 p-4">
                        <div className="h-full rounded-[1.2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.05))] p-4">
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

                      <div className="flex items-center justify-center rounded-[1.5rem] border border-white/12 bg-white/8 p-4">
                        <div className="flex h-full min-h-[180px] w-full items-center justify-center rounded-[1.3rem] border border-white/16 bg-white text-center text-sm font-semibold text-slate-400 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                          Imagen principal
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-white/12 bg-white/8 px-4 py-4">
                      <div>
                        <p className="text-sm text-slate-100/75">Desde</p>
                        <p className="text-3xl font-semibold tracking-tight">$18</p>
                      </div>
                      <button
                        type="button"
                        className="cursor-pointer rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                      >
                        Ver producto
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section
              id="destacados"
              className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
                    Productos destacados
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    Catalogo visual para pedidos online
                  </h2>
                </div>
                <button
                  type="button"
                  className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  Ver todos
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                {featuredProducts.map((product) => (
                  <article
                    key={product.name}
                    className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full bg-[#fff4c6] px-3 py-1 text-xs font-semibold text-[#8a6a00]">
                        Destacado
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {product.category}
                      </span>
                    </div>

                    <div className="mt-5 rounded-[1.3rem] bg-slate-100 p-5">
                      <div className="flex h-28 items-center justify-center rounded-[1rem] border border-white/80 bg-white">
                        <span className="text-sm font-semibold text-slate-400">Vista previa</span>
                      </div>
                    </div>

                    <h3 className="mt-5 text-lg font-semibold tracking-tight">{product.name}</h3>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{product.price}</p>

                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        className="flex-1 cursor-pointer rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Pedir
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Ver
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
