import Link from "next/link";
import { redirect } from "next/navigation";

import { verifyIdentifierAction } from "@/app/login/actions";
import { CodeModal } from "@/app/login/code-modal";
import { getCurrentSession, getPendingLogin } from "@/lib/auth/session";
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

function capitalizeFirstLetter(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const message = resolveMessage(params.message);
  const step = resolveMessage(params.step);

  const session = await getCurrentSession();
  const pendingLogin = await getPendingLogin();
  const canUsePanel = hasPanelAuthConfig();
  const isCodeStep = Boolean(pendingLogin && step === "code");
  const pendingDisplayName = pendingLogin
    ? capitalizeFirstLetter(pendingLogin.displayName)
    : "";

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(245,245,247,0.94)_42%,_rgba(232,236,241,0.96)_100%)] px-6 py-8 sm:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.07),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(15,23,42,0.08),transparent_26%)]" />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <section className="relative w-full max-w-md overflow-hidden rounded-[2.25rem] border border-slate-200/90 bg-white/90 p-8 shadow-[0_32px_90px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(248,250,252,0))]" />
          <div className="flex items-start justify-between gap-4">
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
                Imprenta Atlas
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Iniciar sesion
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Acceso administrativo
              </p>
            </div>
            <Link
              href="/"
              className="relative rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Inicio
            </Link>
          </div>

          <div className="relative mt-8 rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(15,23,42,0.18)]">
                01
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Usuario o cedula
                </p>
                <p className="text-sm text-slate-500">
                  Verifica tu identidad para continuar
                </p>
              </div>
            </div>
          </div>

          {message && !isCodeStep ? (
            <div className="mt-6 rounded-[1.2rem] border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              {message}
            </div>
          ) : null}

          {!canUsePanel ? (
            <div className="mt-6 rounded-[1.2rem] border border-dashed border-rose-300 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-950">
              Falta configurar `NEXT_PUBLIC_SUPABASE_URL`,
              `SUPABASE_SERVICE_ROLE_KEY` y `APP_SESSION_SECRET`.
            </div>
          ) : null}

          <form className="relative mt-8 space-y-5" noValidate>
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
                defaultValue={pendingLogin?.identifier ?? ""}
              />
            </div>

            <button
              type="submit"
              formAction={verifyIdentifierAction}
              className="w-full rounded-full bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-700"
            >
              Continuar
            </button>
          </form>

          {isCodeStep ? (
            <CodeModal
              displayName={pendingDisplayName}
              username={pendingLogin?.username ?? ""}
              message={message}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}
