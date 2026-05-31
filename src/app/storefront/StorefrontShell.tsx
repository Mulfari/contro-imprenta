"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { CustomerAccountClient } from "@/app/mi-cuenta/account-client";
import {
  cartStorageKey,
  catalogQueryStorageKey,
  deleteCartArtFiles,
  getCartKey,
  getDefaultOptions,
  getProductById,
  restoreStoredCart,
  restoreStoredWishlist,
  saveCartArtFiles,
  serializeCartItems,
  wishlistStorageKey,
  type CartItem,
  type StoredCartItem,
} from "@/app/storefront-cart";
import { storefrontProducts, type StorefrontProduct } from "@/app/storefront-data";
import { StorefrontBusinessSection } from "@/app/storefront-business-section";
import { StorefrontCategoryStrip } from "@/app/storefront-category-strip";
import { StorefrontDealsSection } from "@/app/storefront-deals-section";
import { StorefrontFooter } from "@/app/storefront-footer";
import { StorefrontFeatureGridSection } from "@/app/storefront-feature-grid-section";
import { StorefrontHeader } from "@/app/storefront-header";
import { StorefrontHero } from "@/app/storefront-hero";
import { StorefrontPromoPanels } from "@/app/storefront-promo-panels";
import { StorefrontTestimonialsSection } from "@/app/storefront-testimonials-section";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { StorefrontToast } from "./components/StorefrontToast";
import { CatalogProductCard } from "./components/CatalogProductCard";
import { CatalogProductSkeleton } from "./components/CatalogProductSkeleton";
import { ProductPreviewModal } from "./components/ProductPreviewModal";
import { MobileCatalogFilterSheet } from "./components/MobileCatalogFilterSheet";
import { MobileStorefrontBar } from "./components/MobileStorefrontBar";
import { CommerceDrawer } from "./components/CommerceDrawer";
import { CatalogProductDetail } from "./CatalogProductDetail";

type CommercePanel = "wishlist" | "cart" | null;

type ToastMessage = {
  id: number;
  message: string;
  tone: "info" | "success" | "error";
};

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

const categoryGroups = [
  { title: "Papeleria comercial", items: ["Tarjetas", "Talonarios", "Facturas", "Invitaciones"] },
  { title: "Gran formato", items: ["Pendones", "Gran formato", "Roll up", "Publicitario"] },
  { title: "Etiquetas y stickers", items: ["Stickers", "Etiquetas", "Packaging", "Troquelados"] },
  { title: "Acabados y usos", items: ["Premium", "Corporativas", "Autocopiativos", "Personalizados"] },
];

export function StorefrontShell() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(() => new Set());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activePanel, setActivePanel] = useState<CommercePanel>(null);
  const [selectedProduct, setSelectedProduct] = useState<StorefrontProduct | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [customerSession, setCustomerSession] = useState<Session | null>(null);
  const [accountActivity, setAccountActivity] = useState<AccountActivity | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutNotice, setCheckoutNotice] = useState<{ message: string; tone: "error" | "success" } | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement | null>(null);
  const toastIdRef = useRef(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    if (!hasSupabasePublicConfig()) {
      return;
    }

    const supabase = createBrowserSupabaseClient();

    void supabase.auth.getSession().then(({ data }) => {
      setCustomerSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setCustomerSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!customerSession) {
      setAccountActivity(null);
      return;
    }

    let isMounted = true;

    async function loadAccountActivity() {
      try {
        const response = await fetch("/api/storefront/account", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("No se pudo cargar la actividad de cuenta.");
        }

        const payload = (await response.json()) as { orders?: AccountActivityOrder[] };
        const activeOrders = (payload.orders ?? []).filter(
          (order) => order.status !== "entregado" && order.status !== "rechazado",
        );
        const needsAttention = activeOrders.some((order) => {
          const hasArt = order.files?.some((file) => file.attachment_type === "arte_cliente");
          return !hasArt || order.payment_review_status === "sin_pago" || order.payment_review_status === "rechazado";
        });

        if (isMounted) {
          setAccountActivity({ activeCount: activeOrders.length, needsAttention });
        }
      } catch {
        if (isMounted) {
          setAccountActivity(null);
        }
      }
    }

    void loadAccountActivity();

    return () => {
      isMounted = false;
    };
  }, [customerSession]);

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
    window.localStorage.setItem(wishlistStorageKey, JSON.stringify(Array.from(wishlistIds)));
  }, [storageReady, wishlistIds]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }
    const storedItems: StoredCartItem[] = serializeCartItems(cartItems);
    window.localStorage.setItem(cartStorageKey, JSON.stringify(storedItems));
  }, [cartItems, storageReady]);

  useEffect(() => {
    if (!accountOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }
      if (accountDropdownRef.current?.contains(target) || target.closest("[data-account-trigger='true']")) {
        return;
      }
      setAccountOpen(false);
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [accountOpen]);

  const isCatalogVisible = catalogOpen || Boolean(debouncedQuery);
  const isCatalogSettling = isCatalogVisible && searchQuery.trim() !== debouncedQuery;
  const showCatalogSkeleton = catalogLoading || isCatalogSettling;

  useEffect(() => {
    if (!catalogLoading) {
      return;
    }
    const timeout = window.setTimeout(() => setCatalogLoading(false), 260);
    return () => window.clearTimeout(timeout);
  }, [catalogLoading]);

  const filteredProducts = useMemo(() => {
    if (!isCatalogVisible) {
      return [];
    }
    const normalized = debouncedQuery.toLowerCase();
    if (!normalized) {
      return storefrontProducts;
    }
    return storefrontProducts.filter((item) =>
      [item.title, item.note, item.category, item.description, item.highlights.join(" "), item.options.map((g) => g.values.join(" ")).join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [debouncedQuery, isCatalogVisible]);

  const wishlistProducts = useMemo(() => storefrontProducts.filter((product) => wishlistIds.has(product.id)), [wishlistIds]);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const publicAuthEnabled = hasSupabasePublicConfig();

  const showToast = (message: string, tone: ToastMessage["tone"] = "info") => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, message, tone });
  };

  const openCatalog = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setCatalogOpen(true);
    setCatalogLoading(true);
    setAccountOpen(false);
    setActivePanel(null);
    setSelectedProduct(null);
    setMobileFilterOpen(false);
    window.history.pushState(null, "", "#catalogo");
    window.setTimeout(() => {
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const goToHome = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setCatalogOpen(false);
    setCatalogLoading(false);
    setAccountOpen(false);
    setActivePanel(null);
    setSelectedProduct(null);
    setMobileFilterOpen(false);
    window.history.pushState(null, "", "/");
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  const openCatalogWithQuery = (query: string) => {
    setSearchQuery(query);
    setDebouncedQuery(query);
    setCatalogOpen(true);
    setCatalogLoading(true);
    setAccountOpen(false);
    setActivePanel(null);
    setSelectedProduct(null);
    setMobileFilterOpen(false);
    window.history.pushState(null, "", "#catalogo");
    window.setTimeout(() => {
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (window.location.hash !== "#catalogo") {
        return;
      }
      const storedQuery = window.sessionStorage.getItem(catalogQueryStorageKey) ?? "";
      window.sessionStorage.removeItem(catalogQueryStorageKey);
      if (storedQuery.trim()) {
        openCatalogWithQuery(storedQuery.trim());
        return;
      }
      openCatalog();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const closeCatalogForHomeSection = () => {
    setCatalogOpen(false);
    setActivePanel(null);
    setSelectedProduct(null);
    setMobileFilterOpen(false);
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    setSelectedProduct(null);
    if (value.trim()) {
      setCatalogOpen(true);
      setCatalogLoading(true);
      setAccountOpen(false);
    }
  };

  const openPreview = (product: StorefrontProduct) => {
    setSelectedProduct(product);
    setSelectedOptions(getDefaultOptions(product));
    setActivePanel(null);
    setMobileFilterOpen(false);
    if (isCatalogVisible) {
      window.setTimeout(() => {
        document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  };

  const openPreviewById = (productId: string) => {
    const product = getProductById(productId);
    if (!product) {
      showToast("No se encontro ese producto.", "error");
      return;
    }
    openPreview(product);
  };

  const toggleWishlist = (productId: string) => {
    setWishlistIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const addToCart = async (
    product: StorefrontProduct,
    options = getDefaultOptions(product),
    quantity = 1,
    artFiles: File[] = [],
  ) => {
    const key = getCartKey(product, options);
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    const artFileNames = artFiles.map((file) => file.name);

    if (artFiles.length > 0) {
      try {
        await saveCartArtFiles(key, artFiles);
      } catch {
        showToast("No se pudo preparar el arte en este navegador.", "error");
      }
    }

    setCartItems((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + safeQuantity, artFileNames: artFileNames.length > 0 ? artFileNames : item.artFileNames }
            : item,
        );
      }
      return [...current, { key, product, quantity: safeQuantity, options, artFileNames }];
    });
    setActivePanel("cart");
    setMobileFilterOpen(false);
    showToast(artFiles.length > 0 ? `${product.title} agregado con arte preparado.` : `${product.title} agregado al carrito.`, "success");
  };

  const addProductById = (productId: string) => {
    const product = getProductById(productId);
    if (!product) {
      showToast("No se encontro ese producto.", "error");
      return;
    }
    void addToCart(product);
  };

  const removeCartItem = (key: string) => {
    setCartItems((current) => current.filter((item) => item.key !== key));
    void deleteCartArtFiles(key);
  };

  const changeCartQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      removeCartItem(key);
      return;
    }
    setCartItems((current) => current.map((item) => (item.key === key ? { ...item, quantity } : item)));
  };

  const handleCheckout = async () => {
    setCheckoutMessage("");
    if (cartItems.length === 0) {
      setCheckoutMessage("Agrega productos al carrito antes de continuar.");
      setCheckoutNotice(null);
      showToast("Agrega productos al carrito antes de continuar.", "info");
      return;
    }
    if (!customerSession) {
      const message = "Necesitas iniciar sesion o registrarte para continuar con el pedido.";
      setCheckoutMessage(message);
      setCheckoutNotice({ message, tone: "error" });
      showToast(message, "error");
      setAccountOpen(true);
      setActivePanel(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setActivePanel(null);
    router.push("/checkout");
  };

  const clearCatalogFilters = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setCatalogOpen(true);
    setCatalogLoading(true);
    setSelectedProduct(null);
    setMobileFilterOpen(false);
    setActivePanel(null);
    setAccountOpen(false);
    window.history.pushState(null, "", "#catalogo");
    window.setTimeout(() => {
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const selectCatalogFilter = (query: string) => {
    setSearchQuery(query);
    setDebouncedQuery(query);
    setCatalogOpen(true);
    setCatalogLoading(true);
    setSelectedProduct(null);
    setMobileFilterOpen(false);
    setActivePanel(null);
    setAccountOpen(false);
    window.history.pushState(null, "", "#catalogo");
    window.setTimeout(() => {
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const openMobileFilters = () => {
    setCatalogOpen(true);
    setCatalogLoading(true);
    setActivePanel(null);
    setAccountOpen(false);
    setSelectedProduct(null);
    setMobileFilterOpen(true);
    window.history.pushState(null, "", "#catalogo");
    window.setTimeout(() => {
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  return (
    <main className="relative min-h-screen bg-[#f3f5f8] pb-24 text-slate-950 xl:pb-0">
      <StorefrontToast key={toast?.id ?? "empty-toast"} toast={toast} onDone={() => setToast(null)} />

      <StorefrontHeader
        searchQuery={searchQuery}
        onSearchQueryChange={handleSearchQueryChange}
        hasActiveSearch={isCatalogVisible}
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
        onCatalogClick={openCatalog}
        onHomeClick={goToHome}
        onSectionNavigate={() => closeCatalogForHomeSection()}
      />

      {accountOpen ? (
        <div className="pointer-events-none absolute inset-x-0 top-[7.35rem] z-[70] px-4 sm:px-6 lg:px-8 2xl:px-10">
          <div ref={accountDropdownRef} className="mx-auto flex w-full max-w-[112rem] justify-end">
            <CustomerAccountClient
              hasPublicAuth={publicAuthEnabled}
              onClose={() => setAccountOpen(false)}
              variant="dropdown"
              initialMode="login"
              showModeSwitch={false}
              initialNotice={checkoutNotice}
            />
          </div>
        </div>
      ) : null}

      {isCatalogVisible ? (
        <>
          <section
            id="catalogo"
            className="catalog-enter mx-auto w-full max-w-[112rem] scroll-mt-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 2xl:px-10"
          >
            <div className="grid gap-4 xl:grid-cols-[300px_1fr] xl:gap-6">
              <aside className="catalog-enter-panel hidden rounded-[1.45rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)] xl:block xl:rounded-[1.8rem]">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Catalogo</p>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">Categorias</h2>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedQuery("");
                    setCatalogOpen(true);
                    setCatalogLoading(true);
                    setSelectedProduct(null);
                  }}
                  className={`mt-5 w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    debouncedQuery ? "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50" : "bg-slate-950 text-white hover:bg-slate-800"
                  }`}
                >
                  Catalogo completo
                </button>
                <div className="mt-5 space-y-5">
                  {categoryGroups.map((group) => (
                    <div key={group.title} className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
                      <h3 className="text-sm font-semibold text-slate-500">{group.title}</h3>
                      <div className="mt-3 space-y-1.5">
                        {group.items.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setSearchQuery(item);
                              setDebouncedQuery(item);
                              setCatalogOpen(true);
                              setCatalogLoading(true);
                              setSelectedProduct(null);
                            }}
                            className={`block w-full cursor-pointer rounded-lg px-2 py-2.5 text-left text-sm transition ${
                              debouncedQuery.toLowerCase() === item.toLowerCase()
                                ? "bg-slate-950 text-white"
                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              <section className="catalog-enter-panel rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-[0_18px 40px_rgba(15,23,42,0.04)] sm:p-6 xl:rounded-[1.9rem]">
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 sm:tracking-[0.32em]">
                      {showCatalogSkeleton
                        ? "Preparando catalogo"
                        : debouncedQuery
                          ? "Resultados de busqueda"
                          : "Catalogo completo"}
                    </p>
                    <h2 className="mt-2 text-[1.55rem] font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
                      {showCatalogSkeleton ? searchQuery.trim() || "Productos de impresion" : debouncedQuery || "Productos de impresion"}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                      {showCatalogSkeleton ? "Cargando..." : `${filteredProducts.length} producto${filteredProducts.length === 1 ? "" : "s"}`}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2">{cartCount} en carrito</span>
                  </div>
                </div>

                {selectedProduct ? (
                  <CatalogProductDetail
                    key={selectedProduct.id}
                    product={selectedProduct}
                    selectedOptions={selectedOptions}
                    onBack={() => setSelectedProduct(null)}
                    onOptionChange={(group, value) => setSelectedOptions((current) => ({ ...current, [group]: value }))}
                    onAddToCart={(quantity, files) => {
                      void addToCart(selectedProduct, selectedOptions, quantity, files);
                      setSelectedProduct(null);
                    }}
                    wished={wishlistIds.has(selectedProduct.id)}
                    onToggleWishlist={() => toggleWishlist(selectedProduct.id)}
                  />
                ) : showCatalogSkeleton ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                    {[0, 1, 2, 3, 4, 5].map((item) => <CatalogProductSkeleton key={item} />)}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <CatalogProductCard
                        key={product.id}
                        product={product}
                        wished={wishlistIds.has(product.id)}
                        onPreview={() => openPreview(product)}
                        onToggleWishlist={() => toggleWishlist(product.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                    <p className="text-lg font-semibold text-slate-900">No encontramos productos para esa busqueda</p>
                    <p className="mt-2 text-sm text-slate-500">Prueba con otra palabra o selecciona una categoria del catalogo.</p>
                  </div>
                )}
              </section>
            </div>
          </section>
          <StorefrontFooter />
        </>
      ) : (
        <>
          <StorefrontHero />
          <StorefrontCategoryStrip onCategorySelect={openCatalogWithQuery} />
          <StorefrontPromoPanels onPreviewProduct={openPreviewById} onAddProduct={addProductById} />
          <StorefrontDealsSection onPreviewProduct={openPreviewById} onAddProduct={addProductById} />
          <StorefrontFeatureGridSection />
          <StorefrontBusinessSection />
          <StorefrontTestimonialsSection />
          <StorefrontFooter />
        </>
      )}

      {selectedProduct && !isCatalogVisible ? (
        <ProductPreviewModal
          product={selectedProduct}
          selectedOptions={selectedOptions}
          onClose={() => setSelectedProduct(null)}
          onOptionChange={(group, value) => setSelectedOptions((current) => ({ ...current, [group]: value }))}
          onAddToCart={() => {
            void addToCart(selectedProduct, selectedOptions);
            setSelectedProduct(null);
          }}
          wished={wishlistIds.has(selectedProduct.id)}
          onToggleWishlist={() => toggleWishlist(selectedProduct.id)}
        />
      ) : null}

      <CommerceDrawer
        panel={activePanel}
        cartItems={cartItems}
        wishlistProducts={wishlistProducts}
        onClose={() => setActivePanel(null)}
        onPreview={openPreview}
        onAddProduct={(product) => void addToCart(product)}
        onRemoveWishlist={(productId) => toggleWishlist(productId)}
        onRemoveCartItem={removeCartItem}
        onQuantityChange={changeCartQuantity}
        onCheckout={handleCheckout}
        checkoutMessage={checkoutMessage}
      />

      <MobileCatalogFilterSheet
        open={mobileFilterOpen}
        activeQuery={debouncedQuery}
        onClose={() => setMobileFilterOpen(false)}
        onClear={clearCatalogFilters}
        onSelect={selectCatalogFilter}
      />

      <MobileStorefrontBar
        isCatalogVisible={isCatalogVisible}
        cartCount={cartCount}
        wishlistCount={wishlistIds.size}
        onCatalogClick={openCatalog}
        onFilterClick={openMobileFilters}
        onWishlistClick={() => {
          setActivePanel("wishlist");
          setAccountOpen(false);
          setMobileFilterOpen(false);
        }}
        onCartClick={() => {
          setActivePanel("cart");
          setAccountOpen(false);
          setMobileFilterOpen(false);
        }}
      />
    </main>
  );
}