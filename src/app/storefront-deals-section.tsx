"use client";

import Image from "next/image";

type DealImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
};

// Productos destacados de la home. Antes era "Ofertas del mes" con descuentos
// y precios inventados + un boletin que no enviaba nada; se reemplazo por un
// rail honesto de productos reales (los botones Ver/Añadir si funcionan).
const deals = [
  {
    productId: "tarjetas-premium",
    title: "Tarjetas ejecutivas",
    category: "Tarjetas",
    tint: "from-[#fff7d6] via-white to-[#fff2b3]",
    note: "Acabado mate o brillante, listas para tu marca.",
    image: {
      src: "/storefront-promo-cards-premium.webp",
      alt: "Tarjetas ejecutivas premium",
      width: 1000,
      height: 640,
      className: "w-[13.75rem] sm:w-[18.25rem] lg:w-[16.5rem]",
    },
  },
  {
    productId: "stickers-troquelados",
    title: "Stickers troquelados",
    category: "Etiquetas",
    tint: "from-[#dff3ff] via-white to-[#cae8ff]",
    note: "Cortes a medida, ideales para packaging.",
    image: {
      src: "/storefront-promo-stickers-labels-trimmed.webp",
      alt: "Stickers troquelados para packaging",
      width: 1024,
      height: 824,
      className: "w-[13.5rem] sm:w-[17.75rem] lg:w-[16.25rem]",
    },
  },
];

function DealArt({ tint, image }: { tint: string; image: DealImage }) {
  return (
    <div className={`relative flex h-[13.5rem] items-center justify-center overflow-hidden rounded-[1.3rem] bg-gradient-to-br ${tint} p-4 sm:h-[18.8rem] sm:rounded-[1.6rem]`}>
      <div className="absolute left-2 top-0 h-20 w-36 -rotate-[16deg] rounded-full bg-white/45 blur-xl" />
      <div className="absolute right-3 top-4 h-16 w-28 rounded-full bg-white/38 blur-xl" />
      <div className="absolute inset-x-8 bottom-5 h-10 rounded-full bg-slate-900/14 blur-2xl" />
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 74vw"
        className={`relative z-10 h-auto max-h-[88%] max-w-none object-contain drop-shadow-[0_22px_34px_rgba(15,23,42,0.18)] transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.02] ${image.className}`}
      />
    </div>
  );
}

export function StorefrontDealsSection({
  onPreviewProduct,
  onAddProduct,
}: {
  onPreviewProduct: (productId: string) => void;
  onAddProduct: (productId: string) => void;
}) {
  return (
    <section id="promociones" className="mx-auto w-full max-w-[112rem] scroll-mt-6 px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8 2xl:px-10">
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-200 pb-4 sm:mb-6">
        <h2 className="text-[1.55rem] font-black tracking-tight text-slate-950 sm:text-[2rem]">
          Productos destacados
        </h2>
        <p className="hidden text-sm font-medium text-slate-500 sm:block">
          Toca un producto para ver opciones y precio
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
        {deals.map((deal) => (
          <article
            key={deal.title}
            className="group grid gap-4 rounded-[1.45rem] border border-slate-200 bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:grid-cols-[minmax(0,300px)_1fr] sm:p-4"
          >
            <DealArt tint={deal.tint} image={deal.image} />

            <div className="flex flex-col justify-center px-1 pb-2 pt-1 sm:px-1 sm:pb-0">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                {deal.category}
              </p>
              <h3 className="mt-2 text-[1.25rem] font-semibold leading-tight tracking-tight text-slate-950 sm:text-[1.7rem]">
                {deal.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
                {deal.note}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
                <button
                  type="button"
                  onClick={() => onPreviewProduct(deal.productId)}
                  className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Ver producto
                </button>
                <button
                  type="button"
                  onClick={() => onAddProduct(deal.productId)}
                  className="cursor-pointer rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Anadir
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
