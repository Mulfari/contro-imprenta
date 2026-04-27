"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";

import { CustomerAccountClient } from "@/app/mi-cuenta/account-client";
import {
  cartStorageKey,
  parsePrice,
  restoreStoredCart,
  serializeCartItems,
  type CartItem,
} from "@/app/storefront-cart";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type CheckoutClientProps = {
  hasPublicAuth: boolean;
};

type CheckoutPrep = {
  files: File[];
  sendLater: boolean;
  confirmed: boolean;
  note: string;
};

type PaymentFields = {
  amount: string;
  bank: string;
  payerPhone: string;
  reference: string;
};

const emptyPrep: CheckoutPrep = {
  files: [],
  sendLater: false,
  confirmed: false,
  note: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function getItemTotal(item: CartItem) {
  return parsePrice(item.product.price) * item.quantity;
}

function getPrep(prepByKey: Record<string, CheckoutPrep>, key: string) {
  return prepByKey[key] ?? emptyPrep;
}

function isPrepReady(prep: CheckoutPrep) {
  return prep.files.length > 0 || prep.sendLater;
}

function getPrepStatus(prep: CheckoutPrep) {
  if (prep.confirmed) {
    return "Confirmado";
  }

  if (isPrepReady(prep)) {
    return "Por confirmar";
  }

  return "Falta arte";
}

function formatFileSize(value: number) {
  if (value < 1024 * 1024) {
    return `${Math.max(1, Math.round(value / 1024))} KB`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function getFileBadge(file: File) {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return "PDF";
  }

  const extension = file.name.split(".").pop()?.trim();

  return extension ? extension.slice(0, 4).toUpperCase() : "FILE";
}

function CheckoutFilePreview({
  file,
  variant = "compact",
}: {
  file: File;
  variant?: "compact" | "featured";
}) {
  const isImage = file.type.startsWith("image/");
  const previewUrl = useMemo(
    () => (isImage ? URL.createObjectURL(file) : null),
    [file, isImage],
  );
  const sizeClass =
    variant === "featured"
      ? "h-56 w-full rounded-[1.45rem] sm:h-64"
      : "h-14 w-14 rounded-xl";
  const badgeClass = variant === "featured" ? "text-2xl" : "text-xs";

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (previewUrl) {
    return (
      <div
        className={`${sizeClass} shrink-0 border border-slate-200 bg-white bg-contain bg-center bg-no-repeat shadow-sm`}
        style={{ backgroundImage: `url(${previewUrl})` }}
        aria-label={`Miniatura de ${file.name}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} ${badgeClass} flex shrink-0 items-center justify-center border border-slate-200 bg-white font-black text-slate-500 shadow-sm`}>
      {getFileBadge(file)}
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <main className="min-h-screen bg-[#f3f5f8] px-4 py-5 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[112rem] space-y-5">
        <div className="h-20 animate-pulse rounded-[1.6rem] bg-white" />
        <div className="grid gap-5 xl:grid-cols-[1fr_28rem]">
          <div className="space-y-5">
            <div className="h-52 animate-pulse rounded-[2rem] bg-white" />
            <div className="h-72 animate-pulse rounded-[2rem] bg-white" />
          </div>
          <div className="h-96 animate-pulse rounded-[2rem] bg-white" />
        </div>
      </div>
    </main>
  );
}

function CheckoutHeader({ currentStep }: { currentStep: number }) {
  const steps = ["Productos", "Arte por producto", "Pago movil"];

  return (
    <header className="rounded-[1.6rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">
            X
          </span>
          <span>
            <span className="block text-lg font-black leading-none text-slate-950">
              Express
            </span>
            <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Printer
            </span>
          </span>
        </Link>
        <div className="grid gap-2 text-xs font-semibold text-slate-500 sm:grid-cols-3">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isDone = stepNumber < currentStep;

            return (
              <span
                key={step}
                className={`rounded-full border px-3 py-2 text-center ${
                  isActive
                    ? "border-slate-950 bg-slate-950 text-white"
                    : isDone
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50"
                }`}
              >
                {stepNumber}. {step}
              </span>
            );
          })}
        </div>
      </div>
    </header>
  );
}

function MessageBox({
  message,
  tone,
}: {
  message: string;
  tone: "error" | "success" | "info";
}) {
  const toneClass =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-blue-200 bg-blue-50 text-blue-700";

  return (
    <div className={`rounded-[1.2rem] border px-4 py-3 text-sm font-semibold leading-6 ${toneClass}`}>
      {message}
    </div>
  );
}

function ProductQueueItem({
  item,
  index,
  isActive,
  prep,
  onClick,
}: {
  item: CartItem;
  index: number;
  isActive: boolean;
  prep: CheckoutPrep;
  onClick: () => void;
}) {
  const ready = isPrepReady(prep);
  const status = getPrepStatus(prep);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full cursor-pointer rounded-[1.3rem] border p-3 text-left transition ${
        isActive
          ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_44px_rgba(15,23,42,0.16)]"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
            prep.confirmed
              ? "bg-emerald-100 text-emerald-700"
              : isActive
                ? "bg-white text-slate-950"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          {prep.confirmed ? "OK" : index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-black ${isActive ? "text-white" : "text-slate-950"}`}>
            {item.product.title}
          </p>
          <p className={`mt-1 text-xs font-semibold ${isActive ? "text-white/60" : "text-slate-400"}`}>
            {item.quantity} unidad{item.quantity === 1 ? "" : "es"} / {formatCurrency(getItemTotal(item))}
          </p>
          <span
            className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${
              prep.confirmed
                ? "bg-emerald-100 text-emerald-700"
                : ready
                  ? "bg-amber-100 text-amber-800"
                  : isActive
                    ? "bg-white/10 text-white"
                    : "bg-slate-100 text-slate-500"
            }`}
          >
            {status}
          </span>
        </div>
      </div>
    </button>
  );
}

function ActiveProductPreparation({
  item,
  index,
  totalItems,
  prep,
  onPrepChange,
  onQuantityChange,
  onRemove,
  onConfirm,
  onPrevious,
  onNext,
}: {
  item: CartItem;
  index: number;
  totalItems: number;
  prep: CheckoutPrep;
  onPrepChange: (next: CheckoutPrep) => void;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  onConfirm: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const ready = isPrepReady(prep);
  const hasFiles = prep.files.length > 0;
  const primaryFile = prep.files[0] ?? null;
  const extraFiles = prep.files.slice(1);
  const setSelectedFiles = (files: File[]) =>
    onPrepChange({
      ...prep,
      files,
      sendLater: false,
      confirmed: false,
    });

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[12rem_1fr] lg:items-center">
        <div className={`flex min-h-44 items-center justify-center overflow-hidden rounded-[1.45rem] bg-gradient-to-br ${item.product.tint} p-4`}>
          <Image
            src={item.product.image}
            alt={item.product.imageAlt}
            width={420}
            height={320}
            sizes="14rem"
            className="h-auto max-h-40 w-auto max-w-full object-contain drop-shadow-[0_20px_34px_rgba(15,23,42,0.18)]"
          />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Producto {index + 1} de {totalItems}
          </p>
          <h1 className="mt-2 break-words text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {item.product.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {Object.entries(item.options).map(([key, value]) => `${key}: ${value}`).join(" / ")}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <div className="flex w-fit items-center rounded-full border border-slate-200">
              <button
                type="button"
                onClick={() => onQuantityChange(item.quantity - 1)}
                className="h-11 w-11 cursor-pointer text-slate-500 transition hover:text-slate-950"
              >
                -
              </button>
              <span className="min-w-10 text-center text-sm font-black">{item.quantity}</span>
              <button
                type="button"
                onClick={() => onQuantityChange(item.quantity + 1)}
                className="h-11 w-11 cursor-pointer text-slate-500 transition hover:text-slate-950"
              >
                +
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-500">
              Subtotal: <span className="font-black text-slate-950">{formatCurrency(getItemTotal(item))}</span>
            </p>
            <button
              type="button"
              onClick={onRemove}
              className="w-fit cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
            >
              Quitar
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[1.55rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Arte del producto
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              {hasFiles ? "Diseno cargado" : prep.sendLater ? "Arte pendiente" : "Prepara el arte"}
            </h2>
          </div>
          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-black ${
              hasFiles
                ? "bg-emerald-100 text-emerald-700"
                : prep.sendLater
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-200 text-slate-600"
            }`}
          >
            {hasFiles ? `${prep.files.length} archivo${prep.files.length === 1 ? "" : "s"}` : prep.sendLater ? "Pendiente" : "Sin arte"}
          </span>
        </div>

        {hasFiles && primaryFile ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="rounded-[1.55rem] border border-slate-200 bg-white p-3 sm:p-4">
              <CheckoutFilePreview file={primaryFile} variant="featured" />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">
                    {primaryFile.name}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    {formatFileSize(primaryFile.size)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white transition hover:bg-slate-800">
                    Cambiar arte
                    <input
                      type="file"
                      multiple
                      className="sr-only"
                      onChange={(event) => {
                        const files = Array.from(event.target.files ?? []);

                        if (files.length > 0) {
                          setSelectedFiles(files);
                        }

                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setSelectedFiles([])}
                    className="cursor-pointer rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                  >
                    Quitar
                  </button>
                </div>
              </div>

              {extraFiles.length > 0 ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {extraFiles.map((file, fileIndex) => (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 text-sm"
                    >
                      <CheckoutFilePreview file={file} />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-slate-800">
                          {file.name}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-slate-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedFiles(prep.files.filter((_, indexToKeep) => indexToKeep !== fileIndex + 1))
                        }
                        className="cursor-pointer rounded-lg px-2 py-1 text-xs font-black text-slate-400 transition hover:bg-white hover:text-slate-900"
                        aria-label={`Quitar ${file.name}`}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-3">
              <textarea
                value={prep.note}
                onChange={(event) =>
                  onPrepChange({
                    ...prep,
                    note: event.target.value,
                    confirmed: false,
                  })
                }
                rows={7}
                placeholder="Notas para este producto..."
                className="w-full resize-none rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
              />
              <p className="rounded-[1.2rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold leading-5 text-emerald-700">
                Revisa que el archivo corresponda a este producto antes de confirmar.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <label className={`block rounded-[1.55rem] border border-dashed px-5 py-10 text-center transition ${
              prep.sendLater
                ? "border-slate-200 bg-white text-slate-400"
                : "cursor-pointer border-slate-300 bg-white text-slate-700 hover:border-slate-400"
            }`}>
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-black text-white">
                +
              </span>
              <span className="mt-4 block text-base font-black text-slate-950">
                Subir arte del producto
              </span>
              <span className="mx-auto mt-2 block max-w-md text-sm leading-6 text-slate-500">
                Adjunta el archivo que se usara para imprimir este producto. Puedes cargar mas de uno si hace falta.
              </span>
              <input
                type="file"
                multiple
                className="sr-only"
                disabled={prep.sendLater}
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);

                  if (files.length > 0) {
                    setSelectedFiles(files);
                  }

                  event.currentTarget.value = "";
                }}
              />
            </label>

            <div className="grid gap-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4">
                <input
                  type="checkbox"
                  checked={prep.sendLater}
                  onChange={(event) =>
                    onPrepChange({
                      ...prep,
                      sendLater: event.target.checked,
                      files: event.target.checked ? [] : prep.files,
                      confirmed: false,
                    })
                  }
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />
                <span>
                  <span className="block text-sm font-black text-slate-950">
                    Lo enviare despues
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Quedara marcado como pendiente de arte.
                  </span>
                </span>
              </label>

              <textarea
                value={prep.note}
                onChange={(event) =>
                  onPrepChange({
                    ...prep,
                    note: event.target.value,
                    confirmed: false,
                  })
                }
                rows={6}
                placeholder="Notas para este producto..."
                className="w-full resize-none rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrevious}
            disabled={index === 0}
            className="cursor-pointer rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={index >= totalItems - 1}
            className="cursor-pointer rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!ready}
          className="cursor-pointer rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {prep.confirmed ? "Producto confirmado" : index >= totalItems - 1 ? "Confirmar producto" : "Confirmar y seguir"}
        </button>
      </div>
    </section>
  );
}

export function CheckoutClient({ hasPublicAuth }: CheckoutClientProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(!hasPublicAuth);
  const [prepByKey, setPrepByKey] = useState<Record<string, CheckoutPrep>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [paymentFields, setPaymentFields] = useState<PaymentFields>({
    amount: "",
    bank: "",
    payerPhone: "",
    reference: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success" | "info">("info");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setCartItems(restoreStoredCart(window.localStorage.getItem(cartStorageKey)));
      setStorageReady(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    window.localStorage.setItem(
      cartStorageKey,
      JSON.stringify(serializeCartItems(cartItems)),
    );
  }, [cartItems, storageReady]);

  useEffect(() => {
    setPrepByKey((current) => {
      const next: Record<string, CheckoutPrep> = {};

      cartItems.forEach((item) => {
        next[item.key] = current[item.key] ?? { ...emptyPrep };
      });

      return next;
    });

    setActiveIndex((current) => Math.min(current, Math.max(0, cartItems.length - 1)));
  }, [cartItems]);

  useEffect(() => {
    if (!hasPublicAuth) {
      return;
    }

    const supabase = createBrowserSupabaseClient();

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, [hasPublicAuth]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + getItemTotal(item), 0),
    [cartItems],
  );

  useEffect(() => {
    setPaymentFields((current) => ({
      ...current,
      amount: subtotal > 0 ? subtotal.toFixed(2) : "",
    }));
  }, [subtotal]);

  const totalUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const preparedCount = cartItems.filter((item) => getPrep(prepByKey, item.key).confirmed).length;
  const allItemsConfirmed = cartItems.length > 0 && preparedCount === cartItems.length;
  const activeItem = cartItems[activeIndex] ?? null;
  const currentStep = !allItemsConfirmed ? 2 : 3;

  const changeQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((current) => current.filter((item) => item.key !== key));
      return;
    }

    setCartItems((current) =>
      current.map((item) => (item.key === key ? { ...item, quantity } : item)),
    );
  };

  const removeItem = (key: string) => {
    setCartItems((current) => current.filter((item) => item.key !== key));
  };

  const updatePrep = (key: string, next: CheckoutPrep) => {
    setPrepByKey((current) => ({
      ...current,
      [key]: next,
    }));
  };

  const confirmCurrentItem = () => {
    if (!activeItem) {
      return;
    }

    const prep = getPrep(prepByKey, activeItem.key);

    if (!isPrepReady(prep)) {
      setMessageTone("error");
      setMessage("Sube el arte de este producto o marca que lo enviaras despues.");
      return;
    }

    updatePrep(activeItem.key, {
      ...prep,
      confirmed: true,
    });
    setMessage("");

    if (activeIndex < cartItems.length - 1) {
      setActiveIndex((current) => current + 1);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!session) {
      setMessageTone("error");
      setMessage("Inicia sesion para preparar tu pedido.");
      return;
    }

    if (cartItems.length === 0) {
      setMessageTone("error");
      setMessage("Tu carrito esta vacio.");
      return;
    }

    if (!allItemsConfirmed) {
      setMessageTone("error");
      setMessage("Confirma el arte de cada producto antes de registrar el pago.");
      const firstPendingIndex = cartItems.findIndex(
        (item) => !getPrep(prepByKey, item.key).confirmed,
      );
      setActiveIndex(Math.max(0, firstPendingIndex));
      return;
    }

    const amount = Number(paymentFields.amount);
    const reference = paymentFields.reference.trim();
    const payerPhone = paymentFields.payerPhone.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessageTone("error");
      setMessage("Escribe el monto del pago movil.");
      return;
    }

    if (!payerPhone || !reference) {
      setMessageTone("error");
      setMessage("Indica el telefono emisor y la referencia del pago movil.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const preparedNotes = cartItems.map((item, index) => {
      const prep = getPrep(prepByKey, item.key);
      const artStatus = prep.sendLater
        ? "arte pendiente para enviar despues"
        : `${prep.files.length} archivo${prep.files.length === 1 ? "" : "s"} de arte adjunto${prep.files.length === 1 ? "" : "s"}`;

      return [
        `${index + 1}. ${item.product.title}`,
        `Cantidad: ${item.quantity}`,
        `Estado de arte: ${artStatus}`,
        prep.note.trim() ? `Notas: ${prep.note.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    });
    const globalNotes = String(formData.get("globalNotes") ?? "").trim();

    formData.set(
      "items",
      JSON.stringify(
        cartItems.map((item) => ({
          productId: item.product.id,
          title: item.product.title,
          productType: item.product.category,
          quantity: item.quantity,
          unitPrice: parsePrice(item.product.price),
          options: item.options,
        })),
      ),
    );
    formData.set(
      "notes",
      [
        globalNotes ? `Notas generales: ${globalNotes}` : "",
        `Preparacion por producto:\n${preparedNotes.join("\n\n")}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
    );
    formData.set(
      "artIntent",
      cartItems.some((item) => getPrep(prepByKey, item.key).sendLater) ? "later" : "now",
    );
    formData.set("amount", paymentFields.amount);
    formData.set("bank", paymentFields.bank);
    formData.set("payerPhone", payerPhone);
    formData.set("reference", reference);
    formData.delete("artFiles");

    cartItems.forEach((item) => {
      getPrep(prepByKey, item.key).files.forEach((file) => {
        formData.append("artFiles", file);
      });
    });

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/storefront/checkout", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo enviar el pedido.");
      }

      window.localStorage.removeItem(cartStorageKey);
      setCartItems([]);
      router.push(
        `/mi-cuenta?tone=success&message=${encodeURIComponent(
          payload.message || "Pedido enviado. Revisaremos el pago y el arte.",
        )}`,
      );
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "No se pudo enviar el pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!storageReady || !sessionReady) {
    return <CheckoutSkeleton />;
  }

  return (
    <main className="min-h-screen bg-[#f3f5f8] px-4 py-5 text-slate-950 sm:px-6 lg:px-8 2xl:px-10">
      <div className="mx-auto max-w-[112rem] space-y-5">
        <CheckoutHeader currentStep={currentStep} />

        {!hasPublicAuth ? (
          <MessageBox
            tone="error"
            message="Configura Supabase publico para activar pedidos de clientes."
          />
        ) : null}

        {!session ? (
          <div className="grid gap-5 xl:grid-cols-[1fr_30rem]">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.05)] sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Pedido protegido
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Inicia sesion para preparar tu pedido.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Tu carrito queda guardado. Al entrar podras preparar cada producto, subir el arte y registrar el pago movil antes de enviarlo a administracion.
              </p>
              <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Resumen actual</p>
                <p className="mt-2 text-3xl font-black text-slate-950">
                  {formatCurrency(subtotal)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {cartItems.length} producto{cartItems.length === 1 ? "" : "s"} / {totalUnits} unidad{totalUnits === 1 ? "" : "es"}
                </p>
              </div>
            </section>
            <CustomerAccountClient
              hasPublicAuth={hasPublicAuth}
              variant="dropdown"
              initialMode="login"
              showModeSwitch
              initialNotice={{
                message: "Inicia sesion o registrate para preparar tu pedido.",
                tone: "error",
              }}
            />
          </div>
        ) : cartItems.length === 0 ? (
          <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-5 py-14 text-center shadow-[0_20px_48px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Carrito vacio
            </p>
            <h1 className="mt-3 text-3xl font-black text-slate-950">
              Agrega productos para preparar un pedido.
            </h1>
            <Link
              href="/#catalogo"
              className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              Volver al catalogo
            </Link>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-[1fr_28rem] xl:items-start">
            <div className="space-y-5">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_20px_48px_rgba(15,23,42,0.05)] sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Preparacion guiada
                    </p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                      Revisa un producto a la vez
                    </h1>
                  </div>
                  <Link
                    href="/#catalogo"
                    className="inline-flex w-fit rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Seguir comprando
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                  {cartItems.map((item, index) => (
                    <ProductQueueItem
                      key={item.key}
                      item={item}
                      index={index}
                      isActive={activeIndex === index}
                      prep={getPrep(prepByKey, item.key)}
                      onClick={() => setActiveIndex(index)}
                    />
                  ))}
                </div>
              </section>

              {activeItem ? (
                <ActiveProductPreparation
                  item={activeItem}
                  index={activeIndex}
                  totalItems={cartItems.length}
                  prep={getPrep(prepByKey, activeItem.key)}
                  onPrepChange={(next) => updatePrep(activeItem.key, next)}
                  onQuantityChange={(quantity) => changeQuantity(activeItem.key, quantity)}
                  onRemove={() => removeItem(activeItem.key)}
                  onConfirm={confirmCurrentItem}
                  onPrevious={() => setActiveIndex((current) => Math.max(0, current - 1))}
                  onNext={() =>
                    setActiveIndex((current) => Math.min(cartItems.length - 1, current + 1))
                  }
                />
              ) : null}

              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.05)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Notas generales
                </p>
                <textarea
                  name="globalNotes"
                  rows={4}
                  placeholder="Indicaciones generales de entrega, contacto o produccion..."
                  className="mt-4 w-full resize-none rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </section>
            </div>

            <aside className="space-y-5 xl:sticky xl:top-5">
              {message ? <MessageBox message={message} tone={messageTone} /> : null}

              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.08)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Resumen
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Pedido completo
                </h2>

                <div className="mt-5 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-500">Productos preparados</span>
                    <span className="text-sm font-black text-slate-950">
                      {preparedCount}/{cartItems.length}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-[#ffd45f] transition-all"
                      style={{
                        width: `${cartItems.length ? (preparedCount / cartItems.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-500">Unidades</span>
                    <span className="text-sm font-black text-slate-950">{totalUnits}</span>
                  </div>
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-slate-500">Total a cancelar</span>
                      <span className="text-3xl font-black text-slate-950">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`mt-5 rounded-[1.35rem] border p-4 ${
                  allItemsConfirmed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-amber-200 bg-amber-50 text-amber-900"
                }`}>
                  <p className="text-sm font-black">
                    {allItemsConfirmed ? "Listo para pago" : "Termina de preparar los productos"}
                  </p>
                  <p className="mt-2 text-sm leading-6 opacity-85">
                    {allItemsConfirmed
                      ? "Ahora registra el pago movil para enviar la orden a revision."
                      : "El pago se desbloquea cuando cada producto tenga arte o quede marcado como pendiente."}
                  </p>
                </div>

                <div className="mt-5 grid gap-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="amount"
                    value={paymentFields.amount}
                    onChange={(event) =>
                      setPaymentFields((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    required
                    disabled={!allItemsConfirmed}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
                    placeholder="Monto pagado"
                  />
                  <input
                    type="text"
                    name="bank"
                    value={paymentFields.bank}
                    onChange={(event) =>
                      setPaymentFields((current) => ({
                        ...current,
                        bank: event.target.value,
                      }))
                    }
                    disabled={!allItemsConfirmed}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
                    placeholder="Banco emisor"
                  />
                  <input
                    type="tel"
                    name="payerPhone"
                    value={paymentFields.payerPhone}
                    onChange={(event) =>
                      setPaymentFields((current) => ({
                        ...current,
                        payerPhone: event.target.value,
                      }))
                    }
                    required
                    disabled={!allItemsConfirmed}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
                    placeholder="Telefono emisor"
                  />
                  <input
                    type="text"
                    name="reference"
                    value={paymentFields.reference}
                    onChange={(event) =>
                      setPaymentFields((current) => ({
                        ...current,
                        reference: event.target.value,
                      }))
                    }
                    required
                    disabled={!allItemsConfirmed}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
                    placeholder="Referencia del pago"
                  />
                  <label className={`block rounded-2xl border border-dashed px-4 py-4 text-center text-sm font-semibold transition ${
                    allItemsConfirmed
                      ? "cursor-pointer border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-white"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}>
                    Adjuntar comprobante
                    <span className="mt-1 block text-xs font-medium text-slate-500">
                      Opcional, recomendado
                    </span>
                    <input
                      type="file"
                      name="proofFile"
                      disabled={!allItemsConfirmed}
                      className="sr-only"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={isSubmitting || !allItemsConfirmed}
                    className="mt-2 w-full cursor-pointer rounded-2xl bg-[#ffd45f] px-5 py-4 text-sm font-black text-slate-950 transition hover:bg-[#ffcd41] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? "Enviando pedido..." : "Enviar pedido a revision"}
                  </button>
                </div>
                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  Una sola orden agrupara estos productos, con detalle de arte por producto.
                </p>
              </section>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
