"use client";

const categories = [
  { title: "Tarjetas", tint: "from-sky-100 via-white to-cyan-50", art: "cards" },
  { title: "Stickers", tint: "from-yellow-100 via-white to-amber-50", art: "stickers" },
  { title: "Folletos", tint: "from-zinc-100 via-white to-slate-50", art: "booklet" },
  { title: "Pendones", tint: "from-violet-100 via-white to-fuchsia-50", art: "banner" },
  { title: "Talonarios", tint: "from-cyan-100 via-white to-sky-50", art: "invoice" },
  { title: "Etiquetas", tint: "from-emerald-100 via-white to-lime-50", art: "labels" },
];

function CategoryArt({ art }: { art: string }) {
  if (art === "stickers") {
    return (
      <div className="relative h-24 w-24">
        <div className="absolute left-2 top-5 h-10 w-10 rounded-[1rem] bg-yellow-300 shadow-sm" />
        <div className="absolute left-11 top-2 h-10 w-10 rounded-full bg-pink-300 shadow-sm" />
        <div className="absolute right-1 bottom-2 h-7 w-11 rounded-full bg-cyan-300 shadow-sm" />
      </div>
    );
  }

  if (art === "booklet") {
    return (
      <div className="relative h-24 w-24">
        <div className="absolute left-4 top-5 h-13 w-10 rounded-[1rem] border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-9 top-2 h-13 w-10 rounded-[1rem] border border-slate-300 bg-white/92 shadow-sm" />
      </div>
    );
  }

  if (art === "banner") {
    return (
      <div className="relative h-24 w-24">
        <div className="absolute left-8 top-1 h-20 w-2 rounded-full bg-slate-400" />
        <div className="absolute left-10 top-7 h-12 w-9 rounded-r-[1rem] rounded-tl-[0.3rem] rounded-bl-[0.3rem] bg-violet-300 shadow-sm" />
      </div>
    );
  }

  if (art === "invoice") {
    return (
      <div className="relative h-24 w-24">
        <div className="absolute left-6 top-4 h-14 w-11 rounded-[1rem] border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-9 top-10 h-1.5 w-7 rounded-full bg-slate-200" />
        <div className="absolute left-9 top-14 h-1.5 w-8 rounded-full bg-slate-200" />
        <div className="absolute left-9 top-18 h-1.5 w-5 rounded-full bg-slate-200" />
      </div>
    );
  }

  if (art === "labels") {
    return (
      <div className="grid h-24 w-24 grid-cols-2 gap-2">
        <div className="rounded-xl bg-emerald-300" />
        <div className="rounded-xl bg-cyan-300" />
        <div className="rounded-xl bg-amber-300" />
        <div className="rounded-xl bg-pink-300" />
      </div>
    );
  }

  return (
    <div className="relative h-24 w-24">
      <div className="absolute left-3 top-7 h-13 w-10 rotate-[-14deg] rounded-[1rem] border border-slate-300 bg-white shadow-sm" />
      <div className="absolute left-10 top-3 h-13 w-10 rotate-[8deg] rounded-[1rem] border border-slate-300 bg-white/92 shadow-sm" />
    </div>
  );
}

export function StorefrontCategoryStrip() {
  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 pb-6 sm:px-6 lg:px-8 2xl:px-10">
      <div className="rounded-[2rem] border border-slate-200 bg-white px-5 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:px-6">
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {categories.map((category) => (
            <button
              key={category.title}
              type="button"
              className="cursor-pointer rounded-[1.5rem] px-3 py-4 text-center transition hover:bg-slate-50"
            >
              <div className={`mx-auto flex h-28 w-full max-w-[8.2rem] items-center justify-center rounded-[1.6rem] bg-gradient-to-br ${category.tint}`}>
                <CategoryArt art={category.art} />
              </div>
              <p className="mt-4 text-[1.02rem] font-semibold tracking-tight text-slate-950">
                {category.title}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
