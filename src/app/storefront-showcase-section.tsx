"use client";

const showcaseRows = [
  {
    title: "Papeleria comercial",
    items: ["Tarjetas", "Talonarios", "Sobres", "Facturas", "Recibos"],
    theme: "dark",
    products: [
      { title: "Tarjetas soft touch", category: "Tarjetas", price: "$29", previousPrice: "$34", discount: "-$5" },
      { title: "Talonarios autocopiativos", category: "Talonarios", price: "$24", previousPrice: "$31", discount: "-$7" },
      { title: "Sobres membretados", category: "Sobres", price: "$18", previousPrice: "$22", discount: "-$4" },
      { title: "Facturas personalizadas", category: "Facturas", price: "$21", previousPrice: "$26", discount: "-$5" },
    ],
  },
  {
    title: "Publicidad y eventos",
    items: ["Pendones", "Afiches", "Stickers", "Invitaciones", "Etiquetas"],
    theme: "light",
    products: [
      { title: "Pendon publicitario", category: "Gran formato", price: "$35", previousPrice: "$42", discount: "-$7" },
      { title: "Afiches premium", category: "Afiches", price: "$17", previousPrice: "$21", discount: "-$4" },
      { title: "Stickers redondos", category: "Stickers", price: "$14", previousPrice: "$19", discount: "-$5" },
      { title: "Invitaciones deluxe", category: "Invitaciones", price: "$27", previousPrice: "$33", discount: "-$6" },
    ],
  },
];

function ShowcaseHero({ theme, title, items }: { theme: "dark" | "light"; title: string; items: string[] }) {
  const isDark = theme === "dark";

  return (
    <article
      className={`relative overflow-hidden rounded-[1.9rem] p-10 ${
        isDark ? "bg-[#0e0e0e] text-white" : "bg-[#fff4cf] text-slate-950"
      }`}
    >
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_45%)]"
            : "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.55),transparent_48%)]"
        }`}
      />
      <div className="relative z-10">
        <h3 className="max-w-[16rem] text-[2.2rem] font-black leading-tight tracking-tight">
          {title}
        </h3>
        <ul className="mt-7 space-y-2.5">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-3 text-lg font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-[#facc15]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={`mt-8 cursor-pointer text-base font-semibold ${
            isDark ? "text-white" : "text-slate-950"
          }`}
        >
          Ver todo {"›"}
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-0 h-[88%] w-[64%]">
        <div
          className={`absolute bottom-10 right-18 h-44 w-32 rotate-[8deg] rounded-[1.7rem] ${
            isDark ? "bg-white/95" : "bg-white"
          } shadow-[0_24px_46px_rgba(15,23,42,0.18)]`}
        />
        <div
          className={`absolute bottom-18 right-36 h-40 w-28 -rotate-[10deg] rounded-[1.5rem] ${
            isDark ? "bg-[#facc15]" : "bg-[#111827]"
          } shadow-[0_24px_46px_rgba(15,23,42,0.18)]`}
        />
        <div
          className={`absolute bottom-24 right-24 h-4 w-18 rounded-full ${
            isDark ? "bg-[#38bdf8]" : "bg-[#facc15]"
          }`}
        />
        <div className={`absolute bottom-32 right-26 h-3 w-16 rounded-full ${isDark ? "bg-white/30" : "bg-slate-200"}`} />
        <div className={`absolute bottom-38 right-24 h-3 w-11 rounded-full ${isDark ? "bg-white/20" : "bg-slate-200"}`} />
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
}: {
  title: string;
  category: string;
  price: string;
  previousPrice: string;
  discount: string;
}) {
  return (
    <article className="group relative border-r border-slate-200 px-5 py-6 last:border-r-0">
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

      <div className="flex h-56 items-center justify-center">
        <div className="relative h-34 w-26">
          <div className="absolute inset-0 rotate-[6deg] rounded-[1.5rem] bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)] transition duration-300 group-hover:-translate-y-1" />
          <div className="absolute left-[-1.3rem] top-8 h-28 w-22 -rotate-[10deg] rounded-[1.4rem] bg-slate-950 shadow-[0_20px_40px_rgba(15,23,42,0.14)] transition duration-300 group-hover:translate-x-1 group-hover:translate-y-1" />
          <div className="absolute left-3 top-3 h-4 w-16 rounded-full bg-[#facc15]" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-lg font-semibold">
        <span className="text-slate-300 line-through">{previousPrice}</span>
        <span className="text-[#3558ff]">{price}</span>
      </div>
      <h4 className="mt-3 text-[1.15rem] font-semibold leading-8 tracking-tight text-slate-950">
        {title}
      </h4>
      <p className="mt-2 text-base font-medium text-slate-400">{category}</p>
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

export function StorefrontShowcaseSection() {
  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 pb-16 sm:px-6 lg:px-8 2xl:px-10">
      <div className="space-y-8">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-[2rem] font-black tracking-tight text-slate-950">
            Acabados premium
          </h2>
        </div>
        {showcaseRows.map((row) => (
          <div key={row.title} className="grid gap-0 overflow-hidden rounded-[1.9rem] border border-slate-200 bg-white xl:grid-cols-[420px_1fr]">
            <ShowcaseHero theme={row.theme as "dark" | "light"} title={row.title} items={row.items} />
            <div className="grid md:grid-cols-2 xl:grid-cols-4">
              {row.products.map((product) => (
                <ProductCard key={product.title} {...product} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
