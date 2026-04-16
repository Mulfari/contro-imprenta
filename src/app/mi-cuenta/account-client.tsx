"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type CustomerProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

type CustomerAccountClientProps = {
  hasPublicAuth: boolean;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: string }).message;

    if (message) {
      return message;
    }
  }

  return fallback;
}

function MessageBox({
  message,
  tone,
}: {
  message: string;
  tone: "error" | "success";
}) {
  return (
    <div
      className={`rounded-[1.35rem] border px-4 py-3 text-sm font-medium ${
        tone === "error"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {message}
    </div>
  );
}

function InfoCard({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
        {eyebrow}
      </p>
      <p className="mt-3 text-base font-semibold tracking-tight text-slate-950">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export function CustomerAccountClient({
  hasPublicAuth,
}: CustomerAccountClientProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("success");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerFullName, setRegisterFullName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  useEffect(() => {
    setMessage("");
  }, [mode]);

  useEffect(() => {
    if (!hasPublicAuth) {
      setIsLoading(false);
      return;
    }

    const supabase = createBrowserSupabaseClient();

    const load = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession);

      if (currentSession?.user?.id) {
        const { data } = await supabase
          .from("customer_profiles")
          .select("*")
          .eq("id", currentSession.user.id)
          .maybeSingle<CustomerProfile>();

        setProfile(data ?? null);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    };

    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (!nextSession?.user?.id) {
        setProfile(null);
        return;
      }

      void supabase
        .from("customer_profiles")
        .select("*")
        .eq("id", nextSession.user.id)
        .maybeSingle<CustomerProfile>()
        .then(({ data }) => {
          setProfile(data ?? null);
        });
    });

    return () => subscription.unsubscribe();
  }, [hasPublicAuth]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasPublicAuth) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    setIsSubmitting(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) {
        throw error;
      }

      setMessageTone("success");
      setMessage("Sesion iniciada.");
      setLoginPassword("");
    } catch (error) {
      setMessageTone("error");
      setMessage(getErrorMessage(error, "No se pudo iniciar sesion."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasPublicAuth) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    setIsSubmitting(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail.trim(),
        password: registerPassword,
        options: {
          data: {
            full_name: registerFullName.trim(),
            phone: registerPhone.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session?.user?.id) {
        await supabase.from("customer_profiles").upsert({
          id: data.session.user.id,
          full_name: registerFullName.trim(),
          phone: registerPhone.trim() || null,
        });
      }

      setMessageTone("success");
      setMessage(
        data.session
          ? "Cuenta creada. Ya puedes gestionar tus pedidos."
          : "Cuenta creada. Revisa tu correo para confirmar el acceso.",
      );
      setRegisterPassword("");
    } catch (error) {
      setMessageTone("error");
      setMessage(getErrorMessage(error, "No se pudo crear la cuenta."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    if (!hasPublicAuth) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    setIsSubmitting(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setMessageTone("success");
      setMessage("Sesion cerrada.");
    } catch (error) {
      setMessageTone("error");
      setMessage(getErrorMessage(error, "No se pudo cerrar la sesion."));
    } finally {
      setIsSubmitting(false);
    }
  }

  const displayName =
    profile?.full_name?.trim() ||
    session?.user.user_metadata.full_name ||
    "Cliente Express Printer";

  return (
    <section className="mx-auto w-full max-w-[118rem] px-4 pb-10 pt-4 sm:px-6 sm:pb-12 lg:px-8 2xl:px-10">
      <div className="ml-auto w-full max-w-[34rem] sm:max-w-[36rem]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          {!hasPublicAuth ? (
            <div className="p-6 sm:p-7">
              <div className="rounded-[1.55rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
                Configura <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> para activar el acceso de clientes.
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex min-h-[26rem] items-center justify-center p-8 text-sm font-medium text-slate-500">
              Cargando cuenta...
            </div>
          ) : session ? (
            <div className="space-y-5 p-6 sm:p-7">
              <div className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5">
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Mi cuenta
                  </p>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
                      {displayName}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">{session.user.email}</p>
                  </div>
                  <p className="text-sm leading-6 text-slate-500">
                    Acceso activo para seguir tus datos y tus futuros pedidos.
                  </p>
                </div>
              </div>

              {message ? <MessageBox message={message} tone={messageTone} /> : null}

              <div className="grid gap-4">
                <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.04)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                    Datos de contacto
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Nombre
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {profile?.full_name?.trim() || "Pendiente"}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Correo
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {session.user.email}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Telefono
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {profile?.phone?.trim() || "Pendiente"}
                      </p>
                    </div>
                  </div>
                </div>

                <InfoCard
                  eyebrow="Cuenta"
                  title="Lista para crecer"
                  description={`Cuenta creada ${
                    profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString("es-VE")
                      : "recientemente"
                  }. Pronto veras aqui tu historial y seguimiento.`}
                />

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSubmitting}
                  className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cerrar sesion
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 p-6 sm:p-7">
              <div className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#fcfdff_0%,#f6f8fb_100%)] p-5">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Mi cuenta
                  </p>
                  <p className="text-sm leading-6 text-slate-500">
                    {mode === "login"
                      ? "Accede a tu cuenta para consultar y gestionar tus pedidos."
                      : "Registra tus datos para comenzar a trabajar con Express Printer."}
                  </p>
                </div>

                <div className="mt-4 inline-flex w-full rounded-[1.45rem] border border-slate-200 bg-white p-1 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={`flex-1 cursor-pointer rounded-[1.2rem] px-4 py-3 text-sm font-semibold transition ${
                      mode === "login"
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Iniciar sesion
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className={`flex-1 cursor-pointer rounded-[1.2rem] px-4 py-3 text-sm font-semibold transition ${
                      mode === "register"
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Registrarme
                  </button>
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.04)] sm:p-6">
                <InfoCard
                  eyebrow="Acceso"
                  title={mode === "login" ? "Entra a tu cuenta" : "Crea tu acceso"}
                  description={
                    mode === "login"
                      ? "Ingresa con tu correo y clave sin salir de la tienda."
                      : "Deja lista tu cuenta para futuros pedidos y seguimiento."
                  }
                />

                <div className="mt-5">
                  {message ? (
                    <div className="mb-5">
                      <MessageBox message={message} tone={messageTone} />
                    </div>
                  ) : null}

                  {mode === "login" ? (
                    <form className="space-y-5" onSubmit={handleLogin}>
                      <div className="space-y-2">
                        <label
                          className="text-sm font-semibold text-slate-700"
                          htmlFor="customer-login-email"
                        >
                          Correo
                        </label>
                        <input
                          id="customer-login-email"
                          type="email"
                          value={loginEmail}
                          onChange={(event) => setLoginEmail(event.target.value)}
                          required
                          autoComplete="email"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          className="text-sm font-semibold text-slate-700"
                          htmlFor="customer-login-password"
                        >
                          Clave
                        </label>
                        <input
                          id="customer-login-password"
                          type="password"
                          value={loginPassword}
                          onChange={(event) => setLoginPassword(event.target.value)}
                          required
                          autoComplete="current-password"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting ? "Entrando..." : "Entrar"}
                      </button>
                    </form>
                  ) : (
                    <form className="space-y-5" onSubmit={handleRegister}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                          <label
                            className="text-sm font-semibold text-slate-700"
                            htmlFor="customer-register-name"
                          >
                            Nombre completo
                          </label>
                          <input
                            id="customer-register-name"
                            type="text"
                            value={registerFullName}
                            onChange={(event) => setRegisterFullName(event.target.value)}
                            required
                            autoComplete="name"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            className="text-sm font-semibold text-slate-700"
                            htmlFor="customer-register-phone"
                          >
                            Telefono
                          </label>
                          <input
                            id="customer-register-phone"
                            type="tel"
                            value={registerPhone}
                            onChange={(event) => setRegisterPhone(event.target.value)}
                            autoComplete="tel"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            className="text-sm font-semibold text-slate-700"
                            htmlFor="customer-register-email"
                          >
                            Correo
                          </label>
                          <input
                            id="customer-register-email"
                            type="email"
                            value={registerEmail}
                            onChange={(event) => setRegisterEmail(event.target.value)}
                            required
                            autoComplete="email"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                          />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                          <label
                            className="text-sm font-semibold text-slate-700"
                            htmlFor="customer-register-password"
                          >
                            Clave
                          </label>
                          <input
                            id="customer-register-password"
                            type="password"
                            value={registerPassword}
                            onChange={(event) => setRegisterPassword(event.target.value)}
                            required
                            minLength={6}
                            autoComplete="new-password"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <p className="text-center text-sm text-slate-500">
                Volver a la{" "}
                <Link
                  href="/"
                  className="font-semibold text-slate-900 transition hover:text-slate-700"
                >
                  tienda
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
