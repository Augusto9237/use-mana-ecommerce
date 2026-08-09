"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { MercadoPagoConfig, Payment, PaymentRefund } from "mercadopago";
import {
  cancelCheckoutPaymentSchema,
  CancelCheckoutPaymentSchema,
} from "./schema";

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN as string,
  options: { timeout: 5000 },
});

const paymentRefund = new PaymentRefund(mpClient);
const paymentClient = new Payment(mpClient);

type UserWithRole = { role?: string };

export const refundPayment = async (
  data: CancelCheckoutPaymentSchema,
) => {
  const { orderId } = cancelCheckoutPaymentSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const existingOrder = await db.query.orderTable.findFirst({
    where: (order, { eq }) => eq(order.id, orderId),
  });

  if (!existingOrder) {
    throw new Error("Order not found");
  }

  const user = session.user as UserWithRole;
  if (existingOrder.userId !== session.user.id && user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não está configurado no ambiente do servidor");
  }

  try {
    const searchResult = await paymentClient.search({
      options: {
        external_reference: `order-${orderId}`,
        sort: "date_created",
        criteria: "desc",
      },
    });

    const payments = searchResult.results ?? [];
    if (payments.length === 0) {
      throw new Error("Mercado Pago payment not found for this order");
    }

    const paymentData = payments[0];
    if (!paymentData.id) {
      throw new Error("Mercado Pago search result did not return a payment id");
    }

    const paymentId = String(paymentData.id);
    const refundResponse = await paymentRefund.create({
      payment_id: paymentId,
    });

    await db.update(orderTable).set({ status: "canceled" }).where(eq(orderTable.id, orderId));

    revalidatePath("/admin/orders");
    revalidatePath("/my-orders");

    return {
      orderId,
      paymentId,
      refundResponse,
    };
  } catch (error) {
    console.error("Erro ao cancelar pagamento Mercado Pago:", error);
    throw error;
  }
};
