"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

import { endSession, startSession } from "@/lib/auth/session";
import { authenticateUser, hasAnyUsers, toSessionUser } from "@/lib/users";
import { hasPanelAuthConfig } from "@/lib/supabase/config";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

function getCredentials(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  if (!username || !password) {
    redirect(
      `/login?message=${encodeMessage(
        "Escribe tu usuario y tu contrasena para continuar.",
      )}`,
    );
  }

  return { username, password };
}

export async function signInAction(formData: FormData) {
  if (!hasPanelAuthConfig()) {
    redirect(
      `/login?message=${encodeMessage(
        "Configura Supabase y APP_SESSION_SECRET antes de usar el login.",
      )}`,
    );
  }

  const { username, password } = getCredentials(formData);

  try {
    if (!(await hasAnyUsers())) {
      redirect("/setup?message=Primero%20crea%20tu%20admin%20inicial");
    }

    const user = await authenticateUser(username, password);

    if (!user) {
      redirect(
        `/login?message=${encodeMessage(
          "Credenciales invalidas. Revisa tu usuario y tu contrasena.",
        )}`,
      );
    }

    await startSession(toSessionUser(user));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error
        ? error.message
        : "No se pudo iniciar sesion con este usuario.";
    redirect(`/login?message=${encodeMessage(message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOutAction() {
  await endSession();

  revalidatePath("/", "layout");
  redirect("/login?message=Sesion%20cerrada");
}
