"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { MercadoPagoConfig, Payment } from "mercadopago";
import {
  cancelCheckoutPaymentSchema,
  CancelCheckoutPaymentSchema,
} from "./schema";

type UserWithRole = { role?: string };

export const cancelCheckoutPayment = async (
  data: CancelCheckoutPaymentSchema,
) => {
  const { orderId } = cancelCheckoutPaymentSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autorizado");
  }

  const existingOrder = await db.query.orderTable.findFirst({
    where: (order, { eq }) => eq(order.id, orderId),
  });

  if (!existingOrder) {
    throw new Error("Pedido não encontrado");
  }

  const user = session.user as UserWithRole;
  if (existingOrder.userId !== session.user.id && user.role !== "admin") {
    throw new Error("Não autorizado");
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("MERCADOPAGO_ACCESS_TOKEN não está configurado no ambiente do servidor");
    throw new Error("Serviço de pagamento temporariamente indisponível. Tente novamente mais tarde.");
  }

  const mpClient = new MercadoPagoConfig({
    accessToken,
    options: { timeout: 5000 },
  });

  const paymentClient = new Payment(mpClient);

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
      throw new Error("Nenhum pagamento foi encontrado para este pedido.");
    }

    const paymentData = payments[0];
    if (!paymentData.id) {
      throw new Error("Nenhum identificador de pagamento foi encontrado para este pedido.");
    }

    const paymentId = String(paymentData.id);
    const cancelResponse = await paymentClient.cancel({
      id: paymentId,
    });

    await db.update(orderTable).set({ status: "canceled" }).where(eq(orderTable.id, orderId));

    revalidatePath("/admin/orders");
    revalidatePath("/my-orders");

    return {
      orderId,
      paymentId,
      cancelResponse,
    };
  } catch (error: any) {
    // Log completo seguro no console do servidor para fins de diagnóstico
    console.error("Erro interno ao cancelar pagamento Mercado Pago:", {
      orderId,
      error: error?.message || error,
      status: error?.status,
      cause: error?.cause,
    });

    const safeCustomErrors = [
      "Não autorizado",
      "Pedido não encontrado",
      "Serviço de pagamento temporariamente indisponível. Tente novamente mais tarde.",
      "Nenhum pagamento foi encontrado para este pedido.",
      "Nenhum identificador de pagamento foi encontrado para este pedido.",
    ];

    if (error instanceof Error && safeCustomErrors.includes(error.message)) {
      throw error;
    }

    throw new Error(
      "Não foi possível cancelar o pagamento junto à operadora. Por favor, tente novamente ou contate o suporte."
    );
  }
};
