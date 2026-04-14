"use client";

const deals = [
  {
    title: "Tarjetas ejecutivas",
    price: "$16",
    previousPrice: "$19",
    category: "Tarjetas",
    discount: "-$3",
    tint: "from-[#fff7d6] via-white to-[#fff2b3]",
  },
  {
    title: "Stickers troquelados",
    price: "$19",
    previousPrice: "$23",
    category: "Etiquetas",
    discount: "-$4",
    tint: "from-[#dff3ff] via-white to-[#cae8ff]",
  },
];

function DealArt({ tint }: { tint: string }) {
  return (
    <div className={`relative h-[18.8rem] rounded-[1.4rem] bg-gradient-to-br ${tint} p-4`}>
      <div className="absolute left-5 top-16 h-28 w-20 -rotate-[12deg] rounded-[1.4rem] bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)]" />
      <div className="absolute left-20 top-24 h-28 w-20 rotate-[10deg] rounded-[1.4rem] bg-slate-950 shadow-[0_20px_40px_rgba(15,23,42,0.12)]" />
      <div className="absolute left-12 top-10 h-7 w-16 rounded-full bg-[#facc15]" />
      <div className="absolute left-11 top-19 h-2.5 w-14 rounded-full bg-slate-200" />
      <div className="absolute left-11 top-24 h-2.5 w-11 rounded-full bg-slate-200" />
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
                className="grid gap-4 border-r border-slate-200 last:border-r-0 lg:grid-cols-[300px_1fr] lg:pr-6 last:lg:pr-0"
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
                  <p className="mt-3 text-base font-medium text-slate-400">
                    {deal.category}
                  </p>
                  <div className="mt-5 flex gap-1 text-slate-300">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[1.8rem] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <div className="flex justify-end">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#facc15] via-[#38bdf8] to-[#fb7185]" />
          </div>
          <p className="mt-4 text-center text-[1.05rem] font-semibold text-[#3558ff]">
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
