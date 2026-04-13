import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSessionSecret } from "@/lib/supabase/config";
import { createPanelSession, endPanelSession } from "@/lib/session-presence";

export const SESSION_COOKIE_NAME = "imprenta_panel_session";
export const PENDING_LOGIN_COOKIE_NAME = "imprenta_panel_pending_login";
export const VERIFIED_RECOVERY_COOKIE_NAME = "imprenta_panel_verified_recovery";

export type SessionUser = {
  userId: string;
  username: string;
  displayName: string;
  role: "admin" | "staff";
  sessionId: string;
};

export type SessionStartInput = Omit<SessionUser, "sessionId">;

export type PendingLogin = {
  userId: string;
  username: string;
  displayName: string;
  identifier: string;
  attempts: number;
  requiresPasswordSetup: boolean;
};

export type VerifiedRecovery = {
  requestId: string;
  userId: string;
  identifier: string;
};

function getSecretKey() {
  return new TextEncoder().encode(getSessionSecret());
}

export async function createSessionToken(session: SessionUser) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function createPendingLoginToken(pendingLogin: PendingLogin) {
  return new SignJWT(pendingLogin)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(getSecretKey());
}

export async function createVerifiedRecoveryToken(verifiedRecovery: VerifiedRecovery) {
  return new SignJWT(verifiedRecovery)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(getSecretKey());
}

export async function readSessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecretKey());

  return payload as SessionUser;
}

export async function readPendingLoginToken(token: string) {
  const { payload } = await jwtVerify(token, getSecretKey());

  return payload as PendingLogin;
}

export async function readVerifiedRecoveryToken(token: string) {
  const { payload } = await jwtVerify(token, getSecretKey());

  return payload as VerifiedRecovery;
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const session = await readSessionToken(token);
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("app_users")
      .select("id, role, display_name, username, is_active")
      .eq("id", session.userId)
      .maybeSingle<{
        id: string;
        role: "admin" | "staff";
        display_name: string;
        username: string;
        is_active: boolean;
      }>();

    if (error || !data || !data.is_active) {
      cookieStore.set(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      });

      return null;
    }

    return {
      userId: data.id,
      username: data.username,
      displayName: data.display_name,
      role: data.role,
      sessionId: typeof session.sessionId === "string" ? session.sessionId : "",
    };
  } catch {
    return null;
  }
}

export async function getPendingLogin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PENDING_LOGIN_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return await readPendingLoginToken(token);
  } catch {
    return null;
  }
}

export async function getVerifiedRecovery() {
  const cookieStore = await cookies();
  const token = cookieStore.get(VERIFIED_RECOVERY_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return await readVerifiedRecoveryToken(token);
  } catch {
    return null;
  }
}

export async function startSession(session: SessionStartInput) {
  const cookieStore = await cookies();
  const sessionId = await createPanelSession(session.userId);
  const token = await createSessionToken({
    ...session,
    sessionId,
  });

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function startPendingLogin(pendingLogin: PendingLogin) {
  const cookieStore = await cookies();
  const token = await createPendingLoginToken(pendingLogin);

  cookieStore.set(PENDING_LOGIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30,
  });
}

export async function startVerifiedRecovery(verifiedRecovery: VerifiedRecovery) {
  const cookieStore = await cookies();
  const token = await createVerifiedRecoveryToken(verifiedRecovery);

  cookieStore.set(VERIFIED_RECOVERY_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
}

export async function clearPendingLogin() {
  const cookieStore = await cookies();

  cookieStore.set(PENDING_LOGIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function clearVerifiedRecovery() {
  const cookieStore = await cookies();

  cookieStore.set(VERIFIED_RECOVERY_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function endSession() {
  const cookieStore = await cookies();
  const activeToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (activeToken) {
    try {
      const session = await readSessionToken(activeToken);
      await endPanelSession(session.sessionId);
    } catch {}
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  cookieStore.set(PENDING_LOGIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  cookieStore.set(VERIFIED_RECOVERY_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
