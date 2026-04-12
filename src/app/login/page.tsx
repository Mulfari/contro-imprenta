import Link from "next/link";
import { redirect } from "next/navigation";

import { signInAction } from "@/app/login/actions";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPanelAuthConfig } from "@/lib/supabase/config";

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

  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
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
              "Acceso por usuario y contrasena",
              "Admin inicial configurable por variables",
              "Preparado para publicar en Vercel",
              "Base lista para crear mas usuarios desde el panel",
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
                  Entrar al panel
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

            {!hasPanelAuthConfig() ? (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-rose-300 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-950">
                Falta configurar `NEXT_PUBLIC_SUPABASE_URL`,
                `SUPABASE_SERVICE_ROLE_KEY`, `APP_SESSION_SECRET`,
                `ADMIN_USERNAME` y `ADMIN_PASSWORD`.
              </div>
            ) : null}

            <form className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Usuario
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="admin"
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
                  className="w-full rounded-full bg-stone-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800"
                >
                  Iniciar sesion
                </button>
              </div>
            </form>

            <p className="mt-6 text-sm leading-6 text-stone-600">
              El primer acceso lo controla el usuario admin definido en las
              variables del proyecto. Luego, desde el panel, ese admin podra
              crear los demas usuarios.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
