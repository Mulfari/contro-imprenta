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

export type VerifyCodeState = {
  status: "idle" | "error" | "success";
  message: string;
};

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

function getIdentifier(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim().slice(0, 8);

  if (!identifier) {
    redirect(
      `/login?message=${encodeMessage(
        "Escribe tu usuario o cedula para continuar.",
      )}`,
    );
  }

  return identifier;
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
        "Usuario o Cedula incorrecto.",
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

export async function verifyCodeStateAction(
  _previousState: VerifyCodeState,
  formData: FormData,
): Promise<VerifyCodeState> {
  if (!hasPanelAuthConfig()) {
    return {
      status: "error",
      message: "Configura Supabase y APP_SESSION_SECRET antes de usar el login.",
    };
  }

  const pendingLogin = await getPendingLogin();

  if (!pendingLogin) {
    return {
      status: "error",
      message: "Primero verifica tu usuario o cedula.",
    };
  }

  const password = String(formData.get("password") ?? "").trim();

  if (!/^\d{4}$/.test(password)) {
    return {
      status: "error",
      message: "Ingresa un codigo valido.",
    };
  }

  let user;

  try {
    user = await authenticateUser(pendingLogin.identifier, password);
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "No se pudo validar el codigo.",
    };
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

    return {
      status: "error",
      message: "Codigo incorrecto.",
    };
  }

  await clearPendingLogin();
  await startSession(toSessionUser(user));

  revalidatePath("/", "layout");

  return {
    status: "success",
    message: "Codigo correcto.",
  };
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
