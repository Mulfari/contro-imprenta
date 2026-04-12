import Link from "next/link";
import { redirect } from "next/navigation";

import { hasSupabaseCredentials } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getCurrentUserEmail() {
  if (!hasSupabaseCredentials()) {
    return null;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.email ?? null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const userEmail = await getCurrentUserEmail();
  const hasSupabase = hasSupabaseCredentials();

  if (userEmail) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8ef_0%,_#f6efe7_36%,_#ead9ca_100%)] text-stone-900">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex flex-col gap-6 rounded-[2rem] border border-stone-900/10 bg-white/70 px-6 py-5 shadow-[0_24px_80px_rgba(90,55,25,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">
              Imprenta Atlas
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Control de pedidos, clientes y produccion
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full border border-stone-900/10 px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-900/20 hover:bg-stone-900/5"
            >
              Entrar al sistema
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              Ver tablero demo
            </Link>
          </div>
        </header>

        <div className="grid gap-8 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-amber-900/10 bg-white/70 px-4 py-2 text-sm text-stone-700 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Proyecto base listo para Next.js, Supabase y Vercel
            </div>

            <div className="space-y-5">
              <h2 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                Una base moderna para manejar tu tienda de imprenta sin hojas
                sueltas ni pedidos perdidos.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-stone-700">
                Esta primera version ya incluye una portada comercial, login con
                Supabase, dashboard protegido y estructura lista para crecer con
                pedidos, clientes, cotizaciones y estados de produccion.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-full bg-amber-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-amber-500"
              >
                Configurar acceso
              </Link>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-stone-900/10 bg-white/80 px-6 py-3.5 text-sm font-semibold text-stone-800 transition hover:border-stone-900/20 hover:bg-white"
              >
                Abrir Supabase
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Pedidos al dia",
                  description:
                    "Registra trabajos, cantidades, fechas de entrega y estado de cada orden.",
                },
                {
                  title: "Clientes organizados",
                  description:
                    "Guarda datos de contacto y reutiliza informacion para nuevas cotizaciones.",
                },
                {
                  title: "Listo para desplegar",
                  description:
                    "Estructura compatible con GitHub y Vercel desde el primer commit.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.75rem] border border-white/60 bg-white/70 p-5 shadow-[0_20px_50px_rgba(90,55,25,0.08)] backdrop-blur"
                >
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-stone-900/10 bg-stone-950 p-7 text-stone-50 shadow-[0_30px_90px_rgba(40,20,5,0.25)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">
                  Estado de arranque
                </p>
                <h3 className="mt-2 text-2xl font-semibold">
                  Checklist del proyecto
                </h3>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-stone-300">
                Fase 1
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {[
                "Aplicacion Next.js 16 con App Router",
                "Login por correo y password usando Supabase Auth",
                "Dashboard protegido para usuarios autenticados",
                "Variables de entorno y README para despliegue",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
                >
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <p className="text-sm leading-6 text-stone-200">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-dashed border-amber-300/30 bg-amber-300/10 p-5">
              <p className="text-sm font-semibold text-amber-200">
                {hasSupabase
                  ? "Supabase parece listo para conectarse."
                  : "Faltan las credenciales de Supabase para activar el login real."}
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-50/90">
                {hasSupabase
                  ? "Cuando agregues usuarios en Supabase ya podras iniciar sesion desde esta misma interfaz."
                  : "Agrega NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local y en Vercel."}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
