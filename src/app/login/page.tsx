import Link from "next/link";
import { redirect } from "next/navigation";

import { signInAction, signUpAction } from "@/app/login/actions";
import { hasSupabaseCredentials } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function resolveMessage(message: string | string[] | undefined) {
  if (Array.isArray(message)) {
    return message[0] ?? "";
  }

  return message ?? "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const message = resolveMessage(params.message);

  if (hasSupabaseCredentials()) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#1d120d_0%,_#8b4f24_45%,_#f4c38d_100%)] px-6 py-8 sm:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl gap-8 lg:grid-cols-[1fr_0.88fr]">
        <section className="flex flex-col justify-between rounded-[2.5rem] border border-white/10 bg-stone-950/70 p-8 text-stone-50 shadow-[0_30px_90px_rgba(25,12,5,0.35)] backdrop-blur">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">
              Acceso privado
            </p>
            <h1 className="mt-4 max-w-xl text-5xl font-semibold tracking-tight text-balance">
              Controla tu imprenta desde una sola pantalla.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-stone-300">
              Inicia sesion para manejar pedidos, organizar clientes y dejar el
              negocio listo para crecer sin perder trazabilidad.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "Acceso seguro con Supabase Auth",
              "Preparado para publicar en Vercel",
              "Base lista para modulos de pedidos y reportes",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.5rem] border border-white/8 bg-white/6 px-4 py-4 text-sm leading-6 text-stone-200"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[2.2rem] border border-stone-900/10 bg-white/92 p-8 shadow-[0_24px_70px_rgba(55,25,5,0.18)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">
                  Login
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
                  Entrar o crear cuenta
                </h2>
              </div>
              <Link
                href="/"
                className="rounded-full border border-stone-900/10 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-900/5"
              >
                Inicio
              </Link>
            </div>

            {message ? (
              <div className="mt-6 rounded-[1.4rem] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
                {message}
              </div>
            ) : null}

            {!hasSupabaseCredentials() ? (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-rose-300 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-950">
                Falta configurar `NEXT_PUBLIC_SUPABASE_URL` y
                `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local` para activar el
                login real.
              </div>
            ) : null}

            <form className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Correo
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ventas@tuimprenta.com"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-stone-950 outline-none transition focus:border-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Contrasena
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimo 6 caracteres"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-stone-950 outline-none transition focus:border-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  formAction={signInAction}
                  className="flex-1 rounded-full bg-stone-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800"
                >
                  Iniciar sesion
                </button>
                <button
                  type="submit"
                  formAction={signUpAction}
                  className="flex-1 rounded-full border border-stone-900/10 px-5 py-3.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-900/5"
                >
                  Crear cuenta
                </button>
              </div>
            </form>

            <p className="mt-6 text-sm leading-6 text-stone-600">
              Siguiente paso recomendado: crear el proyecto en Supabase,
              habilitar Email/Password y copiar las variables en tu entorno
              local y en Vercel.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
