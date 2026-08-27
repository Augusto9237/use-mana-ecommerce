"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { cancelCheckoutPayment } from "../cancel-mercadopago";
import { revalidatePath } from "next/cache";
import { refundPayment } from "../refund-mercadopago";

type UserWithRole = { role?: string };

export const deleteOrder = async (orderId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const existingOrder = await db.query.orderTable.findFirst({
    where: (order, { eq }) => eq(order.id, orderId),
  });

  if (!existingOrder) {
    throw new Error("Pedido não encontrado");
  }

  if (existingOrder.userId !== session.user.id || (session.user as UserWithRole).role !== "admin") {
    throw new Error("Não autorizado: você não pode excluir este pedido");
  }

  if (existingOrder.status === "paid") {
     throw new Error("Pedido ja foi pago, não é possível excluir um pedido pago");
    // try {
    //   const { refundResponse } = await refundPayment({ orderId });
    //   console.log("Reembolso executado com sucesso:", refundResponse);
    // } catch (error) {
    //   console.warn("Não foi possível processar o reembolso automático no Mercado Pago:", error);
    // }
  }

  await db.delete(orderTable).where(eq(orderTable.id, orderId));

  revalidatePath("/admin/orders");
};
