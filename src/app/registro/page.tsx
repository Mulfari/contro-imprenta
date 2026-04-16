import type { Metadata } from "next";

import { StorefrontAuthShell } from "@/app/storefront-auth-shell";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Registro | Express Printer",
  description: "Registro de clientes para Express Printer.",
};

export default function CustomerRegisterPage() {
  return (
    <StorefrontAuthShell
      hasPublicAuth={hasSupabasePublicConfig()}
      initialMode="register"
    />
  );
}
