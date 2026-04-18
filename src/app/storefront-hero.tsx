"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type HeroSlide = {
  id: string;
  shellClass: string;
  imageClass: string;
  accentClass: string;
  type?: "promo";
};

const slides: HeroSlide[] = [
  {
    id: "promo",
    shellClass:
      "bg-[linear-gradient(90deg,#eb1687_0%,#ff2d9d_49.8%,#1ebeff_50.2%,#46c8ff_100%)]",
    imageClass:
      "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(15,23,42,0.08))]",
    accentClass: "bg-[#ffcf33]",
    type: "promo",
  },
  {
    id: "stickers",
    shellClass:
      "bg-[linear-gradient(135deg,#2b153f_0%,#5b21b6_42%,#8b5cf6_100%)]",
    imageClass:
      "bg-[linear-gradient(135deg,#faf5ff_0%,#ffffff_46%,#ede9fe_100%)]",
    accentClass: "bg-[#f9a8d4]",
  },
  {
    id: "pendones",
    shellClass:
      "bg-[linear-gradient(135deg,#0f2d28_0%,#0f766e_46%,#14b8a6_100%)]",
    imageClass:
      "bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_46%,#ccfbf1_100%)]",
    accentClass: "bg-[#fde047]",
  },
];

function PromoFlyerSlide() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.18),transparent_28%)]" />
      <div className="absolute inset-y-0 left-1/2 hidden w-px bg-white/18 lg:block" />
      <div className="absolute inset-x-0 top-0 h-7 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1.5px)] bg-[length:18px_18px] opacity-35" />

      <div className="relative grid h-full grid-cols-1 overflow-hidden lg:grid-cols-[1.05fr_0.9fr_0.95fr]">
        <div className="flex items-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="max-w-[24rem]">
            <p className="text-[clamp(2.4rem,5vw,5rem)] font-black uppercase leading-[0.9] tracking-[-0.05em] text-white drop-shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
              <span className="block">¡La </span>
              <span className="text-[#ffd23d]">calidad</span>
              <span className="block">de tu flyer</span>
              <span className="block">define tu</span>
              <span className="block">negocio!</span>
            </p>

            <div className="mt-8 flex items-center gap-3 text-[2.1rem] sm:text-[2.5rem]">
              <span className="text-[#ffd23d]">🤩</span>
              <span className="text-[#ffd23d]">↘</span>
              <span className="rounded-[1rem] bg-white/16 px-3 py-2 backdrop-blur-sm">✅</span>
            </div>
          </div>
        </div>

        <div className="relative hidden items-center justify-center px-2 py-8 lg:flex">
          <div className="absolute bottom-[12%] left-1/2 h-10 w-[68%] -translate-x-1/2 rounded-full bg-black/28 blur-2xl" />
          <div className="relative w-[82%] max-w-[24rem] rotate-[-8deg] rounded-[1.9rem] border border-white/12 bg-[linear-gradient(180deg,#0b1120_0%,#121826_100%)] p-5 text-white shadow-[0_30px_65px_rgba(15,23,42,0.45)]">
            <div className="pointer-events-none absolute inset-0 rounded-[1.9rem] bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(255,214,10,0.15),transparent_32%)]" />
            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <Image
                  src="/express-printer-logo.webp"
                  alt="Express Printer"
                  width={160}
                  height={46}
                  className="h-auto w-30"
                />
                <span className="text-[0.7rem] font-semibold tracking-[0.16em] text-white/65">
                  EP-PRINT
                </span>
              </div>

              <div className="space-y-1 text-[clamp(1.2rem,2vw,1.95rem)] font-black uppercase leading-[0.95] tracking-[-0.045em]">
                <div className="text-[#ffe24a]">Impresión láser</div>
                <div className="text-white">Tarjetas de</div>
                <div className="text-white">presentación</div>
                <div className="text-[#60b8ff]">Laminado</div>
                <div className="text-[#ff4ea5]">Gigantografía</div>
                <div className="text-white">Stickers adhesivos</div>
                <div className="text-[#ffe24a]">Brazaletes</div>
                <div className="flex gap-2">
                  <span className="text-[#49da83]">Volantes</span>
                  <span className="text-[#ff4ea5]">Pendones</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-white">Menú & catálogos</span>
                  <span className="text-[#60b8ff]">PVC</span>
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div className="space-y-1.5 text-[0.76rem] leading-4 text-white/78">
                  <p>0424-339-0487</p>
                  <p>Las Americas, PB, local 15</p>
                  <p>expressprinterpedidos@gmail.com</p>
                </div>
                <div className="h-18 w-18 rounded-[1rem] border border-white/10 bg-white p-1.5">
                  <div className="grid h-full w-full grid-cols-6 gap-[2px] rounded-[0.75rem] bg-black p-[5px]">
                    {Array.from({ length: 36 }).map((_, index) => (
                      <span
                        key={index}
                        className={`rounded-[1px] ${
                          (index + (index % 5)) % 3 === 0 ? "bg-white" : "bg-black"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-10 sm:px-10 lg:px-12">
          <div className="max-w-[25rem] text-right">
            <div className="space-y-5 text-[clamp(1.55rem,2.65vw,3rem)] font-bold leading-[1.08] tracking-[-0.04em] text-white drop-shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
              <p>No es solo papel, es la primera impresión que dejas en tus clientes.</p>
              <p>Un volante mal impreso puede alejar una venta; uno impecable, la cierra.</p>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 text-[2.1rem] sm:text-[2.5rem]">
              <span className="text-[#ffd23d]">😖</span>
              <span className="text-red-500">✕</span>
              <span className="text-[#ffd23d]">↗</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DefaultHeroSlide({ slide }: { slide: HeroSlide }) {
  return (
    <div className="flex h-full items-center justify-center p-4 sm:p-6 xl:p-8">
      <div
        className={`relative h-full w-full overflow-hidden rounded-[2rem] border border-white/14 shadow-[0_24px_60px_rgba(0,0,0,0.18)] ${slide.imageClass}`}
      >
        <div className="absolute left-[6%] top-[10%] h-[22%] w-[14%] rounded-[2rem] bg-white/90 shadow-[0_12px_30px_rgba(15,23,42,0.08)]" />
        <div className="absolute left-[10%] top-[42%] h-[18%] w-[24%] rounded-[1.8rem] border border-slate-200/80 bg-white/88 shadow-[0_12px_30px_rgba(15,23,42,0.08)]" />
        <div className="absolute left-[38%] top-[18%] h-[54%] w-[36%] rounded-[2.2rem] border border-slate-200/80 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]" />
        <div className="absolute right-[8%] top-[12%] h-[22%] w-[12%] rounded-[1.8rem] border border-white/40 bg-white/60 shadow-[0_16px_36px_rgba(15,23,42,0.08)]" />
        <div className="absolute right-[10%] bottom-[12%] h-[28%] w-[20%] rounded-[1.8rem] border border-slate-200/80 bg-white/94 shadow-[0_16px_36px_rgba(15,23,42,0.08)]" />
        <div
          className={`absolute right-[16%] top-[20%] h-[9%] w-[5%] rounded-full ${slide.accentClass} shadow-[0_14px_30px_rgba(0,0,0,0.1)]`}
        />

        <div className="absolute left-[42%] top-[24%] h-[6%] w-[18%] rounded-full bg-slate-200" />
        <div className="absolute left-[42%] top-[34%] h-[5%] w-[12%] rounded-full bg-slate-100" />
        <div className="absolute left-[42%] top-[46%] h-[18%] w-[28%] rounded-[1.5rem] bg-slate-100" />
        <div className="absolute left-[14%] bottom-[14%] h-[10%] w-[28%] rounded-[1.5rem] bg-white/78 shadow-[0_10px_24px_rgba(15,23,42,0.06)]" />
        <div className="absolute left-[48%] bottom-[14%] h-[10%] w-[18%] rounded-[1.5rem] bg-white/92 shadow-[0_10px_24px_rgba(15,23,42,0.08)]" />
      </div>
    </div>
  );
}

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
      <div className="relative h-[420px] overflow-hidden rounded-[2.35rem] shadow-[0_30px_80px_rgba(15,23,42,0.22)] sm:h-[500px] xl:h-[620px]">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <article
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ${
                isActive ? "opacity-100" : "pointer-events-none opacity-0"
              } ${slide.shellClass}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%)]" />
              {slide.type === "promo" ? <PromoFlyerSlide /> : <DefaultHeroSlide slide={slide} />}
            </article>
          );
        })}
      </div>
    </section>
  );
}
