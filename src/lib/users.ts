import { compare, hash } from "bcryptjs";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SessionUser } from "@/lib/auth/session";

type AppRole = "admin" | "staff";

export type AppUser = {
  id: string;
  username: string;
  display_name: string;
  role: AppRole;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
};

type AppUserRecord = AppUser & {
  password_hash: string;
};

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function sanitizeUser(user: AppUserRecord): AppUser {
  const { password_hash, ...safeUser } = user;
  void password_hash;

  return safeUser;
}

async function getUserRecordByUsername(username: string) {
  const supabase = createSupabaseAdminClient();
  const normalizedUsername = normalizeUsername(username);
  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("username", normalizedUsername)
    .maybeSingle<AppUserRecord>();

  if (error) {
    throw error;
  }

  return data;
}

export async function authenticateUser(username: string, password: string) {
  const user = await getUserRecordByUsername(username);

  if (!user || !user.is_active) {
    return null;
  }

  const isValid = await compare(password, user.password_hash);

  if (!isValid) {
    return null;
  }

  return sanitizeUser(user);
}

export async function hasAnyUsers() {
  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from("app_users")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return (count ?? 0) > 0;
}

export async function listUsers() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("app_users")
    .select("id, username, display_name, role, is_active, created_at, created_by")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as AppUser[];
}

export async function createUser(input: {
  username: string;
  password: string;
  displayName: string;
  role: AppRole;
  createdBy: string;
}) {
  const supabase = createSupabaseAdminClient();
  const normalizedUsername = normalizeUsername(input.username);
  const displayName = input.displayName.trim();

  if (normalizedUsername.length < 3) {
    throw new Error("El usuario debe tener al menos 3 caracteres.");
  }

  if (input.password.length < 6) {
    throw new Error("La contrasena debe tener al menos 6 caracteres.");
  }

  if (!displayName) {
    throw new Error("Escribe un nombre visible para el usuario.");
  }

  const existingUser = await getUserRecordByUsername(normalizedUsername);

  if (existingUser) {
    throw new Error("Ese nombre de usuario ya existe.");
  }

  const passwordHash = await hash(input.password, 12);
  const { data, error } = await supabase
    .from("app_users")
    .insert({
      username: normalizedUsername,
      display_name: displayName,
      password_hash: passwordHash,
      role: input.role,
      is_active: true,
      created_by: input.createdBy,
    })
    .select("id, username, display_name, role, is_active, created_at, created_by")
    .single<AppUser>();

  if (error) {
    throw error;
  }

  return data;
}

export function toSessionUser(user: AppUser): SessionUser {
  return {
    userId: user.id,
    username: user.username,
    displayName: user.display_name,
    role: user.role,
  };
}
