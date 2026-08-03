"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { triggerUberDelivery } from "@/lib/delivery-trigger";

export async function requestUberDelivery(orderId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });

  if (!order) throw new Error("Pedido não encontrado");
  
  // Autorização: só o dono do pedido ou admin pode solicitar
  if (order.userId !== session.user.id && session.user.role !== "admin") {
    throw new Error("Sem permissão");
  }

  if (order.uberDeliveryId) {
    return {
      status: order.uberDeliveryStatus ?? "already_requested",
      deliveryId: order.uberDeliveryId,
    };
  }

  if (!order.uberQuoteId) {
    throw new Error("Este pedido ainda não possui uma cotação Uber válida");
  }

  if (order.status !== "paid") {
    throw new Error("A entrega Uber só pode ser solicitada para pedidos pagos");
  }

  // Agora sim, chama o serviço que não precisa revalidar nada
  const delivery = await triggerUberDelivery(orderId);

  revalidatePath("/admin/orders");
  revalidatePath("/my-orders");

  return {
    status: delivery.status,
    deliveryId: delivery.id,
  };
}
