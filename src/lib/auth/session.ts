import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

import { getSessionSecret } from "@/lib/supabase/config";

export const SESSION_COOKIE_NAME = "imprenta_panel_session";

export type SessionUser = {
  userId: string;
  username: string;
  displayName: string;
  role: "admin" | "staff";
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

export async function readSessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecretKey());

  return payload as SessionUser;
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return await readSessionToken(token);
  } catch {
    return null;
  }
}

export async function startSession(session: SessionUser) {
  const cookieStore = await cookies();
  const token = await createSessionToken(session);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function endSession() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
