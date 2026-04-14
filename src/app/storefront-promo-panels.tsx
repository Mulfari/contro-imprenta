"use client";

function PromoPrintArt({ kind }: { kind: "cards" | "stickers" | "large-format" | "receipts" }) {
  if (kind === "cards") {
    return (
      <div className="relative h-full min-h-[20rem] w-full">
        <div className="absolute right-4 top-0 h-24 w-44 rotate-[-18deg] rounded-full bg-white/18 blur-2xl transition duration-500 group-hover:translate-x-2 group-hover:-translate-y-2" />
        <div className="absolute right-20 top-2 h-64 w-44 rotate-[7deg] rounded-[2rem] bg-white shadow-[0_32px_60px_rgba(15,23,42,0.18)] transition duration-500 group-hover:translate-y-2 group-hover:rotate-[10deg]" />
        <div className="absolute right-38 top-18 h-60 w-40 rotate-[-9deg] rounded-[2rem] bg-[#111827] shadow-[0_32px_60px_rgba(15,23,42,0.18)] transition duration-500 group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:rotate-[-12deg]" />
        <div className="absolute right-28 top-14 h-10 w-24 rounded-full bg-[#facc15] transition duration-500 group-hover:translate-y-1" />
        <div className="absolute right-24 top-26 h-4 w-28 rounded-full bg-slate-200 transition duration-500 group-hover:translate-x-1" />
        <div className="absolute right-28 top-34 h-4 w-18 rounded-full bg-slate-200 transition duration-500 group-hover:translate-x-1" />
        <div className="absolute right-44 top-28 h-14 w-14 rounded-full bg-[#38bdf8] transition duration-500 group-hover:-translate-y-1 group-hover:scale-105" />
      </div>
    );
  }

  if (kind === "stickers") {
    return (
      <div className="relative h-full min-h-[20rem] w-full">
        <div className="absolute right-8 top-4 h-24 w-40 rotate-[18deg] rounded-full bg-white/16 blur-2xl transition duration-500 group-hover:translate-x-2" />
        <div className="absolute right-12 top-10 h-28 w-28 rounded-[2rem] bg-white shadow-[0_28px_50px_rgba(15,23,42,0.18)] transition duration-500 group-hover:-translate-y-2 group-hover:rotate-[5deg]" />
        <div className="absolute right-34 top-20 h-32 w-32 rounded-full bg-[#facc15] shadow-[0_28px_50px_rgba(15,23,42,0.16)] transition duration-500 group-hover:translate-y-2 group-hover:scale-105" />
        <div className="absolute right-20 top-40 h-26 w-26 rounded-[1.8rem] bg-[#fb7185] shadow-[0_28px_50px_rgba(15,23,42,0.16)] transition duration-500 group-hover:-translate-x-2 group-hover:-translate-y-2" />
        <div className="absolute right-48 top-44 h-24 w-24 rounded-full bg-[#67e8f9] shadow-[0_28px_50px_rgba(15,23,42,0.16)] transition duration-500 group-hover:translate-y-2" />
        <div className="absolute right-24 top-24 h-8 w-18 rounded-full bg-slate-900/10 transition duration-500 group-hover:scale-110" />
      </div>
    );
  }

  if (kind === "receipts") {
    return (
      <div className="relative h-full min-h-[12rem]">
        <div className="absolute right-4 top-8 h-18 w-30 rounded-full bg-[#f8fafc] blur-xl transition duration-500 group-hover:translate-x-2" />
        <div className="absolute right-10 top-3 h-36 w-24 rotate-[5deg] rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_22px_44px_rgba(15,23,42,0.12)] transition duration-500 group-hover:-translate-y-2 group-hover:rotate-[8deg]" />
        <div className="absolute right-24 top-9 h-34 w-22 rotate-[-8deg] rounded-[1.4rem] bg-slate-950 shadow-[0_22px_44px_rgba(15,23,42,0.12)] transition duration-500 group-hover:translate-x-2 group-hover:translate-y-2" />
        <div className="absolute right-16 top-14 h-3 w-16 rounded-full bg-slate-200 transition duration-500 group-hover:translate-x-1" />
        <div className="absolute right-15 top-20 h-3 w-12 rounded-full bg-slate-200 transition duration-500 group-hover:translate-x-1" />
        <div className="absolute right-26 top-18 h-9 w-9 rounded-full bg-[#facc15] transition duration-500 group-hover:scale-110" />
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[20rem] w-full">
      <div className="absolute right-6 top-6 h-28 w-44 rotate-[12deg] rounded-full bg-white/10 blur-2xl transition duration-500 group-hover:translate-x-2" />
      <div className="absolute right-12 top-8 h-72 w-8 rounded-full bg-slate-200/90 transition duration-500 group-hover:translate-y-2" />
      <div className="absolute right-20 top-16 h-56 w-36 rounded-[2rem] bg-white shadow-[0_30px_55px_rgba(15,23,42,0.18)] transition duration-500 group-hover:-translate-y-2 group-hover:rotate-[4deg]" />
      <div className="absolute right-24 top-24 h-40 w-28 rounded-[1.4rem] bg-[#111827] transition duration-500 group-hover:translate-x-2 group-hover:translate-y-2" />
      <div className="absolute right-34 top-36 h-12 w-12 rounded-full bg-[#facc15] transition duration-500 group-hover:scale-110" />
      <div className="absolute right-44 top-16 h-48 w-4 rounded-full bg-slate-300 transition duration-500 group-hover:-translate-y-2" />
      <div className="absolute right-40 top-8 h-8 w-12 rounded-full bg-[#38bdf8] transition duration-500 group-hover:translate-x-1" />
    </div>
  );
}

export function StorefrontPromoPanels() {
  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 pb-10 sm:px-6 lg:px-8 2xl:px-10">
      <div className="grid gap-4 xl:grid-cols-[1.05fr_1.25fr_1fr]">
        <article className="group overflow-hidden rounded-[2rem] bg-[#facc15]">
          <div className="grid h-full gap-6 p-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900/70">
                  Presentacion profesional
                </p>
                <h2 className="mt-4 text-4xl font-black leading-none tracking-tight text-slate-950 xl:text-[3.3rem]">
                  Tarjetas
                  <br />
                  Premium
                </h2>
                <p className="mt-4 max-w-xs text-base font-medium text-slate-900/80">
                  Acabados limpios, colores vivos y opciones para marcas que quieren destacar.
                </p>
              </div>

              <button
                type="button"
                className="mt-8 inline-flex w-fit cursor-pointer items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
              >
                Ver producto
                <span aria-hidden="true">›</span>
              </button>
            </div>

            <PromoPrintArt kind="cards" />
          </div>
        </article>

        <article className="group overflow-hidden rounded-[2rem] bg-[#3b5bfd]">
          <div className="grid h-full gap-6 p-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-between text-white">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                  Personaliza tu marca
                </p>
                <h2 className="mt-4 text-4xl font-black leading-none tracking-tight xl:text-[3.3rem]">
                  Stickers y
                  <br />
                  Etiquetas
                </h2>
                <p className="mt-4 max-w-xs text-base font-medium text-white/78">
                  Perfectos para packaging, promociones, frascos, bolsas y productos personalizados.
                </p>
              </div>

              <button
                type="button"
                className="mt-8 inline-flex w-fit cursor-pointer items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Ver producto
                <span aria-hidden="true">›</span>
              </button>
            </div>

            <PromoPrintArt kind="stickers" />
          </div>
        </article>

        <div className="grid gap-4">
          <article className="group overflow-hidden rounded-[2rem] bg-[#101010] text-white">
            <div className="grid min-h-[14.25rem] gap-6 p-8 lg:grid-cols-[1fr_0.95fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/62">
                  Gran formato
                </p>
                <h2 className="mt-3 text-3xl font-black leading-none tracking-tight">
                  Pendones,
                  <br />
                  afiches
                </h2>
                <p className="mt-4 text-base font-medium text-white/72">
                  Piezas grandes para vitrinas, eventos y puntos de venta.
                </p>
              </div>
              <PromoPrintArt kind="large-format" />
            </div>
          </article>

          <article className="group overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <div className="grid min-h-[14.25rem] gap-6 p-8 lg:grid-cols-[1fr_0.92fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Entrega express
                </p>
                <h3 className="mt-3 text-3xl font-black leading-none tracking-tight text-slate-950">
                  Talonarios,
                  <br />
                  facturas y recibos
                </h3>
                <p className="mt-4 max-w-sm text-base font-medium text-slate-600">
                  Produccion rapida para operaciones diarias, negocios y puntos de caja.
                </p>
              </div>

              <PromoPrintArt kind="receipts" />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
