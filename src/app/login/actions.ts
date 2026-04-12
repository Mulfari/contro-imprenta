"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hasSupabaseCredentials } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

function getCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    redirect(
      `/login?message=${encodeMessage(
        "Escribe tu correo y tu contrasena para continuar.",
      )}`,
    );
  }

  return { email, password };
}

function getFriendlyError(message: string) {
  if (message.toLowerCase().includes("invalid login credentials")) {
    return "Credenciales invalidas. Revisa tu correo y contrasena.";
  }

  if (message.toLowerCase().includes("email not confirmed")) {
    return "Debes confirmar tu correo antes de iniciar sesion.";
  }

  return message;
}

export async function signInAction(formData: FormData) {
  if (!hasSupabaseCredentials()) {
    redirect(
      `/login?message=${encodeMessage(
        "Configura las variables de Supabase antes de usar el login.",
      )}`,
    );
  }

  const { email, password } = getCredentials(formData);
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?message=${encodeMessage(getFriendlyError(error.message))}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  if (!hasSupabaseCredentials()) {
    redirect(
      `/login?message=${encodeMessage(
        "Configura las variables de Supabase antes de crear usuarios.",
      )}`,
    );
  }

  const { email, password } = getCredentials(formData);
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/login?message=${encodeMessage(getFriendlyError(error.message))}`);
  }

  revalidatePath("/", "layout");
  redirect(
    `/login?message=${encodeMessage(
      "Cuenta creada. Si activaste confirmacion por correo, revisa tu bandeja.",
    )}`,
  );
}

export async function signOutAction() {
  if (hasSupabaseCredentials()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/login?message=Sesion%20cerrada");
}
