"use client";

import Link from "next/link";

function FooterLogo() {
  return (
    <Link
      href="/"
      className="group inline-flex w-fit cursor-pointer items-center rounded-xl border border-white/20 bg-white px-4 py-3 shadow-[0_18px_42px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_56px_rgba(0,0,0,0.3)]"
      aria-label="Express Printer"
    >
      <span className="relative block h-[2.9rem] w-[10.4rem]" aria-hidden="true">
        <span
          className="block h-full w-full"
          style={{
            backgroundImage: "url('/express-printer-logo.webp')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "left center",
            backgroundSize: "contain",
          }}
        />
        <span
          className="pointer-events-none absolute text-[12px] font-black uppercase tracking-[0.08em] text-slate-500"
          style={{ left: "5.45rem", top: "1.9rem" }}
        >
          Printer
        </span>
      </span>
    </Link>
  );
}

export function StorefrontFooter() {
  return (
    <footer className="bg-[#08111f] text-slate-200">
      <div className="mx-auto grid w-full max-w-[118rem] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 2xl:px-10">
        <div className="space-y-5">
          <FooterLogo />
          <p className="max-w-md text-sm leading-6 text-slate-400">
            Impresion comercial, publicitaria y corporativa con pedidos online
            conectados al panel administrativo.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-sm text-slate-300 shadow-[0_18px_44px_rgba(0,0,0,0.18)] lg:min-w-[24rem] lg:text-right">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Contacto
          </p>
          <div className="space-y-2">
            <p>
              WhatsApp:{" "}
              <a
                href="https://wa.me/584243390487?text=Hola%2C%20necesito%20ayuda%20con%20mi%20pedido%20en%20Express%20Printer."
                target="_blank"
                rel="noreferrer"
                className="font-medium text-white transition hover:text-slate-100"
              >
                +58 424-339-0487
              </a>
            </p>
            <p>
              Correo:{" "}
              <a
                href="mailto:expressprinterpedidos@gmail.com"
                className="font-medium text-white transition hover:text-slate-100"
              >
                expressprinterpedidos@gmail.com
              </a>
            </p>
            <p>Lunes a viernes, 8:00 AM - 6:00 PM</p>
            <p>Sabados, 9:00 AM - 2:00 PM</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[118rem] flex-col gap-3 px-4 py-5 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 2xl:px-10">
          <div className="flex flex-wrap gap-4">
            <Link href="/login" className="transition hover:text-white">
              Panel administrativo
            </Link>
          </div>
          <p>&copy; 2026 Express Printer. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
