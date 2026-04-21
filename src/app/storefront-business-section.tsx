"use client";

const businessBenefits = [
  "Precios preferenciales para compras recurrentes",
  "Produccion por volumen para sedes, marcas y eventos",
  "Asesoria en materiales, formatos y acabados",
  "Atencion prioritaria para pedidos corporativos",
];

export function StorefrontBusinessSection() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto grid w-full max-w-[104rem] gap-6 px-4 py-9 sm:px-5 sm:py-14 lg:grid-cols-[1.02fr_0.98fr] lg:px-6">
        <div className="relative min-h-[19rem] overflow-hidden rounded-[1.45rem] border border-slate-200 bg-[linear-gradient(140deg,#f8fafc_0%,#eef4ff_54%,#fff4cf_100%)] sm:min-h-[25rem] sm:rounded-[1.8rem]">
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

          <div className="absolute bottom-6 left-8 h-40 w-32 rotate-[-8deg] rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_20px_34px_rgba(15,23,42,0.12)] sm:bottom-7 sm:left-10 sm:h-56 sm:w-44 sm:rounded-[1.9rem] sm:shadow-[0_26px_42px_rgba(15,23,42,0.14)]">
            <div className="h-full w-full rounded-[1.9rem] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5">
              <div className="h-4 w-20 rounded-full bg-[#3558ff]" />
              <div className="mt-5 space-y-2">
                <div className="h-3 w-24 rounded-full bg-slate-200" />
                <div className="h-3 w-20 rounded-full bg-slate-200" />
                <div className="h-20 rounded-[1.2rem] bg-[#eff6ff]" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="h-10 rounded-xl bg-slate-100" />
                <div className="h-10 rounded-xl bg-slate-100" />
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 left-28 h-30 w-24 rotate-[8deg] rounded-[1.2rem] border border-slate-200 bg-white shadow-[0_18px_28px_rgba(15,23,42,0.1)] sm:bottom-12 sm:left-36 sm:h-40 sm:w-32 sm:rounded-[1.6rem] sm:shadow-[0_22px_34px_rgba(15,23,42,0.12)]">
            <div className="p-4">
              <div className="h-3 w-16 rounded-full bg-[#fbbf24]" />
              <div className="mt-4 h-16 rounded-[1rem] bg-[#e0ecff]" />
              <div className="mt-4 h-3 w-20 rounded-full bg-slate-200" />
              <div className="mt-2 h-3 w-14 rounded-full bg-slate-200" />
            </div>
          </div>

          <div className="absolute bottom-14 left-46 h-24 w-18 rotate-[-4deg] rounded-[1.1rem] bg-[#0f172a] shadow-[0_18px_28px_rgba(15,23,42,0.16)] sm:bottom-16 sm:left-56 sm:h-32 sm:w-24 sm:rounded-[1.35rem] sm:shadow-[0_20px_34px_rgba(15,23,42,0.18)]">
            <div className="p-4">
              <div className="h-2.5 w-10 rounded-full bg-white/70" />
              <div className="mt-4 h-14 rounded-[0.9rem] bg-white/10" />
            </div>
          </div>

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
