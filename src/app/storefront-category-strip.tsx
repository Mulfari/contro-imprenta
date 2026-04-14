"use client";

const collectionBlocks = [
  {
    title: "Papeleria comercial",
    subtitle: "Tarjetas, talonarios y formatos para negocio",
    items: ["Tarjetas premium", "Facturas", "Talonarios"],
    tint: "from-sky-100 via-white to-cyan-50",
    accent: "bg-sky-400",
    art: "stack",
  },
  {
    title: "Etiquetas y stickers",
    subtitle: "Adhesivos para productos, empaques y marca",
    items: ["Stickers troquelados", "Etiquetas", "Rollos adhesivos"],
    tint: "from-amber-100 via-white to-yellow-50",
    accent: "bg-amber-400",
    art: "stickers",
  },
  {
    title: "Publicidad impresa",
    subtitle: "Material promocional para eventos y negocios",
    items: ["Folletos", "Volantes", "Afiches"],
    tint: "from-violet-100 via-white to-fuchsia-50",
    accent: "bg-violet-400",
    art: "fold",
  },
  {
    title: "Gran formato",
    subtitle: "Pendones, banners y piezas de alto impacto",
    items: ["Pendones", "Banners", "Vinil"],
    tint: "from-emerald-100 via-white to-teal-50",
    accent: "bg-emerald-400",
    art: "banner",
  },
];

function CollectionArt({ art, accent }: { art: string; accent: string }) {
  if (art === "stickers") {
    return (
      <div className="relative h-24 w-28">
        <div className={`absolute left-2 top-5 h-11 w-11 rounded-[1rem] ${accent} opacity-80`} />
        <div className="absolute left-12 top-2 h-12 w-12 rounded-full bg-white shadow-sm" />
        <div className="absolute left-16 top-10 h-10 w-10 rounded-[0.9rem] border border-white/70 bg-white/85 shadow-sm" />
      </div>
    );
  }

  if (art === "fold") {
    return (
      <div className="relative h-24 w-28">
        <div className="absolute left-6 top-4 h-16 w-12 rounded-[1rem] border border-white/75 bg-white shadow-sm" />
        <div className="absolute left-11 top-4 h-16 w-12 rounded-[1rem] border border-white/75 bg-white/92 shadow-sm" />
        <div className={`absolute left-14 top-7 h-3 w-14 rounded-full ${accent} opacity-55`} />
      </div>
    );
  }

  if (art === "banner") {
    return (
      <div className="relative h-24 w-28">
        <div className="absolute left-10 top-1 h-20 w-2 rounded-full bg-slate-400" />
        <div className={`absolute left-12 top-8 h-12 w-10 rounded-r-[1rem] rounded-tl-[0.3rem] rounded-bl-[0.3rem] ${accent} opacity-85 shadow-sm`} />
        <div className="absolute left-5 bottom-3 h-2 w-16 rounded-full bg-white/85" />
      </div>
    );
  }

  return (
    <div className="relative h-24 w-28">
      <div className="absolute left-6 top-8 h-14 w-12 rotate-[-14deg] rounded-[1rem] border border-white/75 bg-white shadow-sm" />
      <div className="absolute left-14 top-3 h-14 w-12 rotate-[8deg] rounded-[1rem] border border-white/75 bg-white/92 shadow-sm" />
      <div className={`absolute left-16 top-11 h-3 w-12 rounded-full ${accent} opacity-55`} />
    </div>
  );
}

export function StorefrontCategoryStrip() {
  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 pb-6 sm:px-6 lg:px-8 2xl:px-10">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {collectionBlocks.map((block) => (
          <button
            key={block.title}
            type="button"
            className="cursor-pointer overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white text-left shadow-[0_18px_40px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_48px_rgba(15,23,42,0.08)]"
          >
            <div className={`flex items-center justify-between gap-4 bg-gradient-to-br ${block.tint} px-5 py-5`}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Coleccion
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {block.title}
                </h2>
              </div>
              <CollectionArt art={block.art} accent={block.accent} />
            </div>

            <div className="space-y-4 p-5">
              <p className="text-sm leading-6 text-slate-600">{block.subtitle}</p>

              <div className="space-y-2">
                {block.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700"
                  >
                    <span>{item}</span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
