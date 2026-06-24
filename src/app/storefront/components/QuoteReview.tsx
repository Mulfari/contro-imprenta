"use client";

import Image from "next/image";
import {
  ArrowLeft,
  Info,
  Minus,
  Plus,
  Receipt,
  Trash,
  WhatsappLogo,
} from "@phosphor-icons/react";

import type { StorefrontProduct } from "../../storefront-data";
import { computeUnitPrice, formatPrice } from "@/lib/pricing";
import { buildWhatsappLink, whatsappCartMessage } from "@/lib/whatsapp";

const grotesk = { fontFamily: "var(--font-space-grotesk), sans-serif" };

type QuoteItem = {
  key: string;
  product: StorefrontProduct;
  quantity: number;
  options: Record<string, string>;
  artFileNames?: string[];
};

interface QuoteReviewProps {
  items: QuoteItem[];
  name: string;
  phone: string;
  note: string;
  onName: (value: string) => void;
  onPhone: (value: string) => void;
  onNote: (value: string) => void;
  onQuantityChange: (key: string, quantity: number) => void;
  onRemoveItem: (key: string) => void;
  onBack: () => void;
  onBrowseCatalog: () => void;
}

// Resumen de cotización (export "Solicitar cotización · resumen"): el cliente
// revisa sus ítems, deja sus datos y al enviar se arma un mensaje de WhatsApp
// con todo. Se llega desde el carrito ("Pedir por WhatsApp").
export function QuoteReview({
  items,
  name,
  phone,
  note,
  onName,
  onPhone,
  onNote,
  onQuantityChange,
  onRemoveItem,
  onBack,
  onBrowseCatalog,
}: QuoteReviewProps) {
  const count = items.length;
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const fixedSubtotal = items
    .filter((item) => !item.product.requiresQuote)
    .reduce((sum, item) => sum + computeUnitPrice(item.product, item.options) * item.quantity, 0);
  const quoteCount = items.filter((item) => item.product.requiresQuote).length;
  const totalLabel = fixedSubtotal > 0 ? formatPrice(fixedSubtotal) : "A cotización";

  const datosLines: string[] = [];
  if (name.trim()) datosLines.push(`Nombre: ${name.trim()}`);
  if (phone.trim()) datosLines.push(`WhatsApp: ${phone.trim()}`);
  if (note.trim()) datosLines.push(`Nota: ${note.trim()}`);
  const message = datosLines.length
    ? `${whatsappCartMessage(items)}\n\n${datosLines.join("\n")}`
    : whatsappCartMessage(items);
  const waLink = buildWhatsappLink(message);

  if (count === 0) {
    return (
      <section className="mx-auto w-full max-w-[112rem] px-4 py-10 sm:px-6 lg:px-8 2xl:px-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#5d5a52] transition hover:text-[#1b1b20]"
        >
          <ArrowLeft size={16} weight="bold" /> Volver
        </button>
        <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-[#ece8df] bg-white px-8 py-14 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-[#e6e3da] text-[#b8b3a7]">
            <Receipt size={26} />
          </div>
          <div style={grotesk} className="mt-4 text-[19px] font-semibold text-[#1b1b20]">
            Aún no agregas productos
          </div>
          <p className="mt-1.5 max-w-[300px] text-sm leading-relaxed text-[#75726a]">
            Explora el catálogo y añade lo que quieras cotizar; aquí armarás tu pedido.
          </p>
          <button
            type="button"
            onClick={onBrowseCatalog}
            className="mt-5 cursor-pointer rounded-xl bg-[#3558ff] px-[22px] py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(53,88,255,0.26)] transition hover:bg-[#2647e8]"
          >
            Ir al catálogo
          </button>
        </div>
      </section>
    );
  }

  const sendButton = (
    <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#25d366] text-[15.5px] font-semibold text-[#06310f] shadow-[0_8px_22px_rgba(37,211,102,0.26)] transition hover:opacity-90">
      <WhatsappLogo size={20} weight="fill" /> Enviar por WhatsApp
    </a>
  );

  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 py-8 sm:px-6 lg:px-8 2xl:px-10">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#5d5a52] transition hover:text-[#1b1b20]"
      >
        <ArrowLeft size={16} weight="bold" /> Volver
      </button>

      {/* Pasos */}
      <div className="mb-7 flex items-center gap-2.5">
        <Step n={1} label="Productos" done />
        <span className="h-px w-5 bg-[#d8d3c8]" />
        <Step n={2} label="Cotización" active />
        <span className="h-px w-5 bg-[#d8d3c8]" />
        <Step n={3} label="Enviar" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_372px] lg:items-start">
        {/* Izquierda: ítems + datos */}
        <div>
          <h2 style={grotesk} className="mb-4 text-[21px] font-semibold tracking-[-0.02em] text-[#1b1b20]">
            Tu cotización <span className="font-medium text-[#9a968c]">· {count} {count === 1 ? "producto" : "productos"}</span>
          </h2>

          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const lineQuote = item.product.requiresQuote;
              const optionTags = Object.values(item.options).filter(Boolean);
              return (
                <div key={item.key} className="flex gap-4 rounded-2xl border border-[#ececec] bg-white p-3.5 shadow-[0_1px_2px_rgba(20,20,35,0.04)]">
                  <div className={`relative h-[84px] w-[96px] flex-none overflow-hidden rounded-xl bg-gradient-to-br ${item.product.tint}`}>
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <Image
                        src={item.product.image}
                        alt={item.product.imageAlt}
                        width={300}
                        height={240}
                        sizes="96px"
                        className="h-auto max-h-[88%] w-auto max-w-[88%] object-contain"
                      />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#a8841f]">{item.product.category}</div>
                        <div style={grotesk} className="mt-0.5 text-[16.5px] font-semibold tracking-[-0.015em] text-[#1b1b20]">{item.product.title}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.key)}
                        aria-label="Quitar"
                        className="flex cursor-pointer rounded-md p-1 text-[#a7a49b] transition hover:bg-[#faf0ee] hover:text-[#c0392b]"
                      >
                        <Trash size={16} weight="bold" />
                      </button>
                    </div>
                    {optionTags.length || item.artFileNames?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {optionTags.map((tag) => (
                          <span key={tag} className="rounded-md bg-[#f4f1ea] px-2 py-[3px] text-[11.5px] font-medium text-[#5d5a52]">{tag}</span>
                        ))}
                        {item.artFileNames?.length ? (
                          <span className="rounded-md bg-[#1f8a5b]/10 px-2 py-[3px] text-[11.5px] font-medium text-[#1f8a5b]">Arte cargado</span>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center overflow-hidden rounded-[10px] border border-[#e0dbcf]">
                        <button type="button" onClick={() => onQuantityChange(item.key, item.quantity - 1)} aria-label="Menos" className="flex h-8 w-8 cursor-pointer items-center justify-center bg-white text-[#3a3a42] transition hover:bg-[#f4f1ea]">
                          <Minus size={13} weight="bold" />
                        </button>
                        <span className="min-w-[42px] text-center text-[13.5px] font-semibold text-[#1b1b20]">{item.quantity}</span>
                        <button type="button" onClick={() => onQuantityChange(item.key, item.quantity + 1)} aria-label="Más" className="flex h-8 w-8 cursor-pointer items-center justify-center bg-white text-[#3a3a42] transition hover:bg-[#f4f1ea]">
                          <Plus size={13} weight="bold" />
                        </button>
                      </div>
                      <span className={`text-[13.5px] font-semibold ${lineQuote ? "text-[#a8841f]" : "text-[#1b1b20]"}`}>
                        {lineQuote ? "A cotización" : formatPrice(computeUnitPrice(item.product, item.options) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Datos */}
          <h3 style={grotesk} className="mb-3.5 mt-7 text-[17px] font-semibold tracking-[-0.015em] text-[#1b1b20]">Tus datos</h3>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Nombre">
              <input value={name} onChange={(e) => onName(e.target.value)} placeholder="Tu nombre o negocio" className="quote-input" />
            </Field>
            <Field label="WhatsApp">
              <input value={phone} onChange={(e) => onPhone(e.target.value)} placeholder="0424 000 0000" inputMode="tel" className="quote-input" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Nota (opcional)">
                <input value={note} onChange={(e) => onNote(e.target.value)} placeholder="Fecha de entrega, detalles, referencia…" className="quote-input" />
              </Field>
            </div>
          </div>
        </div>

        {/* Derecha: enviar */}
        <aside className="rounded-2xl border border-[#ececec] bg-white p-[22px] shadow-[0_1px_2px_rgba(20,20,35,0.04)] lg:sticky lg:top-6">
          <div style={grotesk} className="text-[17px] font-semibold tracking-[-0.015em] text-[#1b1b20]">Enviar cotización</div>
          <div className="my-4 flex flex-col gap-2.5 border-y border-[#f0ece3] py-4 text-[13.5px]">
            <Row label="Productos" value={String(count)} />
            <Row label="Unidades totales" value={totalUnits.toLocaleString("es")} />
            <Row label="Total" value={totalLabel} />
            {quoteCount > 0 && fixedSubtotal > 0 ? (
              <p className="text-[12px] text-[#a8841f]">+ {quoteCount} {quoteCount === 1 ? "ítem a cotizar" : "ítems a cotizar"}</p>
            ) : null}
          </div>
          {sendButton}
          <div className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-[#9a968c]">
            <Info size={15} className="mt-px shrink-0" />
            Te respondemos con el precio y tiempo de entrega. Lun a Vie 8–18h · Sáb 9–14h.
          </div>
          <div className="mt-[18px]">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#a7a49b]">Mensaje que se envía</div>
            <div className="whitespace-pre-wrap rounded-[11px] bg-[#f4f1ea] px-3.5 py-3 text-[12px] leading-relaxed text-[#3d3a34]">{message}</div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Step({ n, label, active, done }: { n: number; label: string; active?: boolean; done?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] ${active ? "font-semibold text-[#1b1b20]" : "text-[#9a968c]"}`}>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
          active || done ? "bg-[#1b1b20] text-white" : "bg-[#e6e3da] text-[#75726a]"
        }`}
      >
        {n}
      </span>
      {label}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-[#1b1b20]">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[#5d5a52]">
      <span>{label}</span>
      <span className="font-semibold text-[#1b1b20]">{value}</span>
    </div>
  );
}
