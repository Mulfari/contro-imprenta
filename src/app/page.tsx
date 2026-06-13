import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { listStorefrontProducts } from "@/lib/catalog";
import { StorefrontShell } from "@/app/storefront-shell";

export default async function Home() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  const products = await listStorefrontProducts();

  return <StorefrontShell products={products} />;
}
