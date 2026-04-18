"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type HeroSlide = {
  id: string;
  shellClass: string;
  panelClass: string;
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
  },
  {
    id: "schedule",
    type: "schedule",
    shellClass:
      "bg-[linear-gradient(135deg,#101827_0%,#172554_46%,#0f3a68_100%)]",
    panelClass:
      "bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_46%,#ddefff_100%)]",
  },
  {
    id: "delivery",
    type: "delivery",
    shellClass:
      "bg-[linear-gradient(135deg,#102616_0%,#14532d_45%,#0f766e_100%)]",
    panelClass:
      "bg-[linear-gradient(135deg,#f6fff8_0%,#effdf5_46%,#dcfce7_100%)]",
  },
];

function PromoPanel() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_28%)]" />
      <div className="absolute inset-y-0 left-1/2 hidden w-px bg-white/18 lg:block" />
      <div className="absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(circle_at_left_center,rgba(255,255,255,0.08),transparent_58%)]" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right_center,rgba(255,255,255,0.08),transparent_58%)]" />

      <div className="relative grid h-full grid-cols-1 lg:grid-cols-[1fr_0.92fr_0.92fr]">
        <div className="flex items-center px-8 py-10 sm:px-12 lg:px-16">
          <div className="max-w-[20rem]">
            <p className="text-[clamp(2rem,4.4vw,4.35rem)] font-black uppercase leading-[0.92] tracking-[-0.05em] text-white">
              <span className="block">La </span>
              <span className="text-[#ffd23d]">calidad</span>
              <span className="block">de tu flyer</span>
              <span className="block">define tu</span>
              <span className="block">negocio</span>
            </p>
          </div>
        </div>

        <div className="relative hidden items-center justify-center px-2 py-8 lg:flex">
          <div className="absolute bottom-[11%] left-1/2 h-11 w-[74%] -translate-x-1/2 rounded-full bg-black/34 blur-2xl" />
          <div className="relative -translate-y-3 w-[86%] max-w-[24rem]">
            <div className="absolute inset-x-[10%] top-[3%] h-[88%] rotate-[-3deg] bg-white/16 shadow-[0_26px_48px_rgba(15,23,42,0.16)]" />
            <div className="absolute inset-x-[7%] top-[2%] h-[92%] rotate-[4deg] bg-white/22 shadow-[0_28px_54px_rgba(15,23,42,0.18)]" />
            <div className="relative rotate-[-7deg] border border-white/16 bg-[linear-gradient(180deg,#07111f_0%,#0f1728_100%)] p-5 text-white shadow-[0_34px_70px_rgba(15,23,42,0.5)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.26),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,214,10,0.12),transparent_34%)]" />
              <div className="relative">
                <div className="flex items-center justify-between">
                <Image
                  src="/express-printer-logo.webp"
                  alt="Express Printer"
                  width={164}
                  height={48}
                  className="h-auto w-32"
                />
                <span className="border-b border-white/18 px-1 pb-1 text-[0.62rem] font-semibold tracking-[0.18em] text-white/72">
                  EXPRESS
                </span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-white/52">
                    Impresion y publicidad
                  </div>
                  <div className="space-y-1 text-[clamp(1.02rem,1.7vw,1.9rem)] font-black uppercase leading-[0.92] tracking-[-0.045em]">
                    <div className="text-[#ffe24a]">Impresion laser</div>
                    <div className="flex gap-2">
                      <span className="text-white">Tarjetas</span>
                      <span className="text-[#60b8ff]">laminado</span>
                    </div>
                    <div className="text-[#ff4ea5]">Gigantografia</div>
                    <div className="text-white">Stickers adhesivos</div>
                    <div className="flex gap-2">
                      <span className="text-[#49da83]">Volantes</span>
                      <span className="text-[#ff4ea5]">Pendones</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-white">Menus</span>
                      <span className="text-[#60b8ff]">PVC</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 border-y border-white/10 py-3 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-white/74">
                  <span>Mate y brillante</span>
                  <span>Bond y sulfato</span>
                  <span>Adhesivo</span>
                  <span>Listo para entregar</span>
                </div>

                <div className="mt-5 flex items-end justify-between gap-4">
                  <div className="space-y-1.5 text-[0.75rem] leading-4 text-white/78">
                    <p>0424-339-0487</p>
                    <p>Las Americas, PB, local 15</p>
                    <p>expressprinterpedidos@gmail.com</p>
                  </div>
                  <div className="border-t border-white/14 pt-2 text-right text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-white/72">
                    <p>Escanea</p>
                    <p className="text-[#ffd23d]">y siguenos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end px-8 py-10 sm:px-12 lg:px-16">
          <div className="max-w-[21rem] text-right">
            <div className="space-y-5 text-[clamp(1.35rem,2.15vw,2.45rem)] font-bold leading-[1.1] tracking-[-0.04em] text-white">
              <p>No es solo papel, es la primera impresion que dejas en tus clientes.</p>
              <p>Un volante mal impreso puede alejar una venta; uno impecable, la cierra.</p>
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
      <div className="absolute left-[4%] top-[9%] h-24 w-24 rounded-full border border-sky-200/80 bg-white/70 shadow-[0_18px_35px_rgba(15,23,42,0.06)]" />
      <div className="absolute left-[7.3%] top-[12.3%] h-1 w-7 origin-left rotate-[50deg] rounded-full bg-sky-500" />
      <div className="absolute left-[7.3%] top-[12.3%] h-1 w-5 origin-left rotate-[-42deg] rounded-full bg-slate-500" />
      <div className="absolute left-[11.2%] top-[15.8%] h-3 w-3 rounded-full bg-slate-900" />

      <div className="absolute right-[5%] top-[10%] h-[72%] w-[28%] rounded-[2rem] bg-[linear-gradient(180deg,#0f172a_0%,#1e3a8a_100%)] shadow-[0_28px_60px_rgba(15,23,42,0.2)]" />
      <div className="absolute right-[7.5%] top-[16%] h-[54%] w-[23%] rounded-[1.6rem] border border-white/10 bg-white/92 p-5 shadow-[0_18px_36px_rgba(15,23,42,0.12)]">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-sky-600">
          Horarios
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Lunes a viernes
            </p>
            <p className="mt-1 text-[1.35rem] font-black tracking-[-0.04em] text-slate-950">
              8:00 AM
            </p>
            <p className="text-sm font-semibold text-slate-500">a 6:00 PM</p>
          </div>
          <div className="h-px bg-slate-200" />
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Sabados
            </p>
            <p className="mt-1 text-[1.35rem] font-black tracking-[-0.04em] text-slate-950">
              9:00 AM
            </p>
            <p className="text-sm font-semibold text-slate-500">a 2:00 PM</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex h-full items-center px-7 py-10 sm:px-10 lg:px-12">
        <div className="max-w-[31rem]">
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-sky-600">
            Express Printer
          </p>
          <h2 className="mt-3 text-[clamp(2.2rem,4.7vw,4.9rem)] font-black uppercase leading-[0.92] tracking-[-0.05em] text-slate-950">
            Horarios de
            <span className="block text-sky-600">atencion</span>
          </h2>
          <p className="mt-5 max-w-[22rem] text-[1rem] leading-7 text-slate-600 sm:text-[1.08rem]">
            Recibimos pedidos, artes y trabajos comerciales durante toda la
            semana para que tu negocio no se detenga.
          </p>

          <div className="mt-8 flex items-center gap-4 text-sm font-semibold text-slate-600">
            <span className="rounded-full bg-white px-4 py-2 shadow-[0_12px_24px_rgba(15,23,42,0.07)]">
              WhatsApp activo
            </span>
            <span className="rounded-full bg-white px-4 py-2 shadow-[0_12px_24px_rgba(15,23,42,0.07)]">
              Recepcion de artes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeliveryPanel() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.12),transparent_28%)]" />
      <div className="absolute right-[8%] top-[18%] h-[34%] w-[22%] rounded-[2rem] border border-emerald-200/80 bg-white/88 shadow-[0_24px_50px_rgba(15,23,42,0.1)]" />
      <div className="absolute right-[13%] top-[46%] h-16 w-[16%] rounded-[1.4rem] bg-emerald-500 shadow-[0_20px_40px_rgba(34,197,94,0.28)]" />
      <div className="absolute right-[11%] top-[50%] h-7 w-[5%] rounded-full bg-slate-900" />
      <div className="absolute right-[25.5%] top-[50%] h-7 w-[5%] rounded-full bg-slate-900" />
      <div className="absolute right-[15%] top-[33%] h-[9%] w-[12%] rounded-[1rem] bg-emerald-100" />
      <div className="absolute right-[26.5%] top-[33%] h-[9%] w-[6%] rounded-l-[1rem] rounded-r-[0.4rem] bg-emerald-400" />

      <div className="absolute left-[50%] top-[58%] h-1.5 w-[18%] rotate-[-15deg] rounded-full bg-[#ffd23d]" />
      <div className="absolute left-[61%] top-[53%] h-4 w-4 rotate-45 border-r-[4px] border-t-[4px] border-[#ffd23d]" />

      <div className="relative z-10 flex h-full items-center px-7 py-10 sm:px-10 lg:px-12">
        <div className="max-w-[31rem]">
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-emerald-600">
            Promocion online
          </p>
          <h2 className="mt-3 text-[clamp(2.2rem,4.7vw,4.9rem)] font-black uppercase leading-[0.92] tracking-[-0.05em] text-slate-950">
            Tus pedidos
            <span className="block text-emerald-600">en linea</span>
            <span className="block">con delivery gratis</span>
          </h2>
          <p className="mt-5 max-w-[23rem] text-[1rem] leading-7 text-slate-600 sm:text-[1.08rem]">
            Compra desde la tienda, confirma por WhatsApp y recibe entrega sin
            costo en zonas seleccionadas.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              Pedidos web
            </span>
            <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              Delivery gratis
            </span>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.07)]">
              Zonas seleccionadas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroPanel({ slide }: { slide: HeroSlide }) {
  return (
    <div className="flex h-full items-center justify-center p-4 sm:p-6 xl:p-8">
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/14 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
        <div className={`absolute inset-0 ${slide.panelClass}`} />
        {slide.type === "promo" ? (
          <PromoPanel />
        ) : slide.type === "schedule" ? (
          <SchedulePanel />
        ) : (
          <DeliveryPanel />
        )}
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
              <HeroPanel slide={slide} />
            </article>
          );
        })}
      </div>
    </section>
  );
}
