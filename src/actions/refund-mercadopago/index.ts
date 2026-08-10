"use server";

import { randomUUID } from "node:crypto";
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

type UserWithRole = { role?: string };

export const refundPayment = async (data: CancelCheckoutPaymentSchema) => {
  const { orderId } = cancelCheckoutPaymentSchema.parse(data);

  const session = await auth.api.getSession({ headers: await headers() });
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

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não está configurado no ambiente do servidor");
  }

  const mpClient = new MercadoPagoConfig({
    accessToken,
    options: { timeout: 5000 },
  });

  const paymentRefund = new PaymentRefund(mpClient);
  const paymentClient = new Payment(mpClient);

  try {
    let paymentData;
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
      paymentData = payments[0];
    } catch (error) {
      console.error("Erro na BUSCA do pagamento:", error);
      throw error;
    }
    const paymentId = String(paymentData.id);
    const refundResponse = await paymentRefund.create({
      payment_id: paymentId,
      body: {},
      requestOptions: {
        idempotencyKey: randomUUID(),
      },
    });

    await db.update(orderTable).set({ status: "canceled" }).where(eq(orderTable.id, orderId));

    revalidatePath("/admin/orders");
    revalidatePath("/my-orders");

    return { orderId, paymentId, refundResponse };
  } catch (error: any) {
    console.error("Erro ao reembolsar pagamento Mercado Pago:", error);

    const errorMessage = error?.message || "";
    const isLiveCredentialsError =
      error?.status === 401 ||
      errorMessage.includes("Unauthorized use of live credentials") ||
      (Array.isArray(error?.cause) &&
        error.cause.some((c: any) => c?.code === 7 || c?.description?.includes("Unauthorized use of live credentials")));

    if (isLiveCredentialsError) {
      throw new Error(
        "Erro de autorização no Mercado Pago (401 - Unauthorized use of live credentials): " +
          "Suas credenciais de produção (APP_USR-...) não estão homologadas/ativadas no painel do Mercado Pago " +
          "ou você está tentando operar em modo de teste/sandbox usando credenciais de produção. " +
          "Substitua seu MERCADOPAGO_ACCESS_TOKEN e PUBLIC_KEY no .env por credenciais de teste (TEST-...)."
      );
    }

    throw error;
  }
};