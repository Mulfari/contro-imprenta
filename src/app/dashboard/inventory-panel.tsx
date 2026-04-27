import { storefrontProducts } from "@/app/storefront-data";
import type { OrderWithClient } from "@/lib/business";

type InventoryPanelProps = {
  orders: OrderWithClient[];
};

const materialFamilies = [
  {
    label: "Papeles premium",
    keywords: ["tarjeta", "invitacion", "papel", "opalina", "lino"],
    hint: "Cartulinas, opalina, lino y papeles especiales.",
  },
  {
    label: "Adhesivos y viniles",
    keywords: ["sticker", "etiqueta", "adhesivo", "vinil", "packaging"],
    hint: "Vinil blanco, transparente, papel adhesivo y laminados.",
  },
  {
    label: "Gran formato",
    keywords: ["pendon", "afiche", "roll up", "lona", "banner"],
    hint: "Lona, banner premium, vinil y estructuras roll up.",
  },
  {
    label: "Autocopiativos",
    keywords: ["talonario", "recibo", "factura", "copia"],
    hint: "Papel autocopiativo, numeracion y juegos de copias.",
  },
];

function normalize(value: string | null | undefined) {
  return (value ?? "").toLowerCase();
}

function matchesKeywords(order: OrderWithClient, keywords: string[]) {
  const haystack = [
    order.title,
    order.product_type,
    order.description ?? "",
    order.material ?? "",
    order.size ?? "",
    order.lamination_finish ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return keywords.some((keyword) => haystack.includes(keyword));
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Por definir";
  }

  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function InventoryMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[1.45rem] border border-slate-200 bg-white px-5 py-4 shadow-[0_16px_34px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{helper}</p>
    </div>
  );
}

export function InventoryPanel({ orders }: InventoryPanelProps) {
  const activeOrders = orders.filter(
    (order) => order.status !== "entregado" && order.status !== "rechazado",
  );
  const pendingMaterialOrders = activeOrders.filter(
    (order) => !order.material && !order.size && !order.lamination_finish,
  );
  const storefrontOrders = activeOrders.filter((order) => order.source === "storefront");
  const productionOrders = activeOrders.filter((order) =>
    ["disenando", "imprimiendo", "listo"].includes(order.status),
  );
  const estimatedActiveValue = activeOrders.reduce(
    (sum, order) => sum + Number(order.total_amount ?? 0),
    0,
  );

  const familyDemand = materialFamilies.map((family) => {
    const relatedOrders = activeOrders.filter((order) =>
      matchesKeywords(order, family.keywords),
    );

    return {
      ...family,
      orders: relatedOrders,
      quantity: relatedOrders.reduce((sum, order) => sum + order.quantity, 0),
    };
  });

  const catalogReadiness = storefrontProducts.map((product) => {
    const relatedOrders = activeOrders.filter((order) => {
      const haystack = [
        normalize(order.title),
        normalize(order.product_type),
        normalize(order.description),
      ].join(" ");

      return (
        haystack.includes(product.title.toLowerCase()) ||
        haystack.includes(product.category.toLowerCase())
      );
    });

    return {
      product,
      activeOrders: relatedOrders.length,
      quantity: relatedOrders.reduce((sum, order) => sum + order.quantity, 0),
    };
  });

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Inventario operativo
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Materiales, demanda y catalogo vendible
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Esta vista cruza pedidos activos con el catalogo publico para saber que preparar antes de pasar a produccion.
            </p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            Listo para operar
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InventoryMetric
            label="Pedidos activos"
            value={String(activeOrders.length)}
            helper={`${productionOrders.length} ya estan en produccion.`}
          />
          <InventoryMetric
            label="Pedidos web"
            value={String(storefrontOrders.length)}
            helper="Ordenes creadas desde el carrito."
          />
          <InventoryMetric
            label="Sin especificacion"
            value={String(pendingMaterialOrders.length)}
            helper="Revisar material, medida o acabado."
          />
          <InventoryMetric
            label="Valor activo"
            value={formatCurrency(estimatedActiveValue)}
            helper="Total estimado de trabajos abiertos."
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-6">
          <h3 className="text-xl font-black text-slate-950">Materiales por preparar</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Prioriza compras y preparacion segun los pedidos abiertos.
          </p>
          <div className="mt-5 space-y-3">
            {familyDemand.map((family) => (
              <div
                key={family.label}
                className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-slate-950">{family.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{family.hint}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                    {family.orders.length} pedido{family.orders.length === 1 ? "" : "s"} - {family.quantity} unidad{family.quantity === 1 ? "" : "es"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-6">
          <h3 className="text-xl font-black text-slate-950">Productos del catalogo</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Todos los productos publicados deben tener precio base, imagen y opciones listas para vender.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {catalogReadiness.map(({ product, activeOrders, quantity }) => (
              <div
                key={product.id}
                className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">{product.title}</p>
                    <p className="mt-1 text-xs font-semibold uppercase text-slate-400">
                      {product.category}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700">
                    {product.price}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {activeOrders} pedido{activeOrders === 1 ? "" : "s"} activo{activeOrders === 1 ? "" : "s"} - {quantity} unidad{quantity === 1 ? "" : "es"} comprometida{quantity === 1 ? "" : "s"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.options.map((option) => (
                    <span
                      key={option.name}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {option.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
