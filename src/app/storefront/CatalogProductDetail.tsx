"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { StorefrontProduct } from "../storefront-data";
import { computeUnitPrice, formatPrice } from "@/lib/pricing";
import { CardMockup } from "./card-editor/CardMockup";
import { COLOR_SCHEMES, DESIGN_LABELS } from "./card-editor/colorSchemes";
import type { CardDesign, CardFields } from "./card-editor/types";
import { CatalogArtPreview } from "./components/CatalogArtPreview";

interface CatalogProductDetailProps {
  product: StorefrontProduct;
  selectedOptions: Record<string, string>;
  onBack: () => void;
  onOptionChange: (group: string, value: string) => void;
  onAddToCart: (quantity: number, files: File[]) => void;
  wished: boolean;
  onToggleWishlist: () => void;
}

function formatCatalogFileSize(value: number) {
  if (value < 1024 * 1024) {
    return `${Math.max(1, Math.round(value / 1024))} KB`;
  }
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export function CatalogProductDetail({
  product,
  selectedOptions,
  onBack,
  onOptionChange,
  onAddToCart,
  wished,
  onToggleWishlist,
}: CatalogProductDetailProps) {
  const [draftQuantity, setDraftQuantity] = useState(1);
  const [draftFiles, setDraftFiles] = useState<File[]>([]);
  const [activeDesign, setActiveDesign] = useState<CardDesign>("minimal");
  const [activeColor, setActiveColor] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [cardFields, setCardFields] = useState<CardFields>({ name: "", title: "", company: "", phone: "", email: "" });
  const [designMode, setDesignMode] = useState<"choose" | "upload" | "create">("choose");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const frontPreviewUrl = useMemo(() => {
    return frontFile && frontFile.type.startsWith("image/") ? URL.createObjectURL(frontFile) : null;
  }, [frontFile]);

  const backPreviewUrl = useMemo(() => {
    return backFile && backFile.type.startsWith("image/") ? URL.createObjectURL(backFile) : null;
  }, [backFile]);

  useEffect(() => {
    return () => {
      if (frontPreviewUrl) URL.revokeObjectURL(frontPreviewUrl);
    };
  }, [frontPreviewUrl]);

  useEffect(() => {
    return () => {
      if (backPreviewUrl) URL.revokeObjectURL(backPreviewUrl);
    };
  }, [backPreviewUrl]);

  const hasFiles = draftFiles.length > 0;
  const unitPrice = computeUnitPrice(product, selectedOptions);
  const estimatedTotal = unitPrice * draftQuantity;
  const currentFinish = selectedOptions["Acabado"] ?? "";
  const isCardProduct = product.id === "tarjetas-premium" || product.id === "tarjetas-corporativas";

  const packageGroup = product.options.find((g) => g.role === "package");
  const otherOptions = product.options.filter((g) => g !== packageGroup);

  return (
    <article className="mt-5">
      <div className="relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.07)]">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative border-b border-slate-100 lg:border-b-0 lg:border-r">
            <button
              type="button"
              onClick={onBack}
              className="absolute left-4 top-4 z-20 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-2 text-xs font-black text-slate-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-950"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Catalogo
            </button>

            <button
              type="button"
              onClick={onToggleWishlist}
              aria-label={wished ? "Quitar de deseados" : "Agregar a deseados"}
              className={`absolute right-4 top-4 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border shadow-sm backdrop-blur transition ${
                wished ? "border-[#ff5b4d]/20 bg-[#ff5b4d] text-white" : "border-slate-200/80 bg-white/90 text-slate-500 hover:bg-white hover:text-[#ff5b4d]"
              }`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-[1.1rem] w-[1.1rem]"
                fill={wished ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 20-1.2-1.1C5.8 14.4 3 11.8 3 8.5A4.5 4.5 0 0 1 7.5 4C9.3 4 11 4.9 12 6.3 13 4.9 14.7 4 16.5 4A4.5 4.5 0 0 1 21 8.5c0 3.3-2.8 5.9-7.8 10.4L12 20Z" />
              </svg>
            </button>

            {isCardProduct ? (
              <div
                className="relative flex flex-col items-center justify-center overflow-hidden px-6 pb-6 pt-16 sm:px-10 sm:pt-20"
                style={{ perspective: "1200px", background: "linear-gradient(180deg, #e8e6e3 0%, #d9d5d0 40%, #cec9c3 100%)" }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
                  }}
                />

                <div
                  className="relative w-full max-w-[26rem] cursor-pointer transition-all duration-700 ease-out"
                  style={{ transform: "rotateX(8deg) rotateY(-1deg)", transformStyle: "preserve-3d" }}
                  onClick={() => setFlipped(!flipped)}
                >
                  <div className="pointer-events-none absolute -bottom-3 left-[8%] right-[8%] h-8 rounded-[50%] bg-black/20 blur-xl" />
                  <div className="pointer-events-none absolute -bottom-1 left-[12%] right-[12%] h-4 rounded-[50%] bg-black/10 blur-md" />
                  <div
                    className="relative transition-transform duration-700"
                    style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                  >
                    <div
                      style={{
                        backfaceVisibility: "hidden",
                        filter: "drop-shadow(0 2px 1px rgba(0,0,0,0.1)) drop-shadow(0 8px 16px rgba(0,0,0,0.12)) drop-shadow(0 20px 40px rgba(0,0,0,0.08))",
                      }}
                    >
                      <CardMockup
                        design={activeDesign}
                        finish={currentFinish}
                        size="large"
                        artUrl={designMode === "upload" ? frontPreviewUrl : undefined}
                        fields={designMode === "create" ? cardFields : undefined}
                        colorScheme={COLOR_SCHEMES[activeDesign][activeColor]}
                        side="front"
                      />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        filter: "drop-shadow(0 2px 1px rgba(0,0,0,0.1)) drop-shadow(0 8px 16px rgba(0,0,0,0.12)) drop-shadow(0 20px 40px rgba(0,0,0,0.08))",
                      }}
                    >
                      <CardMockup
                        design={activeDesign}
                        finish={currentFinish}
                        size="large"
                        artUrl={designMode === "upload" ? backPreviewUrl : undefined}
                        fields={designMode === "create" ? cardFields : undefined}
                        colorScheme={COLOR_SCHEMES[activeDesign][activeColor]}
                        side="back"
                      />
                    </div>
                  </div>
                </div>

                {(designMode === "upload" && (frontPreviewUrl || backPreviewUrl)) || designMode === "create" ? (
                  <p className="mt-4 text-center text-[0.7rem] font-medium text-[#8a8480]/70">
                    {flipped ? "← Click para ver el frente" : "Click para ver el reverso →"}
                  </p>
                ) : null}

                {designMode === "create" && (
                  <>
                    <div className="relative mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                      {(["minimal", "bold", "elegant", "tech", "medical", "gastro"] as CardDesign[]).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setActiveDesign(d);
                            setActiveColor(0);
                            setFlipped(false);
                          }}
                          className={`group relative cursor-pointer overflow-hidden rounded-[0.35rem] transition-all duration-300 ${
                            activeDesign === d
                              ? "scale-110 ring-2 ring-[#3558ff] ring-offset-2 ring-offset-[#d9d5d0]"
                              : "opacity-60 hover:opacity-90 hover:scale-105"
                          }`}
                          style={{ filter: activeDesign === d ? "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" : "drop-shadow(0 2px 6px rgba(0,0,0,0.1))" }}
                        >
                          <div className="w-[4rem] sm:w-[5rem]">
                            <CardMockup design={d} finish={currentFinish} size="thumb" colorScheme={COLOR_SCHEMES[d][0]} />
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                      {COLOR_SCHEMES[activeDesign].map((cs, i) => (
                        <button
                          key={cs.id}
                          type="button"
                          onClick={() => setActiveColor(i)}
                          className={`flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold transition ${
                            activeColor === i ? "bg-white/90 text-slate-900 shadow-sm" : "text-[#8a8480] hover:text-slate-700"
                          }`}
                        >
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cs.primary }} />
                          {cs.name}
                        </button>
                      ))}
                    </div>

                    <p className="mt-2 text-center text-xs font-medium text-[#8a8480]">
                      {DESIGN_LABELS[activeDesign]}
                      {currentFinish ? ` · ${currentFinish}` : ""}
                    </p>
                  </>
                )}

                {designMode === "choose" && (
                  <p className="mt-6 text-center text-xs font-medium text-[#8a8480]">
                    Tarjeta de presentacion premium{currentFinish ? ` · ${currentFinish}` : ""}
                  </p>
                )}

                {designMode === "upload" && (frontPreviewUrl || backPreviewUrl) && (
                  <div className="mt-3 flex items-center gap-2 rounded-full bg-emerald-600/90 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Vista previa de tu arte{currentFinish ? ` · Acabado ${currentFinish.toLowerCase()}` : ""}
                  </div>
                )}
              </div>
            ) : (
              <div className={`relative flex min-h-[16rem] items-center justify-center overflow-hidden bg-gradient-to-br ${product.tint} p-8 pt-16 sm:min-h-[22rem] lg:min-h-[26rem]`}>
                <div className="absolute inset-x-12 bottom-10 h-12 rounded-full bg-slate-900/10 blur-2xl" />
                <Image
                  src={product.image}
                  alt={product.imageAlt}
                  width={1200}
                  height={900}
                  sizes="(min-width: 1024px) 60vw, 92vw"
                  className="relative z-10 h-auto max-h-[80%] w-auto max-w-[70%] object-contain drop-shadow-[0_28px_48px_rgba(15,23,42,0.2)] sm:max-w-[60%]"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#3558ff]/8 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#3558ff]">{product.category}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{product.turnaround}</span>
            </div>

            <h2 className="mt-3 text-[1.65rem] font-black leading-[1.15] tracking-tight text-slate-950 sm:text-[1.9rem]">{product.title}</h2>

            <p className="mt-2 text-[0.9rem] leading-7 text-slate-500">{product.description}</p>

            <ul className="mt-4 space-y-1.5">
              {product.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-5">
              {otherOptions.map((group) => {
                const finishDescriptions: Record<string, string> = {
                  Mate: "Textura suave sin reflejos, elegante y sobria",
                  Brillante: "Acabado espejo con brillo intenso, colores vibrantes",
                  "Soft touch": "Tacto aterciopelado premium, sensacion de lujo",
                };
                const isFinishGroup = group.name === "Acabado";

                return (
                  <div key={group.name}>
                    <p className="text-[0.82rem] font-black uppercase tracking-[0.12em] text-slate-950">{group.name}</p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {group.values.map((value) => {
                        const selected = selectedOptions[group.name] === value.label;
                        const hint = value.amount > 0 ? ` +$${value.amount}` : "";
                        return (
                          <button
                            key={value.label}
                            type="button"
                            onClick={() => onOptionChange(group.name, value.label)}
                            className={`cursor-pointer rounded-[0.85rem] border-2 px-4 py-2.5 text-sm font-semibold transition ${
                              selected
                                ? "border-[#3558ff] bg-[#3558ff]/5 text-[#3558ff] shadow-[0_0_0_1px_rgba(53,88,255,0.15)]"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                            }`}
                          >
                            {value.label}
                            {hint ? <span className={selected ? "text-[#3558ff]/70" : "text-slate-400"}>{hint}</span> : null}
                          </button>
                        );
                      })}
                    </div>
                    {isFinishGroup && selectedOptions[group.name] && finishDescriptions[selectedOptions[group.name]] && (
                      <p className="mt-2 text-xs text-slate-400 italic">{finishDescriptions[selectedOptions[group.name]]}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {packageGroup ? (
              <div className="mt-6">
                <p className="text-[0.82rem] font-black uppercase tracking-[0.12em] text-slate-950">{packageGroup.name}</p>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  {packageGroup.values.map((value) => {
                    const selected = selectedOptions[packageGroup.name] === value.label;
                    return (
                      <button
                        key={value.label}
                        type="button"
                        onClick={() => onOptionChange(packageGroup.name, value.label)}
                        className={`cursor-pointer rounded-[0.85rem] border-2 px-3 py-3 text-center transition ${
                          selected
                            ? "border-[#3558ff] bg-[#3558ff]/5 text-[#3558ff] shadow-[0_0_0_1px_rgba(53,88,255,0.15)]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span className="block text-sm font-black leading-tight">{value.label}</span>
                        <span className="block text-[0.78rem] font-bold text-slate-500">${value.amount}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-6 flex items-center gap-3">
                <p className="text-sm font-black text-slate-700">Cantidad</p>
                <div className="flex h-12 items-center overflow-hidden rounded-[0.85rem] border-2 border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setDraftQuantity((c) => Math.max(1, c - 1))}
                    className="flex h-full w-12 cursor-pointer items-center justify-center text-lg font-black text-slate-400 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    {"−"}
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={draftQuantity}
                    onChange={(e) => setDraftQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="h-full w-14 bg-transparent text-center text-[0.95rem] font-black text-slate-950 outline-none"
                    aria-label="Cantidad del producto"
                  />
                  <button
                    type="button"
                    onClick={() => setDraftQuantity((c) => c + 1)}
                    className="flex h-full w-12 cursor-pointer items-center justify-center text-lg font-black text-slate-400 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {isCardProduct && (
              <div className="mt-6">
                <p className="text-[0.82rem] font-black uppercase tracking-[0.12em] text-slate-950">Tu diseño</p>

                {designMode === "choose" ? (
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDesignMode("upload")}
                      className="flex cursor-pointer flex-col items-center gap-2 rounded-[0.85rem] border-2 border-slate-200 bg-white p-4 text-center transition hover:border-[#3558ff] hover:bg-[#3558ff]/5"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
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
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </span>
                      <span className="text-sm font-bold text-slate-700">Ya tengo mi diseño</span>
                      <span className="text-[0.7rem] text-slate-400">Sube tu archivo listo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesignMode("create")}
                      className="flex cursor-pointer flex-col items-center gap-2 rounded-[0.85rem] border-2 border-slate-200 bg-white p-4 text-center transition hover:border-[#3558ff] hover:bg-[#3558ff]/5"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
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
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </span>
                      <span className="text-sm font-bold text-slate-700">Crear mi diseño</span>
                      <span className="text-[0.7rem] text-slate-400">Usa nuestras plantillas</span>
                    </button>
                  </div>
                ) : designMode === "upload" ? (
                  <div className="mt-2.5 space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <p className="mb-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Frente</p>
                        {frontFile ? (
                          <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5">
                            <CatalogArtPreview file={frontFile} />
                            <p className="max-w-full truncate text-[0.65rem] font-medium text-slate-600">{frontFile.name}</p>
                            <div className="flex gap-1.5">
                              <label className="cursor-pointer rounded-lg bg-white px-2 py-1 text-[0.65rem] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50">
                                Cambiar
                                <input
                                  type="file"
                                  accept="image/*,.pdf,.ai,.psd"
                                  className="sr-only"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) setFrontFile(f);
                                    e.currentTarget.value = "";
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => setFrontFile(null)}
                                className="cursor-pointer rounded-lg px-2 py-1 text-[0.65rem] font-bold text-slate-400 transition hover:text-slate-600"
                              >
                                Quitar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-4 text-center transition hover:border-[#3558ff] hover:bg-white">
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 24 24"
                              className="h-5 w-5 text-slate-300"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span className="text-[0.7rem] font-semibold text-slate-500">Subir frente</span>
                            <input
                              type="file"
                              accept="image/*,.pdf,.ai,.psd"
                              className="sr-only"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  setFrontFile(f);
                                  setDraftFiles([f]);
                                }
                                e.currentTarget.value = "";
                              }}
                            />
                          </label>
                        )}
                      </div>
                      <div>
                        <p className="mb-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Reverso</p>
                        {backFile ? (
                          <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5">
                            <CatalogArtPreview file={backFile} />
                            <p className="max-w-full truncate text-[0.65rem] font-medium text-slate-600">{backFile.name}</p>
                            <div className="flex gap-1.5">
                              <label className="cursor-pointer rounded-lg bg-white px-2 py-1 text-[0.65rem] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50">
                                Cambiar
                                <input
                                  type="file"
                                  accept="image/*,.pdf,.ai,.psd"
                                  className="sr-only"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) {
                                      setBackFile(f);
                                      setFlipped(true);
                                    }
                                    e.currentTarget.value = "";
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => setBackFile(null)}
                                className="cursor-pointer rounded-lg px-2 py-1 text-[0.65rem] font-bold text-slate-400 transition hover:text-slate-600"
                              >
                                Quitar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-4 text-center transition hover:border-[#3558ff] hover:bg-white">
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 24 24"
                              className="h-5 w-5 text-slate-300"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span className="text-[0.7rem] font-semibold text-slate-500">Subir reverso</span>
                            <span className="text-[0.6rem] text-slate-400">Opcional</span>
                            <input
                              type="file"
                              accept="image/*,.pdf,.ai,.psd"
                              className="sr-only"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  setBackFile(f);
                                  setFlipped(true);
                                }
                                e.currentTarget.value = "";
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDesignMode("choose");
                        setFrontFile(null);
                        setBackFile(null);
                        setDraftFiles([]);
                        setFlipped(false);
                      }}
                      className="cursor-pointer text-xs font-semibold text-slate-400 transition hover:text-slate-600"
                    >
                      ← Volver a opciones
                    </button>
                  </div>
                ) : (
                  <div className="mt-2.5 space-y-3">
                    <div className="space-y-2.5 rounded-[0.85rem] border border-slate-200 bg-slate-50/60 p-4">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Nombre</label>
                          <input
                            type="text"
                            placeholder="Maria Rodriguez"
                            value={cardFields.name}
                            onChange={(e) => setCardFields((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:border-[#3558ff] focus:outline-none focus:ring-1 focus:ring-[#3558ff]/30"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Cargo</label>
                          <input
                            type="text"
                            placeholder="Directora Creativa"
                            value={cardFields.title}
                            onChange={(e) => setCardFields((prev) => ({ ...prev, title: e.target.value }))}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:border-[#3558ff] focus:outline-none focus:ring-1 focus:ring-[#3558ff]/30"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Empresa</label>
                        <input
                          type="text"
                          placeholder="Mi Empresa"
                          value={cardFields.company}
                          onChange={(e) => setCardFields((prev) => ({ ...prev, company: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:border-[#3558ff] focus:outline-none focus:ring-1 focus:ring-[#3558ff]/30"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Telefono</label>
                          <input
                            type="text"
                            placeholder="+58 412 555 0123"
                            value={cardFields.phone}
                            onChange={(e) => setCardFields((prev) => ({ ...prev, phone: e.target.value }))}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:border-[#3558ff] focus:outline-none focus:ring-1 focus:ring-[#3558ff]/30"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Email</label>
                          <input
                            type="text"
                            placeholder="tu@email.com"
                            value={cardFields.email}
                            onChange={(e) => setCardFields((prev) => ({ ...prev, email: e.target.value }))}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:border-[#3558ff] focus:outline-none focus:ring-1 focus:ring-[#3558ff]/30"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDesignMode("choose")}
                      className="cursor-pointer text-xs font-semibold text-slate-400 transition hover:text-slate-600"
                    >
                      ← Volver a opciones
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isCardProduct && (
              <div className="mt-6">
                {hasFiles ? (
                  <div className="space-y-2">
                    <p className="text-sm font-black text-slate-700">Arte cargado</p>
                    {draftFiles.map((file) => (
                      <div key={`${file.name}-${file.lastModified}`} className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5">
                        <CatalogArtPreview file={file} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-950">{file.name}</p>
                          <p className="text-xs text-slate-400">{formatCatalogFileSize(file.size)}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-1">
                      <label className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-xs font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                        Cambiar
                        <input
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={(e) => {
                            setDraftFiles(Array.from(e.target.files ?? []));
                            e.currentTarget.value = "";
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setDraftFiles([])}
                        className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-400 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center gap-3 rounded-[0.85rem] border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-3.5 transition hover:border-slate-300 hover:bg-white">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-4.5 w-4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-600">Subir arte</p>
                      <p className="text-xs text-slate-400">Opcional — puedes enviarlo despues</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      className="sr-only"
                      onChange={(e) => {
                        setDraftFiles(Array.from(e.target.files ?? []));
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            )}

            <div className="mt-auto pt-6">
              {isCardProduct && designMode !== "choose" && (
                <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Resumen</p>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Diseño</span>
                      <span className="font-semibold text-slate-900">{designMode === "upload" ? "Arte propio" : DESIGN_LABELS[activeDesign]}</span>
                    </div>
                    {currentFinish && (
                      <div className="flex justify-between">
                        <span>Acabado</span>
                        <span className="font-semibold text-slate-900">{currentFinish}</span>
                      </div>
                    )}
                    {selectedOptions["Cantidad"] && (
                      <div className="flex justify-between">
                        <span>Cantidad</span>
                        <span className="font-semibold text-slate-900">{selectedOptions["Cantidad"]}</span>
                      </div>
                    )}
                    {designMode === "upload" && (
                      <div className="flex justify-between">
                        <span>Archivos</span>
                        <span className="font-semibold text-slate-900">
                          {frontFile ? "Frente ✓" : "Frente ✗"} · {backFile ? "Reverso ✓" : "Reverso ✗"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <p className="text-[2.2rem] font-black leading-none tracking-tight text-slate-950">{formatPrice(estimatedTotal)}</p>
                  {draftQuantity > 1 && <p className="text-sm font-semibold text-slate-400">{formatPrice(unitPrice)} c/u</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onAddToCart(draftQuantity, frontFile ? [frontFile, ...(backFile ? [backFile] : [])] : draftFiles)}
                className="mt-4 w-full cursor-pointer rounded-2xl bg-[#ffd45f] px-6 py-[1.15rem] text-[0.95rem] font-black text-slate-950 shadow-[0_14px_32px_rgba(255,212,95,0.4)] transition hover:bg-[#ffcd41] hover:shadow-[0_18px_40px_rgba(255,212,95,0.5)] active:scale-[0.98]"
              >
                Anadir al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}