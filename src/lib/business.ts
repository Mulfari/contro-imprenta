import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type Client = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  document_id: string | null;
  address: string | null;
  preferred_branch: string | null;
  reference_files: string | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
};

export type OrderStatus =
  | "recibido"
  | "disenando"
  | "imprimiendo"
  | "listo"
  | "entregado"
  | "rechazado";

export type PaymentStatus =
  | "pendiente"
  | "anticipo"
  | "pagado"
  | "credito";

export type PaymentReviewStatus =
  | "sin_pago"
  | "por_validar"
  | "validado"
  | "rechazado";

export type OrderConfirmationStatus =
  | "pendiente"
  | "confirmado"
  | "rechazado";

export type OrderPriority = "baja" | "media" | "alta" | "urgente";

export type OrderUrgency = "normal" | "prioritaria" | "express";

export type OrderAttachmentType =
  | "arte_cliente"
  | "prueba_aprobada"
  | "imagen_referencia"
  | "comprobante_pago";

export type Order = {
  id: string;
  client_id: string;
  customer_user_id: string | null;
  order_number: string;
  title: string;
  product_type: string;
  description: string | null;
  quantity: number;
  measurements: string | null;
  material: string | null;
  size: string | null;
  lamination_finish: string | null;
  color_profile: string | null;
  includes_design: boolean;
  includes_installation: boolean;
  urgency: OrderUrgency;
  branch: string | null;
  quoted_price: number | null;
  discount_amount: number | null;
  total_amount: number | null;
  deposit_amount: number | null;
  pending_amount: number | null;
  payment_method: string | null;
  payment_status: PaymentStatus;
  payment_review_status: PaymentReviewStatus;
  confirmation_status: OrderConfirmationStatus;
  source: "admin" | "storefront";
  promised_delivery_at: string | null;
  priority: OrderPriority;
  current_owner: string | null;
  current_area: string | null;
  due_date: string | null;
  status: OrderStatus;
  rejected_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  internal_notes: string | null;
  created_at: string;
  created_by: string | null;
};

export type OrderWithClient = Order & {
  client: {
    id: string;
    name: string;
  } | null;
};

export type OrderHistoryEntry = {
  id: string;
  order_id: string;
  detail: string;
  event_type: string;
  created_at: string;
  changed_by: string | null;
};

function normalizeText(value: string) {
  return value.trim();
}

function parseCurrency(value: string) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Los montos deben ser valores validos.");
  }

  return parsed;
}

export async function createOrderNumber() {
  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  const nextSequence = String((count ?? 0) + 1).padStart(6, "0");
  return `EP-${nextSequence}`;
}

export async function createOrderHistoryEntry(input: {
  orderId: string;
  detail: string;
  eventType: string;
  changedBy?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("order_history").insert({
    order_id: input.orderId,
    detail: normalizeText(input.detail),
    event_type: normalizeText(input.eventType),
    changed_by: input.changedBy ?? null,
  });

  if (error) {
    throw error;
  }
}

export async function listOrderHistory(orderIds: string[]) {
  if (orderIds.length === 0) {
    return [] as OrderHistoryEntry[];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("order_history")
    .select("*")
    .in("order_id", orderIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as OrderHistoryEntry[];
}

export async function listClients() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Client[];
}

export async function createClient(input: {
  name: string;
  phone: string;
  email: string;
  documentId: string;
  address: string;
  preferredBranch: string;
  referenceFiles: string;
  notes: string;
  createdBy: string;
}) {
  const supabase = createSupabaseAdminClient();
  const name = normalizeText(input.name);
  const phone = normalizeText(input.phone);

  if (!name) {
    throw new Error("Escribe el nombre o razon social del cliente.");
  }

  if (!phone) {
    throw new Error("Escribe el telefono del cliente.");
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      name,
      phone,
      email: normalizeText(input.email) || null,
      document_id: normalizeText(input.documentId) || null,
      address: normalizeText(input.address) || null,
      preferred_branch: normalizeText(input.preferredBranch) || null,
      reference_files: normalizeText(input.referenceFiles) || null,
      notes: normalizeText(input.notes) || null,
      created_by: input.createdBy,
    })
    .select("*")
    .single<Client>();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateClient(input: {
  clientId: string;
  name: string;
  phone: string;
  email: string;
  documentId: string;
  address: string;
  preferredBranch: string;
  referenceFiles: string;
  notes: string;
}) {
  const supabase = createSupabaseAdminClient();
  const name = normalizeText(input.name);
  const phone = normalizeText(input.phone);

  if (!input.clientId) {
    throw new Error("No se pudo identificar el cliente.");
  }

  if (!name) {
    throw new Error("Escribe el nombre o razon social del cliente.");
  }

  if (!phone) {
    throw new Error("Escribe el telefono del cliente.");
  }

  const { data, error } = await supabase
    .from("clients")
    .update({
      name,
      phone,
      email: normalizeText(input.email) || null,
      document_id: normalizeText(input.documentId) || null,
      address: normalizeText(input.address) || null,
      preferred_branch: normalizeText(input.preferredBranch) || null,
      reference_files: normalizeText(input.referenceFiles) || null,
      notes: normalizeText(input.notes) || null,
    })
    .eq("id", input.clientId)
    .select("*")
    .single<Client>();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteClient(clientId: string) {
  const supabase = createSupabaseAdminClient();

  if (!clientId) {
    throw new Error("No se pudo identificar el cliente.");
  }

  const { error } = await supabase.from("clients").delete().eq("id", clientId);

  if (error) {
    throw error;
  }
}

export async function listOrders() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, client_id, customer_user_id, order_number, title, product_type, description, quantity, measurements, material, size, lamination_finish, color_profile, includes_design, includes_installation, urgency, branch, quoted_price, discount_amount, total_amount, deposit_amount, pending_amount, payment_method, payment_status, payment_review_status, confirmation_status, source, promised_delivery_at, priority, current_owner, current_area, due_date, status, rejected_by, rejected_at, rejection_reason, internal_notes, created_at, created_by",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const orders = (data ?? []) as Order[];
  const clientIds = [...new Set(orders.map((order) => order.client_id).filter(Boolean))];

  if (clientIds.length === 0) {
    return orders.map((order) => ({
      ...order,
      client: null,
    }));
  }

  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("id, name")
    .in("id", clientIds);

  if (clientsError) {
    throw clientsError;
  }

  const clientsById = new Map(
    (clients ?? []).map((client) => [client.id as string, client as { id: string; name: string }]),
  );

  return orders.map((order) => ({
    ...order,
    client: clientsById.get(order.client_id) ?? null,
  }));
}

export async function createOrder(input: {
  clientId: string;
  productType: string;
  description: string;
  quantity: string;
  measurements: string;
  material: string;
  laminationFinish: string;
  colorProfile: string;
  includesDesign: boolean;
  includesInstallation: boolean;
  urgency: OrderUrgency;
  branch: string;
  quotedPrice: string;
  discountAmount: string;
  totalAmount: string;
  depositAmount: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  promisedDeliveryAt: string;
  priority: OrderPriority;
  currentOwner: string;
  currentArea: string;
  status: OrderStatus;
  internalNotes: string;
  createdBy: string;
}) {
  const supabase = createSupabaseAdminClient();
  const productType = normalizeText(input.productType);
  const quantity = Number(input.quantity);
  const quotedPrice = parseCurrency(input.quotedPrice);
  const discountAmount = parseCurrency(input.discountAmount) ?? 0;
  const totalAmount = parseCurrency(input.totalAmount);
  const depositAmount = parseCurrency(input.depositAmount) ?? 0;
  const currentArea = normalizeText(input.currentArea);
  const promisedDeliveryAt = normalizeText(input.promisedDeliveryAt);

  if (!input.clientId) {
    throw new Error("Selecciona un cliente para el pedido.");
  }

  if (!productType) {
    throw new Error("Selecciona el tipo de producto.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("La cantidad debe ser mayor a 0.");
  }

  if (!promisedDeliveryAt) {
    throw new Error("Escribe la fecha promesa de entrega.");
  }

  if (!currentArea) {
    throw new Error("Selecciona el area actual del pedido.");
  }

  if (totalAmount === null) {
    throw new Error("Escribe el total del pedido.");
  }

  if (depositAmount > totalAmount) {
    throw new Error("El anticipo no puede ser mayor al total.");
  }

  const orderNumber = await createOrderNumber();
  const pendingAmount = Math.max(0, totalAmount - depositAmount);

  const { data, error } = await supabase
    .from("orders")
    .insert({
      client_id: input.clientId,
      source: "admin",
      payment_review_status: input.paymentStatus === "pagado" ? "validado" : "sin_pago",
      confirmation_status: "confirmado",
      order_number: orderNumber,
      title: productType,
      product_type: productType,
      description: normalizeText(input.description) || null,
      quantity,
      measurements: normalizeText(input.measurements) || null,
      material: normalizeText(input.material) || null,
      lamination_finish: normalizeText(input.laminationFinish) || null,
      color_profile: normalizeText(input.colorProfile) || null,
      includes_design: input.includesDesign,
      includes_installation: input.includesInstallation,
      urgency: input.urgency,
      branch: normalizeText(input.branch) || null,
      quoted_price: quotedPrice,
      discount_amount: discountAmount || null,
      total_amount: totalAmount,
      deposit_amount: depositAmount || null,
      pending_amount: pendingAmount,
      payment_method: normalizeText(input.paymentMethod) || null,
      payment_status: input.paymentStatus,
      promised_delivery_at: promisedDeliveryAt,
      priority: input.priority,
      current_owner: normalizeText(input.currentOwner) || null,
      current_area: currentArea,
      status: input.status,
      internal_notes: normalizeText(input.internalNotes) || null,
      created_by: input.createdBy,
    })
    .select("*")
    .single<Order>();

  if (error) {
    throw error;
  }

  await createOrderHistoryEntry({
    orderId: data.id,
    detail: `Orden ${orderNumber} creada para ${productType}. Estado inicial: ${input.status}.`,
    eventType: "creacion",
    changedBy: input.createdBy,
  });

  return data;
}

export async function updateOrderStatus(input: {
  orderId: string;
  status: OrderStatus;
  changedBy?: string | null;
}) {
  const supabase = createSupabaseAdminClient();

  if (!input.orderId) {
    throw new Error("No se encontro el pedido.");
  }

  const { data: previousOrder, error: previousError } = await supabase
    .from("orders")
    .select("id, order_number, status")
    .eq("id", input.orderId)
    .single<{ id: string; order_number: string; status: OrderStatus }>();

  if (previousError) {
    throw previousError;
  }

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: input.status,
    })
    .eq("id", input.orderId)
    .select("*")
    .single<Order>();

  if (error) {
    throw error;
  }

  if (previousOrder.status !== input.status) {
    await createOrderHistoryEntry({
      orderId: input.orderId,
      detail: `Estado cambiado de ${previousOrder.status} a ${input.status} en ${previousOrder.order_number}.`,
      eventType: "estado",
      changedBy: input.changedBy ?? null,
    });
  }

  return data;
}

export async function rejectOrder(input: {
  orderId: string;
  rejectedBy: string;
  reason?: string;
}) {
  const supabase = createSupabaseAdminClient();
  const reason = normalizeText(input.reason ?? "");

  if (!input.orderId) {
    throw new Error("No se encontro el pedido.");
  }

  if (!input.rejectedBy) {
    throw new Error("No se pudo identificar quien rechaza el pedido.");
  }

  const { data: previousOrder, error: previousError } = await supabase
    .from("orders")
    .select("id, order_number, status")
    .eq("id", input.orderId)
    .single<{ id: string; order_number: string; status: OrderStatus }>();

  if (previousError) {
    throw previousError;
  }

  const rejectedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "rechazado",
      confirmation_status: "rechazado",
      rejected_by: input.rejectedBy,
      rejected_at: rejectedAt,
      rejection_reason: reason || null,
      current_area: "Rechazados",
    })
    .eq("id", input.orderId)
    .select("*")
    .single<Order>();

  if (error) {
    throw error;
  }

  if (previousOrder.status !== "rechazado") {
    await createOrderHistoryEntry({
      orderId: input.orderId,
      detail: reason
        ? `Pedido ${previousOrder.order_number} rechazado. Motivo: ${reason}.`
        : `Pedido ${previousOrder.order_number} rechazado sin motivo especificado.`,
      eventType: "rechazo",
      changedBy: input.rejectedBy,
    });
  }

  return data;
}
