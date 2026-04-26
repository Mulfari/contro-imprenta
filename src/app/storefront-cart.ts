import { storefrontProducts, type StorefrontProduct } from "@/app/storefront-data";

export type CartItem = {
  key: string;
  product: StorefrontProduct;
  quantity: number;
  options: Record<string, string>;
};

export type StoredCartItem = {
  productId: string;
  quantity: number;
  options: Record<string, string>;
};

export const cartStorageKey = "express-printer-cart";
export const wishlistStorageKey = "express-printer-wishlist";
export const catalogQueryStorageKey = "express-printer-catalog-query";

export function getDefaultOptions(product: StorefrontProduct) {
  return Object.fromEntries(
    product.options.map((group) => [group.name, group.values[0] ?? ""]),
  );
}

export function getCartKey(product: StorefrontProduct, options: Record<string, string>) {
  return `${product.id}:${Object.entries(options)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}-${value}`)
    .join("|")}`;
}

export function parsePrice(price: string) {
  return Number(price.replace(/[^\d.]/g, "")) || 0;
}

export function getProductById(productId: string) {
  return storefrontProducts.find((product) => product.id === productId) ?? null;
}

export function restoreStoredCart(value: string | null) {
  if (!value) {
    return [] as CartItem[];
  }

  try {
    const parsed = JSON.parse(value) as StoredCartItem[];

    if (!Array.isArray(parsed)) {
      return [] as CartItem[];
    }

    return parsed.flatMap((item) => {
      const product = getProductById(item.productId);

      if (!product) {
        return [];
      }

      const options = item.options && typeof item.options === "object"
        ? item.options
        : getDefaultOptions(product);

      return [
        {
          key: getCartKey(product, options),
          product,
          quantity: Math.max(1, Number(item.quantity) || 1),
          options,
        },
      ];
    });
  } catch {
    return [] as CartItem[];
  }
}

export function restoreStoredWishlist(value: string | null) {
  if (!value) {
    return new Set<string>();
  }

  try {
    const parsed = JSON.parse(value) as string[];

    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    const validIds = new Set(storefrontProducts.map((product) => product.id));
    return new Set(parsed.filter((productId) => validIds.has(productId)));
  } catch {
    return new Set<string>();
  }
}

export function serializeCartItems(cartItems: CartItem[]) {
  return cartItems.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
    options: item.options,
  })) satisfies StoredCartItem[];
}
