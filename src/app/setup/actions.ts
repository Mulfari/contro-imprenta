"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { startSession } from "@/lib/auth/session";
import { hasPanelAuthConfig } from "@/lib/supabase/config";
import { createInitialAdmin, hasAnyUsers, toSessionUser } from "@/lib/users";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

export async function createInitialAdminAction(formData: FormData) {
  if (!hasPanelAuthConfig()) {
    redirect(
      `/setup?message=${encodeMessage(
        "Configura primero Supabase y APP_SESSION_SECRET.",
      )}`,
    );
  }

  if (await hasAnyUsers()) {
    redirect("/login?message=El%20usuario%20inicial%20ya%20existe");
  }

  const displayName = String(formData.get("displayName") ?? "");
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  let user;

  try {
    user = await createInitialAdmin({ displayName, username, password });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo crear el admin.";
    redirect(`/setup?message=${encodeMessage(message)}`);
  }

  await startSession(toSessionUser(user));

  revalidatePath("/", "layout");
  redirect("/dashboard?message=Admin%20inicial%20creado");
}
