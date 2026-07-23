"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUberDeliveryStatus } from "@/lib/uber";

export async function syncUberDeliveryStatus(orderId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const existingOrder = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });

  if (!existingOrder) {
    throw new Error("Pedido não encontrado");
  }

  if (!existingOrder.uberDeliveryId) {
    throw new Error("Este pedido ainda não possui uma entrega Uber vinculada");
  }

  const uberDelivery = await getUberDeliveryStatus(existingOrder.uberDeliveryId);

  await db
    .update(orderTable)
    .set({
      uberDeliveryStatus: uberDelivery.status,
    })
    .where(eq(orderTable.id, orderId));

  revalidatePath("/admin/orders");
  revalidatePath("/my-orders");

  return { status: uberDelivery.status };
}
