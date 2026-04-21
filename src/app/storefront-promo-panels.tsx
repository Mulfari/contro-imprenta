"use client";

import Image from "next/image";

function PromoTile({
  title,
  eyebrow,
  theme,
  compact = false,
  image,
}: {
  title: string;
  eyebrow: string;
  theme: "sun" | "sky" | "ink" | "paper";
  compact?: boolean;
  image?: {
    src: string;
    alt: string;
    className?: string;
  };
}) {
  const palette =
    theme === "sun"
      ? {
          wrapper: "bg-gradient-to-br from-[#ffd94d] via-[#ffc423] to-[#ffb000] text-slate-950",
          shapeA: "bg-white",
          shapeB: "bg-[#101828]",
          shapeC: "bg-[#38bdf8]",
          line: "bg-black/10",
          eyebrow: "text-slate-900/60",
        }
      : theme === "sky"
        ? {
            wrapper: "bg-gradient-to-br from-[#4d6bff] via-[#3558ff] to-[#1937d9] text-white",
            shapeA: "bg-white",
            shapeB: "bg-[#ffd84c]",
            shapeC: "bg-[#0f172a]",
            line: "bg-white/14",
            eyebrow: "text-white/72",
          }
        : theme === "ink"
          ? {
              wrapper: "bg-gradient-to-br from-[#111111] via-[#171717] to-[#050505] text-white",
              shapeA: "bg-white",
              shapeB: "bg-[#fb7185]",
              shapeC: "bg-[#facc15]",
              line: "bg-white/10",
              eyebrow: "text-white/62",
            }
          : {
              wrapper: "bg-gradient-to-br from-white via-[#f8fafc] to-[#eef2ff] text-slate-950 border border-slate-200",
              shapeA: "bg-[#111827]",
              shapeB: "bg-white",
              shapeC: "bg-[#facc15]",
              line: "bg-slate-200/90",
              eyebrow: "text-slate-500",
            };

  return (
    <article
      className={`group overflow-hidden rounded-[1.45rem] ${palette.wrapper} shadow-[0_16px_34px_rgba(15,23,42,0.07)] transition duration-300 hover:shadow-[0_24px_48px_rgba(15,23,42,0.1)] sm:rounded-[2rem] lg:hover:-translate-y-1`}
    >
      <div className={`grid h-full gap-4 p-5 sm:gap-6 sm:p-8 ${compact ? "lg:grid-cols-[1fr_0.9fr]" : "lg:grid-cols-[0.95fr_1.05fr]"}`}>
        <div className="flex flex-col justify-between">
          <div>
            <p className={`text-[0.68rem] font-semibold uppercase tracking-[0.18em] sm:text-sm sm:tracking-[0.22em] ${palette.eyebrow}`}>
              {eyebrow}
            </p>
            <h2
              className={`mt-3 whitespace-pre-line font-black leading-none tracking-tight sm:mt-4 ${
                compact ? "text-[2rem] sm:text-3xl xl:text-[2.55rem]" : "text-[2.2rem] sm:text-[2.45rem] xl:text-[3.2rem]"
              }`}
            >
              {title}
            </h2>
          </div>

          <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-white/88 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-sm backdrop-blur-sm sm:mt-8 sm:rounded-2xl sm:px-5 sm:py-3 sm:text-sm">
            Ver mas
            <span aria-hidden="true">›</span>
          </span>
        </div>

        <div className={`relative ${compact ? "min-h-[8.5rem] sm:min-h-[12rem]" : image ? "min-h-[12.5rem] sm:min-h-[13.5rem] xl:min-h-[19rem]" : "min-h-[10rem] sm:min-h-[19rem]"}`}>
          {image ? (
            <div className="absolute inset-0 overflow-visible">
              <div className={`absolute inset-x-2 bottom-2 h-14 rounded-full blur-2xl ${theme === "sky" ? "bg-black/14" : "bg-black/16"}`} />
              <Image
                src={image.src}
                alt={image.alt}
                width={560}
                height={420}
                sizes="(min-width: 1280px) 24vw, 62vw"
                className={`absolute h-auto max-w-none select-none object-contain drop-shadow-[0_24px_30px_rgba(15,23,42,0.2)] transition duration-500 group-hover:-translate-y-1 group-hover:scale-[1.025] ${image.className ?? ""}`}
              />
            </div>
          ) : (
            <>
              <div className={`absolute left-2 top-0 h-20 w-44 -rotate-12 rounded-full ${palette.line}`} />
              <div className={`absolute right-0 top-4 h-16 w-28 rounded-full ${palette.line}`} />
              <div className={`absolute right-16 top-8 h-44 w-32 rotate-[7deg] rounded-[1.9rem] ${palette.shapeA} shadow-[0_26px_50px_rgba(15,23,42,0.15)] transition duration-300 group-hover:-translate-y-2 group-hover:rotate-[10deg]`} />
              <div className={`absolute right-34 top-18 h-40 w-28 -rotate-[9deg] rounded-[1.5rem] ${palette.shapeB} shadow-[0_22px_44px_rgba(15,23,42,0.14)] transition duration-300 group-hover:translate-x-2 group-hover:translate-y-2`} />
              <div className={`absolute right-22 top-18 h-5 w-22 rounded-full ${palette.shapeC} transition duration-300 group-hover:scale-110`} />
              <div className={`absolute right-22 top-30 h-3 w-18 rounded-full ${theme === "ink" ? "bg-white/24" : "bg-slate-200/90"}`} />
              <div className={`absolute right-20 top-37 h-3 w-12 rounded-full ${theme === "ink" ? "bg-white/18" : "bg-slate-200/90"}`} />
              <div className={`absolute right-40 top-28 h-14 w-14 rounded-full ${theme === "paper" ? "bg-[#38bdf8]" : "bg-white/18"} transition duration-300 group-hover:-translate-y-1 group-hover:scale-105`} />
            </>
          )}
        </div>
      </div>
    </article>
  );
}

const promoTiles = [
  {
    title: "Tarjetas\nPremium",
    eyebrow: "Acabados destacados",
    theme: "sun" as const,
    image: {
      src: "/storefront-promo-cards.webp",
      alt: "Tarjetas premium con acabado elegante",
      className: "bottom-2 left-1/2 w-[15.5rem] -translate-x-1/2 sm:w-[16.5rem] xl:bottom-7 xl:left-auto xl:right-[-0.75rem] xl:w-[24rem] xl:translate-x-0",
    },
  },
  {
    title: "Stickers y\nEtiquetas",
    eyebrow: "Marca y packaging",
    theme: "sky" as const,
    image: {
      src: "/storefront-promo-stickers-labels.webp",
      alt: "Stickers y etiquetas personalizadas",
      className: "bottom-1 left-1/2 w-[16.5rem] -translate-x-1/2 sm:w-[17.25rem] xl:bottom-6 xl:left-auto xl:right-[-1.25rem] xl:w-[25.5rem] xl:translate-x-0",
    },
  },
  {
    title: "Pendones,\nafiches",
    eyebrow: "Gran formato",
    theme: "ink" as const,
    compact: true,
  },
  {
    title: "Talonarios,\nrecibos",
    eyebrow: "Impresion diaria",
    theme: "paper" as const,
    compact: true,
  },
];

export function StorefrontPromoPanels() {
  return (
    <section className="mx-auto w-full max-w-[112rem] pb-7 sm:pb-10 xl:px-4 2xl:px-10">
      <div className="xl:hidden">
        <div
          className="storefront-strip-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto"
          style={{
            paddingInline: "max(1rem, calc((100vw - min(78vw, 19rem)) / 2))",
          }}
        >
          {promoTiles.map((tile) => (
            <div
              key={tile.title}
              className="w-[78vw] max-w-[19rem] shrink-0 snap-center"
            >
              <PromoTile {...tile} />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden gap-4 px-4 sm:px-6 lg:px-8 xl:grid xl:grid-cols-[1.02fr_1.22fr_1fr] xl:px-4 2xl:px-0">
        <PromoTile {...promoTiles[0]} />
        <PromoTile {...promoTiles[1]} />

        <div className="grid gap-4">
          <PromoTile {...promoTiles[2]} />
          <PromoTile {...promoTiles[3]} />
        </div>
      </div>
    </section>
  );
}
