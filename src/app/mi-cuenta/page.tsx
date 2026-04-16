import type { Metadata } from "next";

import { CustomerAccountClient } from "@/app/mi-cuenta/account-client";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Mi cuenta | Express Printer",
  description: "Acceso de clientes para Express Printer.",
};

export default function CustomerAccountPage() {
  return <CustomerAccountClient hasPublicAuth={hasSupabasePublicConfig()} />;
}
