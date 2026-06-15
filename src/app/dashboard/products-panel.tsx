"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { CatalogProductRecord } from "@/lib/catalog";
import { formatPrice, productFromPrice } from "@/lib/pricing";
import type {
  ProductOptionGroup,
  ProductOptionRole,
} from "@/app/storefront-data";

type ProductFormAction = (formData: FormData) => void;

type ProductsPanelProps = {
  products: CatalogProductRecord[];
  categories: string[];
  createAction: ProductFormAction;
  updateAction: ProductFormAction;
  deleteAction: ProductFormAction;
  toggleAction: ProductFormAction;
};

type FormState = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  imagePath: string;
  imageAlt: string;
  tint: string;
  turnaround: string;
  highlights: string;
  pricingMode: "package" | "unit";
  basePrice: string;
  designFee: string;
  requiresQuote: boolean;
  stock: string;
  options: ProductOptionGroup[];
  isActive: boolean;
  sortOrder: string;
};

const TINT_PRESETS = [
  "from-amber-100 via-white to-orange-50",
  "from-sky-100 via-white to-cyan-50",
  "from-violet-100 via-white to-fuchsia-50",
  "from-emerald-100 via-white to-lime-50",
  "from-rose-100 via-white to-pink-50",
  "from-cyan-100 via-white to-sky-50",
  "from-zinc-100 via-white to-slate-50",
  "from-yellow-100 via-white to-amber-50",
];

function emptyForm(sortOrder: number): FormState {
  return {
    id: "",
    title: "",
    slug: "",
    description: "",
    category: "",
    imagePath: "",
    imageAlt: "",
    tint: TINT_PRESETS[0],
    turnaround: "",
    highlights: "",
    pricingMode: "package",
    basePrice: "0",
    designFee: "0",
    requiresQuote: false,
    stock: "",
    options: [
      { name: "Cantidad", role: "package", values: [{ label: "", amount: 0 }] },
    ],
    isActive: true,
    sortOrder: String(sortOrder),
  };
}

function recordToForm(record: CatalogProductRecord): FormState {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    description: record.description,
    category: record.category,
    imagePath: record.imagePath,
    imageAlt: record.imageAlt,
    tint: record.tint,
    turnaround: record.turnaround,
    highlights: record.highlights.join("\n"),
    pricingMode: record.pricingMode,
    basePrice: String(record.basePrice),
    designFee: String(record.designFee),
    requiresQuote: record.requiresQuote,
    stock: record.stock == null ? "" : String(record.stock),
    options: record.options.length > 0 ? record.options : [],
    isActive: record.isActive,
    sortOrder: String(record.sortOrder),
  };
}

function buildPayload(form: FormState) {
  return {
    title: form.title.trim(),
    slug: form.slug.trim() || undefined,
    description: form.description.trim(),
    category: form.category.trim(),
    imagePath: form.imagePath.trim(),
    imageAlt: form.imageAlt.trim(),
    tint: form.tint.trim(),
    turnaround: form.turnaround.trim(),
    highlights: form.highlights
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    pricingMode: form.pricingMode,
    basePrice: Number(form.basePrice) || 0,
    designFee: Number(form.designFee) || 0,
    requiresQuote: form.requiresQuote,
    stock: form.stock.trim() === "" ? null : Math.max(0, Math.trunc(Number(form.stock) || 0)),
    options: form.options,
    isActive: form.isActive,
    sortOrder: Number(form.sortOrder) || 0,
  };
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400";
const labelClass = "mb-1.5 block text-xs font-semibold text-slate-500";

export function ProductsPanel({
  products,
  categories,
  createAction,
  updateAction,
  deleteAction,
  toggleAction,
}: ProductsPanelProps) {
  const [form, setForm] = useState<FormState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const nextSortOrder = useMemo(
    () => products.reduce((max, product) => Math.max(max, product.sortOrder), 0) + 1,
    [products],
  );

  const isEditing = Boolean(form?.id);

  const previewFrom = form
    ? formatPrice(
        productFromPrice({
          pricingMode: form.pricingMode,
          basePrice: Number(form.basePrice) || 0,
          options: form.options,
        }),
      )
    : "";

  const updateOption = (index: number, next: Partial<ProductOptionGroup>) => {
    setForm((current) => {
      if (!current) return current;
      const options = current.options.map((group, groupIndex) =>
        groupIndex === index ? { ...group, ...next } : group,
      );
      return { ...current, options };
    });
  };

  const updateValue = (
    groupIndex: number,
    valueIndex: number,
    next: Partial<{ label: string; amount: number }>,
  ) => {
    setForm((current) => {
      if (!current) return current;
      const options = current.options.map((group, gi) => {
        if (gi !== groupIndex) return group;
        const values = group.values.map((value, vi) =>
          vi === valueIndex ? { ...value, ...next } : value,
        );
        return { ...group, values };
      });
      return { ...current, options };
    });
  };

  const handleImageUpload = async (file: File) => {
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const response = await fetch("/api/admin/products/image/upload", {
        method: "POST",
        body: fd,
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "No se pudo subir la imagen.");
      }
      setForm((current) => (current ? { ...current, imagePath: data.url! } : current));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">Catalogo</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Productos de la tienda</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Crea y edita los productos que ven los clientes: precio por paquete u opciones, foto, acabados y visibilidad.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setForm(emptyForm(nextSortOrder))}
          className="w-fit cursor-pointer rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
        >
          Nuevo producto
        </button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <p className="text-base font-semibold text-slate-900">Aun no hay productos en la base de datos.</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Crea el primero, o corre <code className="rounded bg-white px-1.5 py-0.5">supabase/setup.sql</code> para sembrar los 8 productos iniciales.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex gap-3 rounded-[1.35rem] border border-slate-200 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.035)]"
            >
              <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${product.tint}`}>
                {product.imagePath ? (
                  <Image
                    src={product.imagePath}
                    alt={product.imageAlt || product.title}
                    width={160}
                    height={160}
                    className="h-auto max-h-[82%] w-auto max-w-[82%] object-contain"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-black text-slate-950">{product.title}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${
                      product.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {product.isActive ? "Visible" : "Oculto"}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">{product.category || "Sin categoria"}</p>
                <p className="mt-1 text-sm font-black text-slate-950">
                  Desde {formatPrice(productFromPrice(product))}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setForm(recordToForm(product))}
                    className="cursor-pointer rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800"
                  >
                    Editar
                  </button>
                  <form action={toggleAction}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="isActive" value={product.isActive ? "false" : "true"} />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      {product.isActive ? "Ocultar" : "Mostrar"}
                    </button>
                  </form>
                  <form action={deleteAction}>
                    <input type="hidden" name="productId" value={product.id} />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {form ? (
        <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
          <form
            action={isEditing ? updateAction : createAction}
            className="w-full max-w-3xl space-y-5 rounded-[1.6rem] bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.28)] sm:p-7"
          >
            <input type="hidden" name="payload" value={JSON.stringify(buildPayload(form))} />
            {isEditing ? <input type="hidden" name="productId" value={form.id} /> : null}

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {isEditing ? "Editar producto" : "Nuevo producto"}
                </p>
                <h3 className="mt-1 text-2xl font-black text-slate-950">
                  {form.title.trim() || "Producto sin nombre"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                aria-label="Cerrar"
              >
                x
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Nombre</span>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Tarjetas premium"
                />
              </label>
              <label className="block">
                <span className={labelClass}>Categoria</span>
                <input
                  className={inputClass}
                  list="product-categories"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Tarjetas de presentacion"
                />
                <datalist id="product-categories">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </label>
            </div>

            <label className="block">
              <span className={labelClass}>Descripcion</span>
              <textarea
                className={`${inputClass} resize-none`}
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Tarjetas de presentacion con acabado profesional..."
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Tiempo de entrega</span>
                <input
                  className={inputClass}
                  value={form.turnaround}
                  onChange={(e) => setForm({ ...form, turnaround: e.target.value })}
                  placeholder="24 a 48 horas"
                />
              </label>
              <label className="block">
                <span className={labelClass}>Orden (menor = primero)</span>
                <input
                  className={inputClass}
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </label>
            </div>

            <label className="block">
              <span className={labelClass}>Existencias (stock)</span>
              <input
                className={inputClass}
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="Déjalo vacío = bajo pedido (sin límite)"
              />
              <span className="mt-1 block text-xs text-slate-400">
                Vacío = se produce bajo pedido. Si pones un número, al llegar a 0 sale &quot;Agotado&quot; y se bloquea el pedido.
              </span>
            </label>

            <label className="block">
              <span className={labelClass}>Destacados (uno por linea)</span>
              <textarea
                className={`${inputClass} resize-none`}
                rows={3}
                value={form.highlights}
                onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                placeholder={"Papel grueso\nAcabado mate o brillante\nDiseno listo para imprimir"}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-[7rem_1fr]">
              <div>
                <span className={labelClass}>Foto</span>
                <div className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${form.tint}`}>
                  {form.imagePath ? (
                    <Image
                      src={form.imagePath}
                      alt={form.imageAlt || form.title}
                      width={160}
                      height={160}
                      className="h-auto max-h-[82%] w-auto max-w-[82%] object-contain"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500">Sin foto</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block">
                  <span className={labelClass}>Subir imagen (max 5 MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-xs text-slate-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleImageUpload(file);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
                {uploading ? <p className="text-xs font-semibold text-slate-500">Subiendo imagen...</p> : null}
                {uploadError ? <p className="text-xs font-semibold text-rose-600">{uploadError}</p> : null}
                <input
                  className={inputClass}
                  value={form.imagePath}
                  onChange={(e) => setForm({ ...form, imagePath: e.target.value })}
                  placeholder="/ruta-o-url-de-la-imagen.webp"
                />
                <input
                  className={inputClass}
                  value={form.imageAlt}
                  onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
                  placeholder="Texto alternativo de la imagen"
                />
                <label className="block">
                  <span className={labelClass}>Fondo (degradado)</span>
                  <select
                    className={inputClass}
                    value={form.tint}
                    onChange={(e) => setForm({ ...form, tint: e.target.value })}
                  >
                    {(TINT_PRESETS.includes(form.tint) ? TINT_PRESETS : [form.tint, ...TINT_PRESETS]).map(
                      (tint) => (
                        <option key={tint} value={tint}>
                          {tint}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-950">Precio y opciones</p>
                  <p className="mt-0.5 text-xs text-slate-500">Desde {previewFrom}</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  Modo de precio
                  <select
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                    value={form.pricingMode}
                    onChange={(e) =>
                      setForm({ ...form, pricingMode: e.target.value === "unit" ? "unit" : "package" })
                    }
                  >
                    <option value="package">Por paquete</option>
                    <option value="unit">Por unidad</option>
                  </select>
                </label>
              </div>

              {form.pricingMode === "unit" ? (
                <label className="mt-3 block">
                  <span className={labelClass}>Precio por unidad ($)</span>
                  <input
                    className={inputClass}
                    type="number"
                    step="0.01"
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                  />
                </label>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  En modo paquete, el grupo marcado como <strong>Paquete</strong> fija el precio (ej. Cantidad). Los grupos <strong>Recargo</strong> suman su monto.
                </p>
              )}

              <label className="mt-3 block">
                <span className={labelClass}>Costo de diseño ($) — si el cliente pide que la imprenta lo diseñe</span>
                <input
                  className={inputClass}
                  type="number"
                  step="0.01"
                  value={form.designFee}
                  onChange={(e) => setForm({ ...form, designFee: e.target.value })}
                />
                <span className="mt-1 block text-xs text-slate-400">
                  No aplica a Tarjetas de presentacion (tienen su propio editor).
                </span>
              </label>

              <div className="mt-4 space-y-3">
                {form.options.map((group, groupIndex) => (
                  <div key={groupIndex} className="rounded-[1rem] border border-slate-200 bg-white p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        className="flex-1 rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-semibold outline-none focus:border-slate-400"
                        value={group.name}
                        onChange={(e) => updateOption(groupIndex, { name: e.target.value })}
                        placeholder="Nombre del grupo (ej. Cantidad)"
                      />
                      <select
                        className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold"
                        value={group.role}
                        onChange={(e) =>
                          updateOption(groupIndex, { role: e.target.value as ProductOptionRole })
                        }
                      >
                        <option value="package">Paquete (fija precio)</option>
                        <option value="surcharge">Recargo (suma)</option>
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            options: form.options.filter((_, i) => i !== groupIndex),
                          })
                        }
                        className="cursor-pointer rounded-lg px-2 py-1 text-xs font-bold text-rose-500 transition hover:bg-rose-50"
                      >
                        Quitar grupo
                      </button>
                    </div>

                    <div className="mt-2 space-y-2">
                      {group.values.map((value, valueIndex) => (
                        <div key={valueIndex} className="flex items-center gap-2">
                          <input
                            className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-slate-400"
                            value={value.label}
                            onChange={(e) => updateValue(groupIndex, valueIndex, { label: e.target.value })}
                            placeholder="Opcion (ej. 500 unidades)"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-slate-400">
                              {group.role === "package" ? "$" : "+$"}
                            </span>
                            <input
                              className="w-24 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-slate-400"
                              type="number"
                              step="0.01"
                              value={value.amount}
                              onChange={(e) =>
                                updateValue(groupIndex, valueIndex, {
                                  amount: Number(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              updateOption(groupIndex, {
                                values: group.values.filter((_, i) => i !== valueIndex),
                              })
                            }
                            className="cursor-pointer rounded-lg px-2 py-1 text-xs font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Quitar opcion"
                          >
                            x
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          updateOption(groupIndex, {
                            values: [...group.values, { label: "", amount: 0 }],
                          })
                        }
                        className="cursor-pointer rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:border-slate-400 hover:bg-slate-50"
                      >
                        + Opcion
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        options: [
                          ...form.options,
                          { name: "", role: "package", values: [{ label: "", amount: 0 }] },
                        ],
                      })
                    }
                    className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-white"
                  >
                    + Grupo paquete
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        options: [
                          ...form.options,
                          { name: "", role: "surcharge", values: [{ label: "", amount: 0 }] },
                        ],
                      })
                    }
                    className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-white"
                  >
                    + Grupo recargo
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.requiresQuote}
                onChange={(e) => setForm({ ...form, requiresQuote: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
              />
              <span>
                A cotización
                <span className="mt-0.5 block text-xs font-normal text-slate-400">
                  No muestra precio cerrado: el cliente envía &quot;Solicitar cotización&quot; y tú le pones el precio en el pedido.
                </span>
              </span>
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              Visible en la tienda
            </label>

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="cursor-pointer rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="cursor-pointer rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
              >
                {isEditing ? "Guardar cambios" : "Crear producto"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
