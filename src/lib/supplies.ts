import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { round2 } from "@/lib/finance-math";

// Inventario real de insumos (fase 3): stock, mínimos, entradas (compras),
// salidas (consumo por pedido) y ajustes por conteo físico.

export const SUPPLY_CATEGORIES = [
  "papel",
  "vinil y adhesivos",
  "lona y gran formato",
  "tintas",
  "acabados",
  "otros",
] as const;

export const SUPPLY_UNITS = [
  "unidad",
  "pliego",
  "resma",
  "rollo",
  "metro",
  "litro",
  "caja",
] as const;

export type Supply = {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  min_stock: number;
  cost_usd: number | null;
  supplier: string | null;
  notes: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SupplyMovementType = "entrada" | "salida" | "ajuste";

export type SupplyMovement = {
  id: string;
  supply_id: string;
  type: SupplyMovementType;
  quantity: number;
  stock_after: number;
  order_id: string | null;
  cost_usd: number | null;
  description: string | null;
  created_by: string | null;
  created_at: string;
};

export async function listSupplies(): Promise<Supply[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("supplies")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Supply[];
}

export async function createSupply(input: {
  name: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  costUsd: number | null;
  supplier?: string;
  notes?: string;
  createdBy: string;
}): Promise<Supply> {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Escribe el nombre del insumo.");
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("supplies")
    .insert({
      name,
      category: input.category || "otros",
      unit: input.unit || "unidad",
      stock: round2(Math.max(0, input.stock)),
      min_stock: round2(Math.max(0, input.minStock)),
      cost_usd: input.costUsd,
      supplier: input.supplier?.trim() || null,
      notes: input.notes?.trim() || null,
      created_by: input.createdBy,
    })
    .select("*")
    .single<Supply>();
  if (error) throw error;
  return data;
}

export async function updateSupply(input: {
  supplyId: string;
  name: string;
  category: string;
  unit: string;
  minStock: number;
  costUsd: number | null;
  supplier?: string;
  notes?: string;
}) {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Escribe el nombre del insumo.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("supplies")
    .update({
      name,
      category: input.category || "otros",
      unit: input.unit || "unidad",
      min_stock: round2(Math.max(0, input.minStock)),
      cost_usd: input.costUsd,
      supplier: input.supplier?.trim() || null,
      notes: input.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.supplyId);
  if (error) throw error;
}

export async function deactivateSupply(supplyId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("supplies")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", supplyId);
  if (error) throw error;
}

// Entrada (compra), salida (consumo) o ajuste (conteo físico → fija el stock).
export async function registerSupplyMovement(input: {
  supplyId: string;
  type: SupplyMovementType;
  quantity: number;
  orderId?: string | null;
  costUsd?: number | null;
  description?: string;
  createdBy: string;
}): Promise<{ movement: SupplyMovement; supply: Supply }> {
  if (!Number.isFinite(input.quantity) || input.quantity < 0) {
    throw new Error("Escribe una cantidad válida.");
  }
  if (input.type !== "ajuste" && input.quantity <= 0) {
    throw new Error("La cantidad debe ser mayor que cero.");
  }

  const supabase = createSupabaseAdminClient();
  const { data: supply, error: supplyError } = await supabase
    .from("supplies")
    .select("*")
    .eq("id", input.supplyId)
    .single<Supply>();
  if (supplyError) throw supplyError;

  const currentStock = Number(supply.stock);
  let newStock: number;

  if (input.type === "entrada") {
    newStock = round2(currentStock + input.quantity);
  } else if (input.type === "salida") {
    if (input.quantity > currentStock) {
      throw new Error(
        `No hay stock suficiente de ${supply.name} (quedan ${currentStock} ${supply.unit}).`,
      );
    }
    newStock = round2(currentStock - input.quantity);
  } else {
    // Ajuste: la cantidad es el stock REAL contado.
    newStock = round2(input.quantity);
  }

  const { data: movement, error: movementError } = await supabase
    .from("supply_movements")
    .insert({
      supply_id: supply.id,
      type: input.type,
      quantity: round2(input.quantity),
      stock_after: newStock,
      order_id: input.orderId ?? null,
      cost_usd: input.costUsd ?? null,
      description: input.description?.trim() || null,
      created_by: input.createdBy,
    })
    .select("*")
    .single<SupplyMovement>();
  if (movementError) throw movementError;

  const { data: updated, error: updateError } = await supabase
    .from("supplies")
    .update({ stock: newStock, updated_at: new Date().toISOString() })
    .eq("id", supply.id)
    .select("*")
    .single<Supply>();
  if (updateError) throw updateError;

  return { movement, supply: updated };
}

export async function listRecentSupplyMovements(limit = 30): Promise<
  (SupplyMovement & { supply_name: string; supply_unit: string })[]
> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("supply_movements")
    .select("*, supply:supplies(name, unit)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? []).map((row) => {
    const supply = Array.isArray(row.supply) ? row.supply[0] : row.supply;
    return {
      ...(row as SupplyMovement),
      supply_name: (supply?.name as string) ?? "Insumo",
      supply_unit: (supply?.unit as string) ?? "unidad",
    };
  });
}
