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
import { type StorefrontProduct } from "@/app/storefront-data";
import { StorefrontBusinessSection } from "@/app/storefront-business-section";
import { StorefrontCategoryStrip } from "@/app/storefront-category-strip";
import { StorefrontFooter } from "@/app/storefront-footer";
import { StorefrontHeader } from "@/app/storefront-header";
import { StorefrontHero } from "@/app/storefront-hero";
import { StorefrontPromoPanels } from "@/app/storefront-promo-panels";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { StorefrontToast } from "./components/StorefrontToast";
import { CaretDown, MagnifyingGlass, Rows, SquaresFour, X } from "@phosphor-icons/react";
import { CatalogProductCard } from "./components/CatalogProductCard";
import { CatalogProductSkeleton } from "./components/CatalogProductSkeleton";
import { ProductPreviewModal } from "./components/ProductPreviewModal";
import { MobileCatalogFilterSheet } from "./components/MobileCatalogFilterSheet";
import { CommerceDrawer } from "./components/CommerceDrawer";
import { QuoteReview } from "./components/QuoteReview";
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

const grotesk = { fontFamily: "var(--font-space-grotesk), sans-serif" };

export function StorefrontShell({ products }: { products: StorefrontProduct[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [catalogView, setCatalogView] = useState<"grid" | "list">("grid");
  const [catalogSort, setCatalogSort] = useState<"rel" | "az" | "cat">("rel");
  const [showQuote, setShowQuote] = useState(false);
  const [quoteName, setQuoteName] = useState("");
  const [quotePhone, setQuotePhone] = useState("");
  const [quoteNote, setQuoteNote] = useState("");
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
      setWishlistIds(restoreStoredWishlist(window.localStorage.getItem(wishlistStorageKey), products));
      setCartItems(restoreStoredCart(window.localStorage.getItem(cartStorageKey), products));
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
      return products;
    }
    return products.filter((item) =>
      [item.title, item.note, item.category, item.description, item.highlights.join(" "), item.options.map((g) => g.values.map((v) => v.label).join(" ")).join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [debouncedQuery, isCatalogVisible, products]);

  const catalogCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
  }, [products]);

  const catalogResults = useMemo(() => {
    if (catalogSort === "az") {
      return [...filteredProducts].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (catalogSort === "cat") {
      return [...filteredProducts].sort(
        (a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title),
      );
    }
    return filteredProducts;
  }, [filteredProducts, catalogSort]);

  const wishlistProducts = useMemo(() => products.filter((product) => wishlistIds.has(product.id)), [wishlistIds, products]);

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
    setShowQuote(false);
    setMobileFilterOpen(false);
    window.history.pushState(null, "", "#catalogo");
    window.setTimeout(() => {
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const openQuoteReview = () => {
    setActivePanel(null);
    setAccountOpen(false);
    setSelectedProduct(null);
    setShowQuote(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToHome = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setCatalogOpen(false);
    setCatalogLoading(false);
    setAccountOpen(false);
    setActivePanel(null);
    setSelectedProduct(null);
    setShowQuote(false);
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
    setShowQuote(false);
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
      setShowQuote(false);
      setCatalogOpen(true);
      setCatalogLoading(true);
      setAccountOpen(false);
    }
  };

  const openPreview = (product: StorefrontProduct) => {
    setSelectedProduct(product);
    setSelectedOptions(getDefaultOptions(product));
    setActivePanel(null);
    setShowQuote(false);
    setMobileFilterOpen(false);
    if (isCatalogVisible) {
      window.setTimeout(() => {
        document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  };

  const openPreviewById = (productId: string) => {
    const product = getProductById(products, productId);
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

  const requestQuote = async (
    product: StorefrontProduct,
    options: Record<string, string>,
  ) => {
    if (!customerSession) {
      const message = "Inicia sesion o registrate para solicitar una cotizacion.";
      setCheckoutNotice({ message, tone: "error" });
      showToast(message, "error");
      setAccountOpen(true);
      setActivePanel(null);
      setSelectedProduct(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const response = await fetch("/api/storefront/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              productId: product.id,
              title: product.title,
              productType: product.category,
              quantity: 1,
              options,
            },
          ],
        }),
      });
      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo enviar la solicitud.");
      }

      setSelectedProduct(null);
      router.push(
        `/mi-cuenta?tone=success&message=${encodeURIComponent(
          payload.message || "Solicitud de cotizacion enviada.",
        )}`,
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "No se pudo enviar la solicitud.",
        "error",
      );
    }
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

  return (
    <main className="relative min-h-screen bg-[#f3f5f8] text-slate-950">
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

      {showQuote ? (
        <>
          <QuoteReview
            items={cartItems}
            name={quoteName}
            phone={quotePhone}
            note={quoteNote}
            onName={setQuoteName}
            onPhone={setQuotePhone}
            onNote={setQuoteNote}
            onQuantityChange={changeCartQuantity}
            onRemoveItem={removeCartItem}
            onBack={() => setShowQuote(false)}
            onBrowseCatalog={openCatalog}
          />
          <StorefrontFooter onCategorySelect={openCatalogWithQuery} />
        </>
      ) : isCatalogVisible ? (
        <>
          <section
            id="catalogo"
            className="catalog-enter mx-auto w-full max-w-[112rem] scroll-mt-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10"
          >
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
                onRequestQuote={() => void requestQuote(selectedProduct, selectedOptions)}
                wished={wishlistIds.has(selectedProduct.id)}
                onToggleWishlist={() => toggleWishlist(selectedProduct.id)}
              />
            ) : (
            <div className="grid gap-8 xl:grid-cols-[236px_1fr]">
              {/* Sidebar de categorías (real, con conteo) */}
              <aside className="catalog-enter-panel hidden xl:sticky xl:top-6 xl:block xl:self-start">
                <p className="mb-3 pl-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#a7a49b]">
                  Categorías
                </p>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedQuery("");
                      setCatalogOpen(true);
                      setCatalogLoading(true);
                      setSelectedProduct(null);
                    }}
                    className={`flex cursor-pointer items-center justify-between gap-2 rounded-[10px] px-3 py-2.5 text-left text-sm font-medium transition ${
                      debouncedQuery ? "text-[#5d5a52] hover:bg-[#1b1b20]/[0.04] hover:text-[#1b1b20]" : "bg-[#1b1b20] text-white"
                    }`}
                  >
                    <span>Todas</span>
                    <span className={`text-[12px] ${debouncedQuery ? "text-[#a7a49b]" : "text-white/60"}`}>{products.length}</span>
                  </button>
                  {catalogCategories.map((category) => {
                    const on = debouncedQuery.toLowerCase() === category.label.toLowerCase();
                    return (
                      <button
                        key={category.label}
                        type="button"
                        onClick={() => {
                          setSearchQuery(category.label);
                          setDebouncedQuery(category.label);
                          setCatalogOpen(true);
                          setCatalogLoading(true);
                          setSelectedProduct(null);
                        }}
                        className={`flex cursor-pointer items-center justify-between gap-2 rounded-[10px] px-3 py-2.5 text-left text-sm font-medium transition ${
                          on ? "bg-[#1b1b20] text-white" : "text-[#5d5a52] hover:bg-[#1b1b20]/[0.04] hover:text-[#1b1b20]"
                        }`}
                      >
                        <span>{category.label}</span>
                        <span className={`text-[12px] ${on ? "text-white/60" : "text-[#a7a49b]"}`}>{category.count}</span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* Main */}
              <div className="catalog-enter-panel">
                  <>
                    {/* Toolbar */}
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                      <div className="flex h-[46px] flex-1 items-center gap-2.5 rounded-xl border border-[#e6e3da] bg-white px-3.5 transition focus-within:border-[#3558ff] focus-within:shadow-[0_0_0_3px_rgba(53,88,255,0.13)] sm:max-w-[360px]">
                        <MagnifyingGlass size={18} className="shrink-0 text-[#8a857a]" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          placeholder="Buscar productos…"
                          className="w-full bg-transparent text-sm text-[#1b1b20] outline-none placeholder:text-[#a7a49b]"
                        />
                        {searchQuery ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery("");
                              setDebouncedQuery("");
                            }}
                            aria-label="Limpiar búsqueda"
                            className="flex cursor-pointer text-[#a7a49b] transition hover:text-[#1b1b20]"
                          >
                            <X size={15} weight="bold" />
                          </button>
                        ) : null}
                      </div>
                      <span className="text-sm font-semibold text-[#1b1b20]">
                        {showCatalogSkeleton
                          ? "Cargando…"
                          : `${catalogResults.length} ${catalogResults.length === 1 ? "producto" : "productos"}`}
                      </span>
                      <div className="relative ml-auto">
                        <select
                          value={catalogSort}
                          onChange={(event) => setCatalogSort(event.target.value as "rel" | "az" | "cat")}
                          className="h-[46px] cursor-pointer appearance-none rounded-xl border border-[#e6e3da] bg-white pl-3.5 pr-9 text-sm font-medium text-[#1b1b20] outline-none transition focus:border-[#3558ff]"
                        >
                          <option value="rel">Relevancia</option>
                          <option value="az">Nombre · A-Z</option>
                          <option value="cat">Categoría</option>
                        </select>
                        <CaretDown size={14} weight="bold" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a857a]" />
                      </div>
                      <div className="flex h-[46px] gap-0.5 rounded-xl border border-[#e6e3da] bg-[#f1eee7] p-[3px]">
                        <button
                          type="button"
                          onClick={() => setCatalogView("grid")}
                          aria-label="Cuadrícula"
                          className={`flex w-[42px] cursor-pointer items-center justify-center rounded-[9px] transition ${
                            catalogView === "grid" ? "bg-white text-[#1b1b20] shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-[#8a857a]"
                          }`}
                        >
                          <SquaresFour size={18} weight="bold" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCatalogView("list")}
                          aria-label="Lista"
                          className={`flex w-[42px] cursor-pointer items-center justify-center rounded-[9px] transition ${
                            catalogView === "list" ? "bg-white text-[#1b1b20] shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-[#8a857a]"
                          }`}
                        >
                          <Rows size={18} weight="bold" />
                        </button>
                      </div>
                    </div>

                    {/* Filtro activo */}
                    {debouncedQuery ? (
                      <div className="mb-5">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#e6e3da] bg-white px-3.5 py-1.5 text-[13px] text-[#1b1b20]">
                          {catalogCategories.some((c) => c.label.toLowerCase() === debouncedQuery.toLowerCase())
                            ? debouncedQuery
                            : `“${debouncedQuery}”`}
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery("");
                              setDebouncedQuery("");
                            }}
                            aria-label="Quitar filtro"
                            className="flex cursor-pointer text-[#8a857a] transition hover:text-[#1b1b20]"
                          >
                            <X size={12} weight="bold" />
                          </button>
                        </span>
                      </div>
                    ) : null}

                    {showCatalogSkeleton ? (
                      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                        {[0, 1, 2, 3, 4, 5].map((item) => <CatalogProductSkeleton key={item} />)}
                      </div>
                    ) : catalogResults.length === 0 ? (
                      <div className="flex flex-col items-center px-5 py-14 text-center">
                        <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-[#e6e3da] bg-white text-[#b8b3a7]">
                          <MagnifyingGlass size={26} />
                        </div>
                        <div style={grotesk} className="mt-4 text-[19px] font-semibold text-[#1b1b20]">
                          Sin resultados
                        </div>
                        <p className="mt-1.5 max-w-[340px] text-sm leading-relaxed text-[#75726a]">
                          No encontramos productos para esa búsqueda o filtro. Prueba con otra palabra o mira todo el catálogo.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setDebouncedQuery("");
                            setCatalogOpen(true);
                          }}
                          className="mt-5 cursor-pointer rounded-xl bg-[#3558ff] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(53,88,255,0.26)] transition hover:bg-[#2c49db]"
                        >
                          Ver todo el catálogo
                        </button>
                      </div>
                    ) : catalogView === "grid" ? (
                      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                        {catalogResults.map((product) => (
                          <CatalogProductCard key={product.id} product={product} view="grid" onPreview={() => openPreview(product)} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {catalogResults.map((product) => (
                          <CatalogProductCard key={product.id} product={product} view="list" onPreview={() => openPreview(product)} />
                        ))}
                      </div>
                    )}
                  </>
              </div>
            </div>
            )}
          </section>
          <StorefrontFooter onCategorySelect={openCatalogWithQuery} />
        </>
      ) : (
        <>
          <StorefrontHero onViewCatalog={openCatalog} />
          <StorefrontCategoryStrip onCategorySelect={openCatalogWithQuery} onViewAll={openCatalog} />
          <StorefrontPromoPanels onPreviewProduct={openPreviewById} onViewAll={openCatalog} />
          <StorefrontBusinessSection />
          <StorefrontFooter onCategorySelect={openCatalogWithQuery} />
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
          onRequestQuote={() => void requestQuote(selectedProduct, selectedOptions)}
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
        onRequestQuote={openQuoteReview}
        onBrowseCatalog={openCatalog}
        checkoutMessage={checkoutMessage}
      />

      <MobileCatalogFilterSheet
        open={mobileFilterOpen}
        activeQuery={debouncedQuery}
        onClose={() => setMobileFilterOpen(false)}
        onClear={clearCatalogFilters}
        onSelect={selectCatalogFilter}
      />

    </main>
  );
}