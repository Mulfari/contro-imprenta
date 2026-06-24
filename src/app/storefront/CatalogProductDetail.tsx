"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  CaretRight,
  CheckCircle,
  Clock,
  Heart,
  Package,
  PenNib,
  Plus,
  Trash,
  UploadSimple,
  WhatsappLogo,
} from "@phosphor-icons/react";

import type { StorefrontProduct } from "../storefront-data";
import { computeUnitPrice, formatPrice } from "@/lib/pricing";
import { buildWhatsappLink, whatsappProductMessage } from "@/lib/whatsapp";

const grotesk = { fontFamily: "var(--font-space-grotesk), sans-serif" };

interface CatalogProductDetailProps {
  product: StorefrontProduct;
  selectedOptions: Record<string, string>;
  onBack: () => void;
  onOptionChange: (group: string, value: string) => void;
  onAddToCart: (quantity: number, files: File[]) => void;
  onRequestQuote: () => void;
  wished: boolean;
  onToggleWishlist: () => void;
}

// Ficha de producto (export "Producto detalle"): galería + opciones (estilo
// botón) + "Tu diseño" (subo mi arte / lo diseñan + subir arte) + CTA. Sin
// editor de tarjetas (decisión de Jose). Conserva el contrato con
// StorefrontShell (opciones, cantidad, archivos, añadir/cotizar, deseados).
export function CatalogProductDetail({
  product,
  selectedOptions,
  onBack,
  onOptionChange,
  onAddToCart,
  onRequestQuote,
  wished,
  onToggleWishlist,
}: CatalogProductDetailProps) {
  const [draftQuantity, setDraftQuantity] = useState(1);
  const [draftFiles, setDraftFiles] = useState<File[]>([]);

  const unitPrice = computeUnitPrice(product, selectedOptions);
  const estimatedTotal = unitPrice * draftQuantity;
  const agotado = product.stock !== null && product.stock <= 0;

  const packageGroup = product.options.find((g) => g.role === "package");
  const designGroup = product.options.find((g) => g.name === "Diseño");
  const otherOptions = product.options.filter((g) => g !== packageGroup && g !== designGroup);
  const designChoice = designGroup ? selectedOptions["Diseño"] ?? designGroup.values[0]?.label ?? "" : "";
  const wantsUpload = !designGroup || /arte|subo|propio|mi dise/i.test(designChoice);

  const optButton = (active: boolean) =>
    `cursor-pointer rounded-[10px] border px-[15px] py-2.5 text-[13.5px] font-medium transition ${
      active
        ? "border-[#1b1b20] bg-[#fbfaf7] text-[#1b1b20] shadow-[inset_0_0_0_1px_#1b1b20]"
        : "border-[#e0dbcf] bg-white text-[#5d5a52] hover:border-[#c9c3b6] hover:text-[#1b1b20]"
    }`;

  const selectionParts = [
    ...otherOptions.map((g) => selectedOptions[g.name]).filter(Boolean),
    packageGroup ? selectedOptions[packageGroup.name] : null,
  ].filter(Boolean);

  return (
    <div className="catalog-enter-panel">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-[13px] text-[#9a968c]">
        <button type="button" onClick={onBack} className="inline-flex cursor-pointer items-center gap-1.5 transition hover:text-[#1b1b20]">
          <ArrowLeft size={14} weight="bold" /> Catálogo
        </button>
        <CaretRight size={11} weight="bold" />
        <span className="text-[#a8841f]">{product.category}</span>
        <CaretRight size={11} weight="bold" />
        <span className="font-medium text-[#1b1b20]">{product.title}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-start">
        {/* Galería */}
        <div className="lg:sticky lg:top-6">
          <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[18px] border border-[#ececec] bg-gradient-to-br ${product.tint} p-8`}>
            <Image
              src={product.image}
              alt={product.imageAlt}
              width={1200}
              height={900}
              sizes="(min-width: 1024px) 45vw, 92vw"
              className={`h-auto max-h-[78%] w-auto max-w-[78%] object-contain drop-shadow-[0_24px_40px_rgba(15,23,42,0.18)] ${agotado ? "opacity-70 grayscale" : ""}`}
            />
            <button
              type="button"
              onClick={onToggleWishlist}
              aria-label={wished ? "Quitar de deseados" : "Guardar en deseados"}
              className={`absolute right-4 top-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full backdrop-blur transition ${
                wished ? "bg-[#ff5b4d] text-white" : "bg-white/90 text-[#8a857a] hover:text-[#ff5b4d]"
              }`}
            >
              <Heart size={18} weight={wished ? "fill" : "regular"} />
            </button>
            {agotado ? (
              <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-[#1b1b20]/85 px-3 py-1 text-[11.5px] font-semibold text-white">
                Agotado
              </span>
            ) : null}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[#a8841f]">{product.category}</div>
          <h1 style={grotesk} className="mt-1.5 text-[1.9rem] font-semibold leading-[1.1] tracking-[-0.025em] text-[#1b1b20]">
            {product.title}
          </h1>
          <p className="mt-3.5 max-w-[460px] text-[15px] leading-[1.6] text-[#6e6b62]">{product.description}</p>

          <div className="mt-5 flex items-baseline gap-2.5">
            <span style={grotesk} className="text-[22px] font-semibold text-[#1b1b20]">
              {product.requiresQuote ? "A cotización" : formatPrice(estimatedTotal)}
            </span>
            <span className="text-[13px] text-[#9a968c]">
              {product.requiresQuote ? "según cantidad y acabado" : draftQuantity > 1 ? `${formatPrice(unitPrice)} c/u` : "precio estimado"}
            </span>
          </div>

          {/* Opciones */}
          {otherOptions.map((group) => (
            <div key={group.name} className="mt-6">
              <div className="mb-2.5 text-[12.5px] font-semibold text-[#1b1b20]">{group.name}</div>
              <div className="flex flex-wrap gap-2">
                {group.values.map((value) => {
                  const active = selectedOptions[group.name] === value.label;
                  return (
                    <button key={value.label} type="button" onClick={() => onOptionChange(group.name, value.label)} className={optButton(active)}>
                      {value.label}
                      {value.amount > 0 ? <span className="text-[#9a968c]"> +${value.amount}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Cantidad / paquete */}
          {packageGroup ? (
            <div className="mt-6">
              <div className="mb-2.5 text-[12.5px] font-semibold text-[#1b1b20]">{packageGroup.name}</div>
              <div className="flex flex-wrap gap-2">
                {packageGroup.values.map((value) => {
                  const active = selectedOptions[packageGroup.name] === value.label;
                  return (
                    <button key={value.label} type="button" onClick={() => onOptionChange(packageGroup.name, value.label)} className={optButton(active)}>
                      {value.label} <span className="text-[#9a968c]">· ${value.amount}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <div className="mb-2.5 text-[12.5px] font-semibold text-[#1b1b20]">Cantidad</div>
              <div className="inline-flex items-center overflow-hidden rounded-[10px] border border-[#e0dbcf]">
                <button type="button" onClick={() => setDraftQuantity((c) => Math.max(1, c - 1))} aria-label="Menos" className="flex h-10 w-10 cursor-pointer items-center justify-center text-[#3a3a42] transition hover:bg-[#f4f1ea]">
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={draftQuantity}
                  onChange={(e) => setDraftQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="h-10 w-14 bg-transparent text-center text-[14px] font-semibold text-[#1b1b20] outline-none"
                  aria-label="Cantidad"
                />
                <button type="button" onClick={() => setDraftQuantity((c) => c + 1)} aria-label="Más" className="flex h-10 w-10 cursor-pointer items-center justify-center text-[#3a3a42] transition hover:bg-[#f4f1ea]">
                  +
                </button>
              </div>
            </div>
          )}

          {/* Tu diseño */}
          <div className="mt-7 border-t border-[#ece8df] pt-5">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="text-[12.5px] font-semibold text-[#1b1b20]">Tu diseño</span>
              <span className="text-[12px] text-[#9a968c]">¿cómo lo hacemos?</span>
            </div>
            {designGroup ? (
              <div className="flex flex-wrap gap-2">
                {designGroup.values.map((value) => {
                  const active = selectedOptions[designGroup.name] === value.label || (!selectedOptions[designGroup.name] && value.label === designChoice);
                  const icon = /dise[ñn]a/i.test(value.label) ? <PenNib size={15} weight="bold" /> : <UploadSimple size={15} weight="bold" />;
                  return (
                    <button key={value.label} type="button" onClick={() => onOptionChange(designGroup.name, value.label)} className={`${optButton(active)} inline-flex items-center gap-1.5`}>
                      {icon}
                      {value.label}
                      {value.amount > 0 ? <span className="text-[#9a968c]"> +${value.amount}</span> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {wantsUpload ? (
              draftFiles.length > 0 ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-[13px] border border-[#1f8a5b]/25 bg-[#1f8a5b]/[0.07] px-4 py-3">
                  <div className="flex items-center gap-2.5 text-[13px] text-[#1b1b20]">
                    <CheckCircle size={18} weight="fill" className="text-[#1f8a5b]" />
                    <span className="truncate">{draftFiles.map((f) => f.name).join(", ")}</span>
                  </div>
                  <button type="button" onClick={() => setDraftFiles([])} aria-label="Quitar arte" className="flex shrink-0 cursor-pointer text-[#a7a49b] transition hover:text-[#c0392b]">
                    <Trash size={15} weight="bold" />
                  </button>
                </div>
              ) : (
                <label className="mt-3 flex cursor-pointer flex-col items-center gap-1.5 rounded-[13px] border-[1.5px] border-dashed border-[#cfc8ba] bg-white px-4 py-5 text-center transition hover:border-[#3558ff]">
                  <UploadSimple size={26} className="text-[#3558ff]" />
                  <span className="text-[13.5px] font-semibold text-[#1b1b20]">Arrastra tu archivo o haz clic para subir</span>
                  <span className="text-[12px] text-[#9a968c]">PDF, JPG, PNG o AI · opcional, puedes enviarlo después</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.ai,.psd"
                    className="sr-only"
                    onChange={(e) => {
                      setDraftFiles(Array.from(e.target.files ?? []));
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
              )
            ) : (
              <div className="mt-3 flex items-start gap-2.5 rounded-[13px] border border-[#3558ff]/20 bg-[#3558ff]/[0.06] px-4 py-3.5 text-[13px] leading-relaxed text-[#3d3a34]">
                <PenNib size={18} weight="bold" className="mt-px shrink-0 text-[#3558ff]" />
                Nuestro equipo lo diseña por ti. Cuéntanos tu idea al cotizar y te pasamos una propuesta.
              </div>
            )}
          </div>

          {/* Selección actual */}
          {selectionParts.length ? (
            <div className="mt-5 flex items-center gap-2 text-[13.5px] text-[#5d5a52]">
              <CheckCircle size={16} weight="fill" className="text-[#1f8a5b]" />
              <span>{product.title} · {selectionParts.join(" · ")}</span>
            </div>
          ) : null}

          {/* CTA */}
          <div className="mt-6">
            {agotado ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-5 text-center">
                <p style={grotesk} className="text-[20px] font-semibold text-rose-700">Agotado</p>
                <p className="mt-1.5 text-[13.5px] leading-6 text-rose-600">Escríbenos por WhatsApp y te avisamos cuando vuelva.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 sm:flex-row">
                {product.requiresQuote ? (
                  <button
                    type="button"
                    onClick={onRequestQuote}
                    className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#25d366] text-[15px] font-semibold text-[#06310f] shadow-[0_8px_22px_rgba(37,211,102,0.26)] transition hover:opacity-90"
                  >
                    <WhatsappLogo size={20} weight="fill" /> Solicitar cotización
                  </button>
                ) : (
                  <a
                    href={buildWhatsappLink(whatsappProductMessage(product, selectedOptions, draftQuantity))}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#25d366] text-[15px] font-semibold text-[#06310f] shadow-[0_8px_22px_rgba(37,211,102,0.26)] transition hover:opacity-90"
                  >
                    <WhatsappLogo size={20} weight="fill" /> Pedir por WhatsApp
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => onAddToCart(draftQuantity, draftFiles)}
                  className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e0dbcf] bg-white text-[15px] font-semibold text-[#1b1b20] transition hover:border-[#c9c3b6] hover:bg-[#fbfaf7]"
                >
                  <Plus size={16} weight="bold" /> Añadir a mi pedido
                </button>
              </div>
            )}
          </div>

          {/* Detalles */}
          <div className="mt-7 flex flex-col gap-3 border-t border-[#ece8df] pt-5">
            {product.highlights.slice(0, 3).map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-[13.5px] text-[#5d5a52]">
                <Package size={18} className="shrink-0 text-[#8a857a]" /> {item}
              </div>
            ))}
            <div className="flex items-center gap-2.5 text-[13.5px] text-[#5d5a52]">
              <Clock size={18} className="shrink-0 text-[#8a857a]" /> Entrega estimada: {product.turnaround}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
