"use client";

import Image from "next/image";
import type { StorefrontProduct } from "../../storefront-data";

interface ProductPreviewModalProps {
  product: StorefrontProduct;
  selectedOptions: Record<string, string>;
  onClose: () => void;
  onOptionChange: (group: string, value: string) => void;
  onAddToCart: () => void;
  wished: boolean;
  onToggleWishlist: () => void;
}

export function ProductPreviewModal({
  product,
  selectedOptions,
  onClose,
  onOptionChange,
  onAddToCart,
  wished,
  onToggleWishlist,
}: ProductPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/45 px-4 py-5 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex h-full w-full max-w-[76rem] items-center">
        <article className="grid max-h-full w-full overflow-hidden rounded-[1.6rem] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] lg:grid-cols-[0.98fr_1.02fr]">
          <div className={`relative flex min-h-[20rem] items-center justify-center overflow-hidden bg-gradient-to-br ${product.tint} p-6 sm:min-h-[26rem]`}>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute left-4 top-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/88 text-slate-700 shadow-sm transition hover:bg-white hover:text-slate-950 lg:hidden"
            >
              x
            </button>
            <div className="absolute inset-x-14 bottom-10 h-12 rounded-full bg-slate-900/12 blur-2xl" />
            <Image
              src={product.image}
              alt={product.imageAlt}
              width={1200}
              height={900}
              sizes="(min-width: 1024px) 38vw, 88vw"
              className="relative z-10 h-auto max-h-[80%] w-auto max-w-[88%] object-contain drop-shadow-[0_28px_42px_rgba(15,23,42,0.2)]"
            />
          </div>

          <div className="overflow-y-auto p-5 sm:p-7 lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3558ff]">{product.category}</p>
                <h2 className="mt-2 text-[1.9rem] font-black leading-tight tracking-tight text-slate-950 sm:text-[2.4rem]">{product.title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="hidden h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 lg:flex"
              >
                x
              </button>
            </div>

            <p className="mt-4 text-base leading-7 text-slate-600">{product.description}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {product.highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-5">
              {product.options.map((group) => (
                <div key={group.name}>
                  <p className="text-sm font-semibold text-slate-950">{group.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.values.map((value) => {
                      const selected = selectedOptions[group.name] === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => onOptionChange(group.name, value)}
                          className={`cursor-pointer rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                            selected ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Precio base</p>
                  <p className="text-3xl font-black text-slate-950">{product.price}</p>
                </div>
                <p className="text-right text-sm font-medium text-slate-500">
                  Entrega estimada<br />
                  <span className="font-semibold text-slate-950">{product.turnaround}</span>
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <button
                  type="button"
                  onClick={onAddToCart}
                  className="cursor-pointer rounded-xl bg-[#ffd45f] px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-[#ffcd41]"
                >
                  Anadir al carrito
                </button>
                <button
                  type="button"
                  onClick={onToggleWishlist}
                  className={`cursor-pointer rounded-xl border px-5 py-3.5 text-sm font-semibold transition ${
                    wished ? "border-[#ff5b4d] bg-[#ff5b4d] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {wished ? "En deseados" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}