"use client";

import { useEffect, useState } from "react";

type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  cta: string;
  price: string;
  shellClass: string;
  imageClass: string;
  accentClass: string;
};

const slides: HeroSlide[] = [
  {
    id: "tarjetas",
    eyebrow: "Tarjetas premium",
    title: "Presentacion profesional para tu marca",
    cta: "Comprar tarjetas",
    price: "Desde $18",
    shellClass:
      "bg-[linear-gradient(135deg,#0f1f35_0%,#19426a_40%,#2d78b8_100%)]",
    imageClass:
      "bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_48%,#dbeafe_100%)]",
    accentClass: "bg-[#ffcf33]",
  },
  {
    id: "stickers",
    eyebrow: "Stickers y etiquetas",
    title: "Identidad visual para empaques y productos",
    cta: "Ver stickers",
    price: "Desde $14",
    shellClass:
      "bg-[linear-gradient(135deg,#2b153f_0%,#5b21b6_42%,#8b5cf6_100%)]",
    imageClass:
      "bg-[linear-gradient(135deg,#faf5ff_0%,#ffffff_46%,#ede9fe_100%)]",
    accentClass: "bg-[#f9a8d4]",
  },
  {
    id: "pendones",
    eyebrow: "Gran formato",
    title: "Pendones listos para promociones y eventos",
    cta: "Pedir pendones",
    price: "Desde $35",
    shellClass:
      "bg-[linear-gradient(135deg,#0f2d28_0%,#0f766e_46%,#14b8a6_100%)]",
    imageClass:
      "bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_46%,#ccfbf1_100%)]",
    accentClass: "bg-[#fde047]",
  },
];

export function StorefrontHero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 py-5 sm:px-6 lg:px-8 2xl:px-10">
      <div className="relative h-[420px] overflow-hidden rounded-[2.35rem] shadow-[0_30px_80px_rgba(15,23,42,0.22)] sm:h-[500px] xl:h-[600px]">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <article
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ${
                isActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              } ${slide.shellClass}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%)]" />
              <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(90deg,rgba(7,12,20,0.58)_0%,rgba(7,12,20,0.2)_38%,rgba(7,12,20,0)_70%)]" />

              <div className="relative grid h-full grid-cols-1 xl:grid-cols-[0.42fr_1.58fr]">
                <div className="flex h-full flex-col justify-end px-6 py-6 sm:px-8 sm:py-8 xl:px-10 xl:py-10">
                  <div className="max-w-md">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/72">
                      {slide.eyebrow}
                    </p>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl xl:text-[2.9rem]">
                      {slide.title}
                    </h1>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                        {slide.price}
                      </span>
                      <button
                        type="button"
                        className="cursor-pointer rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                      >
                        {slide.cta}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative hidden h-full xl:block">
                  <div className="absolute inset-y-8 left-0 right-8 rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur-sm">
                    <div className={`relative h-full rounded-[1.7rem] border border-white/40 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.18)] ${slide.imageClass}`}>
                      <div className="absolute left-6 top-6 h-24 w-24 rounded-[1.5rem] bg-white/80 shadow-sm" />
                      <div className={`absolute right-6 top-6 h-16 w-16 rounded-full ${slide.accentClass} shadow-[0_12px_30px_rgba(0,0,0,0.12)]`} />
                      <div className="absolute bottom-6 left-6 right-6 rounded-[1.3rem] bg-white/92 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.1)]">
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="h-3 w-24 rounded-full bg-slate-300" />
                            <div className="h-3 w-16 rounded-full bg-slate-200" />
                          </div>
                          <div className="flex h-20 w-20 items-center justify-center rounded-[1rem] border border-slate-200 bg-white text-xs font-semibold text-slate-400">
                            Imagen
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

        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-6 pb-5 sm:px-8 sm:pb-6 xl:px-10 xl:pb-8">
          <div className="flex items-center gap-2">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    isActive ? "w-10 bg-white" : "w-2.5 bg-white/40"
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
              className="cursor-pointer rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((current) => (current + 1) % slides.length)}
              className="cursor-pointer rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
