"use client";

const gridShowcaseRows = [
  {
    title: "Acabados premium",
    theme: "dark",
    items: ["Laminado", "Sectorizado", "Relieve", "Troquelado", "Barniz UV"],
    products: [
      { title: "Tarjetas laminadas", category: "Tarjetas", price: "$26", previousPrice: "$31", discount: "-$5" },
      { title: "Invitaciones foil", category: "Invitaciones", price: "$34", previousPrice: "$40", discount: "-$6" },
      { title: "Etiquetas metalizadas", category: "Etiquetas", price: "$18", previousPrice: "$22", discount: "-$4" },
      { title: "Packaging premium", category: "Packaging", price: "$38", previousPrice: "$45", discount: "-$7" },
      { title: "Sobres especiales", category: "Sobres", price: "$16", previousPrice: "$20", discount: "-$4" },
      { title: "Carpetas corporativas", category: "Papeleria", price: "$22", previousPrice: "$27", discount: "-$5" },
    ],
  },
  {
    title: "Gran formato",
    theme: "photo",
    items: ["Vinil", "Afiches", "Pendones", "Lonas", "Roll up", "Senaletica"],
    products: [
      { title: "Vinil adhesivo", category: "Vinil", price: "$28", previousPrice: "$35", discount: "-$7" },
      { title: "Pendones express", category: "Pendones", price: "$32", previousPrice: "$39", discount: "-$7" },
      { title: "Afiches full color", category: "Afiches", price: "$15", previousPrice: "$19", discount: "-$4" },
      { title: "Lonas publicitarias", category: "Lonas", price: "$41", previousPrice: "$49", discount: "-$8" },
      { title: "Roll up display", category: "Display", price: "$55", previousPrice: "$64", discount: "-$9" },
      { title: "Senaletica interna", category: "Senaletica", price: "$24", previousPrice: "$29", discount: "-$5" },
    ],
  },
];

function VerticalFeature({
  title,
  items,
  theme,
}: {
  title: string;
  items: string[];
  theme: "dark" | "photo";
}) {
  const isDark = theme === "dark";

  return (
    <article
      className={`relative overflow-hidden rounded-[1.9rem] p-10 ${
        isDark
          ? "bg-[#090909] text-white"
          : "bg-[linear-gradient(135deg,#0f172a_0%,#111827_42%,#1f2937_100%)] text-white"
      }`}
    >
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_42%)]"
            : "bg-[radial-gradient(circle_at_bottom_left,rgba(250,204,21,0.18),transparent_36%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_34%)]"
        }`}
      />
      <div className="relative z-10">
        <h3 className="max-w-[14rem] text-[2.1rem] font-black leading-tight tracking-tight">
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
          className="mt-8 cursor-pointer text-base font-semibold text-white"
        >
          Ver todo {"›"}
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-0 h-[70%] w-[48%]">
        {isDark ? (
          <>
            <div className="absolute bottom-0 right-0 h-full w-10 rounded-full bg-white/14" />
            <div className="absolute bottom-10 right-14 h-48 w-18 rounded-[1.3rem] bg-white" />
            <div className="absolute bottom-22 right-22 h-34 w-14 rounded-[1.1rem] bg-[#facc15]" />
          </>
        ) : (
          <>
            <div className="absolute bottom-0 right-0 h-full w-full bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.24)_100%)]" />
            <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full border border-white/20 bg-white/8 backdrop-blur-sm" />
            <div className="absolute bottom-24 right-26 h-12 w-12 rounded-full bg-[#facc15]" />
          </>
        )}
      </div>
    </article>
  );
}

function GridProductCard({
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
    <article className="group relative border-b border-r border-slate-200 px-5 py-5 even:border-r-0 xl:nth-[3n]:border-r-0">
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

      <div className="flex h-44 items-center justify-center">
        <div className="relative h-28 w-24">
          <div className="absolute inset-0 rotate-[7deg] rounded-[1.3rem] bg-white shadow-[0_18px_36px_rgba(15,23,42,0.12)] transition duration-300 group-hover:-translate-y-1" />
          <div className="absolute left-[-1rem] top-6 h-24 w-20 -rotate-[8deg] rounded-[1.2rem] bg-slate-950 shadow-[0_18px_36px_rgba(15,23,42,0.14)] transition duration-300 group-hover:translate-x-1 group-hover:translate-y-1" />
          <div className="absolute left-3 top-3 h-4 w-14 rounded-full bg-[#facc15]" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-lg font-semibold">
        <span className="text-slate-300 line-through">{previousPrice}</span>
        <span className="text-[#3558ff]">{price}</span>
      </div>
      <h4 className="mt-3 text-[1.1rem] font-semibold leading-8 tracking-tight text-slate-950">
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

export function StorefrontGridShowcaseSection() {
  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 pb-16 sm:px-6 lg:px-8 2xl:px-10">
      <div className="space-y-8">
        {gridShowcaseRows.map((row) => (
          <div
            key={row.title}
            className="grid gap-0 overflow-hidden rounded-[1.9rem] border border-slate-200 bg-white xl:grid-cols-[320px_1fr]"
          >
            <VerticalFeature title={row.title} items={row.items} theme={row.theme as "dark" | "photo"} />
            <div className="grid md:grid-cols-2 xl:grid-cols-3">
              {row.products.map((product) => (
                <GridProductCard key={product.title} {...product} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
