"use client";

export function CatalogProductSkeleton() {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.035)]">
      <div className="mx-3 mt-3 flex h-40 items-center justify-center overflow-hidden rounded-[0.95rem] bg-slate-100 p-4 sm:h-44">
        <div className="h-24 w-32 animate-pulse rounded-[1.2rem] bg-slate-200 sm:h-28 sm:w-36" />
      </div>
      <div className="flex min-h-[9.6rem] flex-1 flex-col px-4 pb-4 pt-4">
        <div>
          <div className="h-5 w-40 max-w-full animate-pulse rounded-full bg-slate-200" />
          <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="h-3 w-16 animate-pulse rounded-full bg-slate-200" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    </article>
  );
}