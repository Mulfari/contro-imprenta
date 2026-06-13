import type { Metadata } from "next";

import { StorefrontAuthShell } from "@/app/storefront-auth-shell";
import { listStorefrontProducts } from "@/lib/catalog";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Registro | Express Printer",
  description: "Registro de clientes para Express Printer.",
};

export const dynamic = "force-dynamic";

export default async function CustomerRegisterPage() {
  const products = await listStorefrontProducts();

  return (
    <StorefrontAuthShell
      hasPublicAuth={hasSupabasePublicConfig()}
      initialMode="register"
      products={products}
    />
  );
}
