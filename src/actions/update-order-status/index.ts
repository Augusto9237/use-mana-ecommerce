"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
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

  const [updatedOrder] = await db
    .update(orderTable)
    .set({
      status: data.status,
    })
    .where(eq(orderTable.id, data.orderId))
    .returning();

  revalidatePath("/admin/orders");
  revalidatePath("/admin/order");
  revalidatePath("/my-orders");

  return updatedOrder;
};
