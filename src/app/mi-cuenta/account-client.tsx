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

  return (
    <section className="mx-auto w-full max-w-[118rem] px-4 py-10 sm:px-6 lg:px-8 2xl:px-10">
      <div className="mx-auto flex w-full max-w-[44rem] flex-col rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_22px_60px_rgba(15,23,42,0.05)] sm:min-h-[40rem] sm:p-10 xl:min-h-[42rem] xl:p-12">
        {!session || !hasPublicAuth ? (
          <div className="mx-auto w-full max-w-[32rem] space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Express Printer
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Mi cuenta
            </h1>
            <p className="text-sm leading-7 text-slate-600 sm:text-base">
              Accede a tu cuenta de cliente para consultar tus datos y mantener centralizados tus pedidos con Express Printer.
            </p>
          </div>
        ) : null}

        <div className="mx-auto flex h-full w-full max-w-[36rem] flex-col justify-center">
          {!hasPublicAuth ? (
            <div className="mx-auto my-auto w-full max-w-[32rem] rounded-[1.6rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
              Configura <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> para activar el acceso de clientes.
            </div>
          ) : isLoading ? (
            <div className="my-auto flex min-h-[22rem] items-center justify-center text-sm font-medium text-slate-500">
              Cargando cuenta...
            </div>
          ) : session ? (
            <div className="flex h-full flex-col justify-center space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Sesion activa
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    {profile?.full_name?.trim() || session.user.user_metadata.full_name || "Cliente Express Printer"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">{session.user.email}</p>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSubmitting}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cerrar sesion
                </button>
              </div>

              {message ? (
                <div
                  className={`rounded-[1.3rem] border px-4 py-3 text-sm font-medium ${
                    messageTone === "error"
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {message}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
                    Datos de contacto
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-900">Nombre:</span>{" "}
                      {profile?.full_name?.trim() || "Pendiente"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Correo:</span>{" "}
                      {session.user.email}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Telefono:</span>{" "}
                      {profile?.phone?.trim() || "Pendiente"}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
                    Cuenta
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-900">Estado:</span> Activa
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Creada:</span>{" "}
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString("es-VE")
                        : "Reciente"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Pedidos:</span> Muy pronto aqui veras tu historial.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-500">
                Esta es la primera base de acceso para clientes. El siguiente paso natural es conectar aqui el historial y seguimiento de pedidos.
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col justify-center">
              <div className="space-y-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Acceso de clientes
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {mode === "login" ? "Inicia sesion" : "Crea tu cuenta"}
                </h2>
                <p className="text-sm leading-6 text-slate-500">
                  {mode === "login"
                    ? "Accede con tu correo y clave para entrar a tu cuenta."
                    : "Registra tus datos para comenzar a gestionar tus pedidos."}
                </p>
              </div>

              <div className="mt-6 inline-flex self-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    mode === "login"
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Iniciar sesion
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    mode === "register"
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Registrarme
                </button>
              </div>

              {message ? (
                <div
                  className={`mt-6 rounded-[1.3rem] border px-4 py-3 text-sm font-medium ${
                    messageTone === "error"
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {message}
                </div>
              ) : null}

              {mode === "login" ? (
                <form className="mt-8 space-y-5" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="customer-login-email">
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
                    <label className="text-sm font-semibold text-slate-700" htmlFor="customer-login-password">
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
                <form className="mt-8 space-y-5" onSubmit={handleRegister}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-semibold text-slate-700" htmlFor="customer-register-name">
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
                      <label className="text-sm font-semibold text-slate-700" htmlFor="customer-register-phone">
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
                      <label className="text-sm font-semibold text-slate-700" htmlFor="customer-register-email">
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
                      <label className="text-sm font-semibold text-slate-700" htmlFor="customer-register-password">
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

              <p className="mt-8 text-center text-sm text-slate-500">
                Volver a la
                {" "}
                <Link href="/" className="font-semibold text-slate-900 transition hover:text-slate-700">
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
