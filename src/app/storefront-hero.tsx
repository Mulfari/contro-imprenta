"use client";

import { useEffect, useState } from "react";

type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  bgClass: string;
  accentClass: string;
  cardClass: string;
  imageLabel: string;
  price: string;
};

const slides: HeroSlide[] = [
  {
    id: "tarjetas",
    eyebrow: "Tarjetas premium",
    title: "Presentacion profesional para tu marca",
    subtitle: "Acabados premium y entrega express",
    cta: "Comprar tarjetas",
    bgClass:
      "bg-[linear-gradient(120deg,#0f1f35_0%,#1d4f79_42%,#3b88c8_100%)]",
    accentClass: "bg-[#ffcf33]",
    cardClass:
      "bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_58%,#dbeafe_100%)]",
    imageLabel: "Tarjetas corporativas",
    price: "$18",
  },
  {
    id: "stickers",
    eyebrow: "Stickers y etiquetas",
    title: "Identidad visual para productos y empaques",
    subtitle: "Corte especial para envases y branding",
    cta: "Ver stickers",
    bgClass:
      "bg-[linear-gradient(120deg,#1b1230_0%,#4c1d95_40%,#7c3aed_100%)]",
    accentClass: "bg-[#f9a8d4]",
    cardClass:
      "bg-[linear-gradient(135deg,#faf5ff_0%,#ffffff_58%,#ede9fe_100%)]",
    imageLabel: "Etiquetas adhesivas",
    price: "$14",
  },
  {
    id: "pendones",
    eyebrow: "Gran formato",
    title: "Pendones listos para promociones y eventos",
    subtitle: "Impresion de alto impacto para vitrinas y ferias",
    cta: "Pedir pendones",
    bgClass:
      "bg-[linear-gradient(120deg,#10261f_0%,#0f766e_45%,#14b8a6_100%)]",
    accentClass: "bg-[#fde047]",
    cardClass:
      "bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_56%,#ccfbf1_100%)]",
    imageLabel: "Banner promocional",
    price: "$35",
  },
];

export function StorefrontHero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 py-5 sm:px-6 lg:px-8 2xl:px-10">
      <div className="relative h-[430px] overflow-hidden rounded-[2.25rem] shadow-[0_28px_70px_rgba(15,23,42,0.24)] sm:h-[500px] xl:h-[560px]">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <article
              key={slide.id}
              className={`absolute inset-0 px-6 py-6 text-white transition-all duration-700 sm:px-8 sm:py-8 xl:px-10 xl:py-10 ${
                slide.bgClass
              } ${
                isActive
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <div className="absolute left-8 top-8 h-44 w-44 rounded-full bg-white/8 blur-3xl" />
              <div className="absolute right-10 top-10 h-56 w-56 rounded-full bg-white/8 blur-3xl" />

              <div className="relative grid h-full gap-6 xl:grid-cols-[0.28fr_1.72fr] xl:items-stretch">
                <div className="flex max-w-sm flex-col justify-between gap-4 xl:py-6">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/68">
                      {slide.eyebrow}
                    </span>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                      {slide.title}
                    </h1>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-white/72">
                      {slide.subtitle}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="inline-flex rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                      Desde {slide.price}
                    </div>
                    <button
                      type="button"
                      className="inline-flex w-fit cursor-pointer items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                      {slide.cta}
                    </button>
                  </div>
                </div>

                <div className="relative min-h-[250px] sm:min-h-[340px] xl:min-h-0">
                  <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-white/8 backdrop-blur-sm" />
                  <div className="absolute left-6 top-6 h-24 w-24 rounded-[1.6rem] border border-white/15 bg-white/10" />
                  <div className="absolute right-8 top-8 h-20 w-20 rounded-[1.4rem] border border-white/15 bg-white/10" />

                  <div className="relative flex h-full items-center justify-center p-5 sm:p-6">
                    <div className="grid h-full w-full gap-4 xl:grid-cols-[1fr]">
                      <div className="rounded-[1.9rem] border border-white/16 bg-white p-4 text-slate-950 shadow-[0_24px_45px_rgba(0,0,0,0.18)] sm:p-5">
                        <div className="flex h-full flex-col justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                              Imagen principal
                            </p>
                            <div className="mt-4 rounded-[1.5rem] bg-slate-100 p-4">
                              <div className="grid gap-4 xl:grid-cols-[1.32fr_0.68fr]">
                                <div className={`flex min-h-[280px] items-center justify-center rounded-[1.3rem] border border-slate-200 xl:min-h-[330px] ${slide.cardClass}`}>
                                  <span className="text-sm font-semibold text-slate-400">
                                    {slide.imageLabel}
                                  </span>
                                </div>
                                <div className="grid gap-3">
                                  <div className="rounded-[1rem] border border-slate-200 bg-white p-3">
                                    <div className="flex h-28 items-center justify-center rounded-[0.9rem] bg-slate-100">
                                      <span className={`h-10 w-10 rounded-full ${slide.accentClass}`} />
                                    </div>
                                  </div>
                                  <div className="rounded-[1rem] border border-slate-200 bg-white p-3">
                                    <div className="flex h-28 items-center justify-center rounded-[0.9rem] bg-slate-100 px-4 text-center text-sm font-semibold text-slate-500">
                                      Promocion web
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm text-slate-500">Promocion online</p>
                              <p className="text-3xl font-semibold tracking-tight">{slide.price}</p>
                            </div>
                            <button
                              type="button"
                              className="cursor-pointer rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                              Ver mas
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        <div className="relative z-10 flex h-full items-end justify-between px-6 pb-5 sm:px-8 sm:pb-6 xl:px-10 xl:pb-8">
          <div className="flex items-center gap-2">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    isActive ? "w-10 bg-white" : "w-2.5 bg-white/45"
                  }`}
                  aria-label={`Mostrar banner ${index + 1}`}
                />
              );
            })}
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() =>
                setActiveIndex((current) => (current - 1 + slides.length) % slides.length)
              }
              className="cursor-pointer rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((current) => (current + 1) % slides.length)}
              className="cursor-pointer rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
