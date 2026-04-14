"use client";

const featuredProducts = [
  {
    title: "Tarjetas premium",
    category: "Papeleria comercial",
    price: "Desde $18",
    note: "Mate o brillante",
    tint: "from-sky-100 via-white to-cyan-50",
    badge: "Mas vendido",
    art: "cards",
  },
  {
    title: "Stickers troquelados",
    category: "Etiquetas y stickers",
    price: "Desde $12",
    note: "Personalizados",
    tint: "from-amber-100 via-white to-yellow-50",
    badge: "Top",
    art: "stickers",
  },
  {
    title: "Pendones publicitarios",
    category: "Gran formato",
    price: "Desde $25",
    note: "Alta visibilidad",
    tint: "from-violet-100 via-white to-fuchsia-50",
    badge: "Express",
    art: "banner",
  },
  {
    title: "Talonarios fiscales",
    category: "Papeleria comercial",
    price: "Desde $14",
    note: "Autocopiativos",
    tint: "from-emerald-100 via-white to-teal-50",
    badge: "Negocio",
    art: "invoice",
  },
  {
    title: "Invitaciones",
    category: "Eventos",
    price: "Desde $22",
    note: "Bodas y celebraciones",
    tint: "from-rose-100 via-white to-pink-50",
    badge: "Nuevo",
    art: "invite",
  },
  {
    title: "Etiquetas para packaging",
    category: "Branding",
    price: "Desde $11",
    note: "Rollos y cortes",
    tint: "from-zinc-100 via-white to-slate-50",
    badge: "Marca",
    art: "labels",
  },
];

function ProductArt({ art }: { art: string }) {
  if (art === "stickers") {
    return (
      <div className="relative h-24 w-28">
        <div className="absolute left-3 top-6 h-10 w-10 rounded-[1rem] bg-yellow-300 shadow-sm" />
        <div className="absolute left-12 top-2 h-11 w-11 rounded-full bg-pink-300 shadow-sm" />
        <div className="absolute right-3 bottom-2 h-8 w-12 rounded-full bg-cyan-300 shadow-sm" />
      </div>
    );
  }

  if (art === "banner") {
    return (
      <div className="relative h-24 w-28">
        <div className="absolute left-10 top-1 h-20 w-2 rounded-full bg-slate-400" />
        <div className="absolute left-12 top-8 h-12 w-10 rounded-r-[1rem] rounded-tl-[0.3rem] rounded-bl-[0.3rem] bg-violet-300 shadow-sm" />
      </div>
    );
  }

  if (art === "invoice") {
    return (
      <div className="relative h-24 w-28">
        <div className="absolute left-8 top-4 h-14 w-12 rounded-[1rem] border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-11 top-10 h-1.5 w-7 rounded-full bg-slate-200" />
        <div className="absolute left-11 top-14 h-1.5 w-9 rounded-full bg-slate-200" />
        <div className="absolute left-11 top-18 h-1.5 w-6 rounded-full bg-slate-200" />
      </div>
    );
  }

  if (art === "invite") {
    return (
      <div className="relative h-24 w-28">
        <div className="absolute left-7 top-6 h-12 w-14 rotate-[-8deg] rounded-[1rem] border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-12 top-3 h-12 w-14 rotate-[8deg] rounded-[1rem] border border-slate-300 bg-white/92 shadow-sm" />
        <div className="absolute left-15 top-12 h-3 w-7 rounded-full bg-rose-300" />
      </div>
    );
  }

  if (art === "labels") {
    return (
      <div className="relative grid h-24 w-28 grid-cols-2 gap-2">
        <div className="rounded-xl bg-emerald-300" />
        <div className="rounded-xl bg-cyan-300" />
        <div className="rounded-xl bg-amber-300" />
        <div className="rounded-xl bg-pink-300" />
      </div>
    );
  }

  return (
    <div className="relative h-24 w-28">
      <div className="absolute left-6 top-7 h-13 w-12 rotate-[-14deg] rounded-[1rem] border border-slate-300 bg-white shadow-sm" />
      <div className="absolute left-13 top-3 h-13 w-12 rotate-[8deg] rounded-[1rem] border border-slate-300 bg-white/92 shadow-sm" />
    </div>
  );
}

export function StorefrontCategoryStrip() {
  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 pb-6 sm:px-6 lg:px-8 2xl:px-10">
      <div className="rounded-[2rem] border border-slate-200 bg-white px-5 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Destacados
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Productos para pedir online
            </h2>
          </div>
          <button
            type="button"
            className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
          >
            Ver todos
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <button
              key={product.title}
              type="button"
              className="cursor-pointer overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white text-left shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_38px_rgba(15,23,42,0.08)]"
            >
              <div className={`bg-gradient-to-br ${product.tint} p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
                    {product.badge}
                  </span>
                  <span className="rounded-full border border-white/60 bg-white/45 px-3 py-1 text-xs font-medium text-slate-600">
                    {product.category}
                  </span>
                </div>

                <div className="mt-5 flex h-28 items-center justify-center rounded-[1.15rem] border border-white/55 bg-white/40 p-4">
                  <ProductArt art={product.art} />
                </div>
              </div>

              <div className="space-y-3 p-5">
                <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                  {product.title}
                </h3>
                <p className="text-sm leading-6 text-slate-600">{product.note}</p>
                <div className="flex items-end justify-between gap-3 pt-1">
                  <p className="text-lg font-semibold text-slate-950">{product.price}</p>
                  <span className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">
                    Ver
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
