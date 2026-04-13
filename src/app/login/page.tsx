import Link from "next/link";
import { redirect } from "next/navigation";

import { CodeModal } from "@/app/login/code-modal";
import { IdentifierForm } from "@/app/login/identifier-form";
import { authCardClassName, authSectionClassName } from "@/app/login/styles";
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(245,245,247,0.95)_38%,_rgba(232,236,241,0.98)_100%)] px-6 py-8 sm:px-10">
      <FloatingToast message={message} />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <section className={`relative ${authCardClassName}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
                Panel Administrativo
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Express Printer
              </h1>
              <p className="mt-4 text-base font-medium text-slate-600 sm:text-lg">
                Iniciar sesion
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

          <div className={authSectionClassName}>
            <IdentifierForm defaultValue={pendingLogin?.identifier ?? ""} />
          </div>

          {isCodeStep ? (
            <CodeModal
              displayName={pendingDisplayName}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}
