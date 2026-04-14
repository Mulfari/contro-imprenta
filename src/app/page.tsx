import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { StorefrontHeader } from "@/app/storefront-header";
import { StorefrontHero } from "@/app/storefront-hero";

export default async function Home() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f3f5f8] text-slate-950">
      <StorefrontHeader />

      <StorefrontHero />
    </main>
  );
}
