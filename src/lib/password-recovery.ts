import { randomInt } from "node:crypto";

import { hash } from "bcryptjs";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { findUserForLogin } from "@/lib/users";

export type PasswordRecoveryRequest = {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  recovery_code: string;
  expires_at: string;
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
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString();

  const { data, error } = await supabase
    .from("password_recovery_requests")
    .insert({
      user_id: user.id,
      username: user.username,
      display_name: user.display_name,
      recovery_code: recoveryCode,
      expires_at: expiresAt,
    })
    .select("*")
    .single<PasswordRecoveryRequest>();

  if (error) {
    throw error;
  }

  return data;
}

export async function resetPasswordWithRecovery(input: {
  identifier: string;
  recoveryCode: string;
  nextPassword: string;
}) {
  const user = await findUserForLogin(input.identifier);

  if (!user) {
    throw new Error("Usuario o Cedula incorrecto.");
  }

  if (!/^\d{6}$/.test(input.recoveryCode)) {
    throw new Error("Ingresa un codigo de recuperacion valido.");
  }

  if (!/^\d{4}$/.test(input.nextPassword)) {
    throw new Error("El nuevo codigo debe tener exactamente 4 digitos.");
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { data: request, error: requestError } = await supabase
    .from("password_recovery_requests")
    .select("*")
    .eq("user_id", user.id)
    .eq("recovery_code", input.recoveryCode)
    .is("used_at", null)
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .maybeSingle<PasswordRecoveryRequest>();

  if (requestError) {
    throw requestError;
  }

  if (!request) {
    throw new Error("Codigo de recuperacion incorrecto o vencido.");
  }

  const passwordHash = await hash(input.nextPassword, 12);
  const { error: updateUserError } = await supabase
    .from("app_users")
    .update({
      password_hash: passwordHash,
    })
    .eq("id", user.id);

  if (updateUserError) {
    throw updateUserError;
  }

  const { error: updateRequestError } = await supabase
    .from("password_recovery_requests")
    .update({
      used_at: now,
    })
    .eq("id", request.id);

  if (updateRequestError) {
    throw updateRequestError;
  }

  return user;
}

export async function listActivePasswordRecoveryRequests(limit = 10) {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("password_recovery_requests")
    .select(
      "id, user_id, username, display_name, recovery_code, expires_at, created_at, used_at",
    )
    .is("used_at", null)
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as PasswordRecoveryRequest[];
}
