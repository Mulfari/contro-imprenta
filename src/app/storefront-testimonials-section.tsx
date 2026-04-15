"use client";

const testimonials = [
  {
    name: "Mariela Gomez",
    role: "Emprendedora",
    time: "Hace 2 meses",
    quote:
      "Excelente calidad de impresion, tiempos de entrega cumplidos y una atencion muy cercana durante todo el pedido.",
  },
  {
    name: "Carlos Rojas",
    role: "Negocio local",
    time: "Hace 1 mes",
    quote:
      "Pedimos talonarios y etiquetas para el negocio. Todo llego bien terminado, con muy buena presentacion y rapido.",
  },
  {
    name: "Fabiana Rivas",
    role: "Evento social",
    time: "Hace 3 semanas",
    quote:
      "Quede muy satisfecha con mis invitaciones. El acabado se ve premium y el equipo resolvio cada detalle del diseño.",
  },
];

const trustPoints = [
  "Produccion rapida y seguimiento claro",
  "Asesoria para materiales y acabados",
  "Atencion por WhatsApp y en tienda",
  "Pagos seguros y confirmacion de pedidos",
];

function RatingStars() {
  return (
    <div className="flex gap-0.5 text-[#ffb61d]">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg key={index} aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-current">
          <path d="m10 2.4 2.3 4.7 5.2.8-3.7 3.6.9 5.1L10 14.2 5.3 16.6l.9-5.1L2.5 7.9l5.2-.8Z" />
        </svg>
      ))}
    </div>
  );
}

function UserInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-[#101828] text-sm font-bold tracking-[0.18em] text-white">
      {initials}
    </div>
  );
}

export function StorefrontTestimonialsSection() {
  return (
    <section className="w-full pb-18">
      <div className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-[118rem] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.4fr] lg:px-8 2xl:px-10">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Confianza real
              </p>
              <h2 className="mt-4 max-w-[22rem] text-[2.4rem] font-semibold tracking-tight text-slate-950">
                Comentarios reales de clientes que imprimen con nosotros
              </h2>
              <p className="mt-5 max-w-[28rem] text-[1.05rem] leading-8 text-slate-500">
                Desde pedidos corporativos hasta impresiones para eventos, esta es la experiencia de quienes ya trabajan con Express Printer.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3558ff]" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="flex h-full flex-col rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_16px_38px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-start gap-4">
                  <UserInitials name={item.name} />
                  <div>
                    <h3 className="text-[1.05rem] font-semibold tracking-tight text-slate-950">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-400">{item.role}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <RatingStars />
                      <span className="text-sm text-slate-400">{item.time}</span>
                    </div>
                  </div>
                </div>

                <p className="mt-6 flex-1 text-[1.02rem] leading-8 text-slate-700">
                  “{item.quote}”
                </p>

                <div className="mt-6 border-t border-slate-100 pt-4 text-sm font-medium text-slate-500">
                  Cliente verificado
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
