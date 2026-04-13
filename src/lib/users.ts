import { compare, hash } from "bcryptjs";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SessionStartInput } from "@/lib/auth/session";

type AppRole = "admin" | "staff";
export type StaffSecondaryRole = "vendedor" | "digital" | "caja";
export type AppBranch = "5 de julio" | "las americas";

export type AppUser = {
  id: string;
  national_id: string;
  username: string;
  display_name: string;
  email: string;
  phone: string;
  role: AppRole;
  secondary_role: StaffSecondaryRole | null;
  branch: AppBranch | null;
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

const userSelectFields =
  "id, national_id, username, display_name, email, phone, role, secondary_role, branch, is_active, created_at, created_by";

function normalizeNationalId(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
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
  const nationalIdCandidate = normalizeNationalId(identifier);

  if (!nationalIdCandidate) {
    return null;
  }

  return getUserRecordByNationalId(nationalIdCandidate);
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
  const query = await supabase
    .from("app_users")
    .select(userSelectFields)
    .order("created_at", { ascending: true });

  if (query.error) {
    throw query.error;
  }

  return (query.data ?? []) as AppUser[];
}

export async function createUser(input: {
  nationalId: string;
  displayName: string;
  email: string;
  phone: string;
  role: AppRole;
  secondaryRole?: StaffSecondaryRole | null;
  branch?: AppBranch | null;
  createdBy: string;
}) {
  const supabase = createSupabaseAdminClient();
  const normalizedNationalId = normalizeNationalId(input.nationalId);
  const normalizedUsername = normalizedNationalId;
  const displayName = input.displayName.trim();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const secondaryRole = input.role === "staff" ? input.secondaryRole ?? null : null;
  const branch = input.branch ?? null;

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

  if (input.role === "staff" && !secondaryRole) {
    throw new Error("Selecciona el rol secundario del staff.");
  }

  if (!branch) {
    throw new Error("Selecciona la sucursal del usuario.");
  }

  const existingNationalId = await getUserRecordByNationalId(normalizedNationalId);
  const existingInternalUsername = await getUserRecordByUsername(normalizedUsername);

  if (existingNationalId) {
    throw new Error("Esa cedula ya existe.");
  }

  if (existingInternalUsername) {
    throw new Error("No se pudo registrar esta cedula.");
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
      secondary_role: secondaryRole,
      branch,
      is_active: true,
      created_by: input.createdBy,
    })
    .select(userSelectFields)
    .single<AppUser>();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUser(input: {
  userId: string;
  nationalId: string;
  displayName: string;
  email: string;
  phone: string;
  role: AppRole;
  secondaryRole?: StaffSecondaryRole | null;
  branch?: AppBranch | null;
}) {
  const supabase = createSupabaseAdminClient();
  const normalizedNationalId = normalizeNationalId(input.nationalId);
  const normalizedUsername = normalizedNationalId;
  const displayName = input.displayName.trim();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const secondaryRole = input.role === "staff" ? input.secondaryRole ?? null : null;
  const branch = input.branch ?? null;

  if (!input.userId) {
    throw new Error("No se pudo identificar el usuario.");
  }

  if (normalizedNationalId.length < 6) {
    throw new Error("La cedula debe tener al menos 6 digitos.");
  }

  if (normalizedNationalId.length > 8) {
    throw new Error("La cedula no puede tener mas de 8 digitos.");
  }

  if (!displayName) {
    throw new Error("Escribe nombre y apellido del usuario.");
  }

  if (!email) {
    throw new Error("Escribe el correo del usuario.");
  }

  if (!phone) {
    throw new Error("Escribe el telefono del usuario.");
  }

  if (input.role === "staff" && !secondaryRole) {
    throw new Error("Selecciona el rol secundario del staff.");
  }

  if (!branch) {
    throw new Error("Selecciona la sucursal del usuario.");
  }

  const existingNationalId = await getUserRecordByNationalId(normalizedNationalId);
  const existingInternalUsername = await getUserRecordByUsername(normalizedUsername);

  if (existingNationalId && existingNationalId.id !== input.userId) {
    throw new Error("Esa cedula ya existe.");
  }

  if (existingInternalUsername && existingInternalUsername.id !== input.userId) {
    throw new Error("No se pudo registrar esta cedula.");
  }

  const { data, error } = await supabase
    .from("app_users")
    .update({
      national_id: normalizedNationalId,
      username: normalizedUsername,
      display_name: displayName,
      email,
      phone,
      role: input.role,
      secondary_role: secondaryRole,
      branch,
    })
    .eq("id", input.userId)
    .select(userSelectFields)
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

export async function deleteUser(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("app_users").delete().eq("id", userId);

  if (error) {
    throw error;
  }
}

export function toSessionUser(user: AppUser): SessionStartInput {
  return {
    userId: user.id,
    username: user.username,
    displayName: user.display_name,
    role: user.role,
  };
}
