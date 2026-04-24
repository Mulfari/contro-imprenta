"use client";

import Link from "next/link";

function FooterLogo() {
  return (
    <Link
      href="/"
      className="inline-flex w-fit cursor-pointer items-center transition hover:-translate-y-0.5"
      aria-label="Express Printer"
    >
      <span
        className="block h-[4.1rem] w-[12.2rem] sm:h-[4.5rem] sm:w-[13.5rem]"
        aria-hidden="true"
        style={{
          backgroundImage: "url('/express-printer-logo-footer.svg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "left center",
          backgroundSize: "contain",
        }}
      />
    </Link>
  );
}

export function StorefrontFooter() {
  return (
    <footer className="bg-[#0b1220] text-slate-200">
      <div className="mx-auto grid w-full max-w-[118rem] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 2xl:px-10">
        <div className="space-y-5">
          <FooterLogo />
          <p className="max-w-md text-sm leading-6 text-slate-400">
            Impresion comercial, publicitaria y corporativa con pedidos online
            conectados al panel administrativo.
          </p>
        </div>

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
          <p>&copy; 2026 Express Printer. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/login" className="transition hover:text-white">
              Panel administrativo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
