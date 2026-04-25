"use client";

import Image from "next/image";

type DealImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
};

const deals = [
  {
    productId: "tarjetas-premium",
    title: "Tarjetas ejecutivas",
    price: "$16",
    previousPrice: "$19",
    category: "Tarjetas",
    discount: "-$3",
    tint: "from-[#fff7d6] via-white to-[#fff2b3]",
    note: "Acabado mate o brillante",
    image: {
      src: "/storefront-promo-cards-premium.webp",
      alt: "Tarjetas ejecutivas premium",
      width: 1000,
      height: 640,
      className: "w-[13.75rem] sm:w-[18.25rem] lg:w-[15.5rem] xl:w-[16.5rem]",
    },
  },
  {
    productId: "stickers-troquelados",
    title: "Stickers troquelados",
    price: "$19",
    previousPrice: "$23",
    category: "Etiquetas",
    discount: "-$4",
    tint: "from-[#dff3ff] via-white to-[#cae8ff]",
    note: "Ideales para packaging",
    image: {
      src: "/storefront-promo-stickers-labels-trimmed.webp",
      alt: "Stickers troquelados para packaging",
      width: 1024,
      height: 824,
      className: "w-[13.5rem] sm:w-[17.75rem] lg:w-[15.25rem] xl:w-[16.25rem]",
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
        sizes="(min-width: 1280px) 15vw, (min-width: 1024px) 18vw, (min-width: 640px) 46vw, 74vw"
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
      <div className="grid gap-5 sm:gap-6 xl:grid-cols-[1.45fr_420px]">
        <div>
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-200 pb-4 sm:mb-6">
            <h2 className="text-[1.55rem] font-black tracking-tight text-slate-950 sm:text-[2rem]">
              Ofertas del mes
            </h2>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                aria-label="Anterior"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                type="button"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                aria-label="Siguiente"
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
            {deals.map((deal) => (
              <article
                key={deal.title}
                className="group grid gap-4 rounded-[1.45rem] border border-slate-200 bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] lg:grid-cols-[300px_1fr] lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r lg:p-0 lg:pr-6 lg:shadow-none last:lg:border-r-0 last:lg:pr-0"
              >
                <div className="relative">
                  <span className="absolute left-3 top-3 z-10 rounded-md bg-[#ff5b4d] px-2.5 py-1 text-xs font-bold text-white">
                    {deal.discount}
                  </span>
                  <button
                    type="button"
                    className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/88 text-slate-500 shadow-sm transition hover:text-slate-900"
                    aria-label="Guardar"
                  >
                    ♡
                  </button>
                  <DealArt tint={deal.tint} image={deal.image} />
                </div>

                <div className="flex flex-col justify-start px-1 pb-2 pt-1 lg:px-0 lg:pb-0">
                  <div className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                    <span className="text-slate-300 line-through">{deal.previousPrice}</span>
                    <span className="text-[#3558ff]">{deal.price}</span>
                  </div>
                  <h3 className="mt-2 text-[1.25rem] font-semibold leading-tight tracking-tight text-slate-950 sm:mt-3 sm:text-[1.8rem]">
                    {deal.title}
                  </h3>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {deal.category}
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
                    {deal.note}
                  </p>
                  <div className="mt-4 flex gap-1 text-slate-300 sm:mt-5">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                  </div>
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
        </div>

        <aside className="overflow-hidden rounded-[1.45rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:rounded-[1.8rem] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="h-14 w-14 rounded-[1.2rem] bg-gradient-to-br from-[#facc15] via-[#38bdf8] to-[#fb7185]" />
            <div className="h-10 w-10 rounded-full bg-[#111827]" />
          </div>
          <p className="mt-6 text-center text-[1.05rem] font-semibold text-[#3558ff]">
            ¡Suscribete a nuestro boletin!
          </p>
          <h3 className="mx-auto mt-4 max-w-xs text-center text-[1.45rem] font-black leading-tight tracking-tight text-slate-950 sm:text-[2rem]">
            Recibe noticias, productos y ofertas destacadas
          </h3>

          <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
            <input
              type="email"
              placeholder="Tu email"
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-base text-slate-950 outline-none transition focus:border-slate-400"
            />
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#ffd45f] px-5 py-4 text-base font-semibold text-slate-950 transition hover:bg-[#ffcd41]"
            >
              Suscribirme
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-500">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300" />
            <span>He leido y acepto las politicas de privacidad.</span>
          </label>
        </aside>
      </div>
    </section>
  );
}
