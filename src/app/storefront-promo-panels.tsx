"use client";

function PromoPanel({
  theme,
  eyebrow,
  title,
  description,
  compact = false,
}: {
  theme: "yellow" | "blue" | "dark" | "light";
  eyebrow: string;
  title: string;
  description: string;
  compact?: boolean;
}) {
  const palette =
    theme === "yellow"
      ? {
          wrapper: "bg-[#facc15] text-slate-950",
          line: "bg-black/10",
          card: "bg-white/90",
          accent: "bg-slate-950",
          accentSoft: "bg-[#38bdf8]",
          text: "text-slate-900/78",
          eyebrow: "text-slate-900/62",
        }
      : theme === "blue"
        ? {
            wrapper: "bg-[#3b5bfd] text-white",
            line: "bg-white/12",
            card: "bg-white/92",
            accent: "bg-[#facc15]",
            accentSoft: "bg-[#111827]",
            text: "text-white/78",
            eyebrow: "text-white/70",
          }
        : theme === "dark"
          ? {
              wrapper: "bg-[#101010] text-white",
              line: "bg-white/10",
              card: "bg-white/92",
              accent: "bg-[#facc15]",
              accentSoft: "bg-white/18",
              text: "text-white/74",
              eyebrow: "text-white/60",
            }
          : {
              wrapper: "bg-white text-slate-950 border border-slate-200",
              line: "bg-slate-100",
              card: "bg-slate-950",
              accent: "bg-[#facc15]",
              accentSoft: "bg-slate-200",
              text: "text-slate-600",
              eyebrow: "text-slate-400",
            };

  return (
    <article
      className={`group overflow-hidden rounded-[2rem] ${palette.wrapper} shadow-[0_18px_40px_rgba(15,23,42,0.05)]`}
    >
      <div className={`grid h-full gap-6 p-8 ${compact ? "lg:grid-cols-[1fr_0.9fr]" : "lg:grid-cols-[0.95fr_1.05fr]"}`}>
        <div className="flex flex-col justify-between">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${palette.eyebrow}`}>
              {eyebrow}
            </p>
            <h2
              className={`mt-4 whitespace-pre-line font-black leading-none tracking-tight ${
                compact ? "text-3xl xl:text-[2.6rem]" : "text-4xl xl:text-[3.25rem]"
              }`}
            >
              {title}
            </h2>
            <p className={`mt-4 max-w-xs text-base font-medium ${palette.text}`}>
              {description}
            </p>
          </div>
        </div>

        <div className={`relative min-h-[13rem] ${compact ? "lg:min-h-[12rem]" : "lg:min-h-[20rem]"}`}>
          <div className={`absolute left-0 top-0 h-20 w-44 -rotate-12 rounded-full ${palette.line}`} />
          <div className={`absolute right-0 top-5 h-16 w-32 rounded-full ${palette.line}`} />
          <div className={`absolute right-14 top-8 h-44 w-32 rotate-6 rounded-[1.8rem] ${palette.card} shadow-[0_22px_44px_rgba(15,23,42,0.14)] transition duration-300 group-hover:-translate-y-1`} />
          <div className={`absolute right-30 top-16 h-40 w-28 -rotate-8 rounded-[1.5rem] ${palette.accentSoft} shadow-[0_22px_44px_rgba(15,23,42,0.12)] transition duration-300 group-hover:translate-x-1 group-hover:translate-y-1`} />
          <div className={`absolute right-20 top-16 h-5 w-22 rounded-full ${palette.accent} transition duration-300 group-hover:scale-105`} />
          <div className={`absolute right-20 top-27 h-3 w-18 rounded-full ${theme === "dark" ? "bg-white/32" : "bg-slate-200"}`} />
          <div className={`absolute right-18 top-34 h-3 w-13 rounded-full ${theme === "dark" ? "bg-white/24" : "bg-slate-200"}`} />
        </div>
      </div>
    </article>
  );
}

export function StorefrontPromoPanels() {
  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 pb-10 sm:px-6 lg:px-8 2xl:px-10">
      <div className="grid gap-4 xl:grid-cols-[1.02fr_1.22fr_1fr]">
        <PromoPanel
          theme="yellow"
          eyebrow="Presentacion profesional"
          title={"Tarjetas\nPremium"}
          description="Opciones elegantes para marcas, emprendimientos y presentaciones corporativas."
        />

        <PromoPanel
          theme="blue"
          eyebrow="Personaliza tu marca"
          title={"Stickers y\nEtiquetas"}
          description="Soluciones adhesivas para packaging, productos, promociones y frascos."
        />

        <div className="grid gap-4">
          <PromoPanel
            theme="dark"
            eyebrow="Gran formato"
            title={"Pendones,\nafiches"}
            description="Piezas visuales para vitrinas, eventos y puntos de venta."
            compact
          />

          <PromoPanel
            theme="light"
            eyebrow="Entrega express"
            title={"Talonarios,\nrecibos"}
            description="Impresos diarios para caja, control de ventas y operaciones."
            compact
          />
        </div>
      </div>
    </section>
  );
}
