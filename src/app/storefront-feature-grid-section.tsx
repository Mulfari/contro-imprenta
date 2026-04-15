"use client";

const bestSellers = [
  { title: "Tarjetas soft touch", category: "Tarjetas", price: "$29", previousPrice: "$34", badge: "Top ventas", tint: "from-[#fff7d6] via-white to-[#fff1bf]" },
  { title: "Stickers troquelados", category: "Etiquetas", price: "$19", previousPrice: "$23", badge: "Popular", tint: "from-[#dff3ff] via-white to-[#cae8ff]" },
  { title: "Pendon express", category: "Gran formato", price: "$32", previousPrice: "$39", badge: "Express", tint: "from-[#efe4ff] via-white to-[#e2d7ff]" },
  { title: "Invitaciones deluxe", category: "Invitaciones", price: "$27", previousPrice: "$33", badge: "Premium", tint: "from-[#ffe0ea] via-white to-[#ffd2df]" },
  { title: "Talonarios autocopiativos", category: "Talonarios", price: "$24", previousPrice: "$31", badge: "Negocios", tint: "from-[#e8ffe7] via-white to-[#d8ffd5]" },
  { title: "Etiquetas metalizadas", category: "Etiquetas", price: "$18", previousPrice: "$22", badge: "Nuevo", tint: "from-[#eef2ff] via-white to-[#e4e9ff]" },
  { title: "Sobres membretados", category: "Sobres", price: "$18", previousPrice: "$22", badge: "Corporate", tint: "from-[#f5f5f5] via-white to-[#ececec]" },
  { title: "Vinil adhesivo", category: "Vinil", price: "$28", previousPrice: "$35", badge: "Publicidad", tint: "from-[#fff3cf] via-white to-[#ffe7af]" },
];

function BestSellerCard({
  title,
  category,
  price,
  previousPrice,
  badge,
  tint,
}: {
  title: string;
  category: string;
  price: string;
  previousPrice: string;
  badge: string;
  tint: string;
}) {
  return (
    <article className="group overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
      <div className={`relative overflow-hidden bg-gradient-to-br ${tint} p-5`}>
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-[#ff5b4d] px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white">
            {badge}
          </span>
          <button
            type="button"
            aria-label="Guardar"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/88 text-slate-500 shadow-sm transition hover:text-slate-900"
          >
            ♡
          </button>
        </div>

        <div className="mt-6 flex h-40 items-center justify-center">
          <div className="relative h-30 w-26">
            <div className="absolute inset-0 rotate-[8deg] rounded-[1.45rem] bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)] transition duration-300 group-hover:-translate-y-1 group-hover:rotate-[10deg]" />
            <div className="absolute left-[-1rem] top-7 h-26 w-22 -rotate-[9deg] rounded-[1.3rem] bg-slate-950 shadow-[0_20px_40px_rgba(15,23,42,0.14)] transition duration-300 group-hover:translate-x-1 group-hover:translate-y-1" />
            <div className="absolute left-4 top-4 h-4 w-14 rounded-full bg-[#facc15]" />
            <div className="absolute left-6 top-12 h-2.5 w-10 rounded-full bg-slate-200" />
            <div className="absolute left-6 top-17 h-2.5 w-7 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-slate-300 line-through">{previousPrice}</span>
          <span className="text-[#3558ff]">{price}</span>
        </div>
        <h3 className="text-[1.08rem] font-semibold leading-7 tracking-tight text-slate-950">
          {title}
        </h3>
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-400">
          {category}
        </p>
        <div className="flex gap-1 text-slate-300">
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>
      </div>
    </article>
  );
}

export function StorefrontFeatureGridSection() {
  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 pb-16 sm:px-6 lg:px-8 2xl:px-10">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Ecommerce
          </p>
          <h2 className="mt-2 text-[2rem] font-black tracking-tight text-slate-950">
            Productos mas vendidos
          </h2>
        </div>
        <button
          type="button"
          className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Ver catalogo
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {bestSellers.map((product) => (
          <BestSellerCard key={product.title} {...product} />
        ))}
      </div>
    </section>
  );
}
