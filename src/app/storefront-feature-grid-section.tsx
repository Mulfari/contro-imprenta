"use client";

const featureRows = [
  {
    title: "Papeleria comercial",
    theme: "dark",
    items: ["Tarjetas", "Talonarios", "Sobres", "Facturas", "Recibos", "Sellos"],
    products: [
      { title: "Tarjetas soft touch", category: "Tarjetas", price: "$29", previousPrice: "$34", discount: "-$5" },
      { title: "Talonarios autocopiativos", category: "Talonarios", price: "$24", previousPrice: "$31", discount: "-$7" },
      { title: "Sobres membretados", category: "Sobres", price: "$18", previousPrice: "$22", discount: "-$4" },
      { title: "Facturas personalizadas", category: "Facturas", price: "$21", previousPrice: "$26", discount: "-$5" },
    ],
  },
  {
    title: "Publicidad y eventos",
    theme: "photo",
    items: ["Vinil", "Afiches", "Pendones", "Lonas", "Roll up", "Senaletica"],
    products: [
      { title: "Vinil adhesivo", category: "Vinil", price: "$28", previousPrice: "$35", discount: "-$7" },
      { title: "Pendones express", category: "Pendones", price: "$32", previousPrice: "$39", discount: "-$7" },
      { title: "Afiches full color", category: "Afiches", price: "$15", previousPrice: "$19", discount: "-$4" },
      { title: "Lonas publicitarias", category: "Lonas", price: "$41", previousPrice: "$49", discount: "-$8" },
    ],
  },
];

function FeatureSidebar({
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
      className={`relative overflow-hidden p-10 ${
        isDark
          ? "bg-[#090909] text-white"
          : "bg-[linear-gradient(135deg,#101827_0%,#172033_42%,#1f2a40_100%)] text-white"
      }`}
    >
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_42%)]"
            : "bg-[radial-gradient(circle_at_bottom_left,rgba(250,204,21,0.18),transparent_36%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_34%)]"
        }`}
      />

      <div className="relative z-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
          Coleccion
        </p>
        <h3 className="mt-4 max-w-[15rem] text-[2.15rem] font-black leading-tight tracking-tight">
          {title}
        </h3>
        <ul className="mt-8 space-y-2.5">
          {items.map((item) => (
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

      <div className="pointer-events-none absolute bottom-0 right-0 h-[76%] w-[48%]">
        {isDark ? (
          <>
            <div className="absolute bottom-0 right-0 h-full w-10 rounded-full bg-white/14" />
            <div className="absolute bottom-10 right-14 h-48 w-20 rounded-[1.5rem] bg-white shadow-[0_26px_46px_rgba(0,0,0,0.2)]" />
            <div className="absolute bottom-24 right-26 h-34 w-16 rounded-[1.2rem] bg-[#facc15]" />
            <div className="absolute bottom-12 right-32 h-20 w-20 rounded-full bg-[#38bdf8]/20 blur-2xl" />
          </>
        ) : (
          <>
            <div className="absolute bottom-0 right-0 h-full w-full bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.28)_100%)]" />
            <div className="absolute bottom-8 right-8 h-40 w-40 rounded-full border border-white/15 bg-white/8 backdrop-blur-sm" />
            <div className="absolute bottom-24 right-26 h-12 w-12 rounded-full bg-[#facc15]" />
            <div className="absolute bottom-14 right-28 h-24 w-24 rounded-full bg-[#38bdf8]/18 blur-2xl" />
          </>
        )}
      </div>
    </article>
  );
}

function FeatureProductCard({
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
    <article className="group relative border-b border-r border-slate-200 px-5 py-5 even:border-r-0 xl:nth-[2n]:border-r-0">
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

      <div className="flex h-44 items-center justify-center overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="relative h-30 w-26">
          <div className="absolute inset-0 rotate-[7deg] rounded-[1.45rem] bg-white shadow-[0_20px_38px_rgba(15,23,42,0.12)] transition duration-300 group-hover:-translate-y-1 group-hover:rotate-[9deg]" />
          <div className="absolute left-[-1rem] top-7 h-26 w-22 -rotate-[8deg] rounded-[1.3rem] bg-slate-950 shadow-[0_20px_38px_rgba(15,23,42,0.14)] transition duration-300 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:-rotate-[10deg]" />
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
      <div className="space-y-8">
        {featureRows.map((row) => (
          <div
            key={row.title}
            className="grid gap-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.04)] xl:grid-cols-[420px_1fr]"
          >
            <FeatureSidebar title={row.title} items={row.items} theme={row.theme as "dark" | "photo"} />
            <div className="grid md:grid-cols-2 xl:grid-cols-4">
              {row.products.map((product) => (
                <FeatureProductCard key={product.title} {...product} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
