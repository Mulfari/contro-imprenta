"use client";

import { useState } from "react";

import { CustomerAccountClient } from "@/app/mi-cuenta/account-client";
import { StorefrontFooter } from "@/app/storefront-footer";
import { StorefrontHeader } from "@/app/storefront-header";

type RegisterShellProps = {
  hasPublicAuth: boolean;
};

export function RegisterShell({ hasPublicAuth }: RegisterShellProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="min-h-screen bg-[#f3f5f8] text-slate-950">
      <StorefrontHeader
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        recentSearches={[]}
        hasActiveSearch={false}
        isAccountActive={false}
        onAccountClick={() => {}}
      />

      <CustomerAccountClient
        hasPublicAuth={hasPublicAuth}
        initialMode="register"
        showModeSwitch={false}
        variant="page"
      />

      <StorefrontFooter />
    </main>
  );
}
