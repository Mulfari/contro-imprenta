"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

// Pantalla de acceso de clientes MINIMALISTA (sin el chrome de la tienda):
// tarjeta centrada, campos mínimos y un solo botón. La usan /mi-cuenta
// (deslogueado) y /registro. Preparada para sumar "Continuar con Google"
// cuando se conecte Clerk.

interface CustomerAuthScreenProps {
  mode: "login" | "register";
  notice?: { message: string; tone: "error" | "success" } | null;
}

const inputClass =
  "h-12 w-full rounded-xl border border-[#e6e3da] bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#3558ff] focus:shadow-[0_0_0_3px_rgba(53,88,255,0.12)]";

export function CustomerAuthScreen({ mode, notice = null }: CustomerAuthScreenProps) {
  const isLogin = mode === "login";
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(notice?.message ?? "");
  const [tone, setTone] = useState<"error" | "success">(notice?.tone ?? "success");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = createBrowserSupabaseClient();
    setBusy(true);
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        window.location.assign("/mi-cuenta");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: { full_name: fullName.trim(), phone: phone.trim() },
        },
      });
      if (error) throw error;

      if (data.session?.user?.id) {
        await supabase.from("customer_profiles").upsert({
          id: data.session.user.id,
          full_name: fullName.trim(),
          phone: phone.trim() || null,
        });
        window.location.assign("/mi-cuenta");
        return;
      }

      setTone("success");
      setMessage("Cuenta creada. Revisa tu correo para confirmar el acceso.");
      setPassword("");
    } catch (error) {
      setTone("error");
      setMessage(
        error && typeof error === "object" && "message" in error && (error as { message?: string }).message
          ? String((error as { message: string }).message)
          : isLogin
            ? "No se pudo iniciar sesión."
            : "No se pudo crear la cuenta.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fbfaf7] px-4 py-10">
      <div className="w-full max-w-[400px]">
        {/* Marca */}
        <Link href="/" className="mx-auto block w-fit cursor-pointer">
          <span
            aria-label="Express Printer"
            role="img"
            className="block h-12 w-44 bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/express-printer-logo.webp')" }}
          />
        </Link>

        {/* Tarjeta */}
        <div className="mt-6 rounded-[1.5rem] border border-[#ece8df] bg-white p-7 shadow-[0_24px_60px_rgba(15,23,42,0.07)] sm:p-8">
          <h1 className="text-center text-[22px] font-bold tracking-tight text-slate-950">
            {isLogin ? "Hola de nuevo" : "Crea tu cuenta"}
          </h1>
          <p className="mt-1.5 text-center text-sm text-slate-500">
            {isLogin
              ? "Entra para ver tus pedidos y pagos."
              : "Sigue tus pedidos, arte y pagos en un solo lugar."}
          </p>

          {message ? (
            <p
              className={`mt-4 rounded-xl border px-3.5 py-2.5 text-center text-sm font-medium ${
                tone === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {message}
            </p>
          ) : null}

          <form onSubmit={submit} className="mt-5 grid gap-3">
            {!isLogin ? (
              <>
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Nombre y apellido"
                  required
                  autoComplete="name"
                  className={inputClass}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Teléfono (opcional)"
                  autoComplete="tel"
                  className={inputClass}
                />
              </>
            ) : null}
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Correo electrónico"
              required
              autoComplete="email"
              className={inputClass}
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Contraseña"
              required
              minLength={6}
              autoComplete={isLogin ? "current-password" : "new-password"}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={busy}
              className="mt-1 h-12 w-full cursor-pointer rounded-xl bg-slate-950 text-[15px] font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? "Un momento…" : isLogin ? "Entrar" : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            {isLogin ? (
              <>
                ¿Primera vez aquí?{" "}
                <Link href="/registro" className="cursor-pointer font-semibold text-[#3558ff] transition hover:text-[#2647e8]">
                  Crea tu cuenta
                </Link>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <Link href="/mi-cuenta" className="cursor-pointer font-semibold text-[#3558ff] transition hover:text-[#2647e8]">
                  Inicia sesión
                </Link>
              </>
            )}
          </p>
        </div>

        <Link
          href="/"
          className="mx-auto mt-6 block w-fit cursor-pointer text-sm font-medium text-slate-400 transition hover:text-slate-700"
        >
          ← Volver a la tienda
        </Link>
      </div>
    </main>
  );
}
