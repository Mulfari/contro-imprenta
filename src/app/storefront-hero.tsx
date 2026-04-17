"use client";
import { useEffect, useState } from "react";

type HeroSlide = {
  id: string;
  shellClass: string;
  imageClass: string;
  accentClass: string;
};

const slides: HeroSlide[] = [
  {
    id: "tarjetas",
    shellClass:
      "bg-[linear-gradient(135deg,#0f1f35_0%,#19426a_40%,#2d78b8_100%)]",
    imageClass:
      "bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_48%,#dbeafe_100%)]",
    accentClass: "bg-[#ffcf33]",
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

              <div className="flex h-full items-center justify-center p-4 sm:p-6 xl:p-8">
                <div className={`relative h-full w-full overflow-hidden rounded-[2rem] border border-white/14 shadow-[0_24px_60px_rgba(0,0,0,0.18)] ${slide.imageClass}`}>
                  <div className="absolute left-[6%] top-[10%] h-[22%] w-[14%] rounded-[2rem] bg-white/90 shadow-[0_12px_30px_rgba(15,23,42,0.08)]" />
                  <div className="absolute left-[10%] top-[42%] h-[18%] w-[24%] rounded-[1.8rem] border border-slate-200/80 bg-white/88 shadow-[0_12px_30px_rgba(15,23,42,0.08)]" />
                  <div className="absolute left-[38%] top-[18%] h-[54%] w-[36%] rounded-[2.2rem] border border-slate-200/80 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]" />
                  <div className="absolute right-[8%] top-[12%] h-[22%] w-[12%] rounded-[1.8rem] border border-white/40 bg-white/60 shadow-[0_16px_36px_rgba(15,23,42,0.08)]" />
                  <div className="absolute right-[10%] bottom-[12%] h-[28%] w-[20%] rounded-[1.8rem] border border-slate-200/80 bg-white/94 shadow-[0_16px_36px_rgba(15,23,42,0.08)]" />
                  <div className={`absolute right-[16%] top-[20%] h-[9%] w-[5%] rounded-full ${slide.accentClass} shadow-[0_14px_30px_rgba(0,0,0,0.1)]`} />

                  <div className="absolute left-[42%] top-[24%] h-[6%] w-[18%] rounded-full bg-slate-200" />
                  <div className="absolute left-[42%] top-[34%] h-[5%] w-[12%] rounded-full bg-slate-100" />
                  <div className="absolute left-[42%] top-[46%] h-[18%] w-[28%] rounded-[1.5rem] bg-slate-100" />
                  <div className="absolute left-[14%] bottom-[14%] h-[10%] w-[28%] rounded-[1.5rem] bg-white/78 shadow-[0_10px_24px_rgba(15,23,42,0.06)]" />
                  <div className="absolute left-[48%] bottom-[14%] h-[10%] w-[18%] rounded-[1.5rem] bg-white/92 shadow-[0_10px_24px_rgba(15,23,42,0.08)]" />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
