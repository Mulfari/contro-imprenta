import type { Metadata } from "next";

import { CustomerAccountClient } from "@/app/mi-cuenta/account-client";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Registro | Express Printer",
  description: "Registro de clientes para Express Printer.",
};

export default function CustomerRegisterPage() {
  return (
    <CustomerAccountClient
      hasPublicAuth={hasSupabasePublicConfig()}
      initialMode="register"
      showModeSwitch={false}
    />
  );
}
