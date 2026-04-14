"use client";

import { useEffect, useState } from "react";

type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  cta: string;
  bgClass: string;
  accentClass: string;
  cardClass: string;
};

const slides: HeroSlide[] = [
  {
    id: "tarjetas",
    eyebrow: "Tarjetas premium",
    title: "Presentacion profesional para tu marca",
    cta: "Comprar tarjetas",
    bgClass:
      "bg-[linear-gradient(120deg,#0f1f35_0%,#1d4f79_42%,#3b88c8_100%)]",
    accentClass: "bg-[#ffcf33]",
    cardClass:
      "bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_58%,#dbeafe_100%)]",
  },
  {
    id: "stickers",
    eyebrow: "Stickers y etiquetas",
    title: "Identidad visual para productos y empaques",
    cta: "Ver stickers",
    bgClass:
      "bg-[linear-gradient(120deg,#1b1230_0%,#4c1d95_40%,#7c3aed_100%)]",
    accentClass: "bg-[#f9a8d4]",
    cardClass:
      "bg-[linear-gradient(135deg,#faf5ff_0%,#ffffff_58%,#ede9fe_100%)]",
  },
  {
    id: "pendones",
    eyebrow: "Gran formato",
    title: "Pendones listos para promociones y eventos",
    cta: "Pedir pendones",
    bgClass:
      "bg-[linear-gradient(120deg,#10261f_0%,#0f766e_45%,#14b8a6_100%)]",
    accentClass: "bg-[#fde047]",
    cardClass:
      "bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_56%,#ccfbf1_100%)]",
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
      <div className="relative overflow-hidden rounded-[2.2rem] shadow-[0_28px_70px_rgba(15,23,42,0.24)]">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <article
              key={slide.id}
              className={`absolute inset-0 px-8 py-8 text-white transition-all duration-700 sm:px-10 sm:py-10 ${
                slide.bgClass
              } ${
                isActive
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <div className="absolute left-8 top-8 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute right-10 top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

              <div className="relative grid min-h-[360px] gap-8 xl:grid-cols-[0.52fr_1.48fr] xl:items-end">
                <div className="flex max-w-md flex-col justify-end xl:pb-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.34em] text-white/70">
                    {slide.eyebrow}
                  </span>
                  <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {slide.title}
                  </h1>
                  <button
                    type="button"
                    className="mt-6 inline-flex w-fit cursor-pointer items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    {slide.cta}
                  </button>
                </div>

                <div className="relative min-h-[280px] sm:min-h-[360px]">
                  <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-white/8 backdrop-blur-sm" />
                  <div className="absolute left-6 top-6 h-24 w-24 rounded-[1.6rem] border border-white/15 bg-white/10" />
                  <div className="absolute right-8 top-8 h-20 w-20 rounded-[1.4rem] border border-white/15 bg-white/10" />

                  <div className="relative flex h-full items-center justify-center p-6 sm:p-8">
                    <div className="grid h-full w-full gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                      <div className={`rounded-[1.8rem] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.12)] ${slide.cardClass}`}>
                        <div className="flex h-full flex-col">
                          <div className="flex items-center justify-between gap-3">
                            <div className="space-y-2">
                              <div className="h-3 w-24 rounded-full bg-slate-300/70" />
                              <div className="h-3 w-20 rounded-full bg-slate-200/90" />
                            </div>
                            <span className={`h-10 w-10 rounded-full ${slide.accentClass}`} />
                          </div>

                          <div className="mt-5 grid flex-1 grid-cols-2 gap-3">
                            <div className="rounded-[1.1rem] border border-slate-200/70 bg-white/80" />
                            <div className="rounded-[1.1rem] border border-slate-200/70 bg-white/60" />
                            <div className="rounded-[1.1rem] border border-slate-200/70 bg-white/65" />
                            <div className="rounded-[1.1rem] border border-slate-200/70 bg-white/90" />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[1.8rem] border border-white/16 bg-white p-5 text-slate-950 shadow-[0_24px_45px_rgba(0,0,0,0.18)]">
                        <div className="flex h-full flex-col justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                              Imagen principal
                            </p>
                            <div className="mt-5 rounded-[1.4rem] bg-slate-100 p-4">
                              <div className="flex h-44 items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white">
                                <span className="text-sm font-semibold text-slate-400">
                                  Producto destacado
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm text-slate-500">Promocion online</p>
                              <p className="text-2xl font-semibold tracking-tight">Desde $18</p>
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

        <div className="relative z-10 flex min-h-[360px] items-end justify-between px-8 pb-6 sm:px-10">
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
