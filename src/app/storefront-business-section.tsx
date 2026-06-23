"use client";

import { WhatsappLogo } from "@phosphor-icons/react";

import { buildWhatsappLink } from "@/lib/whatsapp";

// Empresas / B2B (export "imagen a sangre" de Claude Design): superficie oscura
// (= footer) con foto corporativa protagonista a la derecha (arriba en móvil) y
// las ventajas como lista tipográfica con barra amarilla en hover. CTA WhatsApp.

const grotesk = { fontFamily: "var(--font-space-grotesk), sans-serif" };

const advantages = [
  { title: "Precios preferenciales", desc: "Tarifas especiales para compras recurrentes." },
  { title: "Producción por volumen", desc: "Para sedes, marcas y eventos, sin perder consistencia." },
  { title: "Asesoría especializada", desc: "En materiales, formatos y acabados para cada pieza." },
  { title: "Atención prioritaria", desc: "Tus pedidos corporativos, primero en la fila." },
];

const whatsappLink = buildWhatsappLink(
  "Hola Express Printer, quiero informacion de impresion para mi empresa.",
);

export function StorefrontBusinessSection() {
  return (
    <section
      id="empresas"
      className="group mx-auto w-full max-w-[112rem] scroll-mt-6 px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8 2xl:px-10"
    >
      <div className="relative overflow-hidden rounded-[1.75rem] bg-[#08111f] sm:rounded-[2rem]">
        <div className="grid grid-cols-1 lg:min-h-[560px] lg:grid-cols-[1.02fr_0.98fr]">
          {/* Texto */}
          <div className="order-2 flex flex-col justify-center px-6 py-9 sm:px-10 sm:py-12 lg:order-none lg:px-14 lg:py-16">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex gap-1">
                <span className="h-[7px] w-[7px] rounded-full bg-[#23c4d6]" />
                <span className="h-[7px] w-[7px] rounded-full bg-[#e6398a]" />
                <span className="h-[7px] w-[7px] rounded-full bg-[#fbbf24]" />
                <span className="h-[7px] w-[7px] rounded-full bg-[#3558ff]" />
              </div>
              <span className="text-[13px] font-medium text-white/55">Para empresas y marcas</span>
            </div>

            <h2
              style={grotesk}
              className="max-w-[480px] text-[2rem] font-bold leading-[1.08] tracking-[-0.025em] text-white sm:text-[2.4rem] lg:text-[2.6rem]"
            >
              Impresión para empresas y marcas
            </h2>
            <p className="mt-4 max-w-[440px] text-[15px] leading-[1.6] text-white/60 sm:text-base">
              Producción recurrente y material corporativo con la presentación que tu marca
              merece. Una imprenta aliada para el día a día de tu empresa.
            </p>

            <div className="mt-8 max-w-[480px]">
              {advantages.map((item) => (
                <div
                  key={item.title}
                  className="group/adv relative border-t border-white/10 py-4 pl-[22px] transition-[padding] duration-200 first:border-t-0 hover:pl-7"
                >
                  <span className="absolute left-0 top-[21px] h-0 w-[3px] rounded-full bg-[#fbbf24] transition-[height] duration-200 group-hover/adv:h-[34px]" />
                  <div style={grotesk} className="text-[16.5px] font-semibold tracking-[-0.01em] text-white">
                    {item.title}
                  </div>
                  <div className="mt-1 text-sm leading-[1.5] text-white/60">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="mt-9">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-[13px] bg-[#25d366] px-7 py-3.5 text-[15.5px] font-semibold text-[#06310f] shadow-[0_8px_22px_rgba(37,211,102,0.26)] transition hover:opacity-90 hover:shadow-[0_12px_28px_rgba(37,211,102,0.34)] active:scale-[0.975]"
              >
                <WhatsappLogo size={20} weight="fill" />
                Solicitar atención empresarial
              </a>
            </div>
          </div>

          {/* Imagen a sangre (derecha en desktop, arriba en móvil) */}
          <div className="relative order-1 h-[180px] overflow-hidden sm:h-[230px] lg:order-none lg:h-auto">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              style={{ backgroundImage: "url('/empresas.jpg')" }}
            />
            {/* Blend hacia el texto: a la izquierda en desktop, hacia abajo en móvil */}
            <div className="absolute inset-0 hidden bg-[linear-gradient(to_right,#08111f_0%,rgba(8,17,31,0.55)_18%,rgba(8,17,31,0.06)_42%,rgba(8,17,31,0)_70%)] lg:block" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,17,31,0)_38%,#08111f_100%)] lg:hidden" />
          </div>
        </div>
      </div>
    </section>
  );
}
