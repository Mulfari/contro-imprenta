import Link from "next/link";

import { OrderFilesPanel } from "@/app/dashboard/order-files-panel";
import type {
  OrderHistoryEntry,
  OrderPriority,
  OrderStatus,
  OrderUrgency,
  OrderWithClient,
  PaymentStatus,
} from "@/lib/business";
import type { OrderFile } from "@/lib/order-files";
import type { AppUser } from "@/lib/users";

type OrdersPanelProps = {
  clients: { id: string; name: string }[];
  users: AppUser[];
  activeStatus: string;
  orderQuery: string;
  filteredOrders: OrderWithClient[];
  orderSummary: {
    total: number;
    active: number;
    ready: number;
    delivered: number;
  };
  orderFilesByOrderId: Map<string, OrderFile[]>;
  orderHistoryByOrderId: Map<string, OrderHistoryEntry[]>;
  createAction: (formData: FormData) => void | Promise<void>;
  updateStatusAction: (formData: FormData) => void | Promise<void>;
  deleteOrderFileAction: (formData: FormData) => void | Promise<void>;
  isAdmin: boolean;
};

const orderStatuses: OrderStatus[] = [
  "recibido",
  "disenando",
  "imprimiendo",
  "listo",
  "entregado",
];

const paymentStatuses: PaymentStatus[] = [
  "pendiente",
  "anticipo",
  "pagado",
  "credito",
];

const priorities: OrderPriority[] = ["baja", "media", "alta", "urgente"];
const urgencies: OrderUrgency[] = ["normal", "prioritaria", "express"];
const branches = ["5 de julio", "las americas"];
const productTypes = [
  "Banner",
  "Sticker",
  "Flyer",
  "Tarjeta",
  "Factura",
  "Lona",
  "Vinil",
  "Talonario",
  "Pendon",
  "Etiqueta",
];
const areas = ["Ventas", "Diseno", "Preprensa", "Impresion", "Acabados", "Entrega"];
const paymentMethods = [
  "Efectivo",
  "Pago movil",
  "Transferencia",
  "Punto de venta",
  "Zelle",
  "Credito",
];

const orderStatusLabels: Record<OrderStatus, string> = {
  recibido: "Recibido",
  disenando: "Diseno",
  imprimiendo: "Impresion",
  listo: "Listo",
  entregado: "Entregado",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  pendiente: "Pendiente",
  anticipo: "Con anticipo",
  pagado: "Pagado",
  credito: "Credito",
};

const priorityLabels: Record<OrderPriority, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

const urgencyLabels: Record<OrderUrgency, string> = {
  normal: "Normal",
  prioritaria: "Prioritaria",
  express: "Express",
};

function buildOrdersUrl(status: string, query: string) {
  const params = new URLSearchParams({ view: "pedidos", status });

  if (query.trim()) {
    params.set("orderQuery", query.trim());
  }

  return `/dashboard?${params.toString()}`;
}

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

function formatDueDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatDateTime(value: string) {
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

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 whitespace-pre-line break-words text-sm font-medium leading-6 text-slate-800">
        {value}
      </p>
    </div>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function StatusBadge({
  label,
  tone = "slate",
}: {
  label: string;
  tone?: "slate" | "blue" | "amber" | "emerald";
}) {
  const toneClass =
    tone === "blue"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : tone === "emerald"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {label}
    </span>
  );
}

export function OrdersPanel(props: OrdersPanelProps) {
  const {
    clients,
    users,
    activeStatus,
    orderQuery,
    filteredOrders,
    orderSummary,
    orderFilesByOrderId,
    orderHistoryByOrderId,
    createAction,
    updateStatusAction,
    deleteOrderFileAction,
    isAdmin,
  } = props;

  return (
    <section className="grid gap-4 sm:gap-6 xl:grid-cols-[0.95fr_1.25fr]">
      <article className="rounded-[1.4rem] border border-slate-200 bg-white/90 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Nueva orden</h2>
            <p className="mt-2 text-sm text-slate-500">
              Registra el trabajo con sus datos de cliente, operacion, cobro y control interno.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</p>
              <p className="mt-2 text-2xl font-semibold">{orderSummary.total}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Activos</p>
              <p className="mt-2 text-2xl font-semibold">{orderSummary.active}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Listos</p>
              <p className="mt-2 text-2xl font-semibold">{orderSummary.ready}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Entregados</p>
              <p className="mt-2 text-2xl font-semibold">{orderSummary.delivered}</p>
            </div>
          </div>
        </div>

        <form action={createAction} className="mt-6 space-y-6">
          <section className="space-y-4 rounded-[1.3rem] border border-slate-200 bg-slate-50/90 p-4 sm:rounded-[1.6rem] sm:p-5">
            <SectionTitle
              title="Datos del trabajo"
              description="Estos datos son visibles para produccion y ayudan a identificar rapido lo que se debe fabricar."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-600" htmlFor="order-client">
                  Cliente
                </label>
                <select
                  id="order-client"
                  name="clientId"
                  required
                  defaultValue=""
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="" disabled>
                    Selecciona un cliente
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-600" htmlFor="productType">
                  Tipo de producto
                </label>
                <select
                  id="productType"
                  name="productType"
                  required
                  defaultValue=""
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="" disabled>
                    Selecciona un producto
                  </option>
                  {productTypes.map((productType) => (
                    <option key={productType} value={productType}>
                      {productType}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-600" htmlFor="quantity">
                  Cantidad
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-600" htmlFor="measurements">
                  Medidas
                </label>
                <input
                  id="measurements"
                  name="measurements"
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Ej. 90 x 120 cm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="material"
                type="text"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Material"
              />
              <input
                name="laminationFinish"
                type="text"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Laminado o acabado"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="colorProfile"
                type="text"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Colorimetria si aplica"
              />
              <select
                name="urgency"
                defaultValue="normal"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {urgencies.map((urgency) => (
                  <option key={urgency} value={urgency}>
                    {urgencyLabels[urgency]}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              name="description"
              required
              className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Descripcion libre del trabajo"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="includesDesign"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Diseno incluido
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="includesInstallation"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Instalacion incluida
              </label>
            </div>
          </section>

          <section className="space-y-4 rounded-[1.3rem] border border-slate-200 bg-slate-50/90 p-4 sm:rounded-[1.6rem] sm:p-5">
            <SectionTitle
              title="Datos comerciales"
              description="Aqui va todo lo relacionado con la cotizacion y el estado de pago del trabajo."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="quotedPrice"
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Precio cotizado"
              />
              <input
                name="discountAmount"
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Descuento"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="totalAmount"
                type="number"
                min="0"
                step="0.01"
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Total"
              />
              <input
                name="depositAmount"
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Anticipo"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <select
                name="paymentMethod"
                defaultValue=""
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Metodo de pago</option>
                {paymentMethods.map((paymentMethod) => (
                  <option key={paymentMethod} value={paymentMethod}>
                    {paymentMethod}
                  </option>
                ))}
              </select>

              <select
                name="paymentStatus"
                defaultValue="pendiente"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {paymentStatuses.map((paymentStatus) => (
                  <option key={paymentStatus} value={paymentStatus}>
                    {paymentStatusLabels[paymentStatus]}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="space-y-4 rounded-[1.3rem] border border-slate-200 bg-slate-50/90 p-4 sm:rounded-[1.6rem] sm:p-5">
            <SectionTitle
              title="Datos operativos"
              description="Estos datos son internos y ayudan a produccion a mover la orden por el area correcta."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-600" htmlFor="promisedDeliveryAt">
                  Fecha promesa de entrega
                </label>
                <input
                  id="promisedDeliveryAt"
                  name="promisedDeliveryAt"
                  type="date"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <select
                name="priority"
                defaultValue="media"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    Prioridad {priorityLabels[priority]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <select
                name="currentArea"
                required
                defaultValue=""
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="" disabled>
                  Area actual
                </option>
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>

              <select
                name="currentOwner"
                defaultValue=""
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Responsable actual</option>
                {users.map((user) => (
                  <option key={user.id} value={user.display_name}>
                    {user.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <select
                name="status"
                defaultValue="recibido"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    Estado {orderStatusLabels[status]}
                  </option>
                ))}
              </select>

              <select
                name="branch"
                defaultValue=""
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Sucursal o punto de entrega</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              name="internalNotes"
              className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Notas internas"
            />
          </section>

          <button
            type="submit"
            className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Crear orden
          </button>
        </form>
      </article>

      <article className="rounded-[1.4rem] border border-slate-200 bg-white/90 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Ordenes registradas</h2>
              <p className="mt-2 text-sm text-slate-500">
                Busca por numero, cliente o responsable y revisa el historial de cada trabajo.
              </p>
            </div>

            <form action="/dashboard" className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <input type="hidden" name="view" value="pedidos" />
              <input type="hidden" name="status" value={activeStatus} />
              <input
                name="orderQuery"
                defaultValue={orderQuery}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Buscar por numero, cliente, producto o responsable"
              />
              <button
                type="submit"
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Buscar
              </button>
            </form>
          </div>

          <div className="flex flex-wrap gap-2">
            {["todos", ...orderStatuses].map((status) => {
              const isActive = activeStatus === status;
              const label =
                status === "todos" ? "Todos" : orderStatusLabels[status as OrderStatus];

              return (
                <Link
                  key={status}
                  href={buildOrdersUrl(status, orderQuery)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
              No hay ordenes para este filtro.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const historyEntries = orderHistoryByOrderId.get(order.id) ?? [];
              const orderFiles = orderFilesByOrderId.get(order.id) ?? [];

              return (
                <article
                  key={order.id}
                className="rounded-[1.3rem] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:rounded-[1.6rem] sm:p-5"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge label={order.order_number} tone="blue" />
                          <StatusBadge label={orderStatusLabels[order.status]} />
                          <StatusBadge
                            label={paymentStatusLabels[order.payment_status]}
                            tone={order.payment_status === "pagado" ? "emerald" : "amber"}
                          />
                        </div>

                        <h3 className="mt-3 text-xl font-semibold text-slate-950">
                          {order.product_type}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Cliente: {order.client?.name ?? "Sin cliente"} · Cantidad {order.quantity}
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <DataItem label="Datos del cliente" value={order.client?.name ?? "Sin cliente"} />
                        <DataItem
                          label="Trabajo"
                          value={order.description ?? "Sin descripcion"}
                        />
                        <DataItem
                          label="Produccion"
                          value={[
                            order.measurements ? `Medidas: ${order.measurements}` : null,
                            order.material ? `Material: ${order.material}` : null,
                            order.lamination_finish ? `Acabado: ${order.lamination_finish}` : null,
                            order.color_profile ? `Colorimetria: ${order.color_profile}` : null,
                          ].filter(Boolean).join("\n") || "Sin datos"}
                        />
                        <DataItem
                          label="Datos comerciales"
                          value={[
                            `Cotizado: ${formatCurrency(order.quoted_price)}`,
                            `Descuento: ${formatCurrency(order.discount_amount)}`,
                            `Total: ${formatCurrency(order.total_amount)}`,
                            `Anticipo: ${formatCurrency(order.deposit_amount)}`,
                            `Saldo: ${formatCurrency(order.pending_amount)}`,
                          ].join("\n")}
                        />
                        <DataItem
                          label="Datos operativos"
                          value={[
                            `Entrega: ${formatDueDate(order.promised_delivery_at)}`,
                            `Prioridad: ${priorityLabels[order.priority]}`,
                            `Urgencia: ${urgencyLabels[order.urgency]}`,
                            `Area: ${order.current_area ?? "Sin area"}`,
                            `Responsable: ${order.current_owner ?? "Sin responsable"}`,
                            `Sucursal: ${order.branch ?? "Sin punto de entrega"}`,
                          ].join("\n")}
                        />
                        <DataItem
                          label="Extras"
                          value={[
                            `Diseno: ${order.includes_design ? "Incluido" : "No incluido"}`,
                            `Instalacion: ${order.includes_installation ? "Incluida" : "No incluida"}`,
                            `Metodo de pago: ${order.payment_method ?? "Sin definir"}`,
                            `Creada: ${formatDateTime(order.created_at)}`,
                          ].join("\n")}
                        />
                      </div>

                      {order.internal_notes ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                            Notas internas
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {order.internal_notes}
                          </p>
                        </div>
                      ) : null}

                      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                        <h4 className="text-sm font-semibold text-slate-900">Adjuntos</h4>
                        <p className="mt-1 text-xs text-slate-500">
                          Artes del cliente, prueba aprobada, referencias y comprobantes.
                        </p>
                        <div className="mt-4">
                          <OrderFilesPanel
                            orderId={order.id}
                            files={orderFiles}
                            isAdmin={isAdmin}
                            deleteAction={deleteOrderFileAction}
                          />
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                        <h4 className="text-sm font-semibold text-slate-900">Historial de cambios</h4>
                        <div className="mt-4 space-y-3">
                          {historyEntries.length === 0 ? (
                            <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
                              Aun no hay movimientos registrados en esta orden.
                            </p>
                          ) : (
                            historyEntries.slice(0, 6).map((historyEntry) => (
                              <div
                                key={historyEntry.id}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <p className="text-sm font-medium text-slate-900">
                                    {historyEntry.detail}
                                  </p>
                                  <span className="text-xs text-slate-500">
                                    {formatDateTime(historyEntry.created_at)}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <form
                      action={updateStatusAction}
                      className="flex w-full flex-col gap-3 rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4 sm:rounded-[1.5rem] xl:sticky xl:top-5 xl:min-w-[250px]"
                    >
                      <input type="hidden" name="orderId" value={order.id} />
                      <input type="hidden" name="activeStatus" value={activeStatus} />
                      <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Estado actual
                      </label>
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {orderStatusLabels[status]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        Actualizar estado
                      </button>
                    </form>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </article>
    </section>
  );
}
