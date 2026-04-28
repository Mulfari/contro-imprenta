import { storefrontProducts, type StorefrontProduct } from "@/app/storefront-data";

export type CartItem = {
  key: string;
  product: StorefrontProduct;
  quantity: number;
  options: Record<string, string>;
  artFileNames?: string[];
};

export type StoredCartItem = {
  productId: string;
  quantity: number;
  options: Record<string, string>;
  artFileNames?: string[];
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
          artFileNames: Array.isArray(item.artFileNames) ? item.artFileNames : [],
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
    artFileNames: item.artFileNames ?? [],
  })) satisfies StoredCartItem[];
}

const cartArtDbName = "express-printer-cart-art";
const cartArtStoreName = "files";
const cartArtDbVersion = 1;

type StoredCartArtFile = {
  id: string;
  cartKey: string;
  index: number;
  name: string;
  type: string;
  lastModified: number;
  blob: Blob;
};

function openCartArtDb() {
  return new Promise<IDBDatabase | null>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }

    const request = indexedDB.open(cartArtDbName, cartArtDbVersion);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(cartArtStoreName)) {
        const store = db.createObjectStore(cartArtStoreName, { keyPath: "id" });
        store.createIndex("cartKey", "cartKey", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function promisifyRequest<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function waitForTransaction(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function loadCartArtFiles(cartKey: string) {
  const db = await openCartArtDb();

  if (!db) {
    return [] as File[];
  }

  try {
    const transaction = db.transaction(cartArtStoreName, "readonly");
    const store = transaction.objectStore(cartArtStoreName);
    const index = store.index("cartKey");
    const entries = await promisifyRequest(index.getAll(cartKey) as IDBRequest<StoredCartArtFile[]>);

    return entries
      .sort((left, right) => left.index - right.index)
      .map(
        (entry) =>
          new File([entry.blob], entry.name, {
            type: entry.type,
            lastModified: entry.lastModified,
          }),
      );
  } finally {
    db.close();
  }
}

export async function saveCartArtFiles(cartKey: string, files: File[]) {
  if (!files.length) {
    return;
  }

  await deleteCartArtFiles(cartKey);

  const db = await openCartArtDb();

  if (!db) {
    return;
  }

  try {
    const transaction = db.transaction(cartArtStoreName, "readwrite");
    const store = transaction.objectStore(cartArtStoreName);

    files.forEach((file, indexValue) => {
      store.put({
        id: `${cartKey}:${indexValue}:${file.name}`,
        cartKey,
        index: indexValue,
        name: file.name,
        type: file.type,
        lastModified: file.lastModified,
        blob: file,
      } satisfies StoredCartArtFile);
    });

    await waitForTransaction(transaction);
  } finally {
    db.close();
  }
}

export async function deleteCartArtFiles(cartKey: string) {
  const db = await openCartArtDb();

  if (!db) {
    return;
  }

  try {
    const readTransaction = db.transaction(cartArtStoreName, "readonly");
    const index = readTransaction.objectStore(cartArtStoreName).index("cartKey");
    const existing = await promisifyRequest(index.getAll(cartKey) as IDBRequest<StoredCartArtFile[]>);

    if (!existing.length) {
      return;
    }

    const writeTransaction = db.transaction(cartArtStoreName, "readwrite");
    const store = writeTransaction.objectStore(cartArtStoreName);

    existing.forEach((entry) => {
      store.delete(entry.id);
    });

    await waitForTransaction(writeTransaction);
  } finally {
    db.close();
  }
}

export async function clearCartArtFiles() {
  const db = await openCartArtDb();

  if (!db) {
    return;
  }

  try {
    const transaction = db.transaction(cartArtStoreName, "readwrite");
    transaction.objectStore(cartArtStoreName).clear();
    await waitForTransaction(transaction);
  } finally {
    db.close();
  }
}
