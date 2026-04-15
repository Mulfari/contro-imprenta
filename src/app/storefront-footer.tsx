"use client";

function FooterLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-black tracking-[0.22em] text-slate-950">
        EX
      </div>
      <div>
        <p className="text-lg font-semibold tracking-tight text-white">Express Printer</p>
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
      <div className="mx-auto flex w-full max-w-[118rem] flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8 2xl:px-10">
        <div>
          <FooterLogo />
        </div>

        <div className="space-y-3 text-sm text-slate-300 lg:text-right">
          <p>
            WhatsApp:
            {" "}
            <a href="#" className="font-medium text-white transition hover:text-slate-100">
              +58 000-0000000
            </a>
          </p>
          <p>
            Correo:
            {" "}
            <a href="#" className="font-medium text-white transition hover:text-slate-100">
              hola@expressprinter.com
            </a>
          </p>
          <p>Lunes a Sabado, 8:00 AM - 6:00 PM</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[118rem] flex-col gap-3 px-4 py-5 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 2xl:px-10">
          <p>© 2026 Express Printer. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="transition hover:text-white">
              Terminos
            </a>
            <a href="#" className="transition hover:text-white">
              Privacidad
            </a>
            <a href="/login" className="transition hover:text-white">
              Panel administrativo
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
