"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { endSession, startSession } from "@/lib/auth/session";
import { authenticateUser, hasAnyUsers, toSessionUser } from "@/lib/users";
import { hasPanelAuthConfig } from "@/lib/supabase/config";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

function getCredentials(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!identifier || !password) {
    redirect(
      `/login?message=${encodeMessage(
        "Escribe tu usuario o cedula y tu codigo de 4 digitos.",
      )}`,
    );
  }

  return { identifier, password };
}

export async function signInAction(formData: FormData) {
  if (!hasPanelAuthConfig()) {
    redirect(
      `/login?message=${encodeMessage(
        "Configura Supabase y APP_SESSION_SECRET antes de usar el login.",
      )}`,
    );
  }

  const { identifier, password } = getCredentials(formData);

  if (!(await hasAnyUsers())) {
    redirect("/login?message=No%20hay%20usuarios%20configurados%20en%20el%20panel");
  }

  let user;

  try {
    user = await authenticateUser(identifier, password);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo iniciar sesion con este usuario.";
    redirect(`/login?message=${encodeMessage(message)}`);
  }

  if (!user) {
    redirect(
      `/login?message=${encodeMessage(
        "Credenciales invalidas. Revisa tu usuario o cedula y tu codigo.",
      )}`,
    );
  }

  await startSession(toSessionUser(user));

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOutAction() {
  await endSession();

  revalidatePath("/", "layout");
  redirect("/login?message=Sesion%20cerrada");
}
