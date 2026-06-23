"use client";

import Link from "next/link";
import {
  Clock,
  EnvelopeSimple,
  LockSimple,
  MapPin,
  WhatsappLogo,
} from "@phosphor-icons/react";

// Footer (export de Claude Design): superficie oscura premium con filo CMYK,
// 4 columnas (marca / navegar / categorías / contacto) que colapsan en móvil.
// Datos de contacto reales. El wordmark va TODO en blanco (sin "Printer" azul,
// por pedido de Jose). Las categorías abren el catálogo filtrado si se pasa
// onCategorySelect.

const grotesk = { fontFamily: "var(--font-space-grotesk), sans-serif" };

const WHATSAPP_LINK =
  "https://wa.me/584243390487?text=" +
  encodeURIComponent("Hola Express Printer, quiero hacer un pedido.");

const navLinks = [
  { label: "Catálogo", href: "#catalogo" },
  { label: "Destacados", href: "#destacados" },
  { label: "Empresas", href: "#empresas" },
];

const categoryLinks = [
  { name: "Tarjetas", query: "Tarjetas" },
  { name: "Stickers", query: "Stickers" },
  { name: "Pendones", query: "Pendones" },
  { name: "Talonarios", query: "Talonarios" },
  { name: "Etiquetas", query: "Etiquetas" },
];

function Wordmark({ size = "text-[22px]" }: { size?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span style={grotesk} className={`${size} font-bold tracking-[-0.02em] text-white`}>
        ExpressPrinter
      </span>
      <span className="h-2 w-2 rounded-full bg-[#fbbf24]" />
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-[18px] text-[11px] font-semibold uppercase tracking-[0.15em] text-[#fbbf24]">
      {children}
    </div>
  );
}

type StorefrontFooterProps = {
  onCategorySelect?: (query: string) => void;
};

export function StorefrontFooter({ onCategorySelect }: StorefrontFooterProps) {
  return (
    <footer className="relative bg-[#08111f] text-white">
      {/* Filo CMYK */}
      <div className="flex h-[3px]">
        <div className="flex-1 bg-[#23c4d6]" />
        <div className="flex-1 bg-[#e6398a]" />
        <div className="flex-1 bg-[#fbbf24]" />
        <div className="flex-1 bg-[#3558ff]" />
      </div>

      <div className="mx-auto w-full max-w-[112rem] px-6 pb-7 pt-12 sm:px-8 lg:px-12 lg:pt-14">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr] lg:gap-12">
          {/* Marca */}
          <div className="col-span-2 lg:col-span-1">
            <Wordmark />
            <p className="mt-[18px] max-w-[280px] text-sm leading-relaxed text-white/60">
              Impresión comercial, publicitaria y corporativa.
            </p>
          </div>

          {/* Navegar */}
          <div>
            <Heading>Navegar</Heading>
            <ul className="flex flex-col gap-[13px]">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 transition hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorías */}
          <div>
            <Heading>Categorías</Heading>
            <ul className="flex flex-col gap-[13px]">
              {categoryLinks.map((category) => (
                <li key={category.name}>
                  <button
                    type="button"
                    onClick={() => onCategorySelect?.(category.query)}
                    className="group inline-flex cursor-pointer items-center gap-2 text-sm text-white/60 transition hover:text-[#fbbf24]"
                  >
                    <span className="h-[5px] w-[5px] shrink-0 -translate-x-1 rounded-full bg-[#fbbf24] opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="col-span-2 lg:col-span-1">
            <Heading>Contacto</Heading>
            <div className="flex flex-col gap-[15px] text-sm">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-start gap-2.5 text-white/65 transition hover:text-white"
              >
                <WhatsappLogo size={18} className="mt-px shrink-0 text-[#5b7bff]" />
                +58 424-339-0487
              </a>
              <a
                href="mailto:expressprinterpedidos@gmail.com"
                className="inline-flex items-start gap-2.5 break-all text-white/65 transition hover:text-white"
              >
                <EnvelopeSimple size={18} className="mt-px shrink-0 text-[#5b7bff]" />
                expressprinterpedidos@gmail.com
              </a>
              <div className="inline-flex items-start gap-2.5 text-white/65">
                <MapPin size={18} className="mt-px shrink-0 text-[#5b7bff]" />
                Las Américas, PB, local 15
              </div>
              <div className="inline-flex items-start gap-2.5 text-white/65">
                <Clock size={18} className="mt-px shrink-0 text-[#5b7bff]" />
                <span className="leading-[1.55]">
                  Lun a Vie 8:00–18:00
                  <br />
                  Sáb 9:00–14:00
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[112rem] flex-col items-start gap-2.5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <span className="text-[13px] text-white/40">© 2026 Express Printer</span>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[12.5px] text-white/30 transition hover:text-white/60"
          >
            <LockSimple size={13} />
            Panel administrativo
          </Link>
        </div>
      </div>
    </footer>
  );
}
