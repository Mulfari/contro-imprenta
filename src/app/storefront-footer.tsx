"use client";

import Image from "next/image";

function FooterLogo() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-44 items-center rounded-2xl bg-white px-4 shadow-[0_14px_32px_rgba(0,0,0,0.18)]">
        <Image
          src="/express-printer-logo.webp"
          alt="Express Printer"
          width={340}
          height={96}
          sizes="11rem"
          className="h-auto w-full object-contain"
        />
      </div>
      <div>
        <p className="text-base font-semibold tracking-tight text-white sm:text-lg">
          Express Printer
        </p>
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-400">
          Impresion comercial
        </p>
      </div>
    </div>
  );
}

export function StorefrontFooter() {
  return (
    <footer className="bg-[#0b1220] text-slate-200">
      <div className="mx-auto flex w-full max-w-[118rem] flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 2xl:px-10">
        <FooterLogo />

        <div className="space-y-2 text-sm text-slate-300 lg:text-right">
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

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[118rem] flex-col gap-3 px-4 py-5 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 2xl:px-10">
          <p>© 2026 Express Printer. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-4">
            <a href="/login" className="transition hover:text-white">
              Panel administrativo
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
