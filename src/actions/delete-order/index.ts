"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { cancelCheckoutPayment } from "../cancel-mercadopago";
import { revalidatePath } from "next/cache";

type UserWithRole = { role?: string };

export const deleteOrder = async (orderId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const user = session.user as UserWithRole;
  if (user.role !== "admin") {
    throw new Error("Acesso negado: apenas administradores podem excluir pedidos");
  }

  const existingOrder = await db.query.orderTable.findFirst({
    where: (order, { eq }) => eq(order.id, orderId),
  });

  if (!existingOrder) {
    throw new Error("Pedido não encontrado");
  }

  await db.delete(orderTable).where(eq(orderTable.id, orderId));

  revalidatePath("/admin/orders");
};
