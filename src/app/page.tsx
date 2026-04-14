import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";

const categories = [
  "Tarjetas",
  "Volantes",
  "Pendones",
  "Stickers",
  "Etiquetas",
  "Lonas",
  "Facturas",
  "Papeleria",
];

const categoryGroups = [
  {
    title: "Compra por categoria",
    items: ["Tarjetas de presentacion", "Volantes y flyers", "Stickers", "Papeleria"],
  },
  {
    title: "Negocio y marca",
    items: ["Etiquetas", "Empaques impresos", "Facturas", "Sobres"],
  },
  {
    title: "Gran formato",
    items: ["Pendones", "Banners", "Vinil", "Avisos"],
  },
];

const featuredProducts = [
  {
    name: "Tarjetas de presentacion premium",
    category: "Tarjetas",
    price: "Desde $18",
    badge: "Mas vendido",
    description: "Acabado mate o brillante para marcas, emprendedores y negocios.",
  },
  {
    name: "Volantes promocionales",
    category: "Publicidad",
    price: "Desde $25",
    badge: "Entrega hoy",
    description: "Ideal para promociones, aperturas, eventos y campañas locales.",
  },
  {
    name: "Stickers personalizados",
    category: "Etiquetas",
    price: "Desde $14",
    badge: "Corte especial",
    description: "Perfectos para empaques, branding de producto y promociones.",
  },
  {
    name: "Pendones publicitarios",
    category: "Gran formato",
    price: "Desde $35",
    badge: "Express",
    description: "Produccion para tiendas, ferias, activaciones y exhibiciones.",
  },
  {
    name: 'Facturas y talonarios',
    category: "Papeleria",
    price: "Desde $22",
    badge: "Corporativo",
    description: "Formatos impresos para control administrativo y ventas diarias.",
  },
  {
    name: "Etiquetas para productos",
    category: "Etiquetas",
    price: "Desde $16",
    badge: "Branding",
    description: "Presentacion profesional para envases, frascos, bolsas y cajas.",
  },
];

const promoBlocks = [
  {
    title: "Impresion para marcas",
    description: "Papeleria, etiquetas, facturas y materiales listos para vender mejor.",
  },
  {
    title: "Pedidos online",
    description: "La web puede convertirse en el canal para tomar solicitudes y producirlas.",
  },
  {
    title: "Atencion rapida",
    description: "Cotizacion, produccion y seguimiento conectados al panel interno.",
  },
];

const trustPoints = [
  "Catalogo digital de productos impresos",
  "Solicitud de pedido desde la web",
  "Seguimiento interno desde el panel administrativo",
  "Base lista para evolucionar a ecommerce funcional",
];

export default async function Home() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <div className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>Bienvenido a Express Printer. Impresion comercial, publicitaria y corporativa.</p>
          <div className="flex items-center gap-4 text-slate-300">
            <a href="#catalogo" className="hover:text-white">
              Catalogo
            </a>
            <a href="#destacados" className="hover:text-white">
              Destacados
            </a>
            <Link href="/login" className="hover:text-white">
              Panel administrativo
            </Link>
          </div>
        </div>
      </div>

      <header className="border-b border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(135deg,#0f172a_0%,#0f4d87_100%)] text-lg font-semibold text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)]">
                EP
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-700">
                  Express Printer
                </p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                  Tienda online de impresion
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 xl:mx-8 xl:max-w-3xl xl:flex-row xl:items-center">
              <div className="flex flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3.5">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar tarjetas, flyers, stickers, pendones..."
                  className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="button"
                className="cursor-pointer rounded-full bg-sky-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-500"
              >
                Buscar
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#catalogo"
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Categorias
              </a>
              <a
                href="#destacados"
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Destacados
              </a>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Panel administrativo
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/80">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 px-5 py-3 sm:px-8 lg:px-10">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className="cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">

        <div className="mt-6 grid gap-6 xl:grid-cols-[290px_1fr]">
          <aside
            id="catalogo"
            className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_22px_55px_rgba(15,23,42,0.05)]"
          >
            {categoryGroups.map((group) => (
              <div key={group.title} className="border-b border-slate-100 py-4 last:border-b-0">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {group.title}
                </h2>
                <div className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="block cursor-pointer text-left text-sm font-medium text-slate-700 transition hover:text-sky-700"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          <div className="grid gap-6">
            <section className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
              <article className="overflow-hidden rounded-[2.2rem] bg-[linear-gradient(135deg,#07111f_0%,#0d2744_45%,#1172c9_100%)] p-7 text-white shadow-[0_30px_80px_rgba(8,18,38,0.28)]">
                <p className="text-xs uppercase tracking-[0.34em] text-sky-200/80">
                  Ecommerce para imprenta
                </p>
                <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  Diseña, cotiza y pide tus impresiones desde una sola web.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200/88">
                  Esta portada puede funcionar como tienda online para que tus
                  clientes exploren productos, elijan formatos y hagan pedidos
                  que luego entren al panel administrativo.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="cursor-pointer rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Comprar ahora
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
                  >
                    Solicitar cotizacion
                  </button>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {promoBlocks.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[1.4rem] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm"
                    >
                      <h3 className="text-base font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-200/84">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-[0_22px_55px_rgba(15,23,42,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-700">
                  Proceso de compra
                </p>
                <div className="mt-5 space-y-4">
                  {[
                    {
                      step: "01",
                      title: "Escoge un producto",
                      description: "Selecciona la categoria y el tipo de impresion que necesitas.",
                    },
                    {
                      step: "02",
                      title: "Personaliza tu pedido",
                      description: "Cantidad, tamaño, material, acabados y comentarios para produccion.",
                    },
                    {
                      step: "03",
                      title: "Confirma y espera respuesta",
                      description: "El pedido entra al sistema para cotizacion, seguimiento y entrega.",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
                        {item.step}
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section
              id="destacados"
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_22px_55px_rgba(15,23,42,0.05)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-700">
                    Productos destacados
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    Catalogo visual para pedidos online
                  </h2>
                </div>
                <button
                  type="button"
                  className="cursor-pointer rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  Ver todos
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {featuredProducts.map((product) => (
                  <article
                    key={product.name}
                    className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(247,249,252,1))] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        {product.badge}
                      </span>
                      <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                        {product.category}
                      </span>
                    </div>

                    <div className="mt-5 rounded-[1.4rem] bg-[linear-gradient(135deg,#dbeafe_0%,#eff6ff_46%,#f8fafc_100%)] p-5">
                      <div className="flex h-28 items-end justify-between">
                        <div className="space-y-2">
                          <div className="h-3 w-24 rounded-full bg-sky-200" />
                          <div className="h-3 w-16 rounded-full bg-sky-100" />
                        </div>
                        <div className="h-16 w-16 rounded-[1.2rem] border border-white/60 bg-white/80 shadow-sm" />
                      </div>
                    </div>

                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {product.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-lg font-semibold text-slate-950">{product.price}</p>
                      <button
                        type="button"
                        className="cursor-pointer rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Pedir
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_22px_55px_rgba(15,23,42,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-700">
                  Lo que sigue
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Convertir esta portada en ecommerce funcional
                </h2>
                <div className="mt-5 space-y-3">
                  {trustPoints.map((point) => (
                    <div
                      key={point}
                      className="flex items-start gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <span className="mt-1 inline-flex h-5 w-5 shrink-0 rounded-full bg-emerald-100" />
                      <p className="text-sm leading-6 text-slate-700">{point}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[2rem] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-200/80">
                  Panel conectado
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Cada pedido web puede caer directo en tu control interno
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200/85">
                  La idea es que el cliente compre o solicite su impresion desde
                  esta pagina y el equipo la reciba en el dashboard para
                  gestionar cliente, produccion, cobro y entrega.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="cursor-pointer rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Simular pedido
                  </button>
                  <Link
                    href="/login"
                    className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Ir al panel
                  </Link>
                </div>
              </article>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
