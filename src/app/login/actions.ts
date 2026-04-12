"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearPendingLogin,
  endSession,
  getPendingLogin,
  startPendingLogin,
  startSession,
} from "@/lib/auth/session";
import { createSecurityAlert } from "@/lib/security-alerts";
import {
  authenticateUser,
  findUserForLogin,
  hasAnyUsers,
  toSessionUser,
} from "@/lib/users";
import { hasPanelAuthConfig } from "@/lib/supabase/config";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

function getIdentifier(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim();

  if (!identifier) {
    redirect(
      `/login?message=${encodeMessage(
        "Escribe tu usuario o cedula para continuar.",
      )}`,
    );
  }

  return identifier;
}

function getCode(formData: FormData) {
  const password = String(formData.get("password") ?? "").trim();

  if (!/^\d{4}$/.test(password)) {
    redirect(
      `/login?message=${encodeMessage(
        "Escribe el codigo de 4 digitos para continuar.",
      )}&step=code`,
    );
  }

  return password;
}

export async function verifyIdentifierAction(formData: FormData) {
  if (!hasPanelAuthConfig()) {
    redirect(
      `/login?message=${encodeMessage(
        "Configura Supabase y APP_SESSION_SECRET antes de usar el login.",
      )}`,
    );
  }

  const identifier = getIdentifier(formData);

  if (!(await hasAnyUsers())) {
    redirect("/login?message=No%20hay%20usuarios%20configurados%20en%20el%20panel");
  }

  let user;

  try {
    user = await findUserForLogin(identifier);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo verificar este usuario.";
    redirect(`/login?message=${encodeMessage(message)}`);
  }

  if (!user) {
    redirect(
      `/login?message=${encodeMessage(
        "No encontramos un usuario con ese usuario o cedula.",
      )}`,
    );
  }

  await startPendingLogin({
    userId: user.id,
    username: user.username,
    displayName: user.display_name,
    identifier,
    attempts: 0,
  });

  revalidatePath("/login");
  redirect("/login?step=code");
}

export async function verifyCodeAction(formData: FormData) {
  if (!hasPanelAuthConfig()) {
    redirect(
      `/login?message=${encodeMessage(
        "Configura Supabase y APP_SESSION_SECRET antes de usar el login.",
      )}`,
    );
  }

  const pendingLogin = await getPendingLogin();

  if (!pendingLogin) {
    redirect("/login?message=Primero%20verifica%20tu%20usuario%20o%20cedula");
  }

  const password = getCode(formData);
  let user;

  try {
    user = await authenticateUser(pendingLogin.identifier, password);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo validar el codigo.";
    redirect(`/login?message=${encodeMessage(message)}&step=code`);
  }

  if (!user) {
    const nextAttempts = pendingLogin.attempts + 1;
    const shouldAlert = nextAttempts >= 3;

    if (shouldAlert) {
      await createSecurityAlert({
        userId: pendingLogin.userId,
        username: pendingLogin.username,
        detail: "Intento de inicio de sesion con codigo incorrecto.",
      });
    }

    await startPendingLogin({
      ...pendingLogin,
      attempts: shouldAlert ? 0 : nextAttempts,
    });

    const failedMessage = shouldAlert
      ? "Codigo incorrecto. Se notifico a administracion."
      : `Codigo incorrecto. Intento ${nextAttempts} de 3.`;

    redirect(`/login?message=${encodeMessage(failedMessage)}&step=code`);
  }

  await clearPendingLogin();
  await startSession(toSessionUser(user));

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function resetPendingLoginAction() {
  await clearPendingLogin();

  revalidatePath("/login");
  redirect("/login");
}

export async function signOutAction() {
  await endSession();

  revalidatePath("/", "layout");
  redirect("/login?message=Sesion%20cerrada");
}
