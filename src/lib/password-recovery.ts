import { randomInt } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { findUserForLogin, setUserPassword } from "@/lib/users";

export type PasswordRecoveryRequest = {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  recovery_code: string;
  expires_at: string | null;
  created_at: string;
  used_at: string | null;
};

function generateRecoveryCode() {
  return String(randomInt(100000, 1000000));
}

export async function createPasswordRecoveryRequest(identifier: string) {
  const user = await findUserForLogin(identifier);

  if (!user) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  await supabase
    .from("password_recovery_requests")
    .update({
      used_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .is("used_at", null);

  const recoveryCode = generateRecoveryCode();

  const { data, error } = await supabase
    .from("password_recovery_requests")
    .insert({
      user_id: user.id,
      username: user.national_id,
      display_name: user.display_name,
      recovery_code: recoveryCode,
      expires_at: null,
    })
    .select("*")
    .single<PasswordRecoveryRequest>();

  if (error) {
    throw error;
  }

  return data;
}

export async function verifyPasswordRecoveryCode(input: {
  identifier: string;
  recoveryCode: string;
}) {
  const user = await findUserForLogin(input.identifier);

  if (!user) {
    throw new Error("Cedula incorrecta.");
  }

  if (!/^\d{6}$/.test(input.recoveryCode)) {
    throw new Error("Ingresa un codigo de recuperacion valido.");
  }

  const supabase = createSupabaseAdminClient();
  const { data: request, error: requestError } = await supabase
    .from("password_recovery_requests")
    .select("*")
    .eq("user_id", user.id)
    .eq("recovery_code", input.recoveryCode)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .maybeSingle<PasswordRecoveryRequest>();

  if (requestError) {
    throw requestError;
  }

  if (!request) {
    throw new Error("Codigo de recuperacion incorrecto.");
  }

  return {
    user,
    request,
  };
}

export async function resetPasswordWithRecovery(input: {
  requestId: string;
  userId: string;
  nextPassword: string;
}) {
  if (!/^\d{4}$/.test(input.nextPassword)) {
    throw new Error("El nuevo codigo debe tener exactamente 4 digitos.");
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { data: request, error: requestError } = await supabase
    .from("password_recovery_requests")
    .select("*")
    .eq("id", input.requestId)
    .eq("user_id", input.userId)
    .is("used_at", null)
    .maybeSingle<PasswordRecoveryRequest>();

  if (requestError) {
    throw requestError;
  }

  if (!request) {
    throw new Error("Este codigo de recuperacion ya fue usado.");
  }

  await setUserPassword(input.userId, input.nextPassword);

  const { error: updateRequestError } = await supabase
    .from("password_recovery_requests")
    .update({
      used_at: now,
    })
    .eq("id", request.id);

  if (updateRequestError) {
    throw updateRequestError;
  }

  return request;
}

export async function listActivePasswordRecoveryRequests(limit = 10) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("password_recovery_requests")
    .select(
      "id, user_id, username, display_name, recovery_code, expires_at, created_at, used_at",
    )
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as PasswordRecoveryRequest[];
}
