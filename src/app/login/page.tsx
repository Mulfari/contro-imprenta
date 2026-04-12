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
  const canUsePanel = hasPanelAuthConfig();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(245,245,247,0.94)_42%,_rgba(232,236,241,0.96)_100%)] px-6 py-8 sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <section className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Imprenta Atlas
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Iniciar sesion
              </h1>
            </div>
            <Link
              href="/"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Inicio
            </Link>
          </div>

          {message ? (
            <div className="mt-6 rounded-[1.2rem] border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-slate-700">
              {message}
            </div>
          ) : null}

          {!canUsePanel ? (
            <div className="mt-6 rounded-[1.2rem] border border-dashed border-rose-300 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-950">
              Falta configurar `NEXT_PUBLIC_SUPABASE_URL`,
              `SUPABASE_SERVICE_ROLE_KEY` y `APP_SESSION_SECRET`.
            </div>
          ) : null}

          <form className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="identifier"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Usuario o cedula
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="admin o 12345678"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Codigo de 4 digitos
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="1234"
                inputMode="numeric"
                pattern="[0-9]{4}"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <button
              type="submit"
              formAction={signInAction}
              className="w-full rounded-full bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Entrar
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
