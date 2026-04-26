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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
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

function CheckoutHeader() {
  return (
    <header className="rounded-[1.6rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
            1. Productos
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
            2. Arte digital
          </span>
          <span className="rounded-full bg-slate-950 px-3 py-2 text-white">
            3. Pago movil
          </span>
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

function ProductLine({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem;
  onQuantityChange: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
}) {
  const lineTotal = parsePrice(item.product.price) * item.quantity;

  return (
    <article className="rounded-[1.35rem] border border-slate-200 bg-white p-3 sm:p-4">
      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <div className={`flex h-32 items-center justify-center overflow-hidden rounded-[1.1rem] bg-gradient-to-br ${item.product.tint} p-3`}>
          <Image
            src={item.product.image}
            alt={item.product.imageAlt}
            width={360}
            height={280}
            sizes="9rem"
            className="h-auto max-h-full w-auto max-w-full object-contain drop-shadow-[0_16px_24px_rgba(15,23,42,0.16)]"
          />
        </div>
        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {item.product.category}
              </p>
              <h3 className="mt-1 text-xl font-black leading-tight text-slate-950">
                {item.product.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {Object.entries(item.options).map(([key, value]) => `${key}: ${value}`).join(" / ")}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Total
              </p>
              <p className="mt-1 text-2xl font-black text-slate-950">
                {formatCurrency(lineTotal)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex items-center rounded-full border border-slate-200">
              <button
                type="button"
                onClick={() => onQuantityChange(item.key, item.quantity - 1)}
                className="h-10 w-10 cursor-pointer text-slate-500 transition hover:text-slate-950"
              >
                -
              </button>
              <span className="min-w-9 text-center text-sm font-black">{item.quantity}</span>
              <button
                type="button"
                onClick={() => onQuantityChange(item.key, item.quantity + 1)}
                className="h-10 w-10 cursor-pointer text-slate-500 transition hover:text-slate-950"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.key)}
              className="cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
            >
              Quitar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function CheckoutClient({ hasPublicAuth }: CheckoutClientProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(!hasPublicAuth);
  const [sendArtLater, setSendArtLater] = useState(false);
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
    () =>
      cartItems.reduce(
        (sum, item) => sum + parsePrice(item.product.price) * item.quantity,
        0,
      ),
    [cartItems],
  );

  const totalUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

    const form = event.currentTarget;
    const formData = new FormData(form);
    const artFiles = formData
      .getAll("artFiles")
      .filter((file): file is File => file instanceof File && file.size > 0);
    const amount = Number(formData.get("amount") ?? 0);
    const reference = String(formData.get("reference") ?? "").trim();
    const payerPhone = String(formData.get("payerPhone") ?? "").trim();

    if (!sendArtLater && artFiles.length === 0) {
      setMessageTone("error");
      setMessage("Sube el arte digital o marca que lo enviaras despues.");
      return;
    }

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
    formData.set("artIntent", sendArtLater ? "later" : "now");

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
        <CheckoutHeader />

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
                Tu carrito queda guardado. Al entrar podras revisar productos, subir el arte y registrar el pago movil antes de enviarlo a administracion.
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
              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.05)] sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Revision de pedido
                    </p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                      Productos del carrito
                    </h1>
                  </div>
                  <Link
                    href="/#catalogo"
                    className="inline-flex w-fit rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Seguir comprando
                  </Link>
                </div>
                <div className="mt-5 space-y-4">
                  {cartItems.map((item) => (
                    <ProductLine
                      key={item.key}
                      item={item}
                      onQuantityChange={changeQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.05)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Arte digital
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Adjunta el arte para acelerar la revision
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                  Puedes subir arte final, referencia o archivos comprimidos. Si aun no lo tienes, marca la opcion para enviarlo despues; el pedido quedara pendiente de arte.
                </p>
                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <label className="block cursor-pointer rounded-[1.35rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-slate-400 hover:bg-white">
                    <span className="block text-sm font-black text-slate-950">
                      Seleccionar archivos de arte
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      PDF, JPG, PNG, AI, PSD o ZIP. Maximo 20 MB por archivo.
                    </span>
                    <input
                      type="file"
                      name="artFiles"
                      multiple
                      className="sr-only"
                      disabled={sendArtLater}
                    />
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4">
                    <input
                      type="checkbox"
                      checked={sendArtLater}
                      onChange={(event) => setSendArtLater(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300"
                    />
                    <span>
                      <span className="block text-sm font-black text-slate-950">
                        Enviare el arte despues
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Administracion vera el pedido como pendiente de arte.
                      </span>
                    </span>
                  </label>
                </div>
                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Notas para produccion: medidas, cambios de texto, colores, indicaciones de entrega..."
                  className="mt-4 w-full resize-none rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </section>
            </div>

            <aside className="space-y-5 xl:sticky xl:top-5">
              {message ? <MessageBox message={message} tone={messageTone} /> : null}

              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.08)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Resumen y pago
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Metodo de pago
                </h2>
                <div className="mt-5 space-y-3 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-500">Productos</span>
                    <span className="text-sm font-black text-slate-950">{cartItems.length}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-500">Unidades</span>
                    <span className="text-sm font-black text-slate-950">{totalUnits}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-slate-500">Total a cancelar</span>
                      <span className="text-3xl font-black text-slate-950">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.35rem] border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-black text-amber-950">Pago movil</p>
                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    Realiza el pago movil por el total indicado y registra los datos para que administracion pueda validarlo antes de producir.
                  </p>
                </div>

                <div className="mt-5 grid gap-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="amount"
                    defaultValue={subtotal.toFixed(2)}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                    placeholder="Monto pagado"
                  />
                  <input
                    type="text"
                    name="bank"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                    placeholder="Banco emisor"
                  />
                  <input
                    type="tel"
                    name="payerPhone"
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                    placeholder="Telefono emisor"
                  />
                  <input
                    type="text"
                    name="reference"
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                    placeholder="Referencia del pago"
                  />
                  <label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white">
                    Adjuntar comprobante
                    <span className="mt-1 block text-xs font-medium text-slate-500">
                      Opcional, recomendado
                    </span>
                    <input type="file" name="proofFile" className="sr-only" />
                  </label>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 w-full cursor-pointer rounded-2xl bg-[#ffd45f] px-5 py-4 text-sm font-black text-slate-950 transition hover:bg-[#ffcd41] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Enviando pedido..." : "Enviar pedido a revision"}
                  </button>
                </div>
                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  Una sola orden agrupara todos los productos de este carrito.
                </p>
              </section>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
