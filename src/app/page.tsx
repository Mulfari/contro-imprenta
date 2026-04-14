import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";

const featuredProducts = [
  {
    name: "Tarjetas de presentacion",
    description:
      "Acabados premium para marcas personales, emprendimientos y negocios.",
    price: "Desde $18",
    delivery: "Entrega en 24-48h",
  },
  {
    name: "Volantes y flyers",
    description:
      "Material publicitario de alto impacto para promociones, eventos y campañas.",
    price: "Desde $25",
    delivery: "Listos el mismo dia",
  },
  {
    name: "Stickers y etiquetas",
    description:
      "Corte personalizado para empaques, branding de productos y promociones.",
    price: "Desde $14",
    delivery: "Produccion express",
  },
  {
    name: "Pendones y banners",
    description:
      "Formatos grandes para tiendas, ferias, exhibiciones y puntos de venta.",
    price: "Desde $35",
    delivery: "Montaje opcional",
  },
];

const categories = [
  "Papeleria corporativa",
  "Material promocional",
  "Etiquetas y empaques",
  "Gran formato",
];

const highlights = [
  {
    title: "Cotiza rapido",
    description:
      "El cliente elige producto, comparte detalles y recibe confirmacion del pedido.",
  },
  {
    title: "Produccion organizada",
    description:
      "Cada pedido queda conectado con el panel administrativo para seguimiento interno.",
  },
  {
    title: "Entrega mas clara",
    description:
      "Pedidos, datos del cliente y estado del trabajo quedan centralizados en un solo flujo.",
  },
];

const steps = [
  {
    step: "01",
    title: "Escoge lo que necesitas",
    description:
      "Explora productos, formatos y tipos de impresion segun tu necesidad.",
  },
  {
    step: "02",
    title: "Personaliza el pedido",
    description:
      "Indica cantidades, medidas, materiales, acabados y comentarios para produccion.",
  },
  {
    step: "03",
    title: "Confirma y recibe seguimiento",
    description:
      "Tu solicitud entra al sistema de la imprenta para cotizacion, produccion y entrega.",
  },
];

export default async function Home() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(240,244,248,0.94)_34%,_rgba(224,232,240,0.98)_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-white/70 bg-white/72 px-6 py-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-700">
              Express Printer
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Ecommerce de impresion y papeleria personalizada
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="#catalogo"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Ver catalogo
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Panel administrativo
            </Link>
          </div>
        </header>

        <section className="grid flex-1 gap-8 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-10">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-3 rounded-full border border-sky-200 bg-white/78 px-4 py-2 text-sm text-slate-700 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Pedidos online conectados con el sistema interno de la imprenta
            </div>

            <div className="space-y-5">
              <h2 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                Diseña, cotiza y pide tus impresiones sin salir de la web.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                La tienda de Express Printer funcionará como ecommerce para que
                tus clientes exploren productos, soliciten impresiones y dejen
                pedidos online mientras el equipo los gestiona desde el panel
                administrativo.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="#pedido-online"
                className="rounded-full bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-500"
              >
                Hacer pedido online
              </Link>
              <Link
                href="#servicios"
                className="rounded-full border border-slate-200 bg-white/85 px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-white"
              >
                Ver servicios
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.75rem] border border-white/70 bg-white/78 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-md"
                >
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-[linear-gradient(160deg,#07111f_0%,#0f2340_44%,#1a4e87_100%)] p-7 text-white shadow-[0_30px_90px_rgba(8,15,33,0.28)]">
            <div className="absolute inset-x-6 top-6 h-32 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-sky-200/80">
                    Tienda online
                  </p>
                  <h3 className="mt-2 text-3xl font-semibold">Compra en pocos pasos</h3>
                </div>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-sky-100">
                  Ecommerce
                </span>
              </div>

              <div className="mt-7 grid gap-4">
                {steps.map((item) => (
                  <div
                    key={item.step}
                    className="rounded-[1.6rem] border border-white/10 bg-white/8 px-5 py-5 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-semibold text-sky-100">
                        {item.step}
                      </span>
                      <div>
                        <h4 className="text-lg font-semibold">{item.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-200/88">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-[1.7rem] border border-sky-300/18 bg-white/10 p-5">
                <p className="text-sm font-semibold text-sky-100">
                  Ideal para ventas por redes, WhatsApp y trafico organico.
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200/88">
                  La web puede captar pedidos y enviarlos directamente al flujo
                  interno del negocio para produccion, entrega y seguimiento.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section
          id="servicios"
          className="grid gap-6 rounded-[2.25rem] border border-white/70 bg-white/76 px-6 py-7 shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur-md lg:grid-cols-[0.86fr_1.14fr]"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-700">
              Servicios destacados
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight">
              Productos listos para vender online
            </h3>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              La tienda puede organizar la experiencia por categorias para que
              el cliente encuentre rapido lo que necesita y complete su pedido
              desde el primer contacto.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div
            id="catalogo"
            className="grid gap-4 sm:grid-cols-2"
          >
            {featuredProducts.map((product) => (
              <article
                key={product.name}
                className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-xl font-semibold tracking-tight">{product.name}</h4>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                    {product.delivery}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {product.description}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-lg font-semibold text-slate-950">{product.price}</p>
                  <button
                    type="button"
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Personalizar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="pedido-online"
          className="mt-8 grid gap-6 rounded-[2.25rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,247,255,0.96))] px-6 py-7 shadow-[0_24px_70px_rgba(15,23,42,0.06)] lg:grid-cols-[0.88fr_1.12fr]"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-700">
              Pedido online
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight">
              Base visual para convertir la portada en ecommerce
            </h3>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Este sería el frente comercial del negocio. El siguiente paso es
              conectar este flujo a productos reales, detalle del pedido,
              cantidades, acabados y un formulario de compra o cotizacion.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Lo que puede venir
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li>Catalogo por productos y categorias</li>
                <li>Formulario de pedido con especificaciones</li>
                <li>Subida de artes o referencias visuales</li>
                <li>Resumen del pedido y seguimiento</li>
              </ul>
            </div>

            <div className="rounded-[1.7rem] border border-slate-200 bg-slate-950 p-5 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">
                Integracion con el panel
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-200/88">
                Cada pedido online puede entrar directo al panel administrativo
                para asignarlo, producirlo, facturarlo y notificar avances.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="cursor-pointer rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Simular compra
                </button>
                <Link
                  href="/login"
                  className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Entrar al panel
                </Link>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
