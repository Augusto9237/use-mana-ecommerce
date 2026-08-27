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
import { client } from "@/lib/mercadopago";

type UserWithRole = { role?: string };

export const refundPayment = async (data: CancelCheckoutPaymentSchema) => {
  const { orderId } = cancelCheckoutPaymentSchema.parse(data);

  const session = await auth.api.getSession({ headers: await headers() });
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

  const paymentRefund = new PaymentRefund(client);
  const paymentClient = new Payment(client);

  try {
    // Busca os pagamentos daquele pedido
    const payment = await paymentClient.get({ id: existingOrder.paymentId! });

    if (!payment.id) {
      throw new Error("Nenhum pagamento aprovado foi encontrado para este pedido.");
    }

    if (payment.status !== "approved") {
      throw new Error("Apenas pedidos com pagamento aprovado podem ser reembolsados.");
    }

    const paymentId = String(payment.id);

// ✅ Correto para o SDK v2 do Mercado Pago
  const refundResponse = await paymentRefund.total({
    payment_id: paymentId,
    requestOptions: {
      idempotencyKey: randomUUID(),
    },
  });


    await db.update(orderTable).set({ status: "canceled" }).where(eq(orderTable.id, orderId));

    revalidatePath("/admin/orders");
    revalidatePath("/my-orders");

    return { orderId, paymentId, refundResponse };
  } catch (error: any) {
    // Log completo no console interno do servidor para diagnóstico seguro
    console.error("Erro interno ao processar reembolso Mercado Pago:", {
      orderId,
      error: error?.message || error,
      status: error?.status,
      cause: error?.cause,
    });

    // Se for uma regra de negócio controlada (ex: pedido/pagamento não encontrado ou não elegível), repassa a mensagem
    const safeCustomErrors = [
      "Não autorizado",
      "Pedido não encontrado",
      "Serviço de pagamento temporariamente indisponível. Tente novamente mais tarde.",
      "Nenhum pagamento aprovado foi encontrado para este pedido.",
      "Apenas pedidos com pagamento aprovado podem ser reembolsados.",
    ];

    if (error instanceof Error && safeCustomErrors.includes(error.message)) {
      throw error;
    }

    // Para erros de API, credenciais ou falhas técnicas inesperadas, oculta detalhes internos e lança mensagem amigável
    throw new Error(
      "Não foi possível processar o reembolso junto à operadora de pagamento. Por favor, tente novamente ou entre em contato com o suporte."
    );
  }
};