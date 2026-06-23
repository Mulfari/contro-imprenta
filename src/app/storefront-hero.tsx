"use client";

import { type CSSProperties, useEffect, useState } from "react";

// Hero animado (carrusel de 3 slides) — export "Hero Slide 1 Animado" de Claude
// Design. Promo / Horarios / Delivery con foto real (Ken Burns), glows
// pulsantes CMYK, entrada escalonada del texto y dots con barra de progreso.
// Autoplay cada 5s; respeta prefers-reduced-motion. Fotos en /public (del ZIP).

const grotesk = { fontFamily: "var(--font-space-grotesk), sans-serif" };
const HERO_MS = 5000;

type Hour = { label: string; value: string };

type Slide = {
  id: string;
  bg: string;
  glowA: string;
  glowB: string;
  edge: string;
  image: string;
  alt: string;
  pre: string;
  accent: string;
  post: string;
  accentColor: string;
  subtitle: string;
  cta: string;
  hours?: Hour[];
};

const slides: Slide[] = [
  {
    id: "promo",
    bg: "linear-gradient(120deg,#0e1320 0%,#121a2c 52%,#0f1626 100%)",
    glowA: "rgba(255,45,157,0.20)",
    glowB: "rgba(25,195,255,0.16)",
    edge: "15,22,38",
    image: "/hero-promo.jpg",
    alt: "Prensa imprimiendo a todo color",
    pre: "La calidad de tu ",
    accent: "flyer",
    post: " define tu negocio.",
    accentColor: "#ffd21f",
    subtitle:
      "Flyers, tarjetas, gigantografías y stickers — impresos rápido y con un color que se nota. No es solo papel: es la primera impresión que dejas.",
    cta: "Ver catálogo",
  },
  {
    id: "schedule",
    bg: "linear-gradient(120deg,#0b1424 0%,#0f2a4d 50%,#0c2036 100%)",
    glowA: "rgba(47,127,255,0.22)",
    glowB: "rgba(25,195,255,0.16)",
    edge: "12,32,54",
    image: "/hero-schedule.jpg",
    alt: "Diseño y artes para impresión",
    pre: "Tus pedidos, atendidos ",
    accent: "a tiempo",
    post: ".",
    accentColor: "#7cc4ff",
    subtitle:
      "Producción, artes y recepción en horario comercial. Y lo mejor: recibimos pedidos online en cualquier momento.",
    hours: [
      { label: "Lunes a viernes", value: "8:00 — 18:00" },
      { label: "Sábados", value: "9:00 — 14:00" },
    ],
    cta: "Ver catálogo",
  },
  {
    id: "delivery",
    bg: "linear-gradient(120deg,#0a1a12 0%,#0f3a2a 48%,#0c2c20 100%)",
    glowA: "rgba(37,211,102,0.22)",
    glowB: "rgba(91,227,160,0.16)",
    edge: "12,44,32",
    image: "/hero-delivery.jpg",
    alt: "Pedidos listos para enviar",
    pre: "Pedidos online con ",
    accent: "delivery gratis",
    post: ".",
    accentColor: "#5be3a0",
    subtitle:
      "Compra en línea y te lo llevamos sin costo dentro de nuestra zona de cobertura. Para distancias mayores, el envío se calcula según la cercanía.",
    cta: "Ver catálogo",
  },
];

type StorefrontHeroProps = {
  onViewCatalog?: () => void;
};

export function StorefrontHero({ onViewCatalog }: StorefrontHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressSeed, setProgressSeed] = useState(0);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
      setProgressSeed((seed) => seed + 1);
    }, HERO_MS);
    return () => window.clearTimeout(id);
  }, [activeIndex]);

  const go = (index: number) => {
    setActiveIndex(index);
    setProgressSeed((seed) => seed + 1);
  };

  // El estado reposo/activo del texto va por estilo inline; reduced-motion lo
  // neutraliza vía CSS (.hero-rise con !important en globals.css).
  const rise = (active: boolean, delay: number): CSSProperties =>
    active
      ? {
          opacity: 1,
          transform: "translateY(0)",
          transition: `opacity 640ms ease ${delay}ms, transform 640ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        }
      : { opacity: 0, transform: "translateY(18px)", transition: "none" };

  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 py-5 sm:px-6 lg:px-8 2xl:px-10">
      <div className="relative h-[500px] overflow-hidden rounded-[1.75rem] shadow-[0_30px_80px_rgba(15,23,42,0.22)] sm:h-[540px] sm:rounded-[2rem] xl:h-[620px]">
        {slides.map((slide, index) => {
          const active = index === activeIndex;
          return (
            <article
              key={slide.id}
              aria-hidden={!active}
              className="absolute inset-0"
              style={{
                opacity: active ? 1 : 0,
                pointerEvents: active ? "auto" : "none",
                transition: "opacity 600ms ease",
              }}
            >
              <div
                className="grid h-full grid-rows-[38%_62%] lg:grid-cols-[1.05fr_0.95fr] lg:grid-rows-none"
                style={{ background: slide.bg }}
              >
                {/* Glows CMYK + textura de puntos */}
                <div
                  className="hero-glow pointer-events-none absolute -left-[8%] -top-[12%] h-[70%] w-[46%] blur-[20px]"
                  style={{ background: `radial-gradient(circle, ${slide.glowA}, transparent 65%)` }}
                />
                <div
                  className="hero-glow pointer-events-none absolute -bottom-[16%] left-[18%] h-[62%] w-[42%] blur-[22px]"
                  style={{
                    background: `radial-gradient(circle, ${slide.glowB}, transparent 66%)`,
                    animationDelay: "-4s",
                    animationDuration: "11s",
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0 opacity-50"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1.4px)",
                    backgroundSize: "16px 16px",
                  }}
                />

                {/* Texto */}
                <div className="relative z-[3] flex flex-col justify-center gap-3.5 overflow-hidden px-6 py-7 sm:gap-5 sm:px-10 lg:px-14 lg:py-12">
                  <h1 className="hero-rise" style={rise(active, 120)}>
                    <span
                      style={grotesk}
                      className="block text-[clamp(1.7rem,3.9vw,3.4rem)] font-bold leading-[1.04] tracking-[-0.03em] text-balance text-white"
                    >
                      {slide.pre}
                      <span style={{ color: slide.accentColor }}>{slide.accent}</span>
                      {slide.post}
                    </span>
                  </h1>
                  <p
                    style={rise(active, 230)}
                    className="hero-rise max-w-[30rem] text-[clamp(0.92rem,1.35vw,1.15rem)] leading-[1.5] text-white/70"
                  >
                    {slide.subtitle}
                  </p>

                  {slide.hours ? (
                    <div style={rise(active, 340)} className="hero-rise flex items-stretch gap-5">
                      {slide.hours.map((hour, hourIndex) => (
                        <div key={hour.label} className="flex items-stretch gap-5">
                          {hourIndex > 0 ? <div className="w-px bg-white/15" /> : null}
                          <div>
                            <div className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/45">
                              {hour.label}
                            </div>
                            <div style={grotesk} className="mt-1 text-[1.35rem] font-bold tracking-[-0.03em] text-white sm:text-[1.5rem]">
                              {hour.value}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="hero-rise" style={rise(active, slide.hours ? 450 : 340)}>
                    <button
                      type="button"
                      onClick={() => onViewCatalog?.()}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3.5 text-base font-medium text-white transition hover:bg-white/[0.12]"
                    >
                      {slide.cta}
                    </button>
                  </div>
                </div>

                {/* Media con Ken Burns */}
                <div className="relative z-[2] overflow-hidden">
                  <div
                    className="hero-kenburns absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${slide.image}')`, transformOrigin: "center" }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(100deg, rgba(${slide.edge},1) 0%, rgba(${slide.edge},0.6) 16%, rgba(${slide.edge},0) 42%)`,
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(0deg, rgba(${slide.edge},0.45) 0%, rgba(${slide.edge},0) 30%)`,
                    }}
                  />
                </div>
              </div>
            </article>
          );
        })}

        {/* Dots con progreso */}
        <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.16)] backdrop-blur-md">
            {slides.map((slide, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => go(index)}
                  aria-label={`Banner ${index + 1}`}
                  aria-pressed={active}
                  className="relative h-2.5 cursor-pointer overflow-hidden rounded-full transition-all duration-300"
                  style={{ width: active ? 44 : 16, background: "rgba(203,213,225,0.8)" }}
                >
                  {active ? (
                    <span
                      key={progressSeed}
                      className="hero-indicator-progress absolute inset-y-0 left-0 rounded-full bg-[#0a0f1e]"
                      style={{ animationDuration: `${HERO_MS}ms` }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
