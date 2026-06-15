"use client";

import { buildWhatsappLink } from "@/lib/whatsapp";

// Seccion de valor/confianza de la home. Antes mostraba testimonios de ejemplo
// con nombres y calificaciones inventadas; se reemplazo por afirmaciones
// honestas de como trabaja la imprenta (sin reseñas falsas).

const benefits = [
  {
    title: "Atencion personalizada",
    description:
      "Te orientamos en materiales, formatos y tiempos segun el tipo de trabajo.",
  },
  {
    title: "Revisamos tu arte",
    description:
      "Confirmamos medidas, colores y acabados antes de imprimir para evitar sorpresas.",
  },
  {
    title: "Tu arte o lo diseñamos",
    description:
      "Subes tu diseño listo para imprimir o nuestro equipo lo arma por ti.",
  },
  {
    title: "Coordina por WhatsApp",
    description:
      "Cotiza y confirma tu pedido por el canal que ya usas todos los dias.",
  },
  {
    title: "Calidad cuidada",
    description:
      "Revisamos cada trabajo para que salga tal como lo necesitas.",
  },
  {
    title: "Para personas y empresas",
    description:
      "Desde un pedido puntual hasta produccion recurrente para tu negocio.",
  },
];

function BenefitIcon({ index }: { index: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
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
  return (
    <section className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-[104rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#3558ff]">
            Por que elegirnos
          </p>
          <h2 className="mt-3 text-[1.7rem] font-black leading-tight tracking-tight text-slate-950 sm:text-[2.3rem]">
            Tu imprenta de confianza, de principio a fin
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Desde la cotizacion hasta la entrega cuidamos cada detalle para que
            tu material salga impecable.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item, index) => (
            <article
              key={item.title}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-[0_14px_30px_rgba(15,23,42,0.05)]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#3558ff]">
                <BenefitIcon index={index} />
              </div>
              <div>
                <h3 className="text-[1.05rem] font-semibold tracking-tight text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={buildWhatsappLink(
              "Hola Express Printer, quiero hacer un pedido.",
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1fbd5a] sm:w-fit"
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
            className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-fit"
          >
            Ver productos
          </a>
        </div>
      </div>
    </section>
  );
}
