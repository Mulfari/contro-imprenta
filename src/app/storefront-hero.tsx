"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type HeroSlide = {
  id: string;
  shellClass: string;
  panelClass: string;
  accentClass: string;
  type: "promo" | "schedule" | "delivery";
};

const slides: HeroSlide[] = [
  {
    id: "promo",
    type: "promo",
    shellClass:
      "bg-[linear-gradient(135deg,#141b29_0%,#1a2440_48%,#143253_100%)]",
    panelClass:
      "bg-[linear-gradient(90deg,#eb1687_0%,#ff2d9d_49.8%,#1ebeff_50.2%,#46c8ff_100%)]",
    accentClass: "bg-[#ffd23d]",
  },
  {
    id: "schedule",
    type: "schedule",
    shellClass:
      "bg-[linear-gradient(135deg,#101827_0%,#172554_46%,#0f3a68_100%)]",
    panelClass:
      "bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_46%,#ddefff_100%)]",
    accentClass: "bg-[#38bdf8]",
  },
  {
    id: "delivery",
    type: "delivery",
    shellClass:
      "bg-[linear-gradient(135deg,#102616_0%,#14532d_45%,#0f766e_100%)]",
    panelClass:
      "bg-[linear-gradient(135deg,#f6fff8_0%,#effdf5_46%,#dcfce7_100%)]",
    accentClass: "bg-[#22c55e]",
  },
];

function PromoPanel() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_30%)]" />
      <div className="absolute inset-y-0 left-1/2 hidden w-px bg-white/18 lg:block" />

      <div className="grid h-full grid-cols-1 lg:grid-cols-[1.05fr_0.9fr_0.95fr]">
        <div className="flex items-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="max-w-[22rem]">
            <p className="text-[clamp(2.2rem,5vw,5rem)] font-black uppercase leading-[0.9] tracking-[-0.05em] text-white">
              <span className="block">¡La </span>
              <span className="text-[#ffd23d]">calidad</span>
              <span className="block">de tu flyer</span>
              <span className="block">define tu</span>
              <span className="block">negocio!</span>
            </p>

            <div className="mt-8 flex items-center gap-3 text-[2rem] sm:text-[2.4rem]">
              <span>🤩</span>
              <span className="text-[#ffd23d]">↘</span>
              <span className="rounded-[1rem] bg-white/16 px-3 py-2 backdrop-blur-sm">✅</span>
            </div>
          </div>
        </div>

        <div className="relative hidden items-center justify-center px-3 py-8 lg:flex">
          <div className="absolute bottom-[11%] left-1/2 h-10 w-[68%] -translate-x-1/2 rounded-full bg-black/28 blur-2xl" />
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

              <div className="space-y-1 text-[clamp(1.18rem,2vw,1.95rem)] font-black uppercase leading-[0.95] tracking-[-0.045em]">
                <div className="text-[#ffe24a]">Impresión láser</div>
                <div className="text-white">Tarjetas de</div>
                <div className="text-white">presentación</div>
                <div className="text-[#60b8ff]">Laminado</div>
                <div className="text-[#ff4ea5]">Gigantografía</div>
                <div className="text-white">Stickers adhesivos</div>
                <div className="flex gap-2">
                  <span className="text-[#49da83]">Volantes</span>
                  <span className="text-[#ff4ea5]">Pendones</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-white">Menús y catálogos</span>
                  <span className="text-[#60b8ff]">PVC</span>
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div className="space-y-1.5 text-[0.76rem] leading-4 text-white/78">
                  <p>0424-339-0487</p>
                  <p>Las Américas, PB, local 15</p>
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
            <div className="space-y-5 text-[clamp(1.5rem,2.5vw,3rem)] font-bold leading-[1.08] tracking-[-0.04em] text-white">
              <p>No es solo papel, es la primera impresión que dejas en tus clientes.</p>
              <p>Un volante mal impreso puede alejar una venta; uno impecable, la cierra.</p>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 text-[2rem] sm:text-[2.4rem]">
              <span>😖</span>
              <span className="text-red-500">✕</span>
              <span className="text-[#ffd23d]">↗</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SchedulePanel() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_28%)]" />
      <div className="grid h-full grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex items-center px-7 py-10 sm:px-10 lg:px-12">
          <div className="max-w-[24rem]">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-sky-600">
              Express Printer
            </p>
            <h2 className="mt-3 text-[clamp(2.1rem,4.6vw,4.6rem)] font-black uppercase leading-[0.92] tracking-[-0.05em] text-slate-950">
              Horarios de
              <span className="block text-sky-600">atención</span>
            </h2>
            <p className="mt-4 max-w-[20rem] text-[1rem] leading-7 text-slate-600 sm:text-[1.08rem]">
              Estamos listos para recibir pedidos, imprimir y ayudarte a resolver
              materiales comerciales durante la semana.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-7 py-10 sm:px-10 lg:px-12">
          <div className="grid w-full max-w-[34rem] gap-4 sm:grid-cols-2">
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_24px_45px_rgba(15,23,42,0.08)]">
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Lunes a viernes
              </p>
              <p className="mt-3 text-[2rem] font-black tracking-[-0.04em] text-slate-950">
                8:00 AM
              </p>
              <p className="text-lg font-semibold text-slate-500">a 6:00 PM</p>
            </div>
            <div className="rounded-[1.8rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_45px_rgba(15,23,42,0.12)]">
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-white/55">
                Sábados
              </p>
              <p className="mt-3 text-[2rem] font-black tracking-[-0.04em]">
                9:00 AM
              </p>
              <p className="text-lg font-semibold text-white/72">a 2:00 PM</p>
            </div>
            <div className="rounded-[1.8rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_35px_rgba(15,23,42,0.06)] sm:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-emerald-600">
                    Atención rápida
                  </p>
                  <p className="mt-2 text-[1.2rem] font-bold tracking-[-0.03em] text-slate-950">
                    Respuesta por WhatsApp y recepción de artes
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-emerald-100 text-2xl">
                  🕒
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeliveryPanel() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.14),transparent_30%)]" />
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex items-center px-7 py-10 sm:px-10 lg:px-12">
          <div className="max-w-[25rem]">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-emerald-600">
              Promoción online
            </p>
            <h2 className="mt-3 text-[clamp(2.1rem,4.8vw,4.8rem)] font-black uppercase leading-[0.92] tracking-[-0.05em] text-slate-950">
              Tus pedidos
              <span className="block text-emerald-600">con delivery</span>
              <span className="block">gratis</span>
            </h2>
            <p className="mt-4 max-w-[22rem] text-[1rem] leading-7 text-slate-600 sm:text-[1.08rem]">
              Haz tu pedido desde la tienda online y recibe envío sin costo en
              zonas seleccionadas. Más rápido, más simple y sin vueltas.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                Pedidos web
              </span>
              <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                Delivery gratis
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center px-7 py-10 sm:px-10 lg:px-12">
          <div className="absolute bottom-[16%] left-1/2 h-10 w-[62%] -translate-x-1/2 rounded-full bg-emerald-200/70 blur-2xl" />
          <div className="relative w-full max-w-[32rem] rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-[0_28px_55px_rgba(15,23,42,0.1)]">
            <div className="absolute -right-4 -top-4 rounded-[1.1rem] bg-emerald-500 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_35px_rgba(34,197,94,0.34)]">
              Gratis
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Compra online
                </p>
                <p className="mt-2 text-[1.8rem] font-black tracking-[-0.04em] text-slate-950">
                  Envío incluido
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.3rem] bg-emerald-100 text-3xl">
                🚚
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {[
                "Aplica para pedidos desde la tienda online",
                "Confirmación rápida por WhatsApp",
                "Entrega coordinada según zona disponible",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[1.1rem] bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
                    ✓
                  </span>
                  <span>{item}</span>
                </div>
              ))}
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
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/14 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
        <div className={`absolute inset-0 ${slide.panelClass}`} />
        {slide.type === "promo" ? <PromoPanel /> : slide.type === "schedule" ? <SchedulePanel /> : <DeliveryPanel />}
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
              <DefaultHeroSlide slide={slide} />
            </article>
          );
        })}
      </div>
    </section>
  );
}
