import {
  fallbackProducts,
  storefrontCategories,
  type ProductOptionGroup,
  type StorefrontProduct,
} from "@/app/storefront-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/config";
import { formatFromPrice, productFromPrice } from "@/lib/pricing";

// Registro completo del producto tal como vive en la BD (lo usa el admin).
export type CatalogProductRecord = {
  id: string; // uuid interno
  slug: string;
  title: string;
  description: string;
  category: string;
  imagePath: string;
  imageAlt: string;
  tint: string;
  turnaround: string;
  highlights: string[];
  pricingMode: "package" | "unit";
  basePrice: number;
  designFee: number;
  requiresQuote: boolean;
  options: ProductOptionGroup[];
  isActive: boolean;
  sortOrder: number;
};

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  image_path: string | null;
  image_alt: string | null;
  tint: string | null;
  turnaround: string | null;
  highlights: unknown;
  pricing_mode: string | null;
  base_price: number | string | null;
  design_fee: number | string | null;
  requires_quote: boolean | null;
  options: unknown;
  is_active: boolean;
  sort_order: number | null;
};

const DEFAULT_TINT = "from-slate-100 via-white to-slate-50";
const DEFAULT_IMAGE = "/storefront-cards.webp";

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
}

function toOptionGroups(value: unknown): ProductOptionGroup[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((group) => {
      if (!group || typeof group !== "object") {
        return null;
      }
      const candidate = group as {
        name?: unknown;
        role?: unknown;
        values?: unknown;
      };
      const name = typeof candidate.name === "string" ? candidate.name : "";
      const role = candidate.role === "package" ? "package" : "surcharge";
      const values = Array.isArray(candidate.values)
        ? candidate.values
            .map((item) => {
              if (!item || typeof item !== "object") {
                return null;
              }
              const value = item as { label?: unknown; amount?: unknown };
              const label = typeof value.label === "string" ? value.label : "";
              const amount = Number(value.amount);
              if (!label) {
                return null;
              }
              return { label, amount: Number.isFinite(amount) ? amount : 0 };
            })
            .filter((item): item is { label: string; amount: number } => item !== null)
        : [];

      if (!name || values.length === 0) {
        return null;
      }

      return { name, role, values } satisfies ProductOptionGroup;
    })
    .filter((group): group is ProductOptionGroup => group !== null);
}

function rowToRecord(row: ProductRow): CatalogProductRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    category: row.category ?? "",
    imagePath: row.image_path || DEFAULT_IMAGE,
    imageAlt: row.image_alt || row.title,
    tint: row.tint || DEFAULT_TINT,
    turnaround: row.turnaround ?? "",
    highlights: toStringArray(row.highlights),
    pricingMode: row.pricing_mode === "unit" ? "unit" : "package",
    basePrice: Number(row.base_price ?? 0) || 0,
    designFee: Number(row.design_fee ?? 0) || 0,
    requiresQuote: Boolean(row.requires_quote),
    options: toOptionGroups(row.options),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0) || 0,
  };
}

// Productos con editor de tarjetas propio (conservan su flujo de diseño actual).
const CARD_EDITOR_SLUGS = new Set(["tarjetas-premium", "tarjetas-corporativas"]);

export function recordToStorefrontProduct(
  record: CatalogProductRecord,
): StorefrontProduct {
  const options = [...record.options];

  // El "diseño" se modela como una opción mas: el cliente sube su arte (+0) o
  // pide que la imprenta lo diseñe (+designFee). Las tarjetas conservan su
  // editor propio, asi que no se les sintetiza este grupo.
  if (!CARD_EDITOR_SLUGS.has(record.slug)) {
    options.push({
      name: "Diseño",
      role: "surcharge",
      values: [
        { label: "Subo mi arte", amount: 0 },
        { label: "Lo diseña la imprenta", amount: Math.max(0, record.designFee) },
      ],
    });
  }

  const base: StorefrontProduct = {
    id: record.slug,
    title: record.title,
    price: "",
    note: record.category,
    category: record.category,
    tint: record.tint,
    image: record.imagePath,
    imageAlt: record.imageAlt,
    description: record.description,
    turnaround: record.turnaround,
    highlights: record.highlights,
    pricingMode: record.pricingMode,
    basePrice: record.basePrice,
    designFee: record.designFee,
    requiresQuote: record.requiresQuote,
    options,
  };

  base.price = formatFromPrice(productFromPrice(base));
  return base;
}

const productColumns =
  "id, slug, title, description, category, image_path, image_alt, tint, turnaround, highlights, pricing_mode, base_price, design_fee, requires_quote, options, is_active, sort_order";

// Catálogo público para el storefront. Si la BD no tiene productos o falla la
// lectura (p. ej. tabla aún no creada), cae a los productos de respaldo.
export async function listStorefrontProducts(): Promise<StorefrontProduct[]> {
  if (!hasSupabaseAdminConfig()) {
    return fallbackProducts;
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select(productColumns)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackProducts;
    }

    return (data as ProductRow[]).map((row) =>
      recordToStorefrontProduct(rowToRecord(row)),
    );
  } catch {
    return fallbackProducts;
  }
}

// Todos los productos (incluye ocultos) para el panel admin. Ante error
// devuelve lista vacía para no romper el dashboard.
export async function listCatalogProductsForAdmin(): Promise<CatalogProductRecord[]> {
  if (!hasSupabaseAdminConfig()) {
    return [];
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select(productColumns)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !data) {
      return [];
    }

    return (data as ProductRow[]).map(rowToRecord);
  } catch {
    return [];
  }
}

export async function listCatalogCategories(): Promise<string[]> {
  if (!hasSupabaseAdminConfig()) {
    return storefrontCategories;
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("product_categories")
      .select("name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return storefrontCategories;
    }

    return data
      .map((row) => String((row as { name: string }).name ?? "").trim())
      .filter(Boolean);
  } catch {
    return storefrontCategories;
  }
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export type CatalogProductInput = {
  title: string;
  slug?: string;
  description: string;
  category: string;
  imagePath: string;
  imageAlt: string;
  tint: string;
  turnaround: string;
  highlights: string[];
  pricingMode: "package" | "unit";
  basePrice: number;
  designFee: number;
  requiresQuote: boolean;
  options: ProductOptionGroup[];
  isActive: boolean;
  sortOrder: number;
};

function sanitizeOptions(options: ProductOptionGroup[]): ProductOptionGroup[] {
  return options
    .map((group) => ({
      name: String(group.name ?? "").trim(),
      role: group.role === "package" ? "package" : "surcharge",
      values: (group.values ?? [])
        .map((value) => ({
          label: String(value.label ?? "").trim(),
          amount: Number.isFinite(Number(value.amount)) ? Number(value.amount) : 0,
        }))
        .filter((value) => value.label.length > 0),
    }))
    .filter((group) => group.name.length > 0 && group.values.length > 0) as ProductOptionGroup[];
}

function toRowPayload(input: CatalogProductInput) {
  const title = input.title.trim();

  if (!title) {
    throw new Error("Escribe el nombre del producto.");
  }

  return {
    slug: (input.slug?.trim() || slugify(title)) || `producto-${Date.now()}`,
    title,
    description: input.description.trim() || null,
    category: input.category.trim() || null,
    image_path: input.imagePath.trim() || null,
    image_alt: input.imageAlt.trim() || title,
    tint: input.tint.trim() || DEFAULT_TINT,
    turnaround: input.turnaround.trim() || null,
    highlights: input.highlights.map((item) => item.trim()).filter(Boolean),
    pricing_mode: input.pricingMode === "unit" ? "unit" : "package",
    base_price: Number.isFinite(input.basePrice) ? Math.max(0, input.basePrice) : 0,
    design_fee: Number.isFinite(input.designFee) ? Math.max(0, input.designFee) : 0,
    requires_quote: Boolean(input.requiresQuote),
    options: sanitizeOptions(input.options),
    is_active: input.isActive,
    sort_order: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
  };
}

export async function createCatalogProduct(input: CatalogProductInput) {
  const supabase = createSupabaseAdminClient();
  const payload = toRowPayload(input);

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select(productColumns)
    .single<ProductRow>();

  if (error) {
    throw error;
  }

  return rowToRecord(data);
}

export async function updateCatalogProduct(id: string, input: CatalogProductInput) {
  if (!id) {
    throw new Error("No se pudo identificar el producto.");
  }

  const supabase = createSupabaseAdminClient();
  const payload = toRowPayload(input);

  const { data, error } = await supabase
    .from("products")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(productColumns)
    .single<ProductRow>();

  if (error) {
    throw error;
  }

  return rowToRecord(data);
}

export async function setCatalogProductActive(id: string, isActive: boolean) {
  if (!id) {
    throw new Error("No se pudo identificar el producto.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteCatalogProduct(id: string) {
  if (!id) {
    throw new Error("No se pudo identificar el producto.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

// Busca el producto real por slug (id público) para recalcular precio en el
// checkout sin confiar en el cliente. Cae al fallback si no está en BD.
export async function getStorefrontProductBySlug(
  slug: string,
): Promise<StorefrontProduct | null> {
  if (!slug) {
    return null;
  }

  if (hasSupabaseAdminConfig()) {
    try {
      const supabase = createSupabaseAdminClient();
      const { data, error } = await supabase
        .from("products")
        .select(productColumns)
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle<ProductRow>();

      if (!error && data) {
        return recordToStorefrontProduct(rowToRecord(data));
      }
    } catch {
      // cae al fallback
    }
  }

  return fallbackProducts.find((product) => product.id === slug) ?? null;
}
