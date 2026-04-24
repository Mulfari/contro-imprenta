import type { AdminPayment } from "@/lib/customer-commerce";

type PaymentsPanelProps = {
  payments: AdminPayment[];
  reviewAction: (formData: FormData) => void | Promise<void>;
};

const paymentStatusLabels: Record<AdminPayment["status"], string> = {
  por_validar: "Por aceptar",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
};

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Sin monto";
  }

  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function PaymentsPanel({ payments, reviewAction }: PaymentsPanelProps) {
  const pendingPayments = payments.filter((payment) => payment.status === "por_validar");
  const reviewedPayments = payments.filter((payment) => payment.status !== "por_validar");

  return (
    <section className="grid gap-6">
      <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Pagos por aceptar</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Valida pagos moviles enviados por clientes antes de mover el pedido a produccion.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-600">Pendientes</p>
              <p className="mt-2 text-2xl font-semibold text-amber-900">{pendingPayments.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{payments.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {pendingPayments.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
              No hay pagos pendientes por validar.
            </div>
          ) : (
            pendingPayments.map((payment) => (
              <article
                key={payment.id}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
              >
                <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        {paymentStatusLabels[payment.status]}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                        {formatDate(payment.created_at)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-slate-950">
                      {payment.client?.name ?? "Cliente storefront"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {payment.order?.order_number ?? "Sin numero"} - {payment.order?.title ?? "Pedido"}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Monto</p>
                        <p className="mt-2 font-semibold text-slate-950">{formatCurrency(Number(payment.amount))}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Banco</p>
                        <p className="mt-2 font-semibold text-slate-950">{payment.bank || "Sin dato"}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Telefono</p>
                        <p className="mt-2 font-semibold text-slate-950">{payment.payer_phone || "Sin dato"}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Referencia</p>
                        <p className="mt-2 font-semibold text-slate-950">{payment.reference || "Sin dato"}</p>
                      </div>
                    </div>

                    {payment.proof_file?.signed_url ? (
                      <a
                        href={payment.proof_file.signed_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Ver comprobante
                      </a>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 xl:min-w-[13rem]">
                    <form action={reviewAction}>
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <input type="hidden" name="status" value="aprobado" />
                      <button
                        type="submit"
                        className="w-full cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Aprobar pago
                      </button>
                    </form>
                    <form action={reviewAction}>
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <input type="hidden" name="status" value="rechazado" />
                      <button
                        type="submit"
                        className="w-full cursor-pointer rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        Rechazar
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </article>

      <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
        <h2 className="text-xl font-semibold text-slate-950">Historial de pagos</h2>
        <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-slate-200">
          {reviewedPayments.length === 0 ? (
            <div className="bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
              Aun no hay pagos revisados.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {reviewedPayments.slice(0, 12).map((payment) => (
                <div key={payment.id} className="grid gap-3 bg-white px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {payment.client?.name ?? "Cliente"} - {formatCurrency(Number(payment.amount))}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {payment.order?.order_number ?? "Sin numero"} - {formatDate(payment.created_at)}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    payment.status === "aprobado"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}>
                    {paymentStatusLabels[payment.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    </section>
  );
}
