import type { Metadata } from "next";

import { StorefrontAuthShell } from "@/app/storefront-auth-shell";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Mi cuenta | Express Printer",
  description: "Acceso de clientes para Express Printer.",
};

export default function CustomerAccountPage() {
  return (
    <StorefrontAuthShell
      hasPublicAuth={hasSupabasePublicConfig()}
      initialMode="login"
    />
  );
}
