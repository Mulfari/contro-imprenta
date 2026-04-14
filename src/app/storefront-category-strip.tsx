"use client";

const promos = [
  {
    title: "Tarjetas premium",
    text: "Acabados elegantes para negocios, marcas y equipos.",
    cta: "Ver tarjetas",
    tint: "from-sky-100 via-white to-cyan-50",
    accent: "bg-sky-400",
    art: "cards",
  },
  {
    title: "Stickers para packaging",
    text: "Etiquetas adhesivas personalizadas para destacar tu producto.",
    cta: "Ver stickers",
    tint: "from-amber-100 via-white to-yellow-50",
    accent: "bg-amber-400",
    art: "stickers",
  },
  {
    title: "Pendones express",
    text: "Piezas de gran formato para tienda, evento o promocion.",
    cta: "Ver pendones",
    tint: "from-violet-100 via-white to-fuchsia-50",
    accent: "bg-violet-400",
    art: "banner",
  },
];

function PromoArt({ art, accent }: { art: string; accent: string }) {
  if (art === "stickers") {
    return (
      <div className="relative h-28 w-32">
        <div className={`absolute left-3 top-9 h-11 w-11 rounded-[1rem] ${accent} opacity-80`} />
        <div className="absolute left-14 top-3 h-12 w-12 rounded-full bg-white shadow-sm" />
        <div className="absolute right-2 bottom-4 h-8 w-12 rounded-full bg-cyan-300 shadow-sm" />
      </div>
    );
  }

  if (art === "banner") {
    return (
      <div className="relative h-28 w-32">
        <div className="absolute left-10 top-2 h-24 w-2 rounded-full bg-slate-400" />
        <div className={`absolute left-12 top-10 h-13 w-11 rounded-r-[1rem] rounded-tl-[0.3rem] rounded-bl-[0.3rem] ${accent} opacity-85 shadow-sm`} />
      </div>
    );
  }

  return (
    <div className="relative h-28 w-32">
      <div className="absolute left-8 top-9 h-15 w-12 rotate-[-14deg] rounded-[1rem] border border-slate-300 bg-white shadow-sm" />
      <div className="absolute left-16 top-4 h-15 w-12 rotate-[8deg] rounded-[1rem] border border-slate-300 bg-white/92 shadow-sm" />
      <div className={`absolute left-18 top-15 h-3 w-12 rounded-full ${accent} opacity-55`} />
    </div>
  );
}

export function StorefrontCategoryStrip() {
  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 pb-6 sm:px-6 lg:px-8 2xl:px-10">
      <div className="grid gap-4 lg:grid-cols-3">
        {promos.map((promo) => (
          <button
            key={promo.title}
            type="button"
            className="cursor-pointer overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white text-left shadow-[0_18px_40px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_48px_rgba(15,23,42,0.08)]"
          >
            <div className={`flex items-center justify-between gap-4 bg-gradient-to-br ${promo.tint} px-5 py-5`}>
              <div className="max-w-[15rem]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Promocion
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {promo.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{promo.text}</p>
                <span className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">
                  {promo.cta}
                </span>
              </div>

              <PromoArt art={promo.art} accent={promo.accent} />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
