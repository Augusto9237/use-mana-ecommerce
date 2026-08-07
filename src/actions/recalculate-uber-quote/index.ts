"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { cartTable, orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUberDeliveryQuote } from "@/lib/uber";

export const recalculateUberQuote = async (orderId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Não autorizado");
  }

const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
    with: {
      shippingAddress: true,
      items: {
        with: {
          productVariant: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Pedido não encontrado");
  }

  if (!order.shippingAddress) {
    // Retorna nulo se ainda não foi selecionado um endereço
    return null;
  }

  const { shippingAddress, items } = order;

  if (items.length === 0) {
    throw new Error("O carrinho está vazio");
  }

  // Calcula o valor total dos itens do carrinho
  const cartTotalInCents = items.reduce(
    (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
    0,
  );

  // Formata o endereço de entrega no padrão exigido pela Uber
  // Ex: "Rua Exemplo, 123 - Centro, São Paulo - SP, 01000-000, Brasil"
  const dropoffAddress = `${shippingAddress.street}, ${shippingAddress.number} - ${shippingAddress.neighborhood}, ${shippingAddress.city} - ${shippingAddress.state}, ${shippingAddress.zipCode}, ${shippingAddress.country || "Brasil"}`;

  try {
    const quote = await getUberDeliveryQuote({
      dropoffAddress,
      dropoffPhoneNumber: shippingAddress.phone,
      manifestTotalValueInCents: cartTotalInCents,
    });

    // A API da Uber pode retornar `fee` em dois formatos dependendo do ambiente:
    // - decimal em BRL (ex: 12.50)
    // - inteiro em centavos (ex: 1620 -> R$16.20)
    // Detectamos o formato e convertemos para centavos de forma robusta.
    let feeInCents: number;
    if (quote.fee >= 1000) {
      // valor provavelmente já está em centavos (ex: 1620 => R$16.20)
      feeInCents = Math.round(quote.fee);
    } else {
      // valor provavelmente em reais (decimal)
      feeInCents = Math.round(quote.fee * 100);
    }

     await db
    .update(orderTable)
    .set({
      uberQuoteId: quote.id,
      shippingFeeInCents: feeInCents,
    })
    .where(eq(orderTable.id, orderId));

    return { success: true, quoteId: quote.id, feeInCents};
  } catch (error: any) {
    console.error("Erro na Server Action de cálculo do frete Uber:", error);
    // Retorna erro estruturado para o frontend
    return {
      success: false,
      message: error.message || "Erro desconhecido ao calcular o frete.",
    };
  }
};
