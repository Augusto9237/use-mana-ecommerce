"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { cartTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUberDeliveryQuote } from "@/lib/uber";

export const calculateUberQuote = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Não autorizado");
  }

  // Busca o carrinho do usuário com o endereço de entrega e os itens
  const cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, session.user.id),
    with: {
      shippingAddress: true,
      items: {
        with: {
          productVariant: true,
        },
      },
    },
  });

  if (!cart) {
    throw new Error("Carrinho não encontrado");
  }

  if (!cart.shippingAddress) {
    // Retorna nulo se ainda não foi selecionado um endereço
    return null;
  }

  const { shippingAddress, items } = cart;

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

    return {
      quoteId: quote.id,
      feeInCents,
      pickupEta: quote.pickup_eta,
      dropoffEta: quote.dropoff_eta,
      duration: quote.duration,
    };
  } catch (error: any) {
    console.error("Erro na Server Action de cálculo do frete Uber:", error);
    // Retorna erro estruturado para o frontend
    return {
      error: true,
      message: error.message || "Erro desconhecido ao calcular o frete.",
    };
  }
};
