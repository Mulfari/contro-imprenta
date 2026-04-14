"use client";

function PromoTile({
  title,
  theme,
  compact = false,
}: {
  title: string;
  theme: "yellow" | "blue" | "dark" | "light";
  compact?: boolean;
}) {
  const palette =
    theme === "yellow"
      ? {
          wrapper: "bg-[#facc15] text-slate-950",
          shapeA: "bg-white",
          shapeB: "bg-slate-950",
          shapeC: "bg-[#38bdf8]",
          line: "bg-slate-900/10",
        }
      : theme === "blue"
        ? {
            wrapper: "bg-[#3b5bfd] text-white",
            shapeA: "bg-white",
            shapeB: "bg-[#facc15]",
            shapeC: "bg-[#111827]",
            line: "bg-white/16",
          }
        : theme === "dark"
          ? {
              wrapper: "bg-[#101010] text-white",
              shapeA: "bg-white",
              shapeB: "bg-[#facc15]",
              shapeC: "bg-white/14",
              line: "bg-white/10",
            }
          : {
              wrapper: "border border-slate-200 bg-white text-slate-950",
              shapeA: "bg-white",
              shapeB: "bg-slate-950",
              shapeC: "bg-[#facc15]",
              line: "bg-slate-100",
            };

  return (
    <article
      className={`group overflow-hidden rounded-[2rem] ${palette.wrapper} shadow-[0_18px_40px_rgba(15,23,42,0.05)]`}
    >
      <div className={`grid h-full gap-6 p-8 ${compact ? "lg:grid-cols-[1fr_0.9fr]" : "lg:grid-cols-[0.95fr_1.05fr]"}`}>
        <div className="flex items-end">
          <h2
            className={`whitespace-pre-line font-black leading-none tracking-tight ${
              compact ? "text-3xl xl:text-[2.55rem]" : "text-4xl xl:text-[3.2rem]"
            }`}
          >
            {title}
          </h2>
        </div>

        <div className={`relative ${compact ? "min-h-[12rem]" : "min-h-[19rem]"}`}>
          <div className={`absolute left-2 top-0 h-20 w-44 -rotate-12 rounded-full ${palette.line}`} />
          <div className={`absolute right-0 top-4 h-16 w-28 rounded-full ${palette.line}`} />
          <div className={`absolute right-14 top-8 h-44 w-32 rotate-[6deg] rounded-[1.9rem] ${palette.shapeA} shadow-[0_22px_44px_rgba(15,23,42,0.12)] transition duration-300 group-hover:-translate-y-1`} />
          <div className={`absolute right-30 top-16 h-40 w-28 -rotate-[8deg] rounded-[1.5rem] ${palette.shapeB} shadow-[0_22px_44px_rgba(15,23,42,0.12)] transition duration-300 group-hover:translate-x-1 group-hover:translate-y-1`} />
          <div className={`absolute right-16 top-14 h-5 w-22 rounded-full ${palette.shapeC} transition duration-300 group-hover:scale-105`} />
          <div className={`absolute right-18 top-27 h-3 w-16 rounded-full ${theme === "dark" ? "bg-white/28" : "bg-slate-200"}`} />
          <div className={`absolute right-18 top-34 h-3 w-12 rounded-full ${theme === "dark" ? "bg-white/18" : "bg-slate-200"}`} />
        </div>
      </div>
    </article>
  );
}

export function StorefrontPromoPanels() {
  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 pb-10 sm:px-6 lg:px-8 2xl:px-10">
      <div className="grid gap-4 xl:grid-cols-[1.02fr_1.22fr_1fr]">
        <PromoTile title={"Tarjetas\nPremium"} theme="yellow" />
        <PromoTile title={"Stickers y\nEtiquetas"} theme="blue" />

        <div className="grid gap-4">
          <PromoTile title={"Pendones,\nafiches"} theme="dark" compact />
          <PromoTile title={"Talonarios,\nrecibos"} theme="light" compact />
        </div>
      </div>
    </section>
  );
}
