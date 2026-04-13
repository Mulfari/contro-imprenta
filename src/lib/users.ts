import { compare, hash } from "bcryptjs";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SessionUser } from "@/lib/auth/session";

type AppRole = "admin" | "staff";

export type AppUser = {
  id: string;
  national_id: string;
  username: string;
  display_name: string;
  email: string;
  phone: string;
  role: AppRole;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
};

type AppUserRecord = AppUser & {
  password_hash: string | null;
};

export type LoginUser = AppUser & {
  requires_password_setup: boolean;
};

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function normalizeNationalId(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.trim();
}

function sanitizeUser(user: AppUserRecord): AppUser {
  const { password_hash, ...safeUser } = user;
  void password_hash;

  return safeUser;
}

function toLoginUser(user: AppUserRecord): LoginUser {
  const safeUser = sanitizeUser(user);

  return {
    ...safeUser,
    requires_password_setup: !user.password_hash,
  };
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

async function getUserRecordByNationalId(nationalId: string) {
  const supabase = createSupabaseAdminClient();
  const normalizedNationalId = normalizeNationalId(nationalId);
  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("national_id", normalizedNationalId)
    .maybeSingle<AppUserRecord>();

  if (error) {
    throw error;
  }

  return data;
}

async function getUserRecordByIdentifier(identifier: string) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const nationalIdCandidate = normalizeNationalId(identifier);

  return (
    (nationalIdCandidate
      ? await getUserRecordByNationalId(nationalIdCandidate)
      : null) ?? (await getUserRecordByUsername(normalizedIdentifier))
  );
}

export async function authenticateUser(identifier: string, password: string) {
  const user = await getUserRecordByIdentifier(identifier);

  if (!user || !user.is_active) {
    return null;
  }

  if (!user.password_hash) {
    return null;
  }

  const isValid = await compare(password, user.password_hash);

  if (!isValid) {
    return null;
  }

  return sanitizeUser(user);
}

export async function findUserForLogin(identifier: string) {
  const user = await getUserRecordByIdentifier(identifier);

  if (!user || !user.is_active) {
    return null;
  }

  return toLoginUser(user);
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
    .select(
      "id, national_id, username, display_name, email, phone, role, is_active, created_at, created_by",
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as AppUser[];
}

export async function createUser(input: {
  nationalId: string;
  username: string;
  displayName: string;
  email: string;
  phone: string;
  role: AppRole;
  createdBy: string;
}) {
  const supabase = createSupabaseAdminClient();
  const normalizedNationalId = normalizeNationalId(input.nationalId);
  const normalizedUsername = normalizeUsername(input.username).slice(0, 8);
  const displayName = input.displayName.trim();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);

  if (normalizedUsername.length < 3) {
    throw new Error("El usuario debe tener al menos 3 caracteres.");
  }

  if (normalizedUsername.length > 8) {
    throw new Error("El usuario no puede tener mas de 8 caracteres.");
  }

  if (normalizedNationalId.length < 6) {
    throw new Error("La cedula debe tener al menos 6 digitos.");
  }

  if (normalizedNationalId.length > 8) {
    throw new Error("La cedula no puede tener mas de 8 digitos.");
  }

  if (!displayName) {
    throw new Error("Escribe un nombre visible para el usuario.");
  }

  if (!email) {
    throw new Error("Escribe el correo del usuario.");
  }

  if (!phone) {
    throw new Error("Escribe el telefono del usuario.");
  }

  const existingUser = await getUserRecordByUsername(normalizedUsername);
  const existingNationalId = await getUserRecordByNationalId(normalizedNationalId);

  if (existingUser) {
    throw new Error("Ese nombre de usuario ya existe.");
  }

  if (existingNationalId) {
    throw new Error("Esa cedula ya existe.");
  }

  const { data, error } = await supabase
    .from("app_users")
    .insert({
      national_id: normalizedNationalId,
      username: normalizedUsername,
      display_name: displayName,
      email,
      phone,
      password_hash: "",
      role: input.role,
      is_active: true,
      created_by: input.createdBy,
    })
    .select(
      "id, national_id, username, display_name, email, phone, role, is_active, created_at, created_by",
    )
    .single<AppUser>();

  if (error) {
    throw error;
  }

  return data;
}

export async function setUserPassword(userId: string, password: string) {
  if (!/^\d{4}$/.test(password)) {
    throw new Error("El codigo debe tener exactamente 4 digitos.");
  }

  const supabase = createSupabaseAdminClient();
  const passwordHash = await hash(password, 12);
  const { error } = await supabase
    .from("app_users")
    .update({
      password_hash: passwordHash,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

export function toSessionUser(user: AppUser): SessionUser {
  return {
    userId: user.id,
    username: user.username,
    displayName: user.display_name,
    role: user.role,
  };
}
