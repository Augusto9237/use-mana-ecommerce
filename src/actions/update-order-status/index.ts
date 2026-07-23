"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { cancelUberDelivery } from "@/lib/uber";
import { UpdateOrderStatusSchema, updateOrderStatusSchema } from "./schema";

type UserWithRole = { role?: string };

export const updateOrderStatus = async (data: UpdateOrderStatusSchema) => {
  updateOrderStatusSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const user = session.user as UserWithRole;
  // if (user.role !== "admin") {
  //   throw new Error("Acesso negado: apenas administradores podem atualizar pedidos");
  // }

  // Verificar se o pedido existe
  const existingOrder = await db.query.orderTable.findFirst({
    where: (order, { eq }) => eq(order.id, data.orderId),
  });

  if (!existingOrder) {
    throw new Error("Pedido não encontrado");
  }

  let uberDeliveryStatus = existingOrder.uberDeliveryStatus;

  if (data.status === "canceled" && existingOrder.uberDeliveryId) {
    try {
      await cancelUberDelivery(existingOrder.uberDeliveryId);
      uberDeliveryStatus = "canceled";
    } catch (error) {
      console.error("Erro ao cancelar entrega Uber ao atualizar status do pedido:", error);
      throw new Error("Falha ao atualizar a entrega Uber. O pedido não foi alterado.");
    }
  }

  const [updatedOrder] = await db
    .update(orderTable)
    .set({
      status: data.status,
      uberDeliveryStatus,
    })
    .where(eq(orderTable.id, data.orderId))
    .returning();

  revalidatePath("/admin/orders");
  revalidatePath("/admin/order");
  revalidatePath("/my-orders");

  return updatedOrder;
};
