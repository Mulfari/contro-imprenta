"use client";

interface MobileStorefrontBarProps {
  isCatalogVisible: boolean;
  cartCount: number;
  wishlistCount: number;
  onCatalogClick: () => void;
  onFilterClick: () => void;
  onWishlistClick: () => void;
  onCartClick: () => void;
}

export function MobileStorefrontBar({
  isCatalogVisible,
  cartCount,
  wishlistCount,
  onCatalogClick,
  onFilterClick,
  onWishlistClick,
  onCartClick,
}: MobileStorefrontBarProps) {
  const itemClass =
    "flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-[1rem] px-2 py-2 text-[0.68rem] font-black transition";

  return (
    <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[64] xl:hidden">
      <div className="mx-auto flex max-w-md items-center gap-1 rounded-[1.35rem] border border-slate-200/80 bg-white/94 p-1.5 text-slate-600 shadow-[0_22px_58px_rgba(15,23,42,0.22)] backdrop-blur-xl">
        <button
          type="button"
          onClick={onCatalogClick}
          className={`${itemClass} ${isCatalogVisible ? "bg-slate-950 text-white" : "hover:bg-slate-50 hover:text-slate-950"}`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 5h16" />
            <path d="M4 12h16" />
            <path d="M4 19h16" />
          </svg>
          Catalogo
        </button>

        <button type="button" onClick={onFilterClick} className={`${itemClass} hover:bg-slate-50 hover:text-slate-950`}>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6h16" />
            <path d="M7 12h10" />
            <path d="M10 18h4" />
          </svg>
          Filtros
        </button>

        <button type="button" onClick={onWishlistClick} className={`${itemClass} relative hover:bg-slate-50 hover:text-slate-950`}>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 20-1.2-1.1C5.8 14.4 3 11.8 3 8.5A4.5 4.5 0 0 1 7.5 4C9.3 4 11 4.9 12 6.3 13 4.9 14.7 4 16.5 4A4.5 4.5 0 0 1 21 8.5c0 3.3-2.8 5.9-7.8 10.4L12 20Z" />
          </svg>
          Deseados
          {wishlistCount > 0 ? (
            <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff5b4d] px-1 text-[0.62rem] font-bold text-white">
              {wishlistCount}
            </span>
          ) : null}
        </button>

        <button type="button" onClick={onCartClick} className={`${itemClass} relative hover:bg-slate-50 hover:text-slate-950`}>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="19" r="1.75" />
            <circle cx="18" cy="19" r="1.75" />
            <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H7.2" />
          </svg>
          Carrito
          {cartCount > 0 ? (
            <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ffd45f] px-1 text-[0.62rem] font-bold text-slate-950">
              {cartCount}
            </span>
          ) : null}
        </button>
      </div>
    </nav>
  );
}