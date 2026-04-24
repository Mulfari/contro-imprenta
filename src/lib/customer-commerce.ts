import {
  createOrderHistoryEntry,
  createOrderNumber,
  type Order,
} from "@/lib/business";
import { listOrderFiles, uploadOrderFile, type OrderFile } from "@/lib/order-files";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type StorefrontCheckoutItem = {
  productId: string;
  title: string;
  productType: string;
  quantity: number;
  unitPrice: number;
  options: Record<string, string>;
};

export type OrderPaymentStatus = "por_validar" | "aprobado" | "rechazado";

export type OrderPayment = {
  id: string;
  order_id: string;
  customer_user_id: string | null;
  amount: number;
  method: string;
  bank: string | null;
  payer_phone: string | null;
  reference: string | null;
  status: OrderPaymentStatus;
  proof_file_id: string | null;
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type CustomerDashboardOrder = Order & {
  files: OrderFile[];
  payments: OrderPayment[];
};

export type AdminPayment = OrderPayment & {
  order: Pick<
    Order,
    "id" | "order_number" | "title" | "total_amount" | "pending_amount" | "payment_status"
  > | null;
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
  proof_file: OrderFile | null;
};

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function parseAmount(value: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Escribe un monto valido.");
  }

  return parsed;
}

function addBusinessDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatOptions(options: Record<string, string>) {
  const entries = Object.entries(options).filter(([, value]) => value);

  if (entries.length === 0) {
    return "Sin opciones seleccionadas.";
  }

  return entries.map(([key, value]) => `${key}: ${value}`).join("\n");
}

async function ensureCustomerClient(input: {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
}) {
  const supabase = createSupabaseAdminClient();

  const { data: existingClient, error: existingError } = await supabase
    .from("clients")
    .select("*")
    .eq("customer_user_id", input.userId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingClient) {
    return existingClient as { id: string; name: string };
  }

  const fallbackName =
    normalizeText(input.fullName) || normalizeText(input.email) || "Cliente storefront";

  const { data, error } = await supabase
    .from("clients")
    .insert({
      customer_user_id: input.userId,
      name: fallbackName,
      email: normalizeText(input.email) || null,
      phone: normalizeText(input.phone) || null,
      notes: "Cliente creado automaticamente desde el storefront.",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as { id: string; name: string };
}

export async function createStorefrontCheckout(input: {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  notes: string;
  items: StorefrontCheckoutItem[];
}) {
  if (input.items.length === 0) {
    throw new Error("Agrega al menos un producto al carrito.");
  }

  const client = await ensureCustomerClient(input);
  const supabase = createSupabaseAdminClient();
  const createdOrders: Order[] = [];

  for (const item of input.items) {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    const totalAmount = unitPrice * quantity;
    const orderNumber = await createOrderNumber();
    const description = [
      `Pedido web creado desde carrito.`,
      `Producto: ${item.title}`,
      `Opciones:\n${formatOptions(item.options)}`,
      normalizeText(input.notes) ? `Notas del cliente: ${normalizeText(input.notes)}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const { data, error } = await supabase
      .from("orders")
      .insert({
        client_id: client.id,
        customer_user_id: input.userId,
        order_number: orderNumber,
        title: item.title,
        product_type: item.productType || item.title,
        description,
        quantity,
        material: item.options.Material ?? null,
        size: item.options.Tamano ?? item.options.Medida ?? null,
        lamination_finish: item.options.Acabado ?? null,
        includes_design: false,
        includes_installation: false,
        urgency: "normal",
        branch: null,
        quoted_price: unitPrice || null,
        discount_amount: null,
        total_amount: totalAmount || null,
        deposit_amount: 0,
        pending_amount: totalAmount || null,
        payment_method: "Pago movil",
        payment_status: "pendiente",
        payment_review_status: "sin_pago",
        confirmation_status: "pendiente",
        promised_delivery_at: addBusinessDays(5),
        priority: "media",
        current_area: "Caja",
        status: "recibido",
        source: "storefront",
        internal_notes: "Esperando arte digital y validacion de pago movil.",
      })
      .select("*")
      .single<Order>();

    if (error) {
      throw error;
    }

    await createOrderHistoryEntry({
      orderId: data.id,
      detail: `Pedido web ${orderNumber} creado por el cliente. Pendiente por validar pago movil.`,
      eventType: "storefront",
      changedBy: null,
    });

    createdOrders.push(data);
  }

  return createdOrders;
}

export async function getCustomerDashboard(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, client_id, customer_user_id, order_number, title, product_type, description, quantity, measurements, material, size, lamination_finish, color_profile, includes_design, includes_installation, urgency, branch, quoted_price, discount_amount, total_amount, deposit_amount, pending_amount, payment_method, payment_status, payment_review_status, confirmation_status, source, promised_delivery_at, priority, current_owner, current_area, due_date, status, internal_notes, created_at, created_by",
    )
    .eq("customer_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const orders = (data ?? []) as Order[];
  const orderIds = orders.map((order) => order.id);
  const files = await listOrderFiles(orderIds);
  const payments = await listPaymentsForOrders(orderIds);

  return orders.map((order) => ({
    ...order,
    files: files.filter((file) => file.order_id === order.id),
    payments: payments.filter((payment) => payment.order_id === order.id),
  })) satisfies CustomerDashboardOrder[];
}

async function listPaymentsForOrders(orderIds: string[]) {
  if (orderIds.length === 0) {
    return [] as OrderPayment[];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("order_payments")
    .select("*")
    .in("order_id", orderIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as OrderPayment[];
}

export async function uploadCustomerOrderFile(input: {
  userId: string;
  orderId: string;
  file: File;
  attachmentType: "arte_cliente" | "comprobante_pago";
}) {
  await assertCustomerOwnsOrder(input.userId, input.orderId);

  return uploadOrderFile({
    orderId: input.orderId,
    attachmentType: input.attachmentType,
    file: input.file,
    customerUploadedBy: input.userId,
  });
}

export async function createCustomerPayment(input: {
  userId: string;
  orderId: string;
  amount: string;
  bank: string;
  payerPhone: string;
  reference: string;
  notes: string;
  proofFile?: File | null;
}) {
  await assertCustomerOwnsOrder(input.userId, input.orderId);
  const supabase = createSupabaseAdminClient();
  const amount = parseAmount(input.amount);
  let proofFileId: string | null = null;

  if (input.proofFile && input.proofFile.size > 0) {
    const uploadedFile = await uploadCustomerOrderFile({
      userId: input.userId,
      orderId: input.orderId,
      file: input.proofFile,
      attachmentType: "comprobante_pago",
    });
    proofFileId = uploadedFile.id;
  }

  const { data, error } = await supabase
    .from("order_payments")
    .insert({
      order_id: input.orderId,
      customer_user_id: input.userId,
      amount,
      method: "pago_movil",
      bank: normalizeText(input.bank) || null,
      payer_phone: normalizeText(input.payerPhone) || null,
      reference: normalizeText(input.reference) || null,
      notes: normalizeText(input.notes) || null,
      proof_file_id: proofFileId,
      status: "por_validar",
    })
    .select("*")
    .single<OrderPayment>();

  if (error) {
    throw error;
  }

  await supabase
    .from("orders")
    .update({
      payment_review_status: "por_validar",
      payment_method: "Pago movil",
    })
    .eq("id", input.orderId);

  await createOrderHistoryEntry({
    orderId: input.orderId,
    detail: `Pago movil registrado por el cliente por $${amount}. Pendiente por validar.`,
    eventType: "pago",
    changedBy: null,
  });

  return data;
}

async function assertCustomerOwnsOrder(userId: string, orderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .eq("customer_user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("No se encontro este pedido en tu cuenta.");
  }
}

export async function listAdminPayments() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("order_payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const payments = (data ?? []) as OrderPayment[];
  const orderIds = [...new Set(payments.map((payment) => payment.order_id))];
  const proofFileIds = [
    ...new Set(payments.map((payment) => payment.proof_file_id).filter(Boolean)),
  ] as string[];

  const { data: ordersData, error: ordersError } =
    orderIds.length > 0
      ? await supabase
          .from("orders")
          .select("id, client_id, order_number, title, total_amount, pending_amount, payment_status")
          .in("id", orderIds)
      : { data: [], error: null };

  if (ordersError) {
    throw ordersError;
  }

  const orders = (ordersData ?? []) as Array<
    Pick<Order, "id" | "client_id" | "order_number" | "title" | "total_amount" | "pending_amount" | "payment_status">
  >;
  const clientIds = [...new Set(orders.map((order) => order.client_id).filter(Boolean))];

  const { data: clientsData, error: clientsError } =
    clientIds.length > 0
      ? await supabase
          .from("clients")
          .select("id, name, email, phone")
          .in("id", clientIds)
      : { data: [], error: null };

  if (clientsError) {
    throw clientsError;
  }

  const proofFiles = proofFileIds.length > 0 ? await listOrderFiles(orderIds) : [];
  const ordersById = new Map(orders.map((order) => [order.id, order]));
  const clientsById = new Map(
    (clientsData ?? []).map((client) => [
      client.id as string,
      client as { id: string; name: string; email: string | null; phone: string | null },
    ]),
  );
  const filesById = new Map(proofFiles.map((file) => [file.id, file]));

  return payments.map((payment) => {
    const order = ordersById.get(payment.order_id) ?? null;
    return {
      ...payment,
      order,
      client: order ? clientsById.get(order.client_id) ?? null : null,
      proof_file: payment.proof_file_id
        ? filesById.get(payment.proof_file_id) ?? null
        : null,
    };
  }) satisfies AdminPayment[];
}

export async function reviewOrderPayment(input: {
  paymentId: string;
  status: "aprobado" | "rechazado";
  reviewedBy: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { data: payment, error: paymentError } = await supabase
    .from("order_payments")
    .select("*")
    .eq("id", input.paymentId)
    .single<OrderPayment>();

  if (paymentError) {
    throw paymentError;
  }

  const { error } = await supabase
    .from("order_payments")
    .update({
      status: input.status,
      reviewed_by: input.reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", input.paymentId);

  if (error) {
    throw error;
  }

  const payments = await listPaymentsForOrders([payment.order_id]);
  const approvedTotal = payments.reduce((sum, item) => {
    if (item.id === input.paymentId) {
      return sum + (input.status === "aprobado" ? Number(item.amount) : 0);
    }

    return sum + (item.status === "aprobado" ? Number(item.amount) : 0);
  }, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, total_amount")
    .eq("id", payment.order_id)
    .single<{ id: string; total_amount: number | null }>();

  if (orderError) {
    throw orderError;
  }

  const totalAmount = Number(order.total_amount ?? 0);
  const pendingAmount = Math.max(0, totalAmount - approvedTotal);
  const hasPendingPayments = payments.some((item) =>
    item.id === input.paymentId
      ? false
      : item.status === "por_validar",
  );

  await supabase
    .from("orders")
    .update({
      deposit_amount: approvedTotal,
      pending_amount: pendingAmount,
      payment_status:
        approvedTotal <= 0 ? "pendiente" : pendingAmount <= 0 ? "pagado" : "anticipo",
      payment_review_status:
        input.status === "rechazado" && approvedTotal <= 0 && !hasPendingPayments
          ? "rechazado"
          : hasPendingPayments
            ? "por_validar"
            : approvedTotal > 0
              ? "validado"
              : "sin_pago",
      confirmation_status:
        approvedTotal > 0 && pendingAmount <= 0 ? "confirmado" : "pendiente",
      current_area:
        approvedTotal > 0 && pendingAmount <= 0 ? "Ventas" : "Caja",
    })
    .eq("id", payment.order_id);

  await createOrderHistoryEntry({
    orderId: payment.order_id,
    detail:
      input.status === "aprobado"
        ? `Pago movil aprobado por $${payment.amount}.`
        : `Pago movil rechazado por $${payment.amount}.`,
    eventType: "pago",
    changedBy: input.reviewedBy,
  });
}
