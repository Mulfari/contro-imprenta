"use client";

const deals = [
  {
    title: "Tarjetas ejecutivas",
    price: "$16",
    previousPrice: "$19",
    category: "Tarjetas",
    discount: "-$3",
    tint: "from-[#fff7d6] via-white to-[#fff2b3]",
    note: "Acabado mate o brillante",
  },
  {
    title: "Stickers troquelados",
    price: "$19",
    previousPrice: "$23",
    category: "Etiquetas",
    discount: "-$4",
    tint: "from-[#dff3ff] via-white to-[#cae8ff]",
    note: "Ideales para packaging",
  },
];

function DealArt({ tint }: { tint: string }) {
  return (
    <div className={`relative h-[18.8rem] overflow-hidden rounded-[1.6rem] bg-gradient-to-br ${tint} p-4`}>
      <div className="absolute left-2 top-0 h-20 w-36 -rotate-[16deg] rounded-full bg-white/45 blur-xl" />
      <div className="absolute right-3 top-4 h-16 w-28 rounded-full bg-white/38 blur-xl" />
      <div className="absolute left-7 top-15 h-30 w-22 -rotate-[12deg] rounded-[1.5rem] bg-white shadow-[0_24px_46px_rgba(15,23,42,0.12)] transition duration-300 group-hover:-translate-y-1 group-hover:rotate-[-9deg]" />
      <div className="absolute left-24 top-23 h-30 w-22 rotate-[10deg] rounded-[1.5rem] bg-slate-950 shadow-[0_24px_46px_rgba(15,23,42,0.14)] transition duration-300 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:rotate-[12deg]" />
      <div className="absolute left-13 top-11 h-7 w-16 rounded-full bg-[#facc15] transition duration-300 group-hover:scale-105" />
      <div className="absolute left-12 top-21 h-2.5 w-14 rounded-full bg-slate-200" />
      <div className="absolute left-12 top-26 h-2.5 w-11 rounded-full bg-slate-200" />
      <div className="absolute right-6 bottom-6 h-24 w-24 rounded-full bg-white/65 blur-2xl" />
    </div>
  );
}

export function StorefrontDealsSection() {
  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 pb-14 sm:px-6 lg:px-8 2xl:px-10">
      <div className="grid gap-6 xl:grid-cols-[1.45fr_420px]">
        <div>
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <h2 className="text-[2rem] font-black tracking-tight text-slate-950">
              Ofertas del mes
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                aria-label="Anterior"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                type="button"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                aria-label="Siguiente"
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {deals.map((deal) => (
              <article
                key={deal.title}
                className="group grid gap-4 border-r border-slate-200 last:border-r-0 lg:grid-cols-[300px_1fr] lg:pr-6 last:lg:pr-0"
              >
                <div className="relative">
                  <span className="absolute left-3 top-3 z-10 rounded-md bg-[#ff5b4d] px-2.5 py-1 text-xs font-bold text-white">
                    {deal.discount}
                  </span>
                  <button
                    type="button"
                    className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/88 text-slate-500 shadow-sm transition hover:text-slate-900"
                    aria-label="Guardar"
                  >
                    ♡
                  </button>
                  <DealArt tint={deal.tint} />
                </div>

                <div className="flex flex-col justify-start pt-1">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <span className="text-slate-300 line-through">{deal.previousPrice}</span>
                    <span className="text-[#3558ff]">{deal.price}</span>
                  </div>
                  <h3 className="mt-3 text-[1.8rem] font-semibold leading-tight tracking-tight text-slate-950">
                    {deal.title}
                  </h3>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {deal.category}
                  </p>
                  <p className="mt-3 max-w-xs text-base leading-7 text-slate-600">
                    {deal.note}
                  </p>
                  <div className="mt-5 flex gap-1 text-slate-300">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                  </div>
                  <div className="mt-5">
                    <button
                      type="button"
                      className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Ver producto
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between gap-4">
            <div className="h-14 w-14 rounded-[1.2rem] bg-gradient-to-br from-[#facc15] via-[#38bdf8] to-[#fb7185]" />
            <div className="h-10 w-10 rounded-full bg-[#111827]" />
          </div>
          <p className="mt-6 text-center text-[1.05rem] font-semibold text-[#3558ff]">
            ¡Suscribete a nuestro boletin!
          </p>
          <h3 className="mx-auto mt-4 max-w-xs text-center text-[2rem] font-black leading-tight tracking-tight text-slate-950">
            Recibe noticias, productos y ofertas destacadas
          </h3>

          <div className="mt-8 space-y-4">
            <input
              type="email"
              placeholder="Tu email"
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-base text-slate-950 outline-none transition focus:border-slate-400"
            />
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#ffd45f] px-5 py-4 text-base font-semibold text-slate-950 transition hover:bg-[#ffcd41]"
            >
              Suscribirme
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-500">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300" />
            <span>He leido y acepto las politicas de privacidad.</span>
          </label>
        </aside>
      </div>
    </section>
  );
}
