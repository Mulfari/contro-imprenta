"use client";

import Image from "next/image";

const businessBenefits = [
  "Precios preferenciales para compras recurrentes",
  "Produccion por volumen para sedes, marcas y eventos",
  "Asesoria en materiales, formatos y acabados",
  "Atencion prioritaria para pedidos corporativos",
];

export function StorefrontBusinessSection() {
  return (
    <section id="empresas" className="w-full scroll-mt-6 bg-white">
      <div className="mx-auto grid w-full max-w-[104rem] gap-6 px-4 py-9 sm:px-5 sm:py-14 lg:grid-cols-[1.02fr_0.98fr] lg:px-6">
        <div className="relative min-h-[24rem] overflow-hidden rounded-[1.45rem] border border-slate-200 bg-[linear-gradient(140deg,#f8fafc_0%,#eef4ff_54%,#fff4cf_100%)] sm:min-h-[25rem] sm:rounded-[1.8rem]">
          <div className="absolute inset-y-0 left-0 w-[72%] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.82),transparent_48%)]" />
          <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[#fbbf24]/18 blur-3xl" />

          <div className="absolute left-5 top-5 max-w-[14rem] text-slate-950 sm:left-7 sm:top-7 sm:max-w-[15rem]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Soluciones B2B
            </p>
            <h3 className="mt-3 text-[1.5rem] font-black leading-tight tracking-tight sm:mt-4 sm:text-[2.2rem]">
              Impresion para empresas y marcas
            </h3>
            <p className="mt-3 text-xs leading-6 text-slate-600 sm:mt-4 sm:text-sm sm:leading-7">
              Material corporativo, piezas publicitarias y produccion continua para equipos comerciales.
            </p>
          </div>

          <div className="absolute inset-x-8 bottom-7 h-14 rounded-full bg-slate-900/12 blur-2xl sm:inset-x-16 sm:bottom-10" />
          <Image
            src="/storefront-promo-banners-posters-transparent.webp"
            alt="Pendones y afiches para empresas"
            width={920}
            height={885}
            sizes="(min-width: 1024px) 42vw, 84vw"
            className="absolute bottom-[-6rem] right-[-4rem] h-auto w-[17rem] max-w-none drop-shadow-[0_28px_42px_rgba(15,23,42,0.18)] sm:bottom-[-0.75rem] sm:right-[-1.5rem] sm:w-[27rem] lg:right-[-2rem] lg:w-[29rem] xl:right-2 xl:w-[31rem]"
          />

          <div className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-950 backdrop-blur-sm sm:right-10 sm:top-8 sm:h-14 sm:w-14">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3 5 6v6c0 4.2 2.9 7.9 7 9 4.1-1.1 7-4.8 7-9V6Z" />
              <path d="M9 12.5 11 14.5l4-4" />
            </svg>
          </div>

          <div className="absolute bottom-5 right-5 rounded-[1rem] border border-white/70 bg-white/78 px-3 py-2.5 backdrop-blur-sm sm:bottom-8 sm:right-8 sm:rounded-[1.2rem] sm:px-4 sm:py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Corporativo
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-950">
              Produccion por volumen
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center px-0 py-1 sm:px-2 sm:py-2 lg:px-4">
          <h2 className="text-[1.65rem] font-semibold tracking-tight text-slate-950 sm:text-[2.25rem]">
            ¿Buscas impresion para tu empresa?
          </h2>
          <p className="mt-3 max-w-[34rem] text-sm leading-7 text-slate-600 sm:mt-4 sm:text-[1.02rem] sm:leading-8">
            Trabajamos con negocios, marcas, equipos comerciales y organizadores de eventos que necesitan produccion constante y buena presentacion.
          </p>

          <div className="mt-6 space-y-3">
            {businessBenefits.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3558ff] text-white">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 4 4 10-10" />
                  </svg>
                </span>
                <p className="text-[1rem] leading-7 text-slate-700">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
            <button
              type="button"
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#fbbf24] px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-[#f5b116] sm:w-fit sm:px-6"
            >
              Solicitar atencion empresarial
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
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
            <p className="text-sm font-medium text-slate-500">
              Respuesta para cuentas empresariales
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
