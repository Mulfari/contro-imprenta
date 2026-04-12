"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
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

  try {
    if (await hasAnyUsers()) {
      redirect("/login?message=El%20usuario%20inicial%20ya%20existe");
    }

    const displayName = String(formData.get("displayName") ?? "");
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");

    const user = await createInitialAdmin({ displayName, username, password });
    await startSession(toSessionUser(user));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "No se pudo crear el admin.";
    redirect(`/setup?message=${encodeMessage(message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard?message=Admin%20inicial%20creado");
}
