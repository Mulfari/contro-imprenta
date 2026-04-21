"use client";

import { useEffect, useRef, useState } from "react";

const items = [
  { title: "Tarjetas", count: "18 productos", art: "cards" },
  { title: "Stickers", count: "16 productos", art: "stickers" },
  { title: "Folletos", count: "12 productos", art: "brochure" },
  { title: "Pendones", count: "9 productos", art: "rollup" },
  { title: "Talonarios", count: "7 productos", art: "notepad" },
  { title: "Etiquetas", count: "21 productos", art: "sticker-labels" },
  { title: "Invitaciones", count: "14 productos", art: "invitations-card" },
  { title: "Packaging", count: "11 productos", art: "packaging-real" },
  { title: "Cuadernos", count: "10 productos", art: "booklet" },
  { title: "Acrilicos", count: "6 productos", art: "banner" },
  { title: "Sellos", count: "8 productos", art: "invoice" },
];

const DESKTOP_ITEM_STRIDE = 206;

function getTrackItemStride(track: HTMLDivElement) {
  const firstItem = track.firstElementChild as HTMLElement | null;

  if (!firstItem) {
    return DESKTOP_ITEM_STRIDE;
  }

  const trackStyles = window.getComputedStyle(track);
  const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap || "0");

  return firstItem.getBoundingClientRect().width + (Number.isFinite(gap) ? gap : 0);
}

function CategoryArt({ art }: { art: string }) {
  if (art === "cards") {
    return (
      <div
        className="relative flex h-40 w-44 items-center justify-center"
        style={{ width: "11rem", height: "10rem" }}
      >
        <div className="absolute inset-x-3 bottom-1 h-9 rounded-full bg-slate-300/65 blur-xl" />
        <div
          aria-label="Tarjetas"
          role="img"
          className="h-[139px] w-[11.625rem] translate-x-1 drop-shadow-[0_20px_30px_rgba(15,23,42,0.16)] [mask-image:radial-gradient(ellipse_72%_66%_at_52%_52%,black_58%,transparent_84%)]"
          style={{
            backgroundImage: "url('/storefront-cards.webp')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
      </div>
    );
  }

  if (art === "stickers") {
    return (
      <div
        className="relative flex h-32 w-36 items-center justify-center"
        style={{ width: "9rem", height: "8rem" }}
      >
        <div className="absolute inset-x-4 bottom-2 h-7 rounded-full bg-slate-300/65 blur-xl" />
        <div
          aria-label="Stickers"
          role="img"
          className="h-[119px] w-[9.875rem] drop-shadow-[0_20px_30px_rgba(15,23,42,0.18)]"
          style={{
            backgroundImage: "url('/storefront-stickers.webp')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
      </div>
    );
  }

  if (art === "booklet") {
    return (
      <div className="relative h-24 w-24">
        <div className="absolute left-4 top-5 h-13 w-10 rounded-[1rem] border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-9 top-2 h-13 w-10 rounded-[1rem] border border-slate-300 bg-white/92 shadow-sm" />
      </div>
    );
  }

  if (art === "brochure") {
    return (
      <div
        className="relative flex h-36 w-40 items-center justify-center"
        style={{ width: "10rem", height: "9rem" }}
      >
        <div className="absolute inset-x-4 bottom-1 h-8 rounded-full bg-slate-300/65 blur-xl" />
        <div
          aria-label="Folletos"
          role="img"
          className="h-[133px] w-[10.875rem] drop-shadow-[0_18px_28px_rgba(15,23,42,0.16)] [mask-image:radial-gradient(ellipse_74%_68%_at_50%_52%,black_58%,transparent_84%)]"
          style={{
            backgroundImage: "url('/storefront-brochures.webp')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
      </div>
    );
  }

  if (art === "banner") {
    return (
      <div className="relative h-24 w-24">
        <div className="absolute left-8 top-1 h-20 w-2 rounded-full bg-slate-400" />
        <div className="absolute left-10 top-7 h-12 w-9 rounded-r-[1rem] rounded-tl-[0.3rem] rounded-bl-[0.3rem] bg-violet-300 shadow-sm" />
      </div>
    );
  }

  if (art === "rollup") {
    return (
      <div
        className="relative flex h-36 w-28 items-center justify-center"
        style={{ width: "7rem", height: "9rem" }}
      >
        <div className="absolute inset-x-2 bottom-1 h-6 rounded-full bg-slate-300/65 blur-xl" />
        <div
          aria-label="Pendones"
          role="img"
          className="h-[161px] w-[7.0625rem] drop-shadow-[0_18px_28px_rgba(15,23,42,0.16)] [mask-image:radial-gradient(ellipse_70%_76%_at_50%_52%,black_60%,transparent_86%)]"
          style={{
            backgroundImage: "url('/storefront-banners.webp')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
      </div>
    );
  }

  if (art === "invoice") {
    return (
      <div className="relative h-24 w-24">
        <div className="absolute left-6 top-4 h-14 w-11 rounded-[1rem] border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-9 top-10 h-1.5 w-7 rounded-full bg-slate-200" />
        <div className="absolute left-9 top-14 h-1.5 w-8 rounded-full bg-slate-200" />
        <div className="absolute left-9 top-18 h-1.5 w-5 rounded-full bg-slate-200" />
      </div>
    );
  }

  if (art === "notepad") {
    return (
      <div
        className="relative flex h-34 w-36 items-center justify-center"
        style={{ width: "9rem", height: "8.5rem" }}
      >
        <div className="absolute inset-x-3 bottom-1 h-7 rounded-full bg-slate-300/65 blur-xl" />
        <div
          aria-label="Talonarios"
          role="img"
          className="h-[125px] w-[9.75rem] drop-shadow-[0_18px_28px_rgba(15,23,42,0.16)] [mask-image:radial-gradient(ellipse_74%_68%_at_50%_54%,black_58%,transparent_84%)]"
          style={{
            backgroundImage: "url('/storefront-invoices.webp')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
      </div>
    );
  }

  if (art === "labels") {
    return (
      <div className="grid h-24 w-24 grid-cols-2 gap-2">
        <div className="rounded-xl bg-emerald-300" />
        <div className="rounded-xl bg-cyan-300" />
        <div className="rounded-xl bg-amber-300" />
        <div className="rounded-xl bg-pink-300" />
      </div>
    );
  }

  if (art === "sticker-labels") {
    return (
      <div
        className="relative flex h-34 w-40 items-center justify-center"
        style={{ width: "10rem", height: "8.5rem" }}
      >
        <div className="absolute inset-x-4 bottom-1 h-7 rounded-full bg-slate-300/65 blur-xl" />
        <div
          aria-label="Etiquetas"
          role="img"
          className="h-[127px] w-[10.5625rem] drop-shadow-[0_18px_28px_rgba(15,23,42,0.16)] [mask-image:radial-gradient(ellipse_74%_70%_at_50%_54%,black_58%,transparent_84%)]"
          style={{
            backgroundImage: "url('/storefront-labels.webp')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
      </div>
    );
  }

  if (art === "invite") {
    return (
      <div className="relative h-24 w-24">
        <div className="absolute left-5 top-6 h-11 w-12 rotate-[-8deg] rounded-[1rem] border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-10 top-3 h-11 w-12 rotate-[8deg] rounded-[1rem] border border-slate-300 bg-white/92 shadow-sm" />
        <div className="absolute left-12 top-11 h-3 w-6 rounded-full bg-rose-300" />
      </div>
    );
  }

  if (art === "invitations-card") {
    return (
      <div
        className="relative flex h-34 w-40 items-center justify-center"
        style={{ width: "10rem", height: "8.5rem" }}
      >
        <div className="absolute inset-x-4 bottom-1 h-7 rounded-full bg-slate-300/65 blur-xl" />
        <div
          aria-label="Invitaciones"
          role="img"
          className="h-[127px] w-[10.5625rem] drop-shadow-[0_18px_28px_rgba(15,23,42,0.16)] [mask-image:radial-gradient(ellipse_74%_70%_at_50%_54%,black_58%,transparent_84%)]"
          style={{
            backgroundImage: "url('/storefront-invitations.webp')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
      </div>
    );
  }

  if (art === "packaging") {
    return (
      <div className="relative h-24 w-24">
        <div className="absolute left-5 top-6 h-10 w-12 rounded-[0.9rem] border border-slate-300 bg-white shadow-sm" />
        <div className="absolute left-9 top-2 h-8 w-4 rounded-md bg-slate-300" />
        <div className="absolute left-9 bottom-3 h-2 w-4 rounded-full bg-amber-300" />
      </div>
    );
  }

  if (art === "packaging-real") {
    return (
      <div
        className="relative flex h-34 w-40 items-center justify-center"
        style={{ width: "10rem", height: "8.5rem" }}
      >
        <div className="absolute inset-x-4 bottom-1 h-7 rounded-full bg-slate-300/65 blur-xl" />
        <div
          aria-label="Packaging"
          role="img"
          className="h-[127px] w-[10.5625rem] drop-shadow-[0_18px_28px_rgba(15,23,42,0.16)] [mask-image:radial-gradient(ellipse_74%_70%_at_50%_54%,black_58%,transparent_84%)]"
          style={{
            backgroundImage: "url('/storefront-packaging.webp')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
      </div>
    );
  }
  return null;
}

export function StorefrontCategoryStrip() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const dragState = useRef<{
    pointerId: number | null;
    startX: number;
    startScrollLeft: number;
    hasMoved: boolean;
    frame: number | null;
    pendingScrollLeft: number | null;
  }>({
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    hasMoved: false,
    frame: null,
    pendingScrollLeft: null,
  });
  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const updateControls = () => {
      const maxScrollLeft = Math.max(track.scrollWidth - track.clientWidth, 0);
      setCanScrollLeft(track.scrollLeft > 4);
      setCanScrollRight(track.scrollLeft < maxScrollLeft - 4);
    };

    updateControls();
    track.addEventListener("scroll", updateControls, { passive: true });

    return () => {
      track.removeEventListener("scroll", updateControls);
    };
  }, []);

  useEffect(() => {
    const dragRef = dragState.current;

    return () => {
      if (dragRef.frame !== null) {
        cancelAnimationFrame(dragRef.frame);
      }
    };
  }, []);

  const snapToNearestItem = () => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const stride = getTrackItemStride(track);
    const target = Math.round(track.scrollLeft / stride) * stride;
    track.scrollTo({
      left: target,
      behavior: "smooth",
    });
  };

  const slideBy = (direction: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    track.scrollBy({
      left: direction === "next" ? getTrackItemStride(track) : -getTrackItemStride(track),
      behavior: "smooth",
    });
  };

  return (
    <section className="mx-auto w-full max-w-[112rem] px-4 pb-6 sm:px-6 lg:px-8 2xl:px-10">
      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[2.9rem_minmax(0,1fr)_2.9rem]">
        <button
          type="button"
          onClick={() => slideBy("prev")}
          className={`hidden h-12 w-12 items-center justify-center rounded-full border bg-white shadow-[0_16px_32px_rgba(15,23,42,0.07)] transition md:flex ${
            canScrollLeft
              ? "cursor-pointer border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.97]"
              : "cursor-default border-slate-100 text-slate-300"
          }`}
          aria-label="Anterior"
          disabled={!canScrollLeft}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div className="relative overflow-hidden">
          <div
            ref={trackRef}
            className={`storefront-strip-scrollbar storefront-strip-track flex gap-3 overflow-x-auto px-0.5 md:gap-[18px] md:px-1 ${
              isDragging ? "cursor-grabbing" : "cursor-grab scroll-smooth"
            }`}
            onPointerDown={(event) => {
              if (event.pointerType !== "mouse") {
                return;
              }

              const track = trackRef.current;
              if (!track) {
                return;
              }

              dragState.current.pointerId = event.pointerId;
              dragState.current.startX = event.clientX;
              dragState.current.startScrollLeft = track.scrollLeft;
              dragState.current.hasMoved = false;
              dragState.current.pendingScrollLeft = null;
              setIsDragging(true);
              track.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (event.pointerType !== "mouse") {
                return;
              }

              const track = trackRef.current;
              if (!track || dragState.current.pointerId !== event.pointerId) {
                return;
              }

              const deltaX = (event.clientX - dragState.current.startX) * 1.08;
              const maxScrollLeft = Math.max(track.scrollWidth - track.clientWidth, 0);
              dragState.current.pendingScrollLeft = Math.min(
                Math.max(dragState.current.startScrollLeft - deltaX, 0),
                maxScrollLeft,
              );
              dragState.current.hasMoved ||= Math.abs(deltaX) > 6;

              if (dragState.current.frame !== null) {
                return;
              }

              dragState.current.frame = requestAnimationFrame(() => {
                if (trackRef.current && dragState.current.pendingScrollLeft !== null) {
                  trackRef.current.scrollLeft = dragState.current.pendingScrollLeft;
                }

                dragState.current.frame = null;
              });
            }}
            onPointerUp={(event) => {
              if (event.pointerType !== "mouse") {
                return;
              }

              const track = trackRef.current;
              if (!track || dragState.current.pointerId !== event.pointerId) {
                return;
              }

              track.releasePointerCapture(event.pointerId);
              dragState.current.pointerId = null;
              setIsDragging(false);
              snapToNearestItem();
            }}
            onPointerCancel={() => {
              if (dragState.current.pointerId === null) {
                return;
              }

              dragState.current.pointerId = null;
              setIsDragging(false);
              snapToNearestItem();
            }}
          >
            {items.map((item) => (
              <button
                key={item.title}
                type="button"
                draggable={false}
                className="min-w-0 basis-[calc((100%_-_0.75rem)/2)] snap-start shrink-0 cursor-pointer px-1 py-4 text-center transition hover:opacity-85 md:w-[188px] md:min-w-[188px] md:basis-auto md:px-2"
                onClick={(event) => {
                  if (dragState.current.hasMoved) {
                    event.preventDefault();
                    event.stopPropagation();
                    dragState.current.hasMoved = false;
                  }
                }}
              >
                <div className="mx-auto flex h-28 w-full items-center justify-center md:h-32">
                  <CategoryArt art={item.art} />
                </div>
                <p className="mt-4 text-[0.98rem] font-semibold leading-5 tracking-tight text-slate-950 md:mt-5 md:text-[1.02rem] md:leading-6">
                  {item.title}
                </p>
                <p className="mt-1 text-[0.86rem] text-slate-400 md:text-[0.95rem]">{item.count}</p>
              </button>
            ))}
          </div>
          {canScrollRight ? (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center md:hidden">
              <div className="h-full w-14 bg-gradient-to-l from-[#f3f5f8] via-[#f3f5f8]/88 to-transparent" />
              <div className="absolute right-1 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/92 text-slate-500 shadow-[0_12px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </div>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => slideBy("next")}
          className={`hidden h-12 w-12 items-center justify-center rounded-full border bg-white shadow-[0_16px_32px_rgba(15,23,42,0.07)] transition md:flex ${
            canScrollRight
              ? "cursor-pointer border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.97]"
              : "cursor-default border-slate-100 text-slate-300"
          }`}
          aria-label="Siguiente"
          disabled={!canScrollRight}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
