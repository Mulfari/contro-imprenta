"use client";

const products = [
  {
    title: "Tarjetas soft touch",
    category: "Tarjetas",
    price: "$29",
    previousPrice: "$34",
    discount: "-$5",
    tint: "from-[#fff7d6] via-white to-[#fff1bf]",
  },
  {
    title: "Stickers troquelados",
    category: "Etiquetas",
    price: "$19",
    previousPrice: "$23",
    discount: "-$4",
    tint: "from-[#dff3ff] via-white to-[#cae8ff]",
  },
  {
    title: "Pendon express",
    category: "Gran formato",
    price: "$32",
    previousPrice: "$39",
    discount: "-$7",
    tint: "from-[#efe4ff] via-white to-[#e2d7ff]",
  },
  {
    title: "Invitaciones deluxe",
    category: "Invitaciones",
    price: "$27",
    previousPrice: "$33",
    discount: "-$6",
    tint: "from-[#ffe0ea] via-white to-[#ffd2df]",
  },
];

function SideFeature() {
  return (
    <article className="relative overflow-hidden bg-[#0d0d0d] p-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_40%)]" />
      <div className="absolute inset-y-0 right-0 w-[54%] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />

      <div className="relative z-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">
          Coleccion destacada
        </p>
        <h3 className="mt-4 max-w-[13rem] text-[2.15rem] font-black leading-tight tracking-tight">
          Papeleria comercial
        </h3>
        <ul className="mt-8 space-y-2.5">
          {["Tarjetas", "Talonarios", "Sobres", "Facturas", "Recibos", "Sellos"].map((item) => (
            <li key={item} className="flex items-center gap-3 text-[1.05rem] font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-[#facc15]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-8 inline-flex cursor-pointer items-center gap-2 text-base font-semibold text-white"
        >
          Ver todo
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-0 h-[78%] w-[52%]">
        <div className="absolute bottom-2 right-4 h-full w-10 rounded-full bg-white/14" />
        <div className="absolute bottom-10 right-14 h-48 w-20 rounded-[1.5rem] bg-white shadow-[0_28px_52px_rgba(0,0,0,0.24)]" />
        <div className="absolute bottom-24 right-28 h-36 w-16 rounded-[1.2rem] bg-[#facc15] shadow-[0_28px_52px_rgba(0,0,0,0.24)]" />
        <div className="absolute bottom-10 right-30 h-24 w-24 rounded-full bg-[#38bdf8]/18 blur-2xl" />
        <div className="absolute bottom-28 right-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      </div>
    </article>
  );
}

function ProductCard({
  title,
  category,
  price,
  previousPrice,
  discount,
  tint,
}: {
  title: string;
  category: string;
  price: string;
  previousPrice: string;
  discount: string;
  tint: string;
}) {
  return (
    <article className="group relative border-r border-slate-200 px-5 py-5 last:border-r-0">
      <span className="absolute left-5 top-5 rounded-md bg-[#ff5b4d] px-2.5 py-1 text-xs font-bold text-white">
        {discount}
      </span>
      <button
        type="button"
        aria-label="Guardar"
        className="absolute right-5 top-5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
      >
        ♡
      </button>

      <div className={`flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br ${tint}`}>
        <div className="relative h-32 w-28">
          <div className="absolute inset-0 rotate-[8deg] rounded-[1.45rem] bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)] transition duration-300 group-hover:-translate-y-1 group-hover:rotate-[10deg]" />
          <div className="absolute left-[-1rem] top-7 h-28 w-24 -rotate-[9deg] rounded-[1.3rem] bg-slate-950 shadow-[0_20px_40px_rgba(15,23,42,0.14)] transition duration-300 group-hover:translate-x-1 group-hover:translate-y-1" />
          <div className="absolute left-4 top-4 h-4 w-14 rounded-full bg-[#facc15]" />
          <div className="absolute left-6 top-12 h-2.5 w-10 rounded-full bg-slate-200" />
          <div className="absolute left-6 top-17 h-2.5 w-7 rounded-full bg-slate-200" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-lg font-semibold">
        <span className="text-slate-300 line-through">{previousPrice}</span>
        <span className="text-[#3558ff]">{price}</span>
      </div>
      <h4 className="mt-3 text-[1.08rem] font-semibold leading-7 tracking-tight text-slate-950">
        {title}
      </h4>
      <p className="mt-2 text-sm font-medium uppercase tracking-[0.16em] text-slate-400">
        {category}
      </p>
      <div className="mt-4 flex gap-1 text-slate-300">
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
      </div>
    </article>
  );
}

export function StorefrontFeatureGridSection() {
  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 pb-16 sm:px-6 lg:px-8 2xl:px-10">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.04)] xl:grid xl:grid-cols-[430px_1fr]">
        <SideFeature />
        <div className="grid md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.title} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
