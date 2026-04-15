"use client";

function FooterLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black tracking-[0.22em] text-white">
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

const quickLinks = ["Catalogo", "Papeleria comercial", "Gran formato", "Promociones", "Contacto"];
const serviceLinks = ["Diseno e impresion", "Stickers y etiquetas", "Pendones", "Talonarios", "Acabados especiales"];

export function StorefrontFooter() {
  return (
    <footer className="mt-8 bg-[#0b1220] text-slate-200">
      <div className="mx-auto grid w-full max-w-[118rem] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] lg:px-8 2xl:px-10">
        <div>
          <FooterLogo />
          <p className="mt-5 max-w-[26rem] text-sm leading-7 text-slate-400">
            Tienda online y centro de impresion para pedidos corporativos, publicidad impresa y piezas personalizadas.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
              Entrega express
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
              Pagos seguros
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
              Atencion personalizada
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
            Navegacion
          </h3>
          <div className="mt-5 space-y-3">
            {quickLinks.map((item) => (
              <a
                key={item}
                href="#"
                className="block text-sm font-medium text-slate-200 transition hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
            Servicios
          </h3>
          <div className="mt-5 space-y-3">
            {serviceLinks.map((item) => (
              <a
                key={item}
                href="#"
                className="block text-sm font-medium text-slate-200 transition hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
            Contacto
          </h3>
          <div className="mt-5 space-y-4 text-sm text-slate-300">
            <p>Centro comercial y pedidos online para toda Venezuela.</p>
            <p>
              WhatsApp:
              {" "}
              <a href="#" className="font-medium text-white transition hover:text-slate-200">
                +58 000-0000000
              </a>
            </p>
            <p>
              Correo:
              {" "}
              <a href="#" className="font-medium text-white transition hover:text-slate-200">
                hola@expressprinter.com
              </a>
            </p>
            <p>Lunes a Sabado, 8:00 AM - 6:00 PM</p>
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
