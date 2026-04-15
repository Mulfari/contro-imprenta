"use client";

const businessBenefits = [
  "Precios preferenciales para compras recurrentes",
  "Produccion por volumen para sedes, marcas y eventos",
  "Asesoria en materiales, formatos y acabados",
  "Atencion prioritaria para pedidos corporativos",
];

export function StorefrontBusinessSection() {
  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 py-14 sm:px-6 lg:px-8 2xl:px-10">
      <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.04)] lg:grid-cols-[1.05fr_0.95fr] lg:p-6">
        <div className="relative overflow-hidden rounded-[1.8rem] bg-[linear-gradient(135deg,#111827_0%,#1f2937_55%,#fbbf24_55%,#fbbf24_100%)] min-h-[24rem]">
          <div className="absolute inset-y-0 left-0 w-[74%] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_48%)]" />
          <div className="absolute bottom-0 left-0 h-28 w-full bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]" />

          <div className="absolute left-7 top-7 max-w-[15rem] text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">
              Soluciones B2B
            </p>
            <h3 className="mt-4 text-[2.2rem] font-black leading-tight tracking-tight">
              Impresion para empresas y marcas
            </h3>
            <p className="mt-4 text-sm leading-7 text-white/78">
              Material corporativo, piezas publicitarias y produccion continua para equipos comerciales.
            </p>
          </div>

          <div className="absolute bottom-0 left-0 h-[74%] w-[68%] bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]" />
          <div className="absolute bottom-6 left-10 h-52 w-40 rotate-[-8deg] rounded-[1.8rem] bg-white shadow-[0_30px_50px_rgba(15,23,42,0.28)]" />
          <div className="absolute bottom-10 left-28 h-44 w-32 rotate-[8deg] rounded-[1.5rem] bg-[#e0ecff] shadow-[0_24px_40px_rgba(15,23,42,0.18)]" />
          <div className="absolute bottom-18 left-48 h-36 w-28 rotate-[-4deg] rounded-[1.35rem] bg-[#0f172a] shadow-[0_22px_40px_rgba(15,23,42,0.24)]" />
          <div className="absolute right-10 top-8 flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white/20 text-slate-950 backdrop-blur-sm">
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
        </div>

        <div className="flex flex-col justify-center px-2 py-2 lg:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            Empresas
          </p>
          <h2 className="mt-4 text-[2.25rem] font-semibold tracking-tight text-slate-950">
            ¿Buscas impresion para tu empresa?
          </h2>
          <p className="mt-4 max-w-[34rem] text-[1.02rem] leading-8 text-slate-600">
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

          <button
            type="button"
            className="mt-8 inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-[#fbbf24] px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-[#f5b116]"
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
        </div>
      </div>
    </section>
  );
}
