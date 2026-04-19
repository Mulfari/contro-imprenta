"use client";

import { useState } from "react";

import { CustomerAccountClient } from "@/app/mi-cuenta/account-client";
import { StorefrontFooter } from "@/app/storefront-footer";
import { StorefrontHeader } from "@/app/storefront-header";

type StorefrontAuthShellProps = {
  hasPublicAuth: boolean;
  initialMode: "login" | "register";
  initialNotice?: {
    message: string;
    tone: "error" | "success";
  } | null;
};

export function StorefrontAuthShell({
  hasPublicAuth,
  initialMode,
  initialNotice = null,
}: StorefrontAuthShellProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="min-h-screen bg-[#f3f5f8] text-slate-950">
      <StorefrontHeader
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        hasActiveSearch={false}
        isAccountActive={false}
        onAccountClick={() => {}}
      />

      <CustomerAccountClient
        hasPublicAuth={hasPublicAuth}
        initialMode={initialMode}
        showModeSwitch={false}
        variant="page"
        initialNotice={initialNotice}
      />

      <StorefrontFooter />
    </main>
  );
}
