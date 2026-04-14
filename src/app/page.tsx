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

const heroCategories = [
  "Tarjetas",
  "Volantes",
  "Pendones",
  "Etiquetas",
  "Stickers",
  "Facturas",
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

const valueCards = [
  {
    title: "Compra por categoria",
    text: "Organiza la tienda por lineas de impresion para que el cliente llegue rapido al producto.",
  },
  {
    title: "Pedido online",
    text: "El cliente puede escoger un producto, detallar su necesidad y enviar el pedido desde la web.",
  },
  {
    title: "Control interno",
    text: "Cada solicitud puede entrar al panel administrativo para produccion, cobro y entrega.",
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
            <section className="grid gap-6 2xl:grid-cols-[1.28fr_0.72fr]">
              <article className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#11243d_0%,#1f4e79_48%,#2d6ea4_100%)] p-7 text-white shadow-[0_28px_70px_rgba(15,23,42,0.24)]">
                <p className="text-xs uppercase tracking-[0.34em] text-sky-100/75">
                  Buscar impresiones
                </p>
                <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  Escoge el producto ideal para tu marca, negocio o evento.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-100/88">
                  Esta web sera la tienda online de Express Printer para recibir
                  pedidos, cotizaciones y solicitudes de impresion desde internet.
                </p>

                <div className="mt-7 rounded-[1.6rem] bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-white">Buscar por producto</p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <select className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none">
                      <option className="text-slate-900">Selecciona categoria</option>
                      {heroCategories.map((item) => (
                        <option key={item} className="text-slate-900">
                          {item}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Describe lo que necesitas"
                      className="flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-200/70"
                    />
                    <button
                      type="button"
                      className="cursor-pointer rounded-xl bg-[#ffcf33] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#f5c61f]"
                    >
                      Buscar
                    </button>
                  </div>
                </div>

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
              </article>

              <div className="grid gap-4">
                {valueCards.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]"
                  >
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                  </article>
                ))}
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
