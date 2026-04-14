import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { StorefrontShell } from "@/app/storefront-shell";

export default async function Home() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return <StorefrontShell />;
}
