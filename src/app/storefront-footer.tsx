"use client";

function FooterIcon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200">
      {children}
    </div>
  );
}

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
    <footer className="overflow-hidden bg-[#0b1220] text-slate-200">
      <div className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)]" />

      <div className="mx-auto grid w-full max-w-[118rem] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8 2xl:px-10">
        <div>
          <FooterLogo />
          <p className="mt-5 max-w-[28rem] text-sm leading-7 text-slate-400">
            Impresion para marcas, eventos, papeleria comercial y piezas personalizadas con atencion rapida.
          </p>

          <div className="mt-7 grid gap-3 sm:max-w-[34rem] sm:grid-cols-3">
            {["Pedidos online", "Retiro o envio", "Respuesta rapida"].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
            Contacto
          </h3>

          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <FooterIcon>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 5h16v14H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </FooterIcon>
              <div className="text-sm text-slate-300">
                <p className="font-semibold text-white">Correo</p>
                <a href="#" className="mt-1 block transition hover:text-slate-100">
                  hola@expressprinter.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <FooterIcon>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12a7 7 0 0 0 7 7h1c3.9 0 7-3.1 7-7V9a4 4 0 0 0-4-4h-.5" />
                  <path d="M9 5.5A4.5 4.5 0 0 0 4.5 10v1.5A4.5 4.5 0 0 0 9 16h2" />
                </svg>
              </FooterIcon>
              <div className="text-sm text-slate-300">
                <p className="font-semibold text-white">WhatsApp</p>
                <a href="#" className="mt-1 block transition hover:text-slate-100">
                  +58 000-0000000
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <FooterIcon>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8v4l2.5 2.5" />
                  <circle cx="12" cy="12" r="8" />
                </svg>
              </FooterIcon>
              <div className="text-sm text-slate-300">
                <p className="font-semibold text-white">Horario</p>
                <p className="mt-1">Lunes a Sabado, 8:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
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
