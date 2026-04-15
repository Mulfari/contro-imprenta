"use client";

import { useMemo, useState } from "react";

const testimonials = [
  {
    name: "Mariela Gomez",
    time: "Hace 2 meses",
    quote:
      "Excelente calidad de impresion, tiempos de entrega cumplidos y una atencion muy cercana durante todo el pedido.",
  },
  {
    name: "Carlos Rojas",
    time: "Hace 1 mes",
    quote:
      "Pedimos talonarios y etiquetas para el negocio. Todo llego bien terminado, con muy buena presentacion y rapido.",
  },
  {
    name: "Fabiana Rivas",
    time: "Hace 3 semanas",
    quote:
      "Quede muy satisfecha con mis invitaciones. El acabado se ve premium y el equipo resolvio cada detalle del diseño.",
  },
  {
    name: "Josue Perez",
    time: "Hace 6 semanas",
    quote:
      "Los pendones y stickers quedaron impecables. La asesoria fue clara y el proceso de aprobacion super sencillo.",
  },
  {
    name: "Andrea Salazar",
    time: "Hace 4 meses",
    quote:
      "Nos ayudaron con material corporativo para un evento y todo se entrego a tiempo, con muy buena presentacion.",
  },
];

const benefits = [
  {
    title: "Entregas a nivel nacional",
    description: "Enviamos pedidos a diferentes ciudades y coordinamos retiros en tienda.",
  },
  {
    title: "Satisfaccion garantizada",
    description: "Revisamos acabados y calidad para que cada trabajo salga como se espera.",
  },
  {
    title: "Precios competitivos",
    description: "Opciones para emprendedores, negocios y pedidos corporativos frecuentes.",
  },
  {
    title: "Atencion personalizada",
    description: "Te orientamos en materiales, formatos y tiempos segun el tipo de trabajo.",
  },
  {
    title: "Pagos seguros",
    description: "Procesamos tus pedidos con confirmacion clara y seguimiento de cada pago.",
  },
];

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? <path d="M12.5 4.5 7 10l5.5 5.5" /> : <path d="M7.5 4.5 13 10l-5.5 5.5" />}
    </svg>
  );
}

function RatingStars() {
  return (
    <div className="mt-1 flex gap-0.5 text-[#ffb61d]">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg key={index} aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-current">
          <path d="m10 2.4 2.3 4.7 5.2.8-3.7 3.6.9 5.1L10 14.2 5.3 16.6l.9-5.1L2.5 7.9l5.2-.8Z" />
        </svg>
      ))}
    </div>
  );
}

export function StorefrontTestimonialsSection() {
  const [startIndex, setStartIndex] = useState(0);
  const visibleTestimonials = useMemo(
    () => testimonials.slice(startIndex, startIndex + 3),
    [startIndex],
  );

  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + 3 < testimonials.length;

  return (
    <section className="w-full pb-18">
      <div className="border-y border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-4 px-3 py-7 sm:px-5 lg:px-6">
          <div className="h-px flex-1 bg-slate-200" />
          <h2 className="text-center text-[1.95rem] font-semibold tracking-tight text-slate-950">
            Lo que nuestros clientes estan diciendo
          </h2>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="relative px-6 pb-10 sm:px-8 lg:px-10 2xl:px-12">
          <button
            type="button"
            onClick={() => setStartIndex((current) => Math.max(current - 1, 0))}
            disabled={!canGoPrev}
            className={`absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border transition lg:flex xl:left-4 2xl:left-5 ${
              canGoPrev
                ? "cursor-pointer border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
                : "cursor-default border-slate-100 bg-slate-50 text-slate-300"
            }`}
            aria-label="Anterior"
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={() =>
              setStartIndex((current) => Math.min(current + 1, testimonials.length - 3))
            }
            disabled={!canGoNext}
            className={`absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border transition lg:flex xl:right-4 2xl:right-5 ${
              canGoNext
                ? "cursor-pointer border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
                : "cursor-default border-slate-100 bg-slate-50 text-slate-300"
            }`}
            aria-label="Siguiente"
          >
            <ArrowIcon direction="right" />
          </button>

          <div className="grid gap-6 lg:grid-cols-3 lg:gap-0">
            {visibleTestimonials.map((item, index) => (
              <article
                key={`${item.name}-${item.time}`}
                className={`px-5 py-8 text-center lg:px-10 2xl:px-12 ${
                  index < visibleTestimonials.length - 1 ? "lg:border-r lg:border-slate-200" : ""
                }`}
              >
                <div className="flex items-start justify-center gap-5">
                  <p className="text-[4.6rem] font-black leading-none tracking-tight text-[#ffb61d]">
                    5.0
                  </p>
                  <div className="pt-2 text-left">
                    <h3 className="text-[1.1rem] font-semibold tracking-tight text-slate-950">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-400">{item.time}</p>
                    <RatingStars />
                  </div>
                </div>
                <p className="mx-auto mt-8 max-w-[30rem] text-[1.15rem] leading-10 tracking-tight text-slate-800">
                  “{item.quote}”
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setStartIndex((current) => Math.max(current - 1, 0))}
              disabled={!canGoPrev}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                canGoPrev
                  ? "cursor-pointer border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
                  : "cursor-default border-slate-100 bg-slate-50 text-slate-300"
              }`}
              aria-label="Anterior"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() =>
                setStartIndex((current) => Math.min(current + 1, testimonials.length - 3))
              }
              disabled={!canGoNext}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                canGoNext
                  ? "cursor-pointer border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
                  : "cursor-default border-slate-100 bg-slate-50 text-slate-300"
              }`}
              aria-label="Siguiente"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>

        <div className="grid gap-5 border-t border-slate-200 px-3 py-10 sm:px-5 md:grid-cols-2 lg:grid-cols-5 lg:px-6 2xl:px-10">
          {benefits.map((item, index) => (
            <article key={item.title} className="flex items-start gap-4">
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-slate-200 text-[#3558ff]">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {index === 0 && (
                    <>
                      <path d="M4 7h16v10H4z" />
                      <path d="M8 7V4h8v3" />
                      <path d="M8 12h8" />
                    </>
                  )}
                  {index === 1 && (
                    <>
                      <path d="M12 3v18" />
                      <path d="M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.5 2.6 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3" />
                    </>
                  )}
                  {index === 2 && (
                    <>
                      <path d="M7 7h10" />
                      <path d="M7 12h7" />
                      <path d="M7 17h5" />
                      <path d="m18 15 2 2-2 2" />
                    </>
                  )}
                  {index === 3 && (
                    <>
                      <path d="M6 18 18 6" />
                      <path d="M8 6h10v10" />
                      <path d="M4 10v8h8" />
                    </>
                  )}
                  {index === 4 && (
                    <>
                      <path d="M12 3 5 6v6c0 4.2 2.9 7.9 7 9 4.1-1.1 7-4.8 7-9V6Z" />
                      <path d="M12 8v8" />
                      <path d="M9.5 11.5h5" />
                    </>
                  )}
                </svg>
              </div>
              <div>
                <h3 className="text-[1.08rem] font-semibold tracking-tight text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-7 text-slate-500">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
