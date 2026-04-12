import Link from "next/link";
import { redirect } from "next/navigation";

import { CodeModal } from "@/app/login/code-modal";
import { IdentifierForm } from "@/app/login/identifier-form";
import { RecoveryForm } from "@/app/login/recovery-form";
import { FloatingToast } from "@/components/floating-toast";
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
  const mode = resolveMessage(params.mode);

  const session = await getCurrentSession();
  const pendingLogin = await getPendingLogin();
  const canUsePanel = hasPanelAuthConfig();
  const isCodeStep = Boolean(pendingLogin && step === "code");
  const isRecoveryMode = mode === "recovery";
  const pendingDisplayName = pendingLogin
    ? capitalizeFirstLetter(pendingLogin.displayName)
    : "";

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(245,245,247,0.95)_38%,_rgba(232,236,241,0.98)_100%)] px-6 py-8 sm:px-10">
      <FloatingToast message={message} />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <section className="relative w-full max-w-xl rounded-[2.3rem] border border-slate-200/90 bg-white/90 p-10 shadow-[0_38px_110px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
                {isRecoveryMode ? "Recuperacion de acceso" : "Panel administrativo"}
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                {isRecoveryMode ? "Recupera tu acceso" : "Inicia sesion"}
              </h1>
              <p className="mt-3 text-lg font-medium text-slate-600">
                Express Printer
              </p>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
                {isRecoveryMode
                  ? "Solicita un codigo temporal al equipo administrador y define un nuevo codigo de 4 digitos."
                  : "Ingrese su metodo de acceso. Puedes ingresar con tu usuario o numero de cedula."}
              </p>
            </div>
            <Link
              href="/"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Inicio
            </Link>
          </div>

          {!canUsePanel ? (
            <div className="mt-6 rounded-[1.2rem] border border-dashed border-rose-300 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-950">
              Falta configurar `NEXT_PUBLIC_SUPABASE_URL`,
              `SUPABASE_SERVICE_ROLE_KEY` y `APP_SESSION_SECRET`.
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                !isRecoveryMode
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              Iniciar sesion
            </Link>
            <Link
              href="/login?mode=recovery"
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isRecoveryMode
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              Recuperar codigo
            </Link>
          </div>

          {isRecoveryMode ? (
            <RecoveryForm defaultIdentifier={pendingLogin?.identifier ?? ""} />
          ) : (
            <IdentifierForm defaultValue={pendingLogin?.identifier ?? ""} />
          )}

          {isCodeStep ? (
            <CodeModal
              displayName={pendingDisplayName}
              username={pendingLogin?.username ?? ""}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}
