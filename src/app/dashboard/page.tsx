import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/login/actions";
import { hasSupabaseCredentials } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getAuthenticatedUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export default async function DashboardPage() {
  if (!hasSupabaseCredentials()) {
    return (
      <main className="min-h-screen bg-stone-950 px-6 py-10 text-stone-50 sm:px-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">
            Configuracion pendiente
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Conecta Supabase para activar el panel.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
            El dashboard ya esta creado, pero necesita tus variables
            `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` para
            verificar sesiones reales.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
            >
              Ir al login
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/5"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?message=Inicia%20sesion%20para%20entrar%20al%20tablero");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#16110e_0%,_#2b1d17_100%)] px-6 py-8 text-stone-50 sm:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">
              Centro de control
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Bienvenido, {user.email}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
              Este dashboard es el punto de partida para administrar pedidos de
              impresion, seguimientos, clientes frecuentes y entregas.
            </p>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/5"
            >
              Cerrar sesion
            </button>
          </form>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Pedidos hoy", value: "12", detail: "4 en impresion" },
            { label: "Entregas cercanas", value: "5", detail: "Proximas 48h" },
            { label: "Clientes activos", value: "28", detail: "Con orden este mes" },
          ].map((card) => (
            <article
              key={card.label}
              className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 shadow-lg"
            >
              <p className="text-sm text-stone-300">{card.label}</p>
              <p className="mt-3 text-4xl font-semibold">{card.value}</p>
              <p className="mt-2 text-sm text-amber-200">{card.detail}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
            <h2 className="text-xl font-semibold">Flujo sugerido</h2>
            <div className="mt-5 space-y-4">
              {[
                "Registrar clientes y canales de contacto.",
                "Crear tabla de pedidos con medidas, material y acabados.",
                "Agregar estados: recibido, disenando, imprimiendo, listo, entregado.",
                "Crear reportes de ventas y tiempos de entrega.",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-start gap-4 rounded-2xl border border-white/8 bg-black/10 px-4 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-stone-950">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-stone-200">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
            <h2 className="text-xl font-semibold">Modulos que siguen</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                "Cotizaciones rapidas",
                "Agenda de entregas",
                "Control de materiales",
                "Historial por cliente",
                "Reportes mensuales",
                "Roles de usuarios",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-white/8 bg-black/10 px-4 py-4 text-sm text-stone-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
