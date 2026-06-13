import type { Metadata } from "next";

import { StorefrontAuthShell } from "@/app/storefront-auth-shell";
import { listStorefrontProducts } from "@/lib/catalog";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Mi cuenta | Express Printer",
  description: "Acceso de clientes para Express Printer.",
};

export const dynamic = "force-dynamic";

type CustomerAccountPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CustomerAccountPage({
  searchParams,
}: CustomerAccountPageProps) {
  const params = await searchParams;
  const rawMessage = params.message;
  const rawTone = params.tone;
  const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;
  const toneValue = Array.isArray(rawTone) ? rawTone[0] : rawTone;
  const initialNotice = message
    ? {
        message,
        tone: (toneValue === "error" ? "error" : "success") as
          | "error"
          | "success",
      }
    : null;

  const products = await listStorefrontProducts();

  return (
    <StorefrontAuthShell
      hasPublicAuth={hasSupabasePublicConfig()}
      initialMode="login"
      products={products}
      initialNotice={initialNotice}
    />
  );
}
