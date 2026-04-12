import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type Client = {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
};

export type OrderStatus =
  | "recibido"
  | "disenando"
  | "imprimiendo"
  | "listo"
  | "entregado";

export type Order = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  quantity: number;
  material: string | null;
  size: string | null;
  due_date: string | null;
  status: OrderStatus;
  total_amount: number | null;
  created_at: string;
  created_by: string | null;
};

export type OrderWithClient = Order & {
  client: {
    id: string;
    name: string;
  } | null;
};

function normalizeText(value: string) {
  return value.trim();
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
  contactName: string;
  phone: string;
  email: string;
  notes: string;
  createdBy: string;
}) {
  const supabase = createSupabaseAdminClient();
  const name = normalizeText(input.name);

  if (!name) {
    throw new Error("Escribe el nombre del cliente.");
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      name,
      contact_name: normalizeText(input.contactName) || null,
      phone: normalizeText(input.phone) || null,
      email: normalizeText(input.email) || null,
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

export async function listOrders() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, client_id, title, description, quantity, material, size, due_date, status, total_amount, created_at, created_by",
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
  title: string;
  description: string;
  quantity: string;
  material: string;
  size: string;
  dueDate: string;
  status: OrderStatus;
  totalAmount: string;
  createdBy: string;
}) {
  const supabase = createSupabaseAdminClient();
  const title = normalizeText(input.title);
  const quantity = Number(input.quantity);
  const totalAmount = normalizeText(input.totalAmount);

  if (!input.clientId) {
    throw new Error("Selecciona un cliente para el pedido.");
  }

  if (!title) {
    throw new Error("Escribe un nombre para el pedido.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("La cantidad debe ser mayor a 0.");
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      client_id: input.clientId,
      title,
      description: normalizeText(input.description) || null,
      quantity,
      material: normalizeText(input.material) || null,
      size: normalizeText(input.size) || null,
      due_date: normalizeText(input.dueDate) || null,
      status: input.status,
      total_amount: totalAmount ? Number(totalAmount) : null,
      created_by: input.createdBy,
    })
    .select("*")
    .single<Order>();

  if (error) {
    throw error;
  }

  return data;
}
