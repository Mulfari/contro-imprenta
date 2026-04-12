import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { hasPanelAuthConfig } from "@/lib/supabase/config";
import { hasAnyUsers } from "@/lib/users";

import { createInitialAdminAction } from "./actions";

type SetupPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function resolveMessage(message: string | string[] | undefined) {
  if (Array.isArray(message)) {
    return message[0] ?? "";
  }

  return message ?? "";
}

export default async function SetupPage({ searchParams }: SetupPageProps) {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const message = resolveMessage(params.message);

  if (!hasPanelAuthConfig()) {
    return (
      <main className="min-h-screen bg-stone-950 px-6 py-10 text-stone-50 sm:px-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-semibold">Configuracion pendiente</h1>
          <p className="mt-4 text-sm leading-7 text-stone-300">
            Antes del registro inicial, configura `NEXT_PUBLIC_SUPABASE_URL`,
            `SUPABASE_SERVICE_ROLE_KEY` y `APP_SESSION_SECRET`.
          </p>
        </div>
      </main>
    );
  }

  if (await hasAnyUsers()) {
    redirect("/login?message=El%20registro%20inicial%20ya%20no%20esta%20disponible");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#1d120d_0%,_#8b4f24_45%,_#f4c38d_100%)] px-6 py-8 sm:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 lg:grid-cols-[1fr_0.88fr]">
        <section className="rounded-[2.5rem] border border-white/10 bg-stone-950/70 p-8 text-stone-50 shadow-[0_30px_90px_rgba(25,12,5,0.35)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">
            Registro inicial
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight">
            Crea tu usuario administrador.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-stone-300">
            Este panel es temporal. Solo funciona mientras no exista ningun
            usuario en la base.
          </p>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[2.2rem] border border-stone-900/10 bg-white/92 p-8 shadow-[0_24px_70px_rgba(55,25,5,0.18)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">
                  Setup
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
                  Primer admin
                </h2>
              </div>
              <Link
                href="/login"
                className="rounded-full border border-stone-900/10 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-900/5"
              >
                Login
              </Link>
            </div>

            {message ? (
              <div className="mt-6 rounded-[1.4rem] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
                {message}
              </div>
            ) : null}

            <form action={createInitialAdminAction} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="displayName"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Nombre
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="Jose"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-stone-950 outline-none transition focus:border-amber-500 focus:bg-white"
                  required
                />
              </div>
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
              <button
                type="submit"
                className="w-full rounded-full bg-stone-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Crear admin
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
