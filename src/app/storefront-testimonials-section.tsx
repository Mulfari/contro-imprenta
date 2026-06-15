"use client";

import Image from "next/image";
import { type MouseEvent as ReactMouseEvent, useEffect, useRef } from "react";

import { buildWhatsappLink } from "@/lib/whatsapp";

// Seccion de valor de la home. Banda oscura tipo "sala de impresion" que
// contrasta con la home clara: un stack 3D de piezas reales que flota y
// reacciona al cursor, ventajas honestas con micro-interacciones y entrada
// escalonada. Sin reseñas ni datos inventados. Todo CSS/JS puro (sin libs).

const benefits = [
  {
    title: "Atencion personalizada",
    description: "Te orientamos en materiales, formatos y tiempos.",
  },
  {
    title: "Revisamos tu arte",
    description: "Confirmamos medidas, colores y acabados antes de imprimir.",
  },
  {
    title: "Tu arte o lo diseñamos",
    description: "Subes tu diseño listo o nuestro equipo lo arma por ti.",
  },
  {
    title: "Coordina por WhatsApp",
    description: "Cotiza y confirma por el canal que ya usas a diario.",
  },
  {
    title: "Calidad cuidada",
    description: "Revisamos cada trabajo para que salga como lo necesitas.",
  },
  {
    title: "Personas y empresas",
    description: "Desde un pedido puntual hasta produccion recurrente.",
  },
];

function BenefitIcon({ index }: { index: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {index === 0 && (
        <>
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </>
      )}
      {index === 1 && (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
          <path d="m9 11 1.5 1.5L14 9" />
        </>
      )}
      {index === 2 && (
        <>
          <path d="M4 7h16v10H4z" />
          <path d="M8 7V4h8v3" />
          <path d="M8 12h6" />
        </>
      )}
      {index === 3 && (
        <>
          <path d="M19.5 12.5a7 7 0 1 1-3-5.7" />
          <path d="m4 20 1.4-3.2" />
          <path d="m9 11 2 2 4-4" />
        </>
      )}
      {index === 4 && (
        <>
          <path d="M12 3 5 6v6c0 4.2 2.9 7.9 7 9 4.1-1.1 7-4.8 7-9V6Z" />
          <path d="m9 12 2 2 4-4" />
        </>
      )}
      {index === 5 && (
        <>
          <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M17 11a3 3 0 1 0 0-6" />
          <path d="M3 20a6 6 0 0 1 12 0" />
          <path d="M16 14a6 6 0 0 1 5 6" />
        </>
      )}
    </svg>
  );
}

export function StorefrontTestimonialsSection() {
  const groupRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  // Entrada escalonada segura: el contenido es visible por defecto (SSR /
  // headless / sin JS). En el cliente se "arma" (.vp-js oculta) y se revela
  // al entrar en viewport, con un fallback por tiempo que garantiza la
  // aparicion aun en pestañas en segundo plano.
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    group.classList.add("vp-js");
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      group.classList.add("vp-in");
    };

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            reveal();
            observer?.disconnect();
          }
        },
        { threshold: 0.18 },
      );
      observer.observe(group);
    } else {
      reveal();
    }

    const timer = window.setTimeout(reveal, 1400);
    return () => {
      observer?.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // Parallax 3D del stack siguiendo el cursor (punteros finos; en tactil no
  // dispara y queda el flotar suave).
  const handlePointerMove = (event: ReactMouseEvent<HTMLElement>) => {
    const el = stackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--vp-ry", `${px * 14}deg`);
    el.style.setProperty("--vp-rx", `${-py * 12}deg`);
  };

  const resetTilt = () => {
    const el = stackRef.current;
    if (!el) return;
    el.style.setProperty("--vp-ry", "0deg");
    el.style.setProperty("--vp-rx", "0deg");
  };

  return (
    <section
      onMouseMove={handlePointerMove}
      onMouseLeave={resetTilt}
      className="relative w-full overflow-hidden bg-[#0a0d15] text-white"
    >
      {/* Glows de ambiente (azul de marca + ambar) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-[-12%] h-[26rem] w-[26rem] rounded-full bg-[#3558ff]/25 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-[-22%] h-[30rem] w-[30rem] rounded-full bg-[#ffb000]/16 blur-[130px]"
      />
      {/* Trama tenue tipo papel milimetrado */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:46px_46px]"
      />

      <div className="relative mx-auto grid w-full max-w-[104rem] items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10 lg:px-8 lg:py-24">
        {/* Columna de copy + ventajas + CTA */}
        <div ref={groupRef}>
          <h2
            className="vp-item max-w-[18ch] text-[2.2rem] font-black leading-[1.02] tracking-[-0.03em] text-balance sm:text-[2.8rem] lg:text-[3.35rem]"
          >
            Tu imprenta de confianza,{" "}
            <span className="text-[#ffd23d]">de principio a fin.</span>
          </h2>
          <p
            className="vp-item mt-5 max-w-[46ch] text-base leading-7 text-slate-300 sm:text-[1.05rem]"
            style={{ transitionDelay: "60ms" }}
          >
            Desde la cotizacion hasta la entrega cuidamos cada detalle para que
            tu material salga impecable. Pidelo online o coordinalo por
            WhatsApp, como prefieras.
          </p>

          <ul className="mt-9 grid gap-1.5 sm:grid-cols-2 sm:gap-x-6">
            {benefits.map((item, index) => (
              <li
                key={item.title}
                className="vp-item"
                style={{ transitionDelay: `${140 + index * 70}ms` }}
              >
                <div className="group/row flex items-start gap-3.5 rounded-xl p-2.5 transition-colors duration-200 hover:bg-white/[0.05]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[#ffd23d] ring-1 ring-white/10 transition duration-200 group-hover/row:scale-110 group-hover/row:bg-[#ffd23d]/15 group-hover/row:ring-[#ffd23d]/30">
                    <BenefitIcon index={index} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[0.98rem] font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-sm leading-6 text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div
            className="vp-item mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ transitionDelay: `${140 + benefits.length * 70}ms` }}
          >
            <a
              href={buildWhatsappLink(
                "Hola Express Printer, quiero hacer un pedido.",
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,211,102,0.28)] transition hover:bg-[#1fbd5a]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="currentColor"
              >
                <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2c-5.45 0-9.88 4.43-9.88 9.88 0 1.74.45 3.43 1.31 4.92L2 22l5.35-1.4a9.82 9.82 0 0 0 4.68 1.19h.01c5.45 0 9.88-4.43 9.88-9.88a9.8 9.8 0 0 0-2.87-7ZM12.04 20.1h-.01a8.13 8.13 0 0 1-4.14-1.13l-.3-.18-3.17.83.85-3.09-.2-.32a8.11 8.11 0 0 1 1.24-10.03 8.1 8.1 0 0 1 5.77-2.38c4.49 0 8.15 3.65 8.15 8.14 0 4.49-3.66 8.15-8.19 8.15Z" />
              </svg>
              Escribenos por WhatsApp
            </a>
            <a
              href="#destacados"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
            >
              Ver productos
            </a>
          </div>
        </div>

        {/* Stack 3D de piezas reales */}
        <div className="vp-stack relative mx-auto flex h-[20rem] w-full max-w-[30rem] items-center justify-center sm:h-[25rem] lg:h-[30rem]">
          {/* Anillo lento detras del stack */}
          <div
            aria-hidden="true"
            className="vp-spin-slow absolute h-[20rem] w-[20rem] rounded-full border border-dashed border-white/10 sm:h-[24rem] sm:w-[24rem]"
          />
          <div
            aria-hidden="true"
            className="absolute h-[14rem] w-[14rem] rounded-full bg-[radial-gradient(circle,rgba(53,88,255,0.18),transparent_70%)] blur-2xl sm:h-[18rem] sm:w-[18rem]"
          />

          <div ref={stackRef} className="vp-stack-inner relative h-full w-full">
            {/* Pendon (atras) */}
            <div
              className="absolute left-1/2 top-1/2 w-[12rem] sm:w-[14.5rem]"
              style={{
                transform:
                  "translate(-78%, -58%) translateZ(-70px) rotate(-10deg)",
              }}
            >
              <div className="vp-float-b">
                <Image
                  src="/storefront-promo-banners-posters-transparent.webp"
                  alt="Pendones publicitarios impresos"
                  width={920}
                  height={885}
                  sizes="(min-width: 1024px) 16vw, 40vw"
                  className="h-auto w-full drop-shadow-[0_34px_50px_rgba(0,0,0,0.55)]"
                />
              </div>
            </div>

            {/* Stickers (medio) */}
            <div
              className="absolute left-1/2 top-1/2 w-[12.5rem] sm:w-[15rem]"
              style={{
                transform: "translate(-22%, -34%) translateZ(0) rotate(8deg)",
              }}
            >
              <div className="vp-float-a" style={{ animationDelay: "-2s" }}>
                <Image
                  src="/storefront-promo-stickers-labels-trimmed.webp"
                  alt="Stickers y etiquetas troqueladas"
                  width={1024}
                  height={824}
                  sizes="(min-width: 1024px) 17vw, 42vw"
                  className="h-auto w-full drop-shadow-[0_30px_44px_rgba(0,0,0,0.5)]"
                />
              </div>
            </div>

            {/* Tarjetas premium (frente) */}
            <div
              className="absolute left-1/2 top-1/2 w-[13rem] sm:w-[16rem]"
              style={{
                transform:
                  "translate(-46%, -2%) translateZ(80px) rotate(-3deg)",
              }}
            >
              <div className="vp-float-a">
                <Image
                  src="/storefront-promo-cards-premium.webp"
                  alt="Tarjetas premium impresas"
                  width={1000}
                  height={640}
                  sizes="(min-width: 1024px) 18vw, 46vw"
                  className="h-auto w-full drop-shadow-[0_36px_54px_rgba(0,0,0,0.6)]"
                />
                {/* Chip flotante */}
                <span className="absolute -right-2 -top-3 inline-flex items-center gap-1.5 rounded-full bg-[#ffd23d] px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.04em] text-slate-950 shadow-[0_12px_24px_rgba(0,0,0,0.4)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />
                  Listo para imprimir
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
