"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { CustomerAccountClient } from "@/app/mi-cuenta/account-client";
import {
  cartStorageKey,
  catalogQueryStorageKey,
  parsePrice,
  restoreStoredCart,
  restoreStoredWishlist,
  serializeCartItems,
  wishlistStorageKey,
  type CartItem,
} from "@/app/storefront-cart";
import { storefrontProducts, type StorefrontProduct } from "@/app/storefront-data";
import { StorefrontFooter } from "@/app/storefront-footer";
import { StorefrontHeader } from "@/app/storefront-header";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type StorefrontAuthShellProps = {
  hasPublicAuth: boolean;
  initialMode: "login" | "register";
  initialNotice?: {
    message: string;
    tone: "error" | "success";
  } | null;
};

type AuthCommercePanel = "wishlist" | "cart" | null;

type AccountActivity = {
  activeCount: number;
  needsAttention: boolean;
};

type AccountActivityOrder = {
  status: string;
  payment_review_status: string;
  files?: Array<{
    attachment_type: string;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function AuthCommerceDrawer({
  panel,
  cartItems,
  wishlistProducts,
  onClose,
  onRemoveWishlist,
  onRemoveCartItem,
  onQuantityChange,
  onCheckout,
}: {
  panel: AuthCommercePanel;
  cartItems: CartItem[];
  wishlistProducts: StorefrontProduct[];
  onClose: () => void;
  onRemoveWishlist: (productId: string) => void;
  onRemoveCartItem: (key: string) => void;
  onQuantityChange: (key: string, quantity: number) => void;
  onCheckout: () => void;
}) {
  if (!panel) {
    return null;
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parsePrice(item.product.price) * item.quantity,
    0,
  );

  return (
    <div className="fixed inset-0 z-[85] bg-slate-950/35 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Cerrar panel"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[28rem] flex-col bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Express Printer
            </p>
            <h2 className="text-xl font-black tracking-tight text-slate-950">
              {panel === "cart" ? "Carrito" : "Deseados"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
            aria-label="Cerrar"
          >
            x
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {panel === "wishlist" ? (
            wishlistProducts.length > 0 ? (
              <div className="space-y-3">
                {wishlistProducts.map((product) => (
                  <div key={product.id} className="grid grid-cols-[5rem_1fr] gap-3 rounded-2xl border border-slate-200 p-3">
                    <div className={`flex h-20 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${product.tint}`}>
                      <Image
                        src={product.image}
                        alt={product.imageAlt}
                        width={220}
                        height={180}
                        sizes="5rem"
                        className="h-auto max-h-[82%] w-auto max-w-[82%] object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950">{product.title}</p>
                      <p className="mt-1 text-sm font-semibold text-[#3558ff]">{product.price}</p>
                      <button
                        type="button"
                        onClick={() => onRemoveWishlist(product.id)}
                        className="mt-3 cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <p className="font-semibold text-slate-950">No tienes productos guardados.</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Guarda productos del catalogo para revisarlos despues.
                </p>
              </div>
            )
          ) : cartItems.length > 0 ? (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.key} className="rounded-2xl border border-slate-200 p-3">
                  <div className="grid grid-cols-[5rem_1fr] gap-3">
                    <div className={`flex h-20 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${item.product.tint}`}>
                      <Image
                        src={item.product.image}
                        alt={item.product.imageAlt}
                        width={220}
                        height={180}
                        sizes="5rem"
                        className="h-auto max-h-[82%] w-auto max-w-[82%] object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950">{item.product.title}</p>
                          <p className="mt-1 text-sm font-semibold text-[#3558ff]">{item.product.price}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveCartItem(item.key)}
                          className="cursor-pointer text-sm font-semibold text-slate-400 transition hover:text-slate-950"
                        >
                          Quitar
                        </button>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                        {Object.entries(item.options).map(([key, value]) => `${key}: ${value}`).join(" / ")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <p className="text-sm font-medium text-slate-500">Cantidad</p>
                    <div className="flex items-center rounded-full border border-slate-200">
                      <button
                        type="button"
                        onClick={() => onQuantityChange(item.key, item.quantity - 1)}
                        className="h-9 w-9 cursor-pointer text-slate-500 transition hover:text-slate-950"
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onQuantityChange(item.key, item.quantity + 1)}
                        className="h-9 w-9 cursor-pointer text-slate-500 transition hover:text-slate-950"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
              <p className="font-semibold text-slate-950">Tu carrito esta vacio.</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Agrega productos del catalogo para preparar tu pedido.
              </p>
            </div>
          )}
        </div>

        {panel === "cart" ? (
          <div className="border-t border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Subtotal estimado</span>
              <span className="text-2xl font-black text-slate-950">{formatCurrency(subtotal)}</span>
            </div>
            <button
              type="button"
              onClick={onCheckout}
              className="mt-4 w-full cursor-pointer rounded-xl bg-[#ffd45f] px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-[#ffcd41]"
            >
              Preparar pedido
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

export function StorefrontAuthShell({
  hasPublicAuth,
  initialMode,
  initialNotice = null,
}: StorefrontAuthShellProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<AuthCommercePanel>(null);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(() => new Set());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [accountActivity, setAccountActivity] = useState<AccountActivity | null>(null);
  const accountDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setWishlistIds(restoreStoredWishlist(window.localStorage.getItem(wishlistStorageKey)));
      setCartItems(restoreStoredCart(window.localStorage.getItem(cartStorageKey)));
      setStorageReady(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    window.localStorage.setItem(
      wishlistStorageKey,
      JSON.stringify(Array.from(wishlistIds)),
    );
  }, [storageReady, wishlistIds]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    window.localStorage.setItem(
      cartStorageKey,
      JSON.stringify(serializeCartItems(cartItems)),
    );
  }, [cartItems, storageReady]);

  useEffect(() => {
    if (!hasPublicAuth) {
      return;
    }

    let isMounted = true;
    const supabase = createBrowserSupabaseClient();

    async function loadAccountActivity() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (isMounted) {
            setAccountActivity(null);
          }
          return;
        }

        const response = await fetch("/api/storefront/account", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar la actividad de cuenta.");
        }

        const payload = (await response.json()) as {
          orders?: AccountActivityOrder[];
        };
        const activeOrders = (payload.orders ?? []).filter(
          (order) => order.status !== "entregado",
        );
        const needsAttention = activeOrders.some((order) => {
          const hasArt = order.files?.some(
            (file) => file.attachment_type === "arte_cliente",
          );

          return (
            !hasArt ||
            order.payment_review_status === "sin_pago" ||
            order.payment_review_status === "rechazado"
          );
        });

        if (isMounted) {
          setAccountActivity({
            activeCount: activeOrders.length,
            needsAttention,
          });
        }
      } catch {
        if (isMounted) {
          setAccountActivity(null);
        }
      }
    }

    void loadAccountActivity();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadAccountActivity();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [hasPublicAuth]);

  useEffect(() => {
    if (!accountOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) {
        return;
      }

      if (
        accountDropdownRef.current?.contains(target) ||
        target.closest("[data-account-trigger='true']")
      ) {
        return;
      }

      setAccountOpen(false);
    };

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [accountOpen]);

  const wishlistProducts = useMemo(
    () => storefrontProducts.filter((product) => wishlistIds.has(product.id)),
    [wishlistIds],
  );
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const openCatalog = (query = "") => {
    if (query.trim()) {
      window.sessionStorage.setItem(catalogQueryStorageKey, query.trim());
    } else {
      window.sessionStorage.removeItem(catalogQueryStorageKey);
    }

    setAccountOpen(false);
    setActivePanel(null);
    router.push("/#catalogo");
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);

    if (value.trim().length >= 2) {
      openCatalog(value);
    }
  };

  const removeCartItem = (key: string) => {
    setCartItems((current) => current.filter((item) => item.key !== key));
  };

  const changeCartQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      removeCartItem(key);
      return;
    }

    setCartItems((current) =>
      current.map((item) => (item.key === key ? { ...item, quantity } : item)),
    );
  };

  return (
    <main className="min-h-screen bg-[#f3f5f8] text-slate-950">
      <StorefrontHeader
        searchQuery={searchQuery}
        onSearchQueryChange={handleSearchQueryChange}
        hasActiveSearch={false}
        isAccountActive={accountOpen}
        accountActivity={accountActivity ?? undefined}
        onAccountClick={() => {
          setAccountOpen((current) => !current);
          setActivePanel(null);
        }}
        wishlistCount={wishlistIds.size}
        cartCount={cartCount}
        onWishlistClick={() => {
          setActivePanel("wishlist");
          setAccountOpen(false);
        }}
        onCartClick={() => {
          setActivePanel("cart");
          setAccountOpen(false);
        }}
        onCatalogClick={() => openCatalog()}
        onHomeClick={() => {
          setSearchQuery("");
          setAccountOpen(false);
          setActivePanel(null);
          router.push("/");
        }}
        onSectionNavigate={(href) => {
          setAccountOpen(false);
          setActivePanel(null);
          router.push(`/${href}`);
        }}
      />

      {accountOpen ? (
        <div className="pointer-events-none absolute inset-x-0 top-[7.35rem] z-[70] px-4 sm:px-6 lg:px-8 2xl:px-10">
          <div
            ref={accountDropdownRef}
            className="mx-auto flex w-full max-w-[112rem] justify-end"
          >
            <CustomerAccountClient
              hasPublicAuth={hasPublicAuth}
              onClose={() => setAccountOpen(false)}
              variant="dropdown"
              initialMode="login"
              showModeSwitch={false}
              initialNotice={initialNotice}
            />
          </div>
        </div>
      ) : null}

      <CustomerAccountClient
        hasPublicAuth={hasPublicAuth}
        initialMode={initialMode}
        showModeSwitch={false}
        variant="page"
        initialNotice={initialNotice}
      />

      <AuthCommerceDrawer
        panel={activePanel}
        cartItems={cartItems}
        wishlistProducts={wishlistProducts}
        onClose={() => setActivePanel(null)}
        onRemoveWishlist={(productId) =>
          setWishlistIds((current) => {
            const next = new Set(current);
            next.delete(productId);
            return next;
          })
        }
        onRemoveCartItem={removeCartItem}
        onQuantityChange={changeCartQuantity}
        onCheckout={() => {
          setActivePanel(null);
          router.push("/checkout");
        }}
      />

      <StorefrontFooter />
    </main>
  );
}
