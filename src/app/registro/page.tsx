import type { Metadata } from "next";

import { RegisterShell } from "@/app/registro/register-shell";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Registro | Express Printer",
  description: "Registro de clientes para Express Printer.",
};

export default function CustomerRegisterPage() {
  return <RegisterShell hasPublicAuth={hasSupabasePublicConfig()} />;
}
