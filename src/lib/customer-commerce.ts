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

export type CheckoutPaymentMethod = "account_balance" | "pago_movil" | "stripe";
export type OrderPaymentStatus = "por_validar" | "aprobado" | "rechazado";
export type OrderPaymentPurpose = "order_payment" | "balance_topup";

export type OrderPayment = {
  id: string;
  order_id: string | null;
  customer_user_id: string | null;
  amount: number;
  method: string;
  bank: string | null;
  payer_phone: string | null;
  reference: string | null;
  status: OrderPaymentStatus;
  purpose: OrderPaymentPurpose;
  proof_file_id: string | null;
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type CustomerAccountProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  account_balance: number;
  preferred_delivery_method: "pickup" | "delivery" | null;
  delivery_recipient_name: string | null;
  delivery_recipient_phone: string | null;
  delivery_address: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerDashboardOrder = Order & {
  files: OrderFile[];
  payments: OrderPayment[];
};

export type AdminPayment = OrderPayment & {
  order: Pick<
    Order,
    | "id"
    | "order_number"
    | "title"
    | "total_amount"
    | "pending_amount"
    | "payment_status"
    | "payment_review_status"
    | "confirmation_status"
    | "source"
    | "current_area"
    | "status"
  > | null;
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
  proof_file: OrderFile | null;
};

function normalizeText(value: string | null | undefined) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
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

function formatOptions(options: Record<string, string> = {}) {
  const entries = Object.entries(options).filter(([, value]) => value);

  if (entries.length === 0) {
    return "Sin opciones seleccionadas.";
  }

  return entries.map(([key, value]) => `${key}: ${value}`).join("\n");
}

function formatCheckoutItem(item: StorefrontCheckoutItem, index: number) {
  const quantity = Math.max(1, Number(item.quantity) || 1);
  const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
  const lineTotal = unitPrice * quantity;

  return [
    `${index + 1}. ${item.title}`,
    `Categoria: ${item.productType || item.title}`,
    `Cantidad: ${quantity}`,
    `Precio unitario: $${unitPrice.toFixed(2)}`,
    `Subtotal: $${lineTotal.toFixed(2)}`,
    `Opciones:\n${formatOptions(item.options)}`,
  ].join("\n");
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

async function ensureCustomerAccountProfile(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: existingProfile, error: existingError } = await supabase
    .from("customer_profiles")
    .select("id, full_name, phone, account_balance, preferred_delivery_method, delivery_recipient_name, delivery_recipient_phone, delivery_address, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle<CustomerAccountProfile>();

  if (existingError) {
    throw existingError;
  }

  if (existingProfile) {
    return {
      ...existingProfile,
      account_balance: Number(existingProfile.account_balance ?? 0),
    };
  }

  const { data, error } = await supabase
    .from("customer_profiles")
    .insert({
      id: userId,
      account_balance: 0,
    })
    .select("id, full_name, phone, account_balance, preferred_delivery_method, delivery_recipient_name, delivery_recipient_phone, delivery_address, created_at, updated_at")
    .single<CustomerAccountProfile>();

  if (error) {
    throw error;
  }

  return {
    ...data,
    account_balance: Number(data.account_balance ?? 0),
  };
}

export async function updateCustomerCheckoutPreferences(input: {
  userId: string;
  contactName: string;
  contactPhone: string;
  deliveryMethod: "pickup" | "delivery";
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
}) {
  const supabase = createSupabaseAdminClient();
  const contactName = normalizeText(input.contactName);
  const contactPhone = normalizeText(input.contactPhone);
  const recipientName = normalizeText(input.recipientName);
  const recipientPhone = normalizeText(input.recipientPhone);
  const deliveryAddress = normalizeText(input.deliveryAddress);

  await ensureCustomerAccountProfile(input.userId);

  const { error: profileError } = await supabase
    .from("customer_profiles")
    .update({
      full_name: contactName || null,
      phone: contactPhone || null,
      preferred_delivery_method: input.deliveryMethod,
      delivery_recipient_name: recipientName || contactName || null,
      delivery_recipient_phone: recipientPhone || contactPhone || null,
      delivery_address: input.deliveryMethod === "delivery" ? deliveryAddress || null : null,
    })
    .eq("id", input.userId);

  if (profileError) {
    throw profileError;
  }

  const { error: clientError } = await supabase
    .from("clients")
    .update({
      name: contactName || recipientName || "Cliente storefront",
      phone: contactPhone || recipientPhone || null,
      address: input.deliveryMethod === "delivery" ? deliveryAddress || null : null,
    })
    .eq("customer_user_id", input.userId);

  if (clientError) {
    throw clientError;
  }
}

async function applyCustomerBalanceChange(input: {
  userId: string;
  amount: number;
  transactionType: "order_debit" | "payment_credit" | "balance_topup";
  description: string;
  orderId?: string | null;
  paymentId?: string | null;
  changedBy?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const profile = await ensureCustomerAccountProfile(input.userId);
  const nextBalance = Number((profile.account_balance + input.amount).toFixed(2));

  const { error: updateError } = await supabase
    .from("customer_profiles")
    .update({
      account_balance: nextBalance,
    })
    .eq("id", input.userId);

  if (updateError) {
    throw updateError;
  }

  const { error: transactionError } = await supabase
    .from("customer_balance_transactions")
    .insert({
      customer_user_id: input.userId,
      order_id: input.orderId ?? null,
      payment_id: input.paymentId ?? null,
      amount: input.amount,
      balance_after: nextBalance,
      transaction_type: input.transactionType,
      description: input.description,
      created_by: input.changedBy ?? null,
    });

  if (transactionError) {
    throw transactionError;
  }

  return nextBalance;
}

export async function getCustomerAccount(userId: string) {
  const profile = await ensureCustomerAccountProfile(userId);

  return {
    profile,
    accountBalance: Number(profile.account_balance ?? 0),
  };
}

export async function createStorefrontCheckout(input: {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  notes: string;
  items: StorefrontCheckoutItem[];
  paymentMethod?: CheckoutPaymentMethod;
}) {
  if (input.items.length === 0) {
    throw new Error("Agrega al menos un producto al carrito.");
  }

  const client = await ensureCustomerClient(input);
  const supabase = createSupabaseAdminClient();
  const orderNumber = await createOrderNumber();
  const normalizedItems = input.items.map((item) => {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);

    return {
      ...item,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
    };
  });
  const totalQuantity = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const paymentMethod = input.paymentMethod ?? "pago_movil";

  if (paymentMethod === "stripe") {
    throw new Error("Stripe estara disponible mas adelante.");
  }

  const account = await getCustomerAccount(input.userId);
  const startingBalance = account.accountBalance;

  if (startingBalance < 0) {
    throw new Error("Tu cuenta tiene saldo negativo. Registra un pago y espera aprobacion antes de crear otro pedido.");
  }

  const balanceCoverage =
    paymentMethod === "account_balance"
      ? Math.min(Math.max(startingBalance, 0), totalAmount)
      : 0;
  const pendingAmount = Math.max(0, Number((totalAmount - balanceCoverage).toFixed(2)));
  const paymentLabel = paymentMethod === "account_balance" ? "Saldo de cuenta" : "Pago movil";
  const categories = [...new Set(normalizedItems.map((item) => item.productType).filter(Boolean))];
  const firstItem = normalizedItems[0];
  const title =
    normalizedItems.length === 1
      ? firstItem.title
      : `Pedido web (${normalizedItems.length} productos)`;
  const productType =
    normalizedItems.length === 1
      ? firstItem.productType || firstItem.title
      : categories.length === 1
        ? categories[0]
        : "Pedido mixto";
  const description = [
    `Pedido web creado desde checkout.`,
    `Productos del pedido:\n${normalizedItems.map(formatCheckoutItem).join("\n\n")}`,
    normalizeText(input.notes) ? `Notas del cliente: ${normalizeText(input.notes)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const singleOptions = normalizedItems.length === 1 ? firstItem.options : {};

  const { data, error } = await supabase
    .from("orders")
    .insert({
      client_id: client.id,
      customer_user_id: input.userId,
      order_number: orderNumber,
      title,
      product_type: productType,
      description,
      quantity: totalQuantity,
      material: singleOptions.Material ?? null,
      size: singleOptions.Tamano ?? singleOptions.Medida ?? null,
      lamination_finish: singleOptions.Acabado ?? null,
      includes_design: false,
      includes_installation: false,
      urgency: "normal",
      branch: null,
      quoted_price: totalAmount || null,
      discount_amount: null,
      total_amount: totalAmount || null,
      deposit_amount: balanceCoverage || 0,
      pending_amount: pendingAmount || 0,
      payment_method: paymentLabel,
      payment_status:
        pendingAmount <= 0 ? "pagado" : balanceCoverage > 0 ? "anticipo" : "pendiente",
      payment_review_status: pendingAmount <= 0 ? "validado" : "sin_pago",
      confirmation_status: pendingAmount <= 0 ? "confirmado" : "pendiente",
      promised_delivery_at: addBusinessDays(5),
      priority: "media",
      current_area: pendingAmount <= 0 ? "Ventas" : "Caja",
      status: "recibido",
      source: "storefront",
      internal_notes:
        pendingAmount <= 0
          ? "Pedido web agrupado. Saldo aplicado, validar arte digital antes de producir."
          : "Pedido web agrupado. Validar arte digital y pago antes de producir.",
    })
    .select("*")
    .single<Order>();

  if (error) {
    throw error;
  }

  await applyCustomerBalanceChange({
    userId: input.userId,
    amount: -totalAmount,
    transactionType: "order_debit",
    orderId: data.id,
    description: `Pedido ${orderNumber} creado desde storefront.`,
  });

  await createOrderHistoryEntry({
    orderId: data.id,
    detail:
      pendingAmount <= 0
        ? `Pedido web ${orderNumber} creado con ${normalizedItems.length} producto${normalizedItems.length === 1 ? "" : "s"}. Cubierto con saldo de cuenta.`
        : `Pedido web ${orderNumber} creado con ${normalizedItems.length} producto${normalizedItems.length === 1 ? "" : "s"}. Saldo pendiente por $${pendingAmount.toFixed(2)}.`,
    eventType: "storefront",
    changedBy: null,
  });

  return [data];
}

export async function getCustomerDashboard(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, client_id, customer_user_id, order_number, title, product_type, description, quantity, measurements, material, size, lamination_finish, color_profile, includes_design, includes_installation, urgency, branch, quoted_price, discount_amount, total_amount, deposit_amount, pending_amount, payment_method, payment_status, payment_review_status, confirmation_status, source, promised_delivery_at, priority, current_owner, current_area, due_date, status, rejected_by, rejected_at, rejection_reason, internal_notes, created_at, created_by",
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

  if (!normalizeText(input.payerPhone) || !normalizeText(input.reference)) {
    throw new Error("Indica el telefono emisor y la referencia del pago movil.");
  }

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
      purpose: "order_payment",
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

export async function createCustomerBalanceTopUp(input: {
  userId: string;
  amount: string;
  bank: string;
  payerPhone: string;
  reference: string;
  notes: string;
  proofFile?: File | null;
}) {
  const supabase = createSupabaseAdminClient();
  const amount = parseAmount(input.amount);

  if (!normalizeText(input.payerPhone) || !normalizeText(input.reference)) {
    throw new Error("Indica el telefono emisor y la referencia del pago movil.");
  }

  const { data, error } = await supabase
    .from("order_payments")
    .insert({
      order_id: null,
      customer_user_id: input.userId,
      amount,
      method: "pago_movil",
      bank: normalizeText(input.bank) || null,
      payer_phone: normalizeText(input.payerPhone) || null,
      reference: normalizeText(input.reference) || null,
      notes: normalizeText(input.notes) || "Recarga de saldo solicitada por el cliente.",
      proof_file_id: null,
      purpose: "balance_topup",
      status: "por_validar",
    })
    .select("*")
    .single<OrderPayment>();

  if (error) {
    throw error;
  }

  return data;
}

async function assertCustomerOwnsOrder(userId: string, orderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .eq("customer_user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("No se encontro este pedido en tu cuenta.");
  }

  if (data.status === "rechazado") {
    throw new Error("Este pedido fue rechazado y ya no permite nuevos archivos o pagos.");
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
  const orderIds = [
    ...new Set(payments.map((payment) => payment.order_id).filter(Boolean)),
  ] as string[];
  const proofFileIds = [
    ...new Set(payments.map((payment) => payment.proof_file_id).filter(Boolean)),
  ] as string[];
  const topUpUserIds = [
    ...new Set(
      payments
        .filter((payment) => !payment.order_id && payment.customer_user_id)
        .map((payment) => payment.customer_user_id),
    ),
  ] as string[];

  const { data: ordersData, error: ordersError } =
    orderIds.length > 0
      ? await supabase
          .from("orders")
          .select("id, client_id, order_number, title, total_amount, pending_amount, payment_status, payment_review_status, confirmation_status, source, current_area, status")
          .in("id", orderIds)
      : { data: [], error: null };

  if (ordersError) {
    throw ordersError;
  }

  const orders = (ordersData ?? []) as Array<
    Pick<
      Order,
      | "id"
      | "client_id"
      | "order_number"
      | "title"
      | "total_amount"
      | "pending_amount"
      | "payment_status"
      | "payment_review_status"
      | "confirmation_status"
      | "source"
      | "current_area"
      | "status"
    >
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

  const { data: profilesData, error: profilesError } =
    topUpUserIds.length > 0
      ? await supabase
          .from("customer_profiles")
          .select("id, full_name, phone")
          .in("id", topUpUserIds)
      : { data: [], error: null };

  if (profilesError) {
    throw profilesError;
  }

  const proofFiles = proofFileIds.length > 0 ? await listOrderFiles(orderIds) : [];
  const ordersById = new Map(orders.map((order) => [order.id, order]));
  const clientsById = new Map(
    (clientsData ?? []).map((client) => [
      client.id as string,
      client as { id: string; name: string; email: string | null; phone: string | null },
    ]),
  );
  const profilesById = new Map(
    (profilesData ?? []).map((profile) => [
      profile.id as string,
      profile as { id: string; full_name: string | null; phone: string | null },
    ]),
  );
  const filesById = new Map(proofFiles.map((file) => [file.id, file]));

  return payments.map((payment) => {
    const order = payment.order_id ? ordersById.get(payment.order_id) ?? null : null;
    const profile = payment.customer_user_id
      ? profilesById.get(payment.customer_user_id) ?? null
      : null;

    return {
      ...payment,
      order,
      client: order
        ? clientsById.get(order.client_id) ?? null
        : profile
          ? {
              id: profile.id,
              name: profile.full_name || "Cliente storefront",
              email: null,
              phone: profile.phone,
            }
          : null,
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

  if (payment.status !== "por_validar") {
    throw new Error("Este pago ya fue revisado.");
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

  if (payment.purpose === "balance_topup" || !payment.order_id) {
    if (input.status === "aprobado" && payment.customer_user_id) {
      await applyCustomerBalanceChange({
        userId: payment.customer_user_id,
        amount: Number(payment.amount),
        transactionType: "balance_topup",
        paymentId: payment.id,
        changedBy: input.reviewedBy,
        description: `Recarga de saldo aprobada por $${Number(payment.amount).toFixed(2)}.`,
      });
    }

    return;
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_number, total_amount, deposit_amount")
    .eq("id", payment.order_id)
    .single<{
      id: string;
      order_number: string | null;
      total_amount: number | null;
      deposit_amount: number | null;
    }>();

  if (orderError) {
    throw orderError;
  }

  const payments = await listPaymentsForOrders([payment.order_id]);
  const totalAmount = Number(order.total_amount ?? 0);
  const currentDeposit = Number(order.deposit_amount ?? 0);
  const approvedTotal =
    input.status === "aprobado"
      ? Number((currentDeposit + Number(payment.amount)).toFixed(2))
      : currentDeposit;
  const pendingAmount = Math.max(0, Number((totalAmount - approvedTotal).toFixed(2)));
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

  if (input.status === "aprobado" && payment.customer_user_id) {
    await applyCustomerBalanceChange({
      userId: payment.customer_user_id,
      amount: Number(payment.amount),
      transactionType: "payment_credit",
      orderId: payment.order_id,
      paymentId: payment.id,
      changedBy: input.reviewedBy,
      description: `Pago movil aprobado para pedido ${order.order_number ?? payment.order_id}.`,
    });
  }
}
