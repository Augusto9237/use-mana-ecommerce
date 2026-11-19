"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";

type UserWithRole = { role?: string };

export const cancelOrder = async (orderId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const user = session.user as UserWithRole;
  if (user.role !== "admin") {
    throw new Error("Acesso negado: apenas administradores podem cancelar pedidos");
  }

  const existingOrder = await db.query.orderTable.findFirst({
    where: (order, { eq }) => eq(order.id, orderId),
  });

  if (!existingOrder) {
    throw new Error("Pedido não encontrado");
  }

  const [updatedOrder] = await db
    .update(orderTable)
    .set({
      status: "canceled",
    })
    .where(eq(orderTable.id, orderId))
    .returning();

  revalidatePath("/admin/orders");
  revalidatePath("/admin/order");
  revalidatePath("/my-orders");

  return updatedOrder;
};
