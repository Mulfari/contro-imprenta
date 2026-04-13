"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearVerifiedRecovery,
  clearPendingLogin,
  endSession,
  getPendingLogin,
  getVerifiedRecovery,
  startPendingLogin,
  startVerifiedRecovery,
  startSession,
} from "@/lib/auth/session";
import {
  createPasswordRecoveryRequest,
  resetPasswordWithRecovery,
  verifyPasswordRecoveryCode,
} from "@/lib/password-recovery";
import { createSecurityAlert } from "@/lib/security-alerts";
import {
  authenticateUser,
  findUserForLogin,
  hasAnyUsers,
  setUserPassword,
  toSessionUser,
} from "@/lib/users";
import { hasPanelAuthConfig } from "@/lib/supabase/config";

export type VerifyCodeState = {
  status: "idle" | "error" | "success";
  message: string;
};

export type RecoveryCodeState = {
  status: "idle" | "error" | "success";
  message: string;
};

export type RecoveryPasswordState = {
  status: "idle" | "error" | "success";
  message: string;
};

export type SetupPasswordState = {
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
        "Escribe tu cedula para continuar.",
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
        : "No se pudo verificar esta cedula.";
    redirect(`/login?message=${encodeMessage(message)}`);
  }

  if (!user) {
    redirect(
      `/login?message=${encodeMessage(
        "Cedula incorrecta.",
      )}`,
    );
  }

  await startPendingLogin({
    userId: user.id,
    username: user.national_id,
    displayName: user.display_name,
    identifier,
    attempts: 0,
    requiresPasswordSetup: user.requires_password_setup,
  });
  await clearVerifiedRecovery();

  revalidatePath("/login");
  redirect("/login?step=code");
}

export async function requestPasswordRecoveryStateAction(
  previousState: RecoveryCodeState,
  formData: FormData,
): Promise<RecoveryCodeState> {
  void previousState;
  void formData;

  if (!hasPanelAuthConfig()) {
    return {
      status: "error",
      message: "Configura Supabase y APP_SESSION_SECRET antes de usar la recuperacion.",
    };
  }

  const pendingLogin = await getPendingLogin();

  if (!pendingLogin) {
    return {
      status: "error",
      message: "Primero verifica tu cedula.",
    };
  }

  try {
    const request = await createPasswordRecoveryRequest(pendingLogin.identifier);

    if (!request) {
      return {
        status: "error",
        message: "Cedula incorrecta.",
      };
    }

    await createSecurityAlert({
      userId: request.user_id,
      username: request.username,
      detail: "Solicitud de recuperacion de acceso.",
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo solicitar la recuperacion.",
    };
  }

  return {
    status: "success",
    message: "Codigo solicitado. Pidelo a administracion.",
  };
}

export async function verifyRecoveryCodeStateAction(
  previousState: RecoveryCodeState,
  formData: FormData,
): Promise<RecoveryCodeState> {
  void previousState;

  if (!hasPanelAuthConfig()) {
    return {
      status: "error",
      message: "Configura Supabase y APP_SESSION_SECRET antes de usar la recuperacion.",
    };
  }

  const pendingLogin = await getPendingLogin();

  if (!pendingLogin) {
    return {
      status: "error",
      message: "Primero verifica tu cedula.",
    };
  }

  const recoveryCode = String(formData.get("recoveryCode") ?? "").trim();

  try {
    const result = await verifyPasswordRecoveryCode({
      identifier: pendingLogin.identifier,
      recoveryCode,
    });

    await startVerifiedRecovery({
      requestId: result.request.id,
      userId: result.user.id,
      identifier: pendingLogin.identifier,
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo verificar el codigo de recuperacion.",
    };
  }

  return {
    status: "success",
    message: "Codigo validado. Ahora define tu nuevo codigo.",
  };
}

export async function completePasswordRecoveryStateAction(
  previousState: RecoveryPasswordState,
  formData: FormData,
): Promise<RecoveryPasswordState> {
  void previousState;

  if (!hasPanelAuthConfig()) {
    return {
      status: "error",
      message: "Configura Supabase y APP_SESSION_SECRET antes de usar la recuperacion.",
    };
  }

  const pendingLogin = await getPendingLogin();

  if (!pendingLogin) {
    return {
      status: "error",
      message: "Primero verifica tu cedula.",
    };
  }

  const verifiedRecovery = await getVerifiedRecovery();

  if (!verifiedRecovery || verifiedRecovery.identifier !== pendingLogin.identifier) {
    return {
      status: "error",
      message: "Primero valida el codigo de recuperacion.",
    };
  }

  const nextPassword = String(formData.get("nextPassword") ?? "").trim();
  const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

  if (nextPassword !== confirmPassword) {
    return {
      status: "error",
      message: "La confirmacion no coincide con el nuevo codigo.",
    };
  }

  let user;

  try {
    await resetPasswordWithRecovery({
      requestId: verifiedRecovery.requestId,
      userId: verifiedRecovery.userId,
      nextPassword,
    });
    user = await authenticateUser(pendingLogin.identifier, nextPassword);
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo restablecer el acceso.",
    };
  }

  if (!user) {
    return {
      status: "error",
      message: "No se pudo iniciar sesion con el nuevo codigo.",
    };
  }

  await clearVerifiedRecovery();
  await clearPendingLogin();
  await startSession(toSessionUser(user));
  revalidatePath("/", "layout");

  return {
    status: "success",
    message: "Acceso restablecido.",
  };
}

export async function completeFirstAccessStateAction(
  previousState: SetupPasswordState,
  formData: FormData,
): Promise<SetupPasswordState> {
  void previousState;

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
      message: "Primero verifica tu cedula.",
    };
  }

  if (!pendingLogin.requiresPasswordSetup) {
    return {
      status: "error",
      message: "Este usuario ya tiene un codigo configurado.",
    };
  }

  const nextPassword = String(formData.get("nextPassword") ?? "").trim();
  const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

  if (!/^\d{4}$/.test(nextPassword)) {
    return {
      status: "error",
      message: "El codigo debe tener exactamente 4 digitos.",
    };
  }

  if (nextPassword !== confirmPassword) {
    return {
      status: "error",
      message: "La confirmacion no coincide con el nuevo codigo.",
    };
  }

  let user;

  try {
    await setUserPassword(pendingLogin.userId, nextPassword);
    user = await authenticateUser(pendingLogin.identifier, nextPassword);
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo guardar el codigo de acceso.",
    };
  }

  if (!user) {
    return {
      status: "error",
      message: "No se pudo iniciar sesion con el nuevo codigo.",
    };
  }

  await clearPendingLogin();
  await clearVerifiedRecovery();
  await startSession(toSessionUser(user));
  revalidatePath("/", "layout");

  return {
    status: "success",
    message: "Codigo creado correctamente.",
  };
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
      message: "Primero verifica tu cedula.",
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
  await clearVerifiedRecovery();
  await clearPendingLogin();

  revalidatePath("/login");
  redirect("/login");
}

export async function signOutAction() {
  await endSession();

  revalidatePath("/", "layout");
  redirect("/login?message=Sesion%20cerrada");
}
